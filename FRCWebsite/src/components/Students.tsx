import { useEffect, useState } from 'react';
import './Students.css';

function Students() {
    const [displayedText, setDisplayedText] = useState('');
    const [typingComplete, setTypingComplete] = useState(false);

    useEffect(() => {
        let currentChar = 0;
        const fullText = "Students";
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
        <div className="students-page">
            <div className="students-pattern">
                {[...Array(30)].map((_, i) => (
                    <div key={`students-line-${i}`} className="students-line">
                        {"JAGS ".repeat(40)}
                    </div>
                ))}
            </div>

            <div className="students-header-container">
                <h1 className={`students-header ${typingComplete ? 'complete' : ''}`}>
                    {displayedText}
                </h1>
            </div>

        </div>
    );
}

export default Students;