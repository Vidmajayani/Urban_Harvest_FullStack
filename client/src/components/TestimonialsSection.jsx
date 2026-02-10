import { FaStar, FaQuoteLeft } from "react-icons/fa";
import { useAppContext } from "../context/AppContext";

function TestimonialsSection() {
    const { testimonials } = useAppContext();

    return (
        <section className="py-12 fold:py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="max-w-7xl mx-auto px-2 fold:px-3 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-8 fold:mb-10 sm:mb-12">
                    <h2 className="text-lg fold:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-ecoHeading font-bold text-ecoDark dark:text-white mb-2 fold:mb-3 sm:mb-4">
                        What Our Community Says
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-xs fold:text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                        Real stories from real people making a difference
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 fold:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fold:gap-5 sm:gap-6 md:gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-white dark:bg-gray-800 rounded-xl fold:rounded-2xl p-4 fold:p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 relative"
                        >
                            {/* Quote Icon */}
                            <FaQuoteLeft className="absolute top-4 fold:top-5 sm:top-6 right-4 fold:right-5 sm:right-6 text-3xl fold:text-4xl sm:text-5xl text-ecoGreen/10" />

                            {/* Profile Section */}
                            <div className="flex items-center gap-3 fold:gap-4 mb-3 fold:mb-4 relative z-10">
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-12 h-12 fold:w-14 fold:h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-ecoGreen"
                                />
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-white text-sm fold:text-base sm:text-lg">
                                        {testimonial.name}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-[10px] fold:text-xs sm:text-sm">
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>

                            {/* Star Rating */}
                            <div className="flex gap-0.5 fold:gap-1 mb-3 fold:mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <FaStar key={i} className="text-yellow-400 text-xs fold:text-sm sm:text-base" />
                                ))}
                            </div>

                            {/* Testimonial Text */}
                            <p className="text-gray-600 dark:text-gray-300 text-[11px] fold:text-xs sm:text-sm md:text-base leading-relaxed italic">
                                "{testimonial.text}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default TestimonialsSection;
