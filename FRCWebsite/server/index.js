import express from "express";
import cors from "cors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Readable } from "node:stream";
import streamifier from "streamifier";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPaths = [
    path.resolve(__dirname, ".env"),
    path.resolve(__dirname, "../.env"),
];

for (const envPath of envPaths) {
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
        break;
    }
}

const app = express();
const port = process.env.PORT || 5000;
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;

app.set("trust proxy", 1);

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** Gmail SMTP — explicit host/port works more reliably on Vercel than `service: "gmail"`. */
function createMailTransporter() {
    const user = (process.env.EMAIL_USER || "").trim();
    const pass = (process.env.EMAIL_APP_PASSWORD || "").replace(/\s/g, "");
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user, pass },
        connectionTimeout: 25_000,
        greetingTimeout: 25_000,
        socketTimeout: 25_000,
    });
}

function escapeHtml(text) {
    if (typeof text !== "string") return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
});

app.get("/", (_req, res) => res.send("Backend is running"));

app.post("/api/upload", upload.single("file"), (req, res) => {
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

app.get("/api/download", async (req, res) => {
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

        const body = response.body;
        if (body && typeof Readable.fromWeb === "function") {
            Readable.fromWeb(body).pipe(res);
        } else if (body && typeof body.pipe === "function") {
            body.pipe(res);
        } else {
            const buf = Buffer.from(await response.arrayBuffer());
            res.end(buf);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching file");
    }
});

app.post("/api/send-email", async (req, res) => {
    try {
        const emailUser = (process.env.EMAIL_USER || "").trim();
        const emailPass = (process.env.EMAIL_APP_PASSWORD || "").replace(/\s/g, "");
        if (!emailUser || !emailPass) {
            console.error("send-email: EMAIL_USER or EMAIL_APP_PASSWORD missing in environment");
            return res.status(503).json({
                success: false,
                error: "Email is not configured on the server. Add EMAIL_USER and EMAIL_APP_PASSWORD in Vercel.",
            });
        }

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
                    const forwardedProto = req.headers["x-forwarded-proto"];
                    const protocol = typeof forwardedProto === "string" ? forwardedProto : req.protocol;
                    const origin = process.env.PUBLIC_SERVER_URL || `${protocol}://${req.get("host")}`;
                    link = `${origin}/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(name)}`;
                }

                const safeName = escapeHtml(name);
                fileLinksHtml += `<li><a href="${link}" target="_blank" rel="noopener noreferrer">${safeName}</a></li>`;
            });
            fileLinksHtml += `</ul>`;
        }

        const htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(from_name)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Email Type:</strong> ${escapeHtml(email_type)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      ${fileLinksHtml}
    `;

        const transporter = createMailTransporter();

        const sendMail = async (to) => {
            try {
                const info = await transporter.sendMail({
                    from: emailUser,
                    to,
                    subject: `Contact Form: ${subject}`,
                    html: htmlContent,
                });
                return { success: true, messageId: info.messageId };
            } catch (err) {
                console.error(`Error sending email to ${to}:`, err);
                return { success: false, error: err.message || String(err) };
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

if (isDirectRun) {
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

export default app;
