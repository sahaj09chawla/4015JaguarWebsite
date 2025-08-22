import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './Sponsor.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

function Sponsors() {
    const [numPages1, setNumPages1] = useState<number | null>(null);
    const [numPages2, setNumPages2] = useState<number | null>(null);
    const [pageNumber1, setPageNumber1] = useState(1);
    const [pageNumber2, setPageNumber2] = useState(1);
    const [scale1, setScale1] = useState(1.0);
    const [scale2, setScale2] = useState(1.0);
    const [displayedText, setDisplayedText] = useState('');
    const [typingComplete, setTypingComplete] = useState(false);
    const [pdfError1, setPdfError1] = useState(false);
    const [pdfError2, setPdfError2] = useState(false);
    const [isLoading1, setIsLoading1] = useState(true);
    const [isLoading2, setIsLoading2] = useState(true);
    const containerRef1 = useRef<HTMLDivElement>(null);
    const containerRef2 = useRef<HTMLDivElement>(null);

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
            });
    };

    const retryLoadPdf1 = () => {
        setIsLoading1(true);
        setPdfError1(false);
        setPageNumber1(prev => prev);
    };

    const retryLoadPdf2 = () => {
        setIsLoading2(true);
        setPdfError2(false);
        setPageNumber2(prev => prev);
    };

    return (
        <div className="sponsors-page">
            <div className="sponsors-pattern">
                {[...Array(30)].map((_, i) => (
                    <div key={`sponsors-line-${i}`} className="jags-line">
                        {"JAGS ".repeat(40)}
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
                                    {isLoading1 && <div className="pdf-loading">Loading PDF preview...</div>}
                                    {pdfError1 ? (
                                        <div className="pdf-error">
                                            <p>Failed to load PDF preview.</p>
                                            <button onClick={retryLoadPdf1} className="retry-button">Retry</button>
                                        </div>
                                    ) : (
                                        <Document file="/documents/SponsorshipPackage2025-2026.pdf" onLoadSuccess={onDocumentLoadSuccess1} onLoadError={onDocumentLoadError1} loading={null}>
                                            <Page pageNumber={pageNumber1} scale={scale1} width={containerRef1.current ? Math.min(containerRef1.current.offsetWidth, 600) : 600}/>
                                        </Document>
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
                                    {isLoading2 && <div className="pdf-loading">Loading PDF preview...</div>}
                                    {pdfError2 ? (
                                        <div className="pdf-error">
                                            <p>Failed to load PDF preview.</p>
                                            <button onClick={retryLoadPdf2} className="retry-button">Retry</button>
                                        </div>
                                    ) : (
                                        <Document file="/documents/2025sponsorshipinstructions.pdf" onLoadSuccess={onDocumentLoadSuccess2} onLoadError={onDocumentLoadError2} loading={null}>
                                            <Page pageNumber={pageNumber2} scale={scale2} width={containerRef2.current ? Math.min(containerRef2.current.offsetWidth, 600) : 600}/>
                                        </Document>
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
        </div>
    );
}

export default Sponsors;