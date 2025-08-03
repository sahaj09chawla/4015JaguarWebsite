import { useEffect, useState } from 'react';
import './AboutUs.css';
import AboutImage from '../assets/AboutImage.png';
import './banners.css'; // Import the banner styles
import achievement from '../assets/achievement.png';
import first from '../assets/first.svg';

function AboutUs() {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let currentChar = 0;
        const typingInterval = setInterval(() => {
            setDisplayedText("About Us".slice(0, currentChar + 1));
            currentChar++;
            if (currentChar === "About Us".length) clearInterval(typingInterval);
        }, 150);
        return () => clearInterval(typingInterval);
    }, []);

    useEffect(() => {
        const valueCards = document.querySelectorAll('.value-card');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );
        valueCards.forEach(card => observer.observe(card));
        return () => {
            valueCards.forEach(card => observer.unobserve(card));
        };
    }, []);

    return (
        <div className="about-page">
            <div className="jags-pattern-about">
                {[...Array(30)].map((_, i) => (
                    <div key={`jags-${i}`} className="jags-line">{"JAGS ".repeat(40)}</div>
                ))}
            </div>

            <div className="about-container">
                <div className="about-content">
                    <h1 className="about-header">{displayedText}</h1>
                    <div className="about-content-row">
                        <div className="about-image">
                            <img src={AboutImage} alt="Team About" />
                        </div>
                        <div className="about-text">
                            <p>
                                Founded in 2012, Team 4015 Jaguar Robotics has been competing in FIRST Robotics
                                competitions with passion and innovation. Our team consists of dedicated students
                                from St. Joseph High School.
                            </p>
                            <p>
                                We emphasize STEM education, teamwork, and community outreach. Each season,
                                we design and build a competitive robot while developing valuable technical
                                and professional skills.
                            </p>
                            <p>
                                Our achievements include multiple regional awards and a strong track record
                                of mentoring younger students in our community through various STEM initiatives.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="values-wrapper">
                    <div className="values-bg"></div>
                    <div className="values-section">
                        <h2 className="section-title">Our Goals</h2>
                        <div className="values-grid">
                            {[
                                { icon: "⚙️", title: "Innovation", desc: "Pushing technical boundaries through creative engineering solutions" },
                                { icon: "🤝", title: "Teamwork", desc: "Collaborating across disciplines to build something greater" },
                                { icon: "🌱", title: "Mentorship", desc: "Upperclassmen guiding newcomers in STEM skills" },
                                { icon: "🏆", title: "Gracious Professionalism", desc: "Competing with integrity and mutual respect" },
                                { icon: "🌱", title: "Mentorship", desc: "Upperclassmen guiding newcomers in STEM skills" },
                                { icon: "🏆", title: "Gracious Professionalism", desc: "Competing with integrity and mutual respect" }
                            ].map((value, index) => (
                                <div key={index} className={`value-card delay-${index}`}>
                                    <div className="value-icon">{value.icon}</div>
                                    <h3>{value.title}</h3>
                                    <p>{value.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="achievements-title-strip">
                    <h2>NOTABLE ACHIEVEMENTS</h2>
                </div>

                <div className="achievements-wrapper">
                    <div className="achievements-container">
                        <div className="achievement-image">
                            <img src={achievement} alt="Team Achievements" />
                        </div>
                        <div className="achievements-grid">
                            <div className="banner-parent" >
                                <ul className="banners">
                                    <li><img src={first} alt="FIRST Logo" />2020<br/> DISTRICT FINALIST</li>
                                    <li><img src={first} alt="FIRST Logo" />2020<br/> AUTONOMOUS AWARD</li>
                                    <li><img src={first} alt="FIRST Logo" />2022<br/> DISTRICT WINNERS</li>
                                    <li><img src={first} alt="FIRST Logo" />2024<br/> GRACIOUS PROFESSIONALISM AWARD</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutUs;
