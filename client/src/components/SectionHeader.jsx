function SectionHeader({ prefix, highlight, color = "orange" }) {
    // Map simple color names to Tailwind utility classes
    // This ensures Tailwind scans the full class names correctly
    const colorMap = {
        green: "bg-ecoGreen",
        orange: "bg-ecoOrange",
        yellow: "bg-ecoYellow",
        purple: "bg-ecoPurple",
        blue: "bg-blue-600",
    };

    const activeColor = colorMap[color] || colorMap.orange;

    return (
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6 sm:mb-8 md:mb-10">
            {/* Prefix Text (e.g., "Our") */}
            <h2 className="text-lg fold:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-ecoHeading font-bold text-gray-800 dark:text-gray-200">
                {prefix}
            </h2>

            {/* Highlight Ribbon (e.g., "Products") */}
            <div className={`relative ${activeColor} px-2 fold:px-3 sm:px-5 py-0.5 fold:py-1 sm:py-2 text-white font-ecoHeading font-bold text-sm fold:text-lg sm:text-xl md:text-2xl lg:text-3xl shadow-md transform rotate-1 hover:rotate-0 transition-transform duration-300`}>
                {/* Left Cutout (Pseudo-element simulation using clip-path) */}
                <div className="absolute left-0 top-0 bottom-0 w-3 sm:w-4 bg-gray-100 dark:bg-gray-900" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}></div>

                {/* Right Point (Pseudo-element simulation) */}
                <div className={`absolute -right-3 sm:-right-4 top-0 bottom-0 w-3 sm:w-4 ${activeColor}`} style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}></div>

                <span className="relative z-10 px-1">{highlight}</span>
            </div>
        </div>
    );
}

export default SectionHeader;
