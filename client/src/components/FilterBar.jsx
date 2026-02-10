import {
    FaThLarge,
    FaUtensils,
    FaHome,
    FaSeedling,
    FaUsers,
    FaGraduationCap,
    FaHandsHelping,
    FaTools,
    FaRecycle,
    FaLeaf,
    FaCalendarCheck,
    FaCalendarPlus,
    FaCalendarAlt
} from "react-icons/fa";

function FilterBar({ categories, activeCategory, onCategoryChange, themeColor = "ecoGreen" }) {
    // Map categories to their respective icons
    const categoryIcons = {
        "All": FaThLarge,
        "Food": FaUtensils,
        "Lifestyle": FaHome,
        "Gardening": FaSeedling,
        "Community": FaUsers,
        "Education": FaGraduationCap,
        "Volunteering": FaHandsHelping,
        "DIY": FaTools,
        "Sustainability": FaRecycle,
        "Weekly": FaCalendarCheck,
        "Bi-weekly": FaCalendarPlus,
        "Monthly": FaCalendarAlt
    };

    // Map theme colors to CSS utility classes
    const colorMap = {
        ecoGreen: {
            active: "filter-btn-base filter-btn-green-active",
            inactive: "filter-btn-base filter-btn-green-inactive"
        },
        ecoOrange: {
            active: "filter-btn-base filter-btn-orange-active",
            inactive: "filter-btn-base filter-btn-orange-inactive"
        },
        ecoYellow: {
            active: "filter-btn-base filter-btn-yellow-active",
            inactive: "filter-btn-base filter-btn-yellow-inactive"
        },
        ecoPurple: {
            active: "filter-btn-base filter-btn-purple-active",
            inactive: "filter-btn-base filter-btn-purple-inactive"
        }
    };

    const theme = colorMap[themeColor] || colorMap.ecoGreen;

    return (
        <div className="flex flex-wrap gap-2 fold:gap-3 sm:gap-4 mb-4 fold:mb-6 sm:mb-8 justify-center">
            {categories.map((category) => {
                const IconComponent = categoryIcons[category] || FaLeaf;
                return (
                    <button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        className={`px-4 fold:px-5 sm:px-7 py-2 fold:py-2.5 sm:py-3 rounded-full font-bold transition-all duration-300 text-[11px] fold:text-sm sm:text-base flex items-center gap-1.5 fold:gap-2 sm:gap-2.5 ${activeCategory === category
                            ? theme.active
                            : theme.inactive
                            }`}
                    >
                        <IconComponent className="text-xs fold:text-sm sm:text-lg" />
                        <span>{category}</span>
                    </button>
                );
            })}
        </div>
    );
}

export default FilterBar;
