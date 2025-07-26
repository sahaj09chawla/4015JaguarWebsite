import './Navbar.css';
import logo from '../../../../4015Website/4015Website/src/assets/Team4015logo.png';
import { Link } from 'react-router-dom';

function Navbar() {
    return(
        <>
            <nav className="navbar">
                <div className="logo">
                    <img src={logo} alt="Company logo" />
                </div>

                <ul className="nav-links">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/aboutus">About</Link></li>
                    <li><Link to="/student">Student</Link></li>
                    <li><Link to="/gallery">Gallery</Link></li>
                    <li><Link to="/sponsor">Sponsor</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                </ul>
            </nav>
            <div className="purple-1"></div>
            <div className="purple-2"></div>
        </>
    );
}

export default Navbar;