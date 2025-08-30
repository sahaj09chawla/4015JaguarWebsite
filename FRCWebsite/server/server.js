import express from "express";
import cors from "cors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import streamifier from "streamifier";
import nodemailer from "nodemailer";
import fetch from "node-fetch";

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
    limits: { fileSize: 20 * 1024 * 1024 },
});

app.get("/", (_req, res) => res.send("Backend is running"));

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const originalname = req.file.originalname || "";
    const mimetype = req.file.mimetype || "";
    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads";

    const isPDF = mimetype === "application/pdf";
    const isDocument = isPDF ||
        mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mimetype === "application/msword" ||
        mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
        mimetype === "application/vnd.ms-powerpoint" ||
        mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        mimetype === "application/vnd.ms-excel";

    const uploadOptions = {
        folder,
        resource_type: isDocument ? "raw" : "auto",
        use_filename: true,
        unique_filename: true,
        public_id: isDocument ? path.parse(originalname).name : undefined,
    };

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) {
            console.error("=== CLOUDINARY UPLOAD ERROR ===", error);
            return res.status(500).json({ error: error.message });
        }

        console.log("=== CLOUDINARY UPLOAD SUCCESS ===", {
            public_id: result.public_id,
            secure_url: result.secure_url,
            resource_type: result.resource_type,
            format: result.format,
        });

        return res.json({
            url: result.secure_url,
            filename: originalname,
            isPDF,
            isDocument
        });
    });

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

app.get("/download", async (req, res) => {
    const { url, filename } = req.query;
    if (!url || !filename) return res.status(400).send("Missing url or filename");

    try {
        const response = await fetch(url);
        if (!response.ok) return res.status(response.status).send("Failed to fetch file");

        const ext = path.extname(filename).toLowerCase();
        let mimeType = "application/octet-stream";

        if (ext === ".pdf") mimeType = "application/pdf";
        else if (ext === ".doc") mimeType = "application/msword";
        else if (ext === ".docx") mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        else if (ext === ".ppt") mimeType = "application/vnd.ms-powerpoint";
        else if (ext === ".pptx") mimeType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        else if (ext === ".xls") mimeType = "application/vnd.ms-excel";
        else if (ext === ".xlsx") mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
        else if (ext === ".png") mimeType = "image/png";
        else if (ext === ".webp") mimeType = "image/webp";
        else if (ext === ".txt") mimeType = "text/plain";

        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Type", mimeType);

        response.body.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching file");
    }
});

app.post("/send-email", async (req, res) => {
    try {
        const { from_name, phone, email_type, email, subject, message, file_urls, file_names, isPDFs, isDocuments } = req.body;

        if (!from_name || !phone || !email_type || !email || !subject || !message) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        let fileLinksHtml = "";
        if (Array.isArray(file_urls) && file_urls.length > 0) {
            fileLinksHtml += `<p><strong>Uploaded Files:</strong></p><ul>`;
            file_urls.forEach((url, i) => {
                const name = (Array.isArray(file_names) && file_names[i]) || `File ${i + 1}`;
                const isPDF = Array.isArray(isPDFs) && isPDFs[i];
                const isDocument = Array.isArray(isDocuments) && isDocuments[i];
                let link = url;

                if (isPDF || isDocument) {
                    link = `http://localhost:${port}/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(name)}`;
                }

                fileLinksHtml += `<li><a href="${link}" target="_blank" rel="noopener noreferrer">${name}</a></li>`;
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