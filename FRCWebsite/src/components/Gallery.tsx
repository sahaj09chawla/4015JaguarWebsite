import { useEffect, useState } from 'react';
import './Gallery.css';

function Gallery() {
    const [displayedText, setDisplayedText] = useState('');
    const [typingComplete, setTypingComplete] = useState(false);

    useEffect(() => {
        let currentChar = 0;
        const fullText = "GALLERY";
        const typingInterval = setInterval(() => {
            setDisplayedText(fullText.slice(0, currentChar + 1));
            currentChar++;
            if (currentChar === fullText.length) {
                clearInterval(typingInterval);
                setTypingComplete(true);
            }
        }, 150); // Typing speed (ms per character)

        return () => clearInterval(typingInterval);
    }, []);

    return (
        <div className="gallery-page">
            <div className="gallery-pattern">
                {[...Array(30)].map((_, i) => (
                    <div key={`gallery-line-${i}`} className="gallery-line">
                        {"JAGS ".repeat(40)}
                    </div>
                ))}
            </div>

            <div className="gallery-header-container">
                <h1 className={`gallery-header ${typingComplete ? 'complete' : ''}`}>
                    {displayedText}
                </h1>
            </div>

            {/* Gallery content will go here */}
        </div>
    );
}

export default Gallery;