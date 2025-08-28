import express from "express";
import cors from "cors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import streamifier from "streamifier";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});


app.get("/", (_req, res) => res.send("Backend is running"));

app.get("/test-cloudinary", async (_req, res) => {
    try {
        const result = await cloudinary.api.ping();
        res.json({ status: "Cloudinary connected", result });
    } catch (error) {
        res.status(500).json({ status: "Cloudinary failed", error: error.message });
    }
});

app.post("/upload", upload.single("file"), (req, res) => {
    console.log("=== UPLOAD REQUEST RECEIVED ===");

    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("File details:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
    });

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error("Missing Cloudinary credentials!");
        return res.status(500).json({ error: "Server configuration error - missing Cloudinary credentials" });
    }

    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads";

    const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder },
        (error, result) => {
            if (error) {
                console.error("=== CLOUDINARY UPLOAD ERROR ===", error);
                return res.status(500).json({
                    error: "Cloudinary upload failed",
                    details: error.message,
                    http_code: error.http_code,
                });
            }
            console.log("=== CLOUDINARY UPLOAD SUCCESS ===", {
                public_id: result.public_id,
                secure_url: result.secure_url,
            });
            return res.json({ url: result.secure_url });
        }
    );

    try {
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (streamError) {
        console.error("Stream error:", streamError);
        return res.status(500).json({ error: "File streaming error", details: streamError.message });
    }
});

app.post("/send-email", async (req, res) => {
    console.log("Send-email request body:", req.body);

    try {
        const { from_name, phone, email_type, email, subject, message, file_urls, file_names } = req.body;

        if (!from_name || !phone || !email_type || !email || !subject || !message) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        let fileLinksHtml = "";
        if (Array.isArray(file_urls) && file_urls.length > 0) {
            fileLinksHtml += `<p><strong>Uploaded Files:</strong></p><ul>`;
            file_urls.forEach((url, i) => {
                const name = (Array.isArray(file_names) && file_names[i]) || `File ${i + 1}`;
                fileLinksHtml += `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a></li>`;
            });
            fileLinksHtml += `</ul>`;
        }

        const htmlContent = `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${from_name}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Email Type:</strong> ${email_type}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            ${fileLinksHtml}
        `;

        // Send to both emails
        const sendMail = async (to) => {
            try {
                const info = await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to,
                    subject: `Contact Form: ${subject}`,
                    html: htmlContent,
                });
                return { success: true, messageId: info.messageId };
            } catch (err) {
                console.error(`Error sending email to ${to}:`, err);
                return { success: false, error: err.message };
            }
        };

        const [businessResult, personalResult] = await Promise.all([
            sendMail("jags4015business@gmail.com"),
            sendMail("jags4015@gmail.com"),
        ]);

        if (businessResult.success && personalResult.success) {
            return res.json({ success: true, message: "Emails sent successfully" });
        }

        console.error("One or more emails failed:", { businessResult, personalResult });
        return res.status(500).json({
            success: false,
            error: "Failed to send one or more emails",
            details: { businessResult, personalResult },
        });
    } catch (err) {
        console.error("Send-email route error:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Email user: ${process.env.EMAIL_USER}`);
    console.log(`Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);
});
