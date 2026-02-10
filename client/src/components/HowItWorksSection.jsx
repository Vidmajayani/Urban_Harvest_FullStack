import { FaSearch, FaGraduationCap, FaSeedling } from "react-icons/fa";

function HowItWorksSection() {
    const steps = [
        {
            id: 1,
            icon: <FaSearch />,
            title: "Explore",
            description: "Browse our curated selection of eco-friendly products, upcoming events, and educational workshops tailored to urban living."
        },
        {
            id: 2,
            icon: <FaGraduationCap />,
            title: "Learn",
            description: "Join expert-led workshops and community events to gain hands-on knowledge about sustainable practices and urban gardening."
        },
        {
            id: 3,
            icon: <FaSeedling />,
            title: "Grow",
            description: "Apply what you've learned, connect with like-minded neighbors, and watch your urban garden—and community—flourish together."
        }
    ];

    return (
        <section className="py-12 fold:py-16 sm:py-20 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-2 fold:px-3 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-8 fold:mb-10 sm:mb-12">
                    <h2 className="text-lg fold:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-ecoHeading font-bold text-ecoDark dark:text-white mb-2 fold:mb-3 sm:mb-4">
                        How It Works
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-xs fold:text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                        Your journey to sustainable urban living in three simple steps
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fold:gap-8 sm:gap-10 md:gap-12 relative">
                    {/* Connection Lines (hidden on mobile) */}
                    <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-ecoGreen via-ecoOrange to-ecoYellow"></div>

                    {steps.map((step, index) => (
                        <div key={step.id} className="relative">
                            {/* Step Card */}
                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl fold:rounded-2xl p-5 fold:p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 text-center group">
                                {/* Step Number */}
                                <div className="absolute -top-4 fold:-top-5 sm:-top-6 left-1/2 -translate-x-1/2">
                                    <div className="w-8 h-8 fold:w-10 fold:h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-ecoGreen to-ecoDark text-white font-bold flex items-center justify-center text-sm fold:text-base sm:text-lg shadow-lg">
                                        {step.id}
                                    </div>
                                </div>

                                {/* Icon */}
                                <div className="mt-4 fold:mt-5 sm:mt-6 mb-4 fold:mb-5 sm:mb-6 flex justify-center">
                                    <div className="w-16 h-16 fold:w-20 fold:h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-ecoGreen/20 to-ecoOrange/20 dark:from-ecoGreen/30 dark:to-ecoOrange/30 flex items-center justify-center text-ecoGreen dark:text-ecoLight group-hover:scale-110 transition-transform duration-300">
                                        <div className="text-2xl fold:text-3xl sm:text-4xl">
                                            {step.icon}
                                        </div>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-base fold:text-lg sm:text-xl md:text-2xl font-ecoHeading font-bold text-ecoDark dark:text-white mb-2 fold:mb-3 sm:mb-4">
                                    {step.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-600 dark:text-gray-300 text-[11px] fold:text-xs sm:text-sm md:text-base leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                            {/* Arrow (mobile only) */}
                            {index < steps.length - 1 && (
                                <div className="md:hidden flex justify-center my-4 fold:my-5">
                                    <div className="text-ecoGreen text-2xl fold:text-3xl">↓</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default HowItWorksSection;
