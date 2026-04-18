import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import { useScreenWidth } from "./hooks/useScreenWidth";
import ScreenBlocker from "./components/ScreenBlocker";

const Home = lazy(() => import("./components/Home"));
const AboutUs = lazy(() => import("./components/AboutUs"));
const Contact = lazy(() => import("./components/Contact"));
const Gallery = lazy(() => import("./components/Gallery"));
const Students = lazy(() => import("./components/Students"));
const Sponsors = lazy(() => import("./components/Sponsor"));

function RouteFallback() {
    return (
        <div
            style={{
                minHeight: "45vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.85)",
                fontFamily: "system-ui, sans-serif",
                fontSize: "1rem",
            }}
        >
            Loading…
        </div>
    );
}

function App() {
    const width = useScreenWidth();
    const isDesktop = width >= 1024;

    return (
        <>
            {isDesktop ? (
                <Router>
                    <Navbar />
                    <Suspense fallback={<RouteFallback />}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/aboutus" element={<AboutUs />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/students" element={<Students />} />
                            <Route path="/sponsor" element={<Sponsors />} />
                            <Route path="/gallery" element={<Gallery />} />
                        </Routes>
                    </Suspense>
                </Router>
            ) : (
                <ScreenBlocker />
            )}
        </>
    );
}

export default App;
