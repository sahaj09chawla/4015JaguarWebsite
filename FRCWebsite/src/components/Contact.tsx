import { useEffect, useState } from "react";
import "./Contact.css";

interface EmailData {
    from_name: string;
    phone: string;
    email_type: string;
    email: string;
    subject: string;
    message: string;
    file_urls: string[];
    file_names: string[];
    isPDFs: boolean[];
    isDocuments: boolean[];
}

function Contact() {
    const [displayedText, setDisplayedText] = useState("");
    const [typingComplete, setTypingComplete] = useState(false);
    const [error, setError] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        phone: "",
        emailType: "",
        email: "",
        subject: "",
        message: "",
        files: [] as File[],
    });

    useEffect(() => {
        let currentChar = 0;
        const fullText = "Contact Us";
        const typingInterval = setInterval(() => {
            setDisplayedText(fullText.slice(0, currentChar + 1));
            currentChar++;
            if (currentChar === fullText.length) {
                clearInterval(typingInterval);
                setTypingComplete(true);
            }
        }, 150);

        return () => clearInterval(typingInterval);
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        setFormData((prev) => ({
            ...prev,
            files: Array.from(files),
        }));
    };

    const uploadFile = async (file: File): Promise<{ url: string; isPDF: boolean; isDocument: boolean } | null> => {
        const data = new FormData();
        data.append("file", file);

        const response = await fetch("http://localhost:5000/upload", {
            method: "POST",
            body: data,
        });

        if (response.ok) {
            const result = await response.json();
            return {
                url: result.url || null,
                isPDF: result.isPDF || false,
                isDocument: result.isDocument || false
            };
        }
        return null;
    };

    const sendEmail = async (emailData: EmailData): Promise<boolean> => {
        const response = await fetch("http://localhost:5000/send-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(emailData),
        });

        return response.ok;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const requiredFields = ["name", "phone", "emailType", "email", "subject", "message"];
        for (const field of requiredFields) {
            if (!formData[field as keyof typeof formData]) {
                setError("Please fill in all required fields.");
                return;
            }
        }

        setError("");
        const uploadedFileUrls: string[] = [];
        const uploadedFileNames: string[] = [];
        const isPDFs: boolean[] = [];
        const isDocuments: boolean[] = [];

        if (formData.files.length > 0) {
            for (const file of formData.files) {
                const uploadResult = await uploadFile(file);

                if (uploadResult && uploadResult.url) {
                    uploadedFileUrls.push(uploadResult.url);
                    uploadedFileNames.push(file.name);
                    isPDFs.push(uploadResult.isPDF);
                    isDocuments.push(uploadResult.isDocument);
                } else {
                    setError(`Failed to upload file: ${file.name}`);
                    return;
                }
            }
        }

        const emailData: EmailData = {
            from_name: `${formData.name} ${formData.lastName}`,
            phone: formData.phone,
            email_type: formData.emailType,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            file_urls: uploadedFileUrls,
            file_names: uploadedFileNames,
            isPDFs,
            isDocuments,
        };

        const emailSent = await sendEmail(emailData);

        if (emailSent) {
            setShowSuccessModal(true);
            setFormData({
                name: "",
                lastName: "",
                phone: "",
                emailType: "",
                email: "",
                subject: "",
                message: "",
                files: [],
            });

            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) {
                fileInput.value = '';
            }
        } else {
            setError("Failed to send email. Please try again.");
        }
    };

    return (
        <div className="contact-page">
            <div className="jags-pattern-contact">
                {[...Array(30)].map((_, i) => (
                    <div key={`contact-line-${i}`} className="jags-line">
                        {"JAGS ".repeat(40)}
                    </div>
                ))}
            </div>

            <div className="contact-container">
                <div className="contact-content">
                    <h1 className="contact-header">
                        {displayedText}
                        {!typingComplete && <span className="typing-cursor">|</span>}
                    </h1>

                    {error && (
                        <div style={{ fontFamily: "Arial", fontSize: "12px", color: "red", textAlign: "center" }}>
                            {error}
                        </div>
                    )}

                    <div className="contact-info-box">
                        <p>
                            Welcome to our contact page! Please fill out the form below, and we'll respond to{" "}
                            <strong>{formData.email || "your email"}</strong>.
                        </p>
                    </div>

                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name / Business Name *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="First Name"/>
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name"/>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 234 567 8900"/>
                            </div>
                            <div className="form-group">
                                <label>Email Type *</label>
                                <select name="emailType" value={formData.emailType} onChange={handleInputChange}>
                                    <option value="">Select...</option>
                                    <option value="personal">General Email</option>
                                    <option value="business">Business Email</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Your Email Address *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="example@email.com"/>
                        </div>

                        <div className="form-group">
                            <label>Subject *</label>
                            <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="Subject"/>
                        </div>

                        <div className="form-group">
                            <label>Message *</label>
                            <textarea name="message" value={formData.message} onChange={handleInputChange} placeholder="Write your message here..." rows={5}></textarea>
                        </div>

                        <div className="form-group">
                            <label>Upload Files</label>
                            <input type="file" multiple accept="application/pdf,image/*" onChange={handleFileChange}/>
                            {formData.files.length > 0 && (
                                <small>{formData.files.map((f) => f.name).join(", ")}</small>
                            )}
                        </div>

                        <button type="submit" className="submit-button">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>

            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Email Sent Successfully!</h2>
                        <button onClick={() => setShowSuccessModal(false)}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Contact;