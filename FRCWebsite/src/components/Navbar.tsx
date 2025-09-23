import './Navbar.css';
import logo from '../assets/Team4015logo.png';
import { Link } from 'react-router-dom';
import { useState } from 'react';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return(
        <>
            <nav className="navbar">
                <div className="logo">
                    <img src={logo} alt="Company logo" />
                </div>

                <div className="hamburger" onClick={toggleMenu}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>

                <ul className={`nav-links ${isMenuOpen ? 'nav-active' : ''}`}>
                    <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
                    <li><Link to="/aboutus" onClick={() => setIsMenuOpen(false)}>About</Link></li>
                    <li><Link to="/students" onClick={() => setIsMenuOpen(false)}>Student</Link></li>
                    <li><Link to="/gallery" onClick={() => setIsMenuOpen(false)}>Gallery</Link></li>
                    <li><Link to="/sponsor" onClick={() => setIsMenuOpen(false)}>Sponsor</Link></li>
                    <li><Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link></li>
                </ul>
            </nav>
            <div className="purple-1"></div>
            <div className="purple-2"></div>
        </>
    );
}

export default Navbar;