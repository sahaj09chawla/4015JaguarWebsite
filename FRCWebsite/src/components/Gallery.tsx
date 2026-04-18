import { useEffect, useState, useRef } from 'react';
import './Gallery.css';
import galleryManifest from '../generated/gallery-manifest.json';

interface GalleryImage {
    index: number;
    /** Full-resolution URL (modal). */
    src: string;
    /** Smaller WebP for grid (generated at build). */
    thumbSrc: string;
    width: number;
    height: number;
    aspectRatio: number;
}

type ImageModule = { default: string };

type GalleryManifest = {
    images: { file: string; width: number; height: number }[];
};

/** Full-size originals (modal). Excludes generated thumbs folder via glob depth. */
const imageLoaders = import.meta.glob('../assets/gallery/*.{jpg,jpeg,png}') as Record<
    string,
    () => Promise<ImageModule>
>;

/** Build-generated WebP thumbnails for the grid (max ~800px wide). */
const thumbLoaders = import.meta.glob('../assets/gallery/thumbs/*.webp') as Record<
    string,
    () => Promise<ImageModule>
>;

function fileFromGlobPath(globPath: string): string {
    const norm = globPath.replace(/\\/g, '/');
    const i = norm.lastIndexOf('/');
    return i === -1 ? norm : norm.slice(i + 1);
}

function baseNameWithoutExt(filename: string): string {
    return filename.replace(/\.[^.]+$/u, '');
}

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
            const paths = Object.keys(imageLoaders).sort((a, b) =>
                fileFromGlobPath(a).localeCompare(fileFromGlobPath(b), undefined, { numeric: true })
            );

            const manifest = galleryManifest as GalleryManifest;
            const dimByFile = new Map(manifest.images.map((img) => [img.file, img]));

            const thumbByBase = new Map<string, () => Promise<ImageModule>>();
            for (const key of Object.keys(thumbLoaders)) {
                const base = baseNameWithoutExt(fileFromGlobPath(key));
                thumbByBase.set(base, thumbLoaders[key]);
            }

            const modules = await Promise.all(paths.map((p) => imageLoaders[p]()));
            const srcs = modules.map((m) => m.default);

            const thumbSrcs = await Promise.all(
                paths.map(async (p, i) => {
                    const file = fileFromGlobPath(p);
                    const base = baseNameWithoutExt(file);
                    const loadThumb = thumbByBase.get(base);
                    if (!loadThumb) return srcs[i];
                    const mod = await loadThumb();
                    return mod.default;
                })
            );

            const imgData: GalleryImage[] = paths.map((p, i) => {
                const file = fileFromGlobPath(p);
                const dim = dimByFile.get(file);
                const w = dim?.width ?? 3;
                const h = dim?.height ?? 2;
                return {
                    index: i,
                    src: srcs[i],
                    thumbSrc: thumbSrcs[i],
                    width: w,
                    height: h,
                    aspectRatio: w / h,
                };
            });

            setFlatImages(imgData);

            if (!layoutCache.current) {
                const cachedLayout = calculateLayout(imgData, window.innerWidth, 300);
                layoutCache.current = cachedLayout;
            }

            setLayout(layoutCache.current);
        };

        void loadImages();
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
            if (e.key === 'ArrowRight' && flatImages.length > 0) {
                setCurrentIndex((prev) => (prev + 1) % flatImages.length);
            }
            if (e.key === 'ArrowLeft' && flatImages.length > 0) {
                setCurrentIndex((prev) => (prev - 1 + flatImages.length) % flatImages.length);
            }
            if (e.key === 'Escape') {
                setModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [modalOpen, flatImages.length]);

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
                        {row.map((img, i) => (
                            <img
                                key={`${rowIndex}-${img.index}-${i}`}
                                src={img.thumbSrc}
                                style={{ width: `${img.width}px`, height: `${img.height}px` }}
                                className="gallery-image1"
                                alt={`Gallery item ${rowIndex}-${i}`}
                                loading="lazy"
                                decoding="async"
                                fetchPriority="low"
                                onClick={() => openModal(img.index)}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {modalOpen && flatImages.length > 0 && (
                <div className="gallery-modal" onClick={closeModal}>
                    <span className="gallery-modal-close" onClick={closeModal}>&times;</span>
                    <img
                        src={flatImages[currentIndex].src}
                        className="gallery-modal-image"
                        alt="Modal"
                        decoding="async"
                        fetchPriority="high"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button className="gallery-modal-prev"
                        onClick={(e) => {
                            e.stopPropagation();
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
