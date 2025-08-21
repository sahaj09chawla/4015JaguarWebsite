import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import Gallery from './components/Gallery';
import Students from './components/Students';
import Sponsors from './components/Sponsor';

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/aboutus" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/students" element={<Students />} />
                <Route path="/sponsor" element={<Sponsors />}/>
                <Route path="/gallery" element={<Gallery />} />
            </Routes>
        </Router>
    );
}

export default App;
