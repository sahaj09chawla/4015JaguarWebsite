import { useEffect, useState } from 'react';
import './Students.css';
import Person1 from '../assets/person1.png';

function Students() {
    const [displayedText, setDisplayedText] = useState('');
    const [typingComplete, setTypingComplete] = useState(false);
    const [alumniText, setAlumniText] = useState('');
    const [alumniTypingComplete, setAlumniTypingComplete] = useState(false);

    useEffect(() => {
        let currentChar = 0;
        const fullText = "Students";
        const typingInterval = setInterval(() => {
            setDisplayedText(fullText.slice(0, currentChar + 1));
            currentChar++;
            if (currentChar === fullText.length) {
                clearInterval(typingInterval);
                setTypingComplete(true);

                setTimeout(() => {
                    let alumniChar = 0;
                    const alumniFullText = "Alumni";
                    const alumniTypingInterval = setInterval(() => {
                        setAlumniText(alumniFullText.slice(0, alumniChar + 1));
                        alumniChar++;
                        if (alumniChar === alumniFullText.length) {
                            clearInterval(alumniTypingInterval);
                            setAlumniTypingComplete(true);
                        }
                    }, 150);
                }, 500);
            }
        }, 150);

        return () => clearInterval(typingInterval);
    }, []);

    const teamMembers = Array(40).fill(0).map((_, index) => ({
        id: index + 1,
        name: `Student ${index + 1}`,
        role: 'General Member',
        image: Person1
    }));

    const alumniMembers = Array(10).fill(0).map((_, index) => ({
        id: index + 1,
        name: `Alumni ${index + 1}`,
        role: 'General Member',
        image: Person1
    }));

    return (
        <div className="students-page">
            <div className="students-pattern">
                {[...Array(30)].map((_, i) => (
                    <div key={`students-line-${i}`} className="students-line">
                        {"JAGS ".repeat(40)}
                    </div>
                ))}
            </div>

            <div className="students-container">
                <div className="students-content">
                    <div className="students-header-container">
                        <h1 className={`students-header ${typingComplete ? 'complete' : ''}`}>
                            {displayedText}
                            {!typingComplete && <span className="typing-cursor">|</span>}
                        </h1>
                    </div>

                    <div className="students-description">
                        <p>
                            To be entered and o be typed. To be entered and o be typed. To be entered and o be typed. To be entered and o be typed.To be entered and o be typed. To be entered and o be typed. To be entered and o be typed.
                            To be entered and o be typed. To be entered and o be typed. To be entered and o be typed. To be entered and o be typed. To be entered and o be typed. To be entered and o be typed. To be entered and o be typed.
                        </p>
                    </div>

                    <div className="students-grid">
                        {teamMembers.map((member) => (
                            <div key={member.id} className="student-card">
                                <div className="student-image-container">
                                    <img src={member.image} alt={member.name} className="student-image" loading="lazy" decoding="async" />
                                </div>
                                <div className="student-info">
                                    <h3 className="student-name">{member.name}</h3>
                                    <p className="student-role">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Alumni Section */}
                    <div className="alumni-section">
                        <h2 className={`alumni-header ${alumniTypingComplete ? 'complete' : ''}`}>
                            {alumniText}
                            {!alumniTypingComplete && alumniText && <span className="typing-cursor">|</span>}
                        </h2>

                        <div className="alumni-grid">
                            {alumniMembers.map((member) => (
                                <div key={`alumni-${member.id}`} className="alumni-card">
                                    <div className="alumni-image-container">
                                        <img src={member.image} alt={member.name} className="alumni-image" loading="lazy" decoding="async" />
                                    </div>
                                    <div className="alumni-info">
                                        <h3 className="alumni-name">{member.name}</h3>
                                        <p className="alumni-role">{member.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Students;