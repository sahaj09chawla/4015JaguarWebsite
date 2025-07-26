import { useEffect, useState } from 'react';
import './AboutUs.css';
import AboutImage from '../assets/AboutImage.png';
import coreValues from '../assets/coreValues.png';

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
        // For core values
        const valueCards = document.querySelectorAll('.value-card');
        // For timeline nodes
        const timelineNodes = document.querySelectorAll('.timeline-node');

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
        timelineNodes.forEach(node => observer.observe(node));

        return () => {
            valueCards.forEach(card => observer.unobserve(card));
            timelineNodes.forEach(node => observer.unobserve(node));
        };
    }, []);

    return (
        <div className="about-page">
            <div className="jags-pattern-about">
                {[...Array(8)].map((_, i) => (
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
                                from St.Joseph High School.
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

                <div className="values-section">
                    <div className="values-bg" style={{ backgroundImage: `url(${coreValues})` }}></div>
                    <h2 className="section-title">Our Core Values</h2>
                    <div className="values-grid">
                        {[
                            {
                                icon: "⚙️",
                                title: "Innovation",
                                desc: "Pushing technical boundaries through creative engineering solutions"
                            },
                            {
                                icon: "🤝",
                                title: "Teamwork",
                                desc: "Collaborating across disciplines to build something greater"
                            },
                            {
                                icon: "🌱",
                                title: "Mentorship",
                                desc: "Upperclassmen guiding newcomers in STEM skills"
                            },
                            {
                                icon: "🏆",
                                title: "Gracious Professionalism",
                                desc: "Competing with integrity and mutual respect"
                            }
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

        </div>
    );
}
export default AboutUs;