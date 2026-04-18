import { useState, useEffect, useRef, useMemo } from 'react';
import { Document, Page, pdfjs} from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './Sponsor.css';
import Apple from '../assets/apple_logo.png';
import CGI from '../assets/cgi_logo.png';
import WellLife from '../assets/wellLife_logo.png';
import Laser from '../assets/pro_laser_cut_logo.png';
import EasterChapter from '../assets/eastern_Chapter.png';


pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

function Sponsors() {
    const [numPages1, setNumPages1] = useState<number | null>(null);
    const [numPages2, setNumPages2] = useState<number | null>(null);
    const [pageNumber1, setPageNumber1] = useState(1);
    const [pageNumber2, setPageNumber2] = useState(1);
    const [scale1, setScale1] = useState(0.9);
    const [scale2, setScale2] = useState(0.9);
    const [displayedText, setDisplayedText] = useState('');
    const [typingComplete, setTypingComplete] = useState(false);
    const [pdfError1, setPdfError1] = useState(false);
    const [pdfError2, setPdfError2] = useState(false);
    const [isLoading1, setIsLoading1] = useState(true);
    const [isLoading2, setIsLoading2] = useState(true);
    const [pastSponsorsText, setPastSponsorsText] = useState('');
    const [pastSponsorsTypingComplete, setPastSponsorsTypingComplete] = useState(false);
    const [visibleLogos, setVisibleLogos] = useState([false, false, false, false, false]);
    const containerRef1 = useRef<HTMLDivElement>(null);
    const containerRef2 = useRef<HTMLDivElement>(null);
    const sponsorsSectionRef = useRef<HTMLDivElement>(null);

    /** Defer fetching/rendering PDFs until the viewer is near the viewport (saves bandwidth + main-thread work). */
    const [shouldLoadPdf1, setShouldLoadPdf1] = useState(false);
    const [shouldLoadPdf2, setShouldLoadPdf2] = useState(false);

    const pdfFile1 = useMemo(() => ({
        url: '/documents/SponsorshipPackage2025-2026.pdf'
    }), []);

    const pdfFile2 = useMemo(() => ({
        url: '/documents/2025sponsorshipinstructions.pdf'
    }), []);

    const pdfOptions = useMemo(() => ({
    }), []);

    useEffect(() => {
        let currentChar = 0;
        const fullText = "Sponsorships";
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

    useEffect(() => {
        if (typingComplete) {
            let currentChar = 0;
            const fullText = "Past Sponsors";
            const typingInterval = setInterval(() => {
                setPastSponsorsText(fullText.slice(0, currentChar + 1));
                currentChar++;
                if (currentChar === fullText.length) {
                    clearInterval(typingInterval);
                    setPastSponsorsTypingComplete(true);
                }
            }, 150);

            return () => clearInterval(typingInterval);
        }
    }, [typingComplete]);

    useEffect(() => {
        const el1 = containerRef1.current;
        const el2 = containerRef2.current;
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    if (entry.target === el1) setShouldLoadPdf1(true);
                    if (entry.target === el2) setShouldLoadPdf2(true);
                }
            },
            { rootMargin: "400px 0px", threshold: 0 }
        );
        if (el1) observer.observe(el1);
        if (el2) observer.observe(el2);
        return () => {
            if (el1) observer.unobserve(el1);
            if (el2) observer.unobserve(el2);
        };
    }, []);

    useEffect(() => {
        const observedSection = sponsorsSectionRef.current;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => setVisibleLogos([true, false, false, false, false]), 200);
                        setTimeout(() => setVisibleLogos([true, true, false, false, false]), 400);
                        setTimeout(() => setVisibleLogos([true, true, true, false, false]), 600);
                        setTimeout(() => setVisibleLogos([true, true, true, true, false]), 800);
                        setTimeout(() => setVisibleLogos([true, true, true, true, true]), 1000);
                    }
                });
            },
            { threshold: 0.3 }
        );

        if (observedSection) {
            observer.observe(observedSection);
        }

        return () => {
            if (observedSection) {
                observer.unobserve(observedSection);
            }
        };
    }, []);

    const onDocumentLoadSuccess1 = ({ numPages }: { numPages: number }) => {
        setNumPages1(numPages);
        setIsLoading1(false);
        setPdfError1(false);
    };

    const onDocumentLoadError1 = (error: Error) => {
        console.error('Error loading PDF 1:', error);
        setPdfError1(true);
        setIsLoading1(false);
    };

    const onDocumentLoadSuccess2 = ({ numPages }: { numPages: number }) => {
        setNumPages2(numPages);
        setIsLoading2(false);
        setPdfError2(false);
    };

    const onDocumentLoadError2 = (error: Error) => {
        console.error('Error loading PDF 2:', error);
        setPdfError2(true);
        setIsLoading2(false);
    };

    const downloadPdf = (url: string, filename: string) => {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(blobUrl);
            })
            .catch(error => {
                console.error('Error downloading PDF:', error);
            });
    };

    const retryLoadPdf1 = () => {
        setIsLoading1(true);
        setPdfError1(false);
        setPageNumber1(1);
    };

    const retryLoadPdf2 = () => {
        setIsLoading2(true);
        setPdfError2(false);
        setPageNumber2(1);
    };

    return (
        <div className="sponsors-page">
            <div className="sponsors-pattern">
                {[...Array(30)].map((_, i) => (
                    <div key={`sponsors-line-${i}`} className="jags-line">
                        {"JAGS ".repeat(15)}
                    </div>
                ))}
            </div>

            <div className="sponsors-container">
                <div className="sponsors-content">
                    <h1 className="sponsors-header">
                        {displayedText}
                        {!typingComplete && <span className="typing-cursor">|</span>}
                    </h1>

                    <div className="sponsors-info-box">
                        <p>
                            Welcome to our sponsorships page! Here you can find all the information about
                            supporting our team through our sponsorship program.
                        </p>
                    </div>

                    <div className="sponsorship-sections">
                        <div className="sponsorship-section">
                            <div className="sponsorship-text">
                                <h2>Sponsorship Package</h2>
                                <p>
                                    Our sponsorship package outlines all benefits and opportunities for supporting our team.
                                    Includes tiered sponsorship levels (Gold, Silver, Bronze) with corresponding benefits.
                                </p>
                                <ul>
                                    <li>Brand visibility at competitions</li>
                                    <li>Social media recognition</li>
                                    <li>Logo placement on our robot</li>
                                    <li>Exclusive event invitations</li>
                                </ul>
                            </div>
                            <div className="pdf-viewer-container" ref={containerRef1}>
                                <div className="pdf-controls">
                                    <button onClick={() => setScale1(prev => Math.max(0.5, prev - 0.1))}>-</button>
                                    <span>Zoom: {(scale1 * 100).toFixed(0)}%</span>
                                    <button onClick={() => setScale1(prev => prev + 0.1)}>+</button>
                                    <button onClick={() => downloadPdf('/documents/SponsorshipPackage2025-2026.pdf', 'JAGS_Sponsorship_Package.pdf')} className="download-button">Download PDF</button>
                                </div>
                                <div className="pdf-viewer">
                                    {!shouldLoadPdf1 ? (
                                        <div className="pdf-loading" style={{ minHeight: 280 }}>
                                            Preview loads when you scroll here…
                                        </div>
                                    ) : (
                                        <>
                                            {isLoading1 && <div className="pdf-loading">Loading PDF preview...</div>}
                                            {pdfError1 ? (
                                                <div className="pdf-error">
                                                    <p>Failed to load PDF preview.</p>
                                                    <button onClick={retryLoadPdf1} className="retry-button">Retry</button>
                                                </div>
                                            ) : (
                                                <Document file={pdfFile1} onLoadSuccess={onDocumentLoadSuccess1} onLoadError={onDocumentLoadError1} loading={<div className="pdf-loading">Loading PDF preview...</div>} error={<div className="pdf-error">Failed to load PDF</div>} options={pdfOptions}>
                                                    <Page pageNumber={pageNumber1} scale={scale1} width={containerRef1.current ? Math.min(containerRef1.current.offsetWidth - 30, 600) : 600} loading={<div>Loading page...</div>} error={<div>Error loading page</div>}/>
                                                </Document>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="pdf-pagination">
                                    <button onClick={() => setPageNumber1(prev => Math.max(1, prev - 1))} disabled={pageNumber1 <= 1}>Previous</button>
                                    <span>Page {pageNumber1} of {numPages1 || '--'}</span>
                                    <button onClick={() => setPageNumber1(prev => Math.min(prev + 1, numPages1 || 1))} disabled={pageNumber1 >= (numPages1 || 1)}>Next</button>
                                </div>
                            </div>
                        </div>

                        <div className="sponsorship-section">
                            <div className="sponsorship-text">
                                <h2>Sponsorship Instructions</h2>
                                <p>
                                    The official sponsorship instructions document containing the process for the partners of Jags Robotics to properly place a donation to our team.
                                </p>
                                <ul>
                                    <li>Step by step process</li>
                                    <li>Payment options</li>
                                    <li>Tax deduction information</li>
                                    <li>Contact details for questions</li>
                                </ul>
                            </div>
                            <div className="pdf-viewer-container" ref={containerRef2}>
                                <div className="pdf-controls">
                                    <button onClick={() => setScale2(prev => Math.max(0.5, prev - 0.1))}>-</button>
                                    <span>Zoom: {(scale2 * 100).toFixed(0)}%</span>
                                    <button onClick={() => setScale2(prev => prev + 0.1)}>+</button>
                                    <button onClick={() => downloadPdf('/documents/2025sponsorshipinstructions.pdf', 'JAGS_Sponsorship_Agreement.pdf')} className="download-button">Download PDF</button>
                                </div>
                                <div className="pdf-viewer">
                                    {!shouldLoadPdf2 ? (
                                        <div className="pdf-loading" style={{ minHeight: 280 }}>
                                            Preview loads when you scroll here…
                                        </div>
                                    ) : (
                                        <>
                                            {isLoading2 && <div className="pdf-loading">Loading PDF preview...</div>}
                                            {pdfError2 ? (
                                                <div className="pdf-error">
                                                    <p>Failed to load PDF preview.</p>
                                                    <button onClick={retryLoadPdf2} className="retry-button">Retry</button>
                                                </div>
                                            ) : (
                                                <Document file={pdfFile2} onLoadSuccess={onDocumentLoadSuccess2} onLoadError={onDocumentLoadError2} loading={<div className="pdf-loading">Loading PDF preview...</div>} error={<div className="pdf-error">Failed to load PDF</div>} options={pdfOptions}>
                                                    <Page pageNumber={pageNumber2} scale={scale2} width={containerRef2.current ? Math.min(containerRef2.current.offsetWidth - 30, 600) : 600} loading={<div>Loading page...</div>} error={<div>Error loading page</div>}/>
                                                </Document>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="pdf-pagination">
                                    <button onClick={() => setPageNumber2(prev => Math.max(1, prev - 1))} disabled={pageNumber2 <= 1}>Previous</button>
                                    <span>Page {pageNumber2} of {numPages2 || '--'}</span>
                                    <button onClick={() => setPageNumber2(prev => Math.min(prev + 1, numPages2 || 1))} disabled={pageNumber2 >= (numPages2 || 1)}>Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="past-sponsors-section" ref={sponsorsSectionRef}>
                <div className="past-sponsors-header">
                    {pastSponsorsText}
                    {!pastSponsorsTypingComplete && <span className="typing-cursor">|</span>}
                </div>
            </div>

            <div className="sponsors-grid">
                <div className={`sponsor-logo ${visibleLogos[0] ? 'visible' : ''}`}>
                    <img src={Apple} alt="Apple" loading="lazy" decoding="async" />
                </div>
                <div className={`sponsor-logo ${visibleLogos[1] ? 'visible' : ''}`}>
                    <img src={CGI} alt="CGI" loading="lazy" decoding="async" />
                </div>

                <div className={`sponsor-logo ${visibleLogos[2] ? 'visible' : ''}`}>
                    <img src={WellLife} alt="WellLife" loading="lazy" decoding="async" />
                </div>
                <div className={`sponsor-logo ${visibleLogos[3] ? 'visible' : ''}`}>
                    <img src={EasterChapter} alt="Eastern Chapter" loading="lazy" decoding="async" />
                </div>
                <div className={`sponsor-logo ${visibleLogos[4] ? 'visible' : ''}`}>
                    <img src={Laser} alt="Pro Laser Cut" loading="lazy" decoding="async" />
                </div>
            </div>
        </div>
    );
}

export default Sponsors;
