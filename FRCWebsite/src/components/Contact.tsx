import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import "./Contact.css";

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
        setFormData(prev => ({
            ...prev,
            files: Array.from(files),
        }));
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
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

        if (formData.files.length > 0) {
            for (const file of formData.files) {
                const base64 = await fileToBase64(file);

                // Send to backend
                const res = await fetch("http://localhost:5000/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ file: base64 }),
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.url) uploadedFileUrls.push(data.url);
                } else {
                    setError(`Failed to upload file: ${file.name}`);
                    return;
                }
            }
        }

        // Send Email via EmailJS (links only)
        const templateParams = {
            from_name: `${formData.name} ${formData.lastName}`,
            phone: formData.phone,
            email_type: formData.emailType,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            file_links: uploadedFileUrls.join("\n"), // Cloudinary URLs
        };

        // Send to business account
        await emailjs.send(
            "service_eke83de",
            "template_lxvd6yk",
            { ...templateParams, to_email: "jags4015business@gmail.com" },
            "YnwnlNF1SL_R48uIp"
        );

        // Send to personal account
        await emailjs.send(
            "service_h8ly42q",
            "template_76v2zdh",
            { ...templateParams, to_email: "jags4015@gmail.com" },
            "YnwnlNF1SL_R48uIp"
        );

        setShowSuccessModal(true);

        // Reset form
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
                            <input type="file" multiple onChange={handleFileChange} />
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
