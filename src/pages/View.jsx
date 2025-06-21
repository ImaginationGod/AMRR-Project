import React, { useState, useEffect } from 'react'
import "./View.css" 

// Default image placeholder for missing images from Add.jsx
const PLACEHOLDER_IMAGE =
    "https://media.istockphoto.com/id/1222357475/vector/image-preview-icon-picture-placeholder-for-website-or-ui-ux-design-vector-illustration.jpg?s=612x612&w=0&k=20&c=KuCo-dRBYV7nz2gbk4J9w1WtTAgpTdznHu55W9FjimE=";

// Default images for the carousel
const DEFAULT_IMAGES = [
    {
        id: 1,
        title: 'Jalebi',
        type: 'Food',
        src: 'https://t4.ftcdn.net/jpg/09/76/94/83/360_F_976948359_rtVBTuf4BroTySr70mvosOlrA5etCO6v.jpg',
        description: 'A delicious and sweet treat, made with a unique combination of flavors.'
    },
    {
        id: 2,
        title: 'Tea',
        type: 'Drink',
        src: 'https://t4.ftcdn.net/jpg/05/18/98/51/360_F_518985142_7VQYNp8NpIrIDzyd2fOshRszD4hswfk7.jpg',
        description: 'A refreshing and invigorating beverage, perfect for a hot day.'
    },
    {
        id: 3,
        title: 'BMW E30',
        type: 'Car',
        src: 'https://i.redd.it/wciu6rx0duq41.jpg',
        description: 'A classic car model, known for its sleek design and powerful engine.'
    },
    {
        id: 4,
        title: 'Cat GIF',
        type: 'GIF',
        src: 'https://no-cdn.shortpixel.ai/client/to_avif,q_lossy,ret_wait/https://shortpixel.com/blog/wp-content/uploads/2023/12/nyan-cat.gif',
        description: 'A funny and cute GIF, perfect for a laugh.'
    }
];

// Helper to get src from a value, fallback to placeholder if missing
const getSrc = (imgFile) => {
    if (typeof imgFile === "string" && imgFile.startsWith("data:")) {
        return imgFile;
    } else if (imgFile && imgFile.preview) {
        return imgFile.preview;
    } else if (typeof imgFile === "string" && imgFile.length > 0) {
        return imgFile;
    } else {
        return PLACEHOLDER_IMAGE;
    }
};

// Read from window.addedItemData (set by Add.jsx)
// Even if no image is passed, the title and type would always be passed
function getAddedImages() {
    let addedImages = [];
    try {
        const parsed = window.addedItemData;
        if (parsed) {
            // Collect all images from parsed.images (if any)
            if (parsed.images && Array.isArray(parsed.images) && parsed.images.length > 0) {
                addedImages = addedImages.concat(
                    parsed.images.map((imgFile, idx) => ({
                        id: `added-multi-${idx}`,
                        title: parsed.text1,
                        src: getSrc(imgFile),
                        type: parsed.text2,
                        description: parsed.text3 || ""
                    }))
                );
            }

            // Collect parsed.image if present and not already in images
            if (parsed.image) {
                // Check if parsed.image is already in parsed.images (by value)
                let alreadyIncluded = false;
                if (parsed.images && Array.isArray(parsed.images)) {
                    alreadyIncluded = parsed.images.some(imgFile => {
                        // Compare as string if possible
                        if (typeof imgFile === "string" && typeof parsed.image === "string") {
                            return imgFile === parsed.image;
                        }
                        // Compare preview if present
                        if (imgFile && imgFile.preview && parsed.image && parsed.image.preview) {
                            return imgFile.preview === parsed.image.preview;
                        }
                        return false;
                    });
                }
                if (!alreadyIncluded) {
                    addedImages.push({
                        id: "added-single",
                        title: parsed.text1,
                        src: getSrc(parsed.image),
                        type: parsed.text2,
                        description: parsed.text3 || ""
                    });
                }
            }

            // If neither images nor image is present, still add an item with title/type and placeholder image
            if (
                (!parsed.images || !Array.isArray(parsed.images) || parsed.images.length === 0) &&
                !parsed.image
            ) {
                addedImages.push({
                    id: "added-placeholder",
                    title: parsed.text1,
                    src: PLACEHOLDER_IMAGE,
                    type: parsed.text2,
                    description: parsed.text3 || ""
                });
            }
        }
    } catch (e) {
        // ignore
    }
    // Filter out images with empty src (shouldn't happen due to fallback)
    return addedImages.filter(img => img.src && img.src.length > 0);
}

const View = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [expandedImage, setExpandedImage] = useState(null);
    const [images, setImages] = useState(DEFAULT_IMAGES);

    // On mount, load images from window.addedItemData and merge with defaults
    useEffect(() => {
        const addedImages = getAddedImages();
        // Only add added images if they exist and are not duplicates
        let merged = [...DEFAULT_IMAGES];
        if (addedImages.length > 0) {
            // Avoid duplicate titles
            const existingTitles = new Set(DEFAULT_IMAGES.map(img => img.title));
            addedImages.forEach(img => {
                if (!existingTitles.has(img.title)) {
                    merged.push(img);
                }
            });
        }
        setImages(merged);
    }, []);

    // Clone images to create infinite loop effect
    const carouselImages = [...images, ...images, ...images];

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => {
            if (prevIndex >= images.length - 1) {
                return 0;
            }
            return prevIndex + 1;
        });
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => {
            if (prevIndex === 0) {
                return images.length - 1;
            }
            return prevIndex - 1;
        });
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const openExpandedView = (image) => {
        setExpandedImage(image);
    };

    const closeExpandedView = () => {
        setExpandedImage(null);
    };

    // Auto slide every 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            nextSlide();
        }, 5000);

        return () => clearTimeout(timer);
    }, [currentIndex, images.length]);

    // Close expanded view when pressing Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && expandedImage) {
                closeExpandedView();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [expandedImage]);

    // Calculate the transform value for smooth sliding
    const getTransformValue = () => {
        // When we reach the end, reset to the cloned set for seamless transition
        if (currentIndex >= images.length) {
            return `translateX(-${images.length * (100 / 3)}%)`;
        }
        return `translateX(-${currentIndex * (100 / 3)}%)`;
    };

    // Handler for navigating to Add.jsx
    const goToAddPage = () => {
        if (typeof window !== "undefined" && window.location) {
            window.location.href = "/";
        }
    };

    return (
        <div className="app-container">
            <div className="carousel">
                <div
                    className="carousel-inner"
                    style={{ transform: getTransformValue() }}
                >
                    {carouselImages.map((image, index) => (
                        <div key={`${image.id}-${index}`} className="carousel-item">
                            <div
                                className="carousel-image-container"
                                onClick={() => openExpandedView(image)}
                            >
                                <img
                                    src={image.src || PLACEHOLDER_IMAGE}
                                    alt={image.title}
                                    className="carousel-image"
                                />
                                <div className="carousel-caption">
                                    <h3>{image.title}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="carousel-control prev" onClick={prevSlide}>
                    &lt;
                </button>
                <button className="carousel-control next" onClick={nextSlide}>
                    &gt;
                </button>

                <div className="carousel-indicators">
                    {images.map((_, index) => (
                        <div
                            key={index}
                            className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                        />
                    ))}
                </div>
            </div>
            <div className="add-btn-container">
                <button
                    className="add-btn"
                    onClick={goToAddPage}
                >
                    Add Item
                </button>
            </div>

            {/* Expanded View */}
            <div className={`expanded-view ${expandedImage ? 'active' : ''}`}>
                {expandedImage && (
                    <div className="expanded-content">
                        <div className="expanded-image-container">
                            <img
                                src={expandedImage.src || PLACEHOLDER_IMAGE}
                                alt={expandedImage.title}
                                className="expanded-image"
                            />
                        </div>
                        <div className="expanded-image-text-container">
                            <div className="expanded-details">
                                <h2 className="expanded-title">{expandedImage.title}</h2>
                                <p className="expanded-description">{expandedImage.description}</p>
                                <div className="expanded-meta">
                                    <span>{expandedImage.type}</span>
                                </div>
                            </div>
                            <button className="enquiry-btn" onClick={() => {
                                window.open('https://www.google.com/', '_blank', 'noopener,noreferrer');
                            }}>Enquire</button>
                        </div>
                    </div>
                )}
                <button className="close-btn" onClick={closeExpandedView}>
                    &times;
                </button>
            </div>
        </div>
    );
};

export default View;
