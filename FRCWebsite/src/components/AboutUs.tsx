import { useEffect, useState} from 'react';
// import { useNavigate } from 'react-router-dom';
import './AboutUs.css';
import AboutImage from '../assets/AboutImage.png';
import './banners.css'; // Import the banner styles
import achievement from '../assets/achievement.png';
import first from '../assets/first.svg';
import subteam from '../assets/subteams.png';
import mechanical from '../assets/mechanical-icon.png';
import electrical from '../assets/electrical-icon.png';
import design from '../assets/design-icon.png';
import programming from '../assets/programming-icon.png';


function AboutUs() {
    const [displayedText, setDisplayedText] = useState('');

    const [flippedButtons, setFlippedButtons] = useState<Record<string, boolean>>({
        mechanical: false,
        electrical: false,
        design: false,
        programming: false
    });

    const handleSubteamClick = (subteam: string) => {
        setFlippedButtons(prev => ({
            ...prev,
            [subteam]: !prev[subteam]
        }));
    };


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

    useEffect(() => {
        const banners = document.querySelectorAll<HTMLElement>('.banners li');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = entry.target as HTMLElement;
                        target.style.animationPlayState = 'running';
                    }
                });
            },
            { threshold: 0.1 }
        );

        banners.forEach(banner => {
            const htmlBanner = banner as HTMLElement;
            htmlBanner.style.animationPlayState = 'paused';
            observer.observe(htmlBanner);
        });

        return () => {
            banners.forEach(banner => {
                observer.unobserve(banner);
            });
        };
    }, []);

    useEffect(() => {
        const buttons = document.querySelectorAll('.subteam-button');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        buttons.forEach(button => observer.observe(button));

        return () => {
            buttons.forEach(button => observer.unobserve(button));
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
                                <div className="scalable-banner-container">
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

                <div className="subteams-title-strip">
                    <h2>ABOUT OUR SUBTEAMS</h2>
                </div>

                <div className="subteams-container">
                    <div className="subteams-image-container">
                        <img src={subteam} alt="Subteams" className="subteams-image" />
                        <div className="subteams-image-overlay"></div>
                    </div>

                    <div className="subteams-content">
                        <div className="subteams-textbox">
                            <p>
                                Our team is divided into specialized subteams, each focusing on different aspects of our robot's
                                development. This structure allows members to develop deep expertise while collaborating across
                                disciplines to create a cohesive final product.
                            </p>
                        </div>

                        <div className="subteams-grid">
                            <button className={`subteam-button ${flippedButtons.mechanical ? 'flipped' : ''}`} onClick={() => handleSubteamClick('mechanical')}>
                                <div className="subteam-button-inner">
                                    <div className="subteam-button-front">
                                        Mechanical
                                        <img src={mechanical} alt="Mechanical" />
                                    </div>
                                    <div className="subteam-button-back">
                                        <ul>
                                            <li>Design and build robot mechanisms</li>
                                            <li>CAD modeling and prototyping</li>
                                            <li>Machining and fabrication</li>
                                            <li>Pneumatics and drivetrain</li>
                                        </ul>
                                    </div>
                                </div>
                            </button>

                            <button className={`subteam-button ${flippedButtons.electrical ? 'flipped' : ''}`} onClick={() => handleSubteamClick('electrical')}>
                                <div className="subteam-button-inner">
                                    <div className="subteam-button-front">
                                        Electrical
                                        <img src={electrical} alt="Electrical" />
                                    </div>
                                    <div className="subteam-button-back">
                                        <ul>
                                            <li>Wiring and circuit design</li>
                                            <li>Power distribution</li>
                                            <li>Sensors and motor control</li>
                                            <li>Control system integration</li>
                                        </ul>
                                    </div>
                                </div>
                            </button>

                            <button className={`subteam-button ${flippedButtons.design ? 'flipped' : ''}`} onClick={() => handleSubteamClick('design')}>
                                <div className="subteam-button-inner">
                                    <div className="subteam-button-front">
                                        Design
                                        <img src={design} alt="Design" />
                                    </div>
                                    <div className="subteam-button-back">
                                        <ul>
                                            <li>Robot aesthetics and branding</li>
                                            <li>Team merchandise</li>
                                            <li>Competition pit design</li>
                                            <li>Marketing materials</li>
                                        </ul>
                                    </div>
                                </div>
                            </button>

                            <button className={`subteam-button ${flippedButtons.programming ? 'flipped' : ''}`} onClick={() => handleSubteamClick('programming')}>
                                <div className="subteam-button-inner">
                                    <div className="subteam-button-front">
                                        Programming
                                        <img src={programming} alt="Programming" />
                                    </div>
                                    <div className="subteam-button-back">
                                        <ul>
                                            <li>Robot control software</li>
                                            <li>Autonomous routines</li>
                                            <li>Sensor integration</li>
                                            <li>Driver station interface</li>
                                        </ul>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutUs;