import { useState } from "react";
import { FaImages, FaTimes } from "react-icons/fa";

// Gallery data - directly embedded in component
const galleryData = [
    {
        id: 1,
        src: "/Images/community_garden_workshop.jpeg",
        alt: "Community Garden Workshop",
        category: "Workshop"
    },
    {
        id: 2,
        src: "/Images/urban_roof_top_garden.webp",
        alt: "Urban Rooftop Garden",
        category: "Garden"
    },
    {
        id: 3,
        src: "/Images/community_event.jpg",
        alt: "Community Event",
        category: "Event"
    },
    {
        id: 4,
        src: "/Images/harvest_day_celebration.jpg",
        alt: "Harvest Day Celebration",
        category: "Event"
    },
    {
        id: 5,
        src: "/Images/sustainable_farming.webp",
        alt: "Sustainable Farming",
        category: "Garden"
    },
    {
        id: 6,
        src: "/Images/urban_farming_tools.jpg",
        alt: "Urban Farming Tools",
        category: "Workshop"
    }
];

function GalleryShowcase() {
    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <section className="mb-12 fold:mb-16 sm:mb-24">
            {/* Section Header */}
            <div className="text-center mb-6 fold:mb-8 sm:mb-12">
                <div className="flex items-center justify-center gap-2 fold:gap-3 mb-3 fold:mb-4">
                    <FaImages className="text-ecoGreen text-xl fold:text-2xl sm:text-3xl" />
                    <h2 className="text-lg fold:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-ecoHeading font-bold text-ecoDark dark:text-white">
                        Community Gallery
                    </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-xs fold:text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                    Moments from our thriving urban harvest community
                </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 fold:grid-cols-2 md:grid-cols-3 gap-3 fold:gap-4 sm:gap-6">
                {galleryData.map((image) => (
                    <div
                        key={image.id}
                        className="group relative overflow-hidden rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                    >
                        {/* Image */}
                        <div className="aspect-square overflow-hidden">
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 fold:p-4 sm:p-5">
                            <span className="text-ecoLight text-[9px] fold:text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
                                {image.category}
                            </span>
                            <h3 className="text-white font-bold text-xs fold:text-sm sm:text-base leading-tight">
                                {image.alt}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-3 fold:p-4 sm:p-6"
                    onClick={() => setSelectedImage(null)}
                >
                    {/* Close Button */}
                    <button
                        className="absolute top-3 fold:top-4 sm:top-6 right-3 fold:right-4 sm:right-6 text-white hover:text-ecoGreen text-2xl fold:text-3xl sm:text-4xl transition-colors z-10"
                        onClick={() => setSelectedImage(null)}
                    >
                        <FaTimes />
                    </button>

                    {/* Image */}
                    <div className="relative max-w-5xl w-full">
                        <img
                            src={selectedImage.src}
                            alt={selectedImage.alt}
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg fold:rounded-xl sm:rounded-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="mt-3 fold:mt-4 text-center">
                            <span className="inline-block bg-ecoGreen/20 text-ecoLight px-2 fold:px-3 py-0.5 fold:py-1 rounded-full text-[9px] fold:text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
                                {selectedImage.category}
                            </span>
                            <h3 className="text-white font-bold text-sm fold:text-base sm:text-lg md:text-xl">
                                {selectedImage.alt}
                            </h3>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default GalleryShowcase;
