import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

import Img1 from '../assets/Team_Picture.png';
import Img2 from '../assets/Aura_Black4015.png';
import Img3 from '../assets/Match_2022.png';
import Img4 from '../assets/School_Robot.png';
import Img5 from '../assets/2022moving.png';
import Img6 from '../assets/backstage.png';
import Img7 from '../assets/drivecontrol.png';
import Img8 from '../assets/jasonpic.png';
import Img9 from '../assets/mantis.png';
import Img10 from '../assets/teampeople.png';
import Img12 from '../assets/teampit2.png';
import Img13 from '../assets/buildingrobot.png';
import Img14 from '../assets/teamcap.png';
import instagram from '../assets/instagram_icon.png';
import X from '../assets/X_logo.png';
import youtube from '../assets/youtube_logo.png';


const images = [Img1, Img2, Img3, Img4];
const teamName = "4015 Jaguar Robotics";
const galleryImages = [
    { id: 1, src: Img5, alt: "2022 Moving Robot" },
    { id: 2, src: Img6, alt: "Backstage Preparation" },
    { id: 3, src: Img7, alt: "Drive Control Station" },
    { id: 4, src: Img8, alt: "Team Member Jason" },
    { id: 5, src: Img9, alt: "Mantis Robot" },
    { id: 6, src: Img10, alt: "Team Working Together" },
    { id: 7, src: Img12, alt: "Pit Crew Working" },
    { id: 8, src: Img13, alt: "Building Robot" }
];

function Home() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [slideIn, setSlideIn] = useState(false);
    const [modalImage, setModalImage] = useState<string | null>(null);
    const [currentGalleryIndex, setCurrentGalleryIndex] = useState<number | null>(null);

    useEffect(() => {
        setSlideIn(true);
        let currentChar = 0;
        const typingInterval = setInterval(() => {
            setDisplayedText(teamName.slice(0, currentChar + 1));
            currentChar++;
            if (currentChar === teamName.length) clearInterval(typingInterval);
        }, 150);
        return () => clearInterval(typingInterval);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    const goPrev = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    const goNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);

    useEffect(() => {
        const section = document.querySelector('.about-section');
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            }),
            { threshold: 0.3 }
        );
        if (section) observer.observe(section);
        return () => { if (section) observer.unobserve(section); };
    }, []);

    const openModal = (imgSrc: string, index: number) => {
        setModalImage(imgSrc);
        setCurrentGalleryIndex(index);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setModalImage(null);
        setCurrentGalleryIndex(null);
        document.body.style.overflow = 'auto';
    };

    const goToNextImage = () => {
        if (currentGalleryIndex === null) return;
        const nextIndex = (currentGalleryIndex + 1) % galleryImages.length;
        setModalImage(galleryImages[nextIndex].src);
        setCurrentGalleryIndex(nextIndex);
    };

    const goToPrevImage = () => {
        if (currentGalleryIndex === null) return;
        const prevIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
        setModalImage(galleryImages[prevIndex].src);
        setCurrentGalleryIndex(prevIndex);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && modalImage) {
                setModalImage(null);
                setCurrentGalleryIndex(null);
                document.body.style.overflow = 'auto';
            }
            if (e.key === 'ArrowRight' && modalImage && currentGalleryIndex !== null) {
                const nextIndex = (currentGalleryIndex + 1) % galleryImages.length;
                setModalImage(galleryImages[nextIndex].src);
                setCurrentGalleryIndex(nextIndex);
            }
            if (e.key === 'ArrowLeft' && modalImage && currentGalleryIndex !== null) {
                const prevIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
                setModalImage(galleryImages[prevIndex].src);
                setCurrentGalleryIndex(prevIndex);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [modalImage, currentGalleryIndex]);

    useEffect(() => {
        const header = document.querySelector('.highlights-header');
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            }),
            { threshold: 0.1 }
        );
        if (header) observer.observe(header);
        return () => { if (header) observer.unobserve(header); };
    }, []);

    useEffect(() => {
        const section = document.querySelector('.highlights-section');
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            }),
            { threshold: 0.3 }
        );
        if (section) observer.observe(section);
        return () => { if (section) observer.unobserve(section); };
    }, []);

    useEffect(() => {
        const socialText = "Follow and experience our robotics journey...";
        const typingElement = document.querySelector('.typing-text');
        const logos = document.querySelectorAll('.social-logo');
        const learnMoreBtn = document.querySelector('.learn-more-button');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Typing animation
                        let currentChar = 0;
                        const typingInterval = setInterval(() => {
                            if (typingElement) {
                                typingElement.textContent = socialText.slice(0, currentChar + 1);
                            }
                            currentChar++;
                            if (currentChar === socialText.length) {
                                clearInterval(typingInterval);
                                setTimeout(() => {
                                    logos.forEach(logo => {
                                        logo.classList.add('visible');
                                    });
                                    setTimeout(() => {
                                        if (learnMoreBtn) learnMoreBtn.classList.add('visible');
                                    }, 500);
                                }, 300);
                            }
                        }, 150);

                        return () => clearInterval(typingInterval);
                    }
                });
            },
            { threshold: 0.3 }
        );

        if (typingElement) observer.observe(typingElement);

        return () => {
            if (typingElement) observer.unobserve(typingElement);
        };
    }, []);

    return (
        <div className="home-screen">
            <div style={{ width: '100%', minHeight: '500px' }}>
                <div className={`gallery-container ${slideIn ? 'slide-in' : ''}`}>
                    <div className="team-name">{displayedText}</div>

                    <div className="button-group">
                        <Link to="/contact" className="btn-outline">Support Us</Link>
                        <Link to="/aboutus" className="btn-outline">About Us</Link>
                    </div>

                    <div className="image-wrapper">
                        <img
                            src={images[currentIndex]}
                            alt={`Slide ${currentIndex}`}
                            className="gallery-image"
                            decoding="async"
                            fetchPriority="high"
                        />
                        <div className="overlay" />
                    </div>

                    <button className="nav-arrow left-arrow" onClick={goPrev} aria-label="Previous Image">&#10094;</button>
                    <button className="nav-arrow right-arrow" onClick={goNext} aria-label="Next Image">&#10095;</button>
                </div>
            </div>
            <div className="about-button-container">
                <Link to="/aboutus" className="floating-button about-button">
                    More About Us
                </Link>
            </div>
            <div className="about-container">

                <div className="jags-pattern-top">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="jags-line">{"JAGS ".repeat(20)}</div>
                    ))}
                </div>

                <div className="about-section">
                    <h2>Our Team</h2>
                    <p>This is where you put text about your team.This is where you put text about your team.This is where you put text about your team.This is where you put text about your team.This is where you put text about your team.This is where you put text about your team.This is where you put text about your team.</p>
                </div>
            </div>

            <div className="gallery-section">
                <Link to="/gallery" className="floating-button gallery-button">
                    Gallery
                </Link>

                <div className="image-grid">
                    {galleryImages.map((image, index) => (
                        <div key={image.id} className="grid-item" onClick={() => openModal(image.src, index)}>
                            <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
                        </div>
                    ))}
                </div>
            </div>

            {modalImage && (
                <div className="image-modal" onClick={closeModal}>
                    <button className="modal-nav-button left" onClick={(e) => {e.stopPropagation();goToPrevImage();}} aria-label="Previous image">
                        &#10094;
                    </button>

                    <img src={modalImage} alt="Expanded view" decoding="async" fetchPriority="high" onClick={e => e.stopPropagation()}/>

                    <button className="modal-nav-button right" onClick={(e) => {e.stopPropagation();goToNextImage();}} aria-label="Next image">
                        &#10095;
                    </button>

                    <button className="modal-close-button" onClick={closeModal} aria-label="Close image">
                        &times;
                    </button>
                </div>
            )}
            <div className="highlights-container">
                <div className="jags-pattern-highlights">
                    {[...Array(7)].map((_, i) => (
                        <div key={`hl-${i}`} className="jags-line">{"JAGS ".repeat(20)}</div>
                    ))}
                </div>
                <div className="highlights-section">
                    <h2>Season Highlights</h2>
                    <p>Relive our most exciting moments from the 2020 and 2022 competition seasons</p>

                    <div className="video-container">
                        <div className="video-wrapper">
                            <iframe
                                src="https://www.youtube.com/embed/Xi4naxTUPnY?start=0"
                                title="2020 Season Highlights"
                                allowFullScreen
                                loading="lazy"
                            ></iframe>
                        </div>

                        <div className="video-wrapper">
                            <iframe
                                src="https://www.youtube.com/embed/prOTfw1wLH8?start=0"
                                title="2022 Season Highlights"
                                allowFullScreen
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
            <div className="social-section">
                <div className="social-background">
                    <img src={Img14} alt="Team background" className="social-bg-image" loading="lazy" decoding="async" />
                    <div className="social-overlay" />
                </div>

                <div className="social-content">
                    <div className="social-text">
                        <h2 className="typing-text"></h2>
                    </div>

                    <div className="social-logos">
                        <a href="https://www.instagram.com/frc4015jags/" target="_blank" rel="noopener noreferrer">
                            <img src={instagram} alt="Instagram" className="social-logo" loading="lazy" decoding="async" />
                        </a>
                        <a href="https://x.com/frc4015" target="_blank" rel="noopener noreferrer">
                            <img src={X} alt="Twitter/X" className="social-logo" loading="lazy" decoding="async" />
                        </a>
                        <a href="https://www.youtube.com/@sjssrobotics3292" target="_blank" rel="noopener noreferrer">
                            <img src={youtube} alt="YouTube" className="social-logo" loading="lazy" decoding="async" />
                        </a>
                    </div>

                    <Link to="/aboutus" className="learn-more-button">Learn More</Link>
                </div>
            </div>

        </div>
    );
}

export default Home;
