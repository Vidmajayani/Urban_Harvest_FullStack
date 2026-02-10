import { useState } from "react";
import { FaChevronDown, FaQuestionCircle } from "react-icons/fa";
import { useAppContext } from "../context/AppContext";

function FAQSection() {
    const [openIndex, setOpenIndex] = useState(null);
    const { faqs } = useAppContext();

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="mb-12 fold:mb-16 sm:mb-24">
            {/* Section Header */}
            <div className="text-center mb-6 fold:mb-8 sm:mb-12">
                <div className="flex items-center justify-center gap-2 fold:gap-3 mb-3 fold:mb-4">
                    <FaQuestionCircle className="text-ecoOrange text-xl fold:text-2xl sm:text-3xl" />
                    <h2 className="text-lg fold:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-ecoHeading font-bold text-ecoDark dark:text-white">
                        Frequently Asked Questions
                    </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-xs fold:text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                    Everything you need to know about Urban Harvest Hub
                </p>
            </div>

            {/* FAQ Items */}
            <div className="max-w-3xl mx-auto space-y-3 fold:space-y-4">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        {/* Question */}
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="w-full flex items-center justify-between p-4 fold:p-5 sm:p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <h3 className="font-bold text-gray-800 dark:text-white text-xs fold:text-sm sm:text-base md:text-lg pr-3 fold:pr-4 leading-snug">
                                {faq.question}
                            </h3>
                            <FaChevronDown
                                className={`text-ecoGreen flex-shrink-0 text-xs fold:text-sm sm:text-base transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {/* Answer */}
                        <div
                            className={`transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                } overflow-hidden`}
                        >
                            <div className="px-4 fold:px-5 sm:px-6 pb-4 fold:pb-5 sm:pb-6 pt-0">
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 fold:pt-4">
                                    <p className="text-gray-600 dark:text-gray-300 text-[10px] fold:text-xs sm:text-sm md:text-base leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-6 fold:mt-8 sm:mt-12">
                <p className="text-gray-600 dark:text-gray-400 text-xs fold:text-sm sm:text-base mb-3 fold:mb-4">
                    Still have questions?
                </p>
                <a
                    href="mailto:info@urbanharvesth.com"
                    className="inline-flex items-center gap-2 bg-ecoGreen hover:bg-ecoDark text-white font-bold py-2 fold:py-2.5 sm:py-3 px-4 fold:px-5 sm:px-6 rounded-lg fold:rounded-xl transition-all duration-300 shadow-md hover:shadow-lg text-xs fold:text-sm sm:text-base"
                >
                    Contact Us
                </a>
            </div>
        </section>
    );
}

export default FAQSection;
