import { Link } from "react-router-dom";
import { FaBox, FaCalendarAlt, FaChalkboardTeacher, FaGift, FaArrowRight } from "react-icons/fa";

function CategoryGrid() {
  const categories = [
    {
      name: "Products",
      link: "/products",
      icon: <FaBox />,
      gradient: "from-ecoGreen to-ecoDark",
      bgColor: "bg-ecoGreen/30",
      iconColor: "text-ecoGreen",
      description: "Eco-friendly products for sustainable living"
    },
    {
      name: "Events",
      link: "/events",
      icon: <FaCalendarAlt />,
      gradient: "from-ecoOrange to-ecoOrangeLight",
      bgColor: "bg-ecoOrange/30",
      iconColor: "text-ecoOrange",
      description: "Join our community eco events"
    },
    {
      name: "Workshops",
      link: "/workshops",
      icon: <FaChalkboardTeacher />,
      gradient: "from-ecoYellow to-ecoYellowLight",
      bgColor: "bg-ecoYellow/30",
      iconColor: "text-ecoYellow",
      description: "Learn sustainable practices"
    },
    {
      name: "Subscription Boxes",
      link: "/subscription-boxes",
      icon: <FaGift />,
      gradient: "from-ecoPurple to-ecoPurpleLight",
      bgColor: "bg-ecoPurple/30",
      iconColor: "text-ecoPurple",
      description: "Curated eco-friendly surprises delivered"
    },
  ];

  return (
    <section>
      {/* Section Header */}
      <div className="text-center mb-6 fold:mb-8 sm:mb-10">
        <h3 className="text-lg fold:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-ecoHeading font-bold text-ecoDark dark:text-white mb-1.5 fold:mb-2 sm:mb-3">Explore Our Categories</h3>
        <p className="text-xs fold:text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">Discover eco-friendly products, events, workshops, and subscription boxes</p>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 fold:gap-6 sm:gap-8">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={cat.link}
            className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl fold:rounded-3xl p-5 fold:p-6 sm:p-7 shadow-lg fold:shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 fold:hover:-translate-y-4 border-2 border-gray-200 dark:border-gray-700 hover:border-transparent overflow-hidden backdrop-blur-sm"
          >
            {/* Animated gradient border on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}></div>
            <div className="absolute inset-[2px] bg-white dark:bg-gray-800 rounded-2xl fold:rounded-3xl -z-5"></div>

            {/* Background gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-15 transition-opacity duration-500`}></div>

            {/* Content */}
            <div className="relative z-10">
              {/* Icon Container with gradient background */}
              <div className={`relative bg-gradient-to-br ${cat.gradient} w-14 h-14 fold:w-16 fold:h-16 sm:w-20 sm:h-20 rounded-2xl fold:rounded-3xl flex items-center justify-center mb-4 fold:mb-5 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                <div className="text-white text-2xl fold:text-3xl sm:text-4xl drop-shadow-lg">
                  {cat.icon}
                </div>
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} rounded-2xl fold:rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
              </div>

              {/* Category Name */}
              <h4 className={`text-lg fold:text-xl sm:text-xl md:text-2xl font-ecoHeading font-bold bg-gradient-to-r ${cat.gradient} bg-clip-text text-transparent dark:text-white dark:bg-none mb-2 fold:mb-3 group-hover:scale-105 transition-transform duration-300 origin-left break-words min-h-[3.5rem] flex items-center`}>
                {cat.name}
              </h4>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 mb-4 fold:mb-5 sm:mb-6 leading-relaxed text-xs fold:text-sm sm:text-sm line-clamp-2 min-h-[3rem]">
                {cat.description}
              </p>

              {/* Arrow Button with enhanced styling */}
              <div className={`inline-flex items-center gap-2 fold:gap-2.5 bg-gradient-to-r ${cat.gradient} text-white font-bold px-4 fold:px-5 py-2 fold:py-2.5 rounded-full group-hover:gap-3 fold:group-hover:gap-4 transition-all duration-300 text-xs fold:text-sm shadow-md group-hover:shadow-lg mt-auto w-fit`}>
                <span>Explore</span>
                <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300 text-xs fold:text-sm" />
              </div>
            </div>

            {/* Decorative floating circles */}
            <div className={`absolute -top-8 -right-8 w-28 h-28 fold:w-32 fold:h-32 sm:w-40 sm:h-40 bg-gradient-to-br ${cat.gradient} rounded-full opacity-5 dark:opacity-10 group-hover:opacity-15 dark:group-hover:opacity-20 transition-all duration-500 group-hover:scale-110`}></div>
            <div className={`absolute -bottom-10 -left-10 w-24 h-24 fold:w-28 fold:h-28 sm:w-36 sm:h-36 bg-gradient-to-br ${cat.gradient} rounded-full opacity-5 dark:opacity-10 group-hover:opacity-15 dark:group-hover:opacity-20 transition-all duration-500 group-hover:scale-110`}></div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategoryGrid;
