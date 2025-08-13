import { useEffect, useState, useRef } from 'react';
import './Gallery.css';

interface GalleryImage {
    src: string;
    width: number;
    height: number;
    aspectRatio: number;
}

type ImageModule = { default: string };

const images: Record<string, ImageModule> = import.meta.glob(
    '../assets/gallery/*.{jpg,jpeg,png}',
    { eager: true }
);

function Gallery() {
    const [displayedText, setDisplayedText] = useState('');
    const [typingComplete, setTypingComplete] = useState(false);
    const [layout, setLayout] = useState<GalleryImage[][]>([]);
    const [flatImages, setFlatImages] = useState<GalleryImage[]>([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const layoutCache = useRef<GalleryImage[][] | null>(null);

    useEffect(() => {
        let currentChar = 0;
        const fullText = 'GALLERY';
        const typingInterval = setInterval(() => {
            setDisplayedText(fullText.slice(0, currentChar + 1));
            currentChar++;
            if (currentChar === fullText.length) clearInterval(typingInterval);
            setTypingComplete(currentChar === fullText.length);
        }, 150);
        return () => clearInterval(typingInterval);
    }, []);

    useEffect(() => {
        const loadImages = async () => {
            const imgData: GalleryImage[] = [];

            for (const path in images) {
                const src = images[path].default;
                const dimensions = await getImageDimensions(src);
                imgData.push({
                    src,
                    width: dimensions.width,
                    height: dimensions.height,
                    aspectRatio: dimensions.width / dimensions.height,
                });
            }

            setFlatImages(imgData);

            if (!layoutCache.current) {
                const cachedLayout = calculateLayout(imgData, window.innerWidth, 300);
                layoutCache.current = cachedLayout;
            }

            setLayout(layoutCache.current);
        };

        void loadImages();

        return () => {
            layoutCache.current = null;
        };
    }, []);

    const openModal = (index: number) => {
        setCurrentIndex(index);
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    const nextImage = () => setCurrentIndex((prev) => (prev + 1) % flatImages.length);
    const prevImage = () =>
        setCurrentIndex((prev) => (prev - 1 + flatImages.length) % flatImages.length);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!modalOpen) return;
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') closeModal();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [modalOpen, flatImages]);

    return (
        <div className="gallery-page">
            <div className="gallery-pattern">
                {[...Array(30)].map((_, i) => (
                    <div key={`gallery-line-${i}`} className="gallery-line">
                        {'JAGS '.repeat(40)}
                    </div>
                ))}
            </div>

            <div className="gallery-header-container">
                <h1 className={`gallery-header ${typingComplete ? 'complete' : ''}`}>
                    {displayedText}
                </h1>
            </div>

            <div className="gallery-grid">
                {layout.map((row, rowIndex) => (
                    <div className="gallery-row" key={rowIndex}>
                        {row.map((img, i) => {
                            const index = flatImages.findIndex((f) => f.src === img.src);
                            return (
                                <img key={i} src={img.src} style={{ width: `${img.width}px`, height: `${img.height}px` }} className="gallery-image" alt={`Gallery item ${rowIndex}-${i}`} onClick={() => openModal(index)}/>
                            );
                        })}
                    </div>
                ))}
            </div>

            {modalOpen && flatImages.length > 0 && (
                <div className="gallery-modal" onClick={closeModal}>
                    <span className="gallery-modal-close" onClick={closeModal}>&times;</span>
                    <img src={flatImages[currentIndex].src} className="gallery-modal-image" alt="Modal" onClick={(e) => e.stopPropagation()}/>
                    <button className="gallery-modal-prev"
                        onClick={(e) => {
                            e.stopPropagation(); // prevent closing the modal
                            prevImage();
                        }}
                    >
                        &#10094;
                    </button>
                    <button className="gallery-modal-next"
                        onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                        }}
                    >
                        &#10095;
                    </button>
                </div>
            )}
        </div>
    );
}

function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.src = src;
    });
}

function calculateLayout(
    images: GalleryImage[],
    screenWidth: number,
    targetHeight: number
): GalleryImage[][] {
    const MIN_IMAGES_PER_ROW = 2;
    const MAX_IMAGES_PER_ROW = 4;
    const layout: GalleryImage[][] = [];
    let currentRow: GalleryImage[] = [];
    let currentWidth = 0;

    images.forEach((img) => {
        const scaledWidth = targetHeight * img.aspectRatio;
        if (
            (currentRow.length < MAX_IMAGES_PER_ROW &&
                currentWidth + scaledWidth <= screenWidth) ||
            currentRow.length < MIN_IMAGES_PER_ROW
        ) {
            currentRow.push({ ...img, width: scaledWidth, height: targetHeight });
            currentWidth += scaledWidth;
        } else {
            layout.push(scaleRow(currentRow, screenWidth, targetHeight));
            currentRow = [{ ...img, width: scaledWidth, height: targetHeight }];
            currentWidth = scaledWidth;
        }
    });

    if (currentRow.length) layout.push(scaleRow(currentRow, screenWidth, targetHeight));
    return layout;
}

function scaleRow(row: GalleryImage[], targetWidth: number, targetHeight: number): GalleryImage[] {
    const totalAspect = row.reduce((sum, img) => sum + img.aspectRatio, 0);
    return row.map((img) => {
        const newWidth = targetWidth * (img.aspectRatio / totalAspect);
        return { ...img, width: newWidth, height: targetHeight };
    });
}

export default Gallery;
