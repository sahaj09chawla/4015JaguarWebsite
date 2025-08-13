import { useEffect, useState } from 'react';
import './Contact.css';

function Contact() {
    const [displayedText, setDisplayedText] = useState('');
    const [typingComplete, setTypingComplete] = useState(false);

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

    return (
        <div className="contact-page">
            <div className="contact-pattern">
                {[...Array(30)].map((_, i) => (
                    <div key={`contact-line-${i}`} className="contact-line">
                        {"JAGS ".repeat(40)}
                    </div>
                ))}
            </div>

            <div className="contact-header-container">
                <h1 className={`contact-header ${typingComplete ? 'complete' : ''}`}>
                    {displayedText}
                </h1>
            </div>

        </div>
    );
}

export default Contact;