import { FaLeaf, FaUsers, FaLightbulb, FaHandHoldingHeart, FaQuoteLeft } from "react-icons/fa";
import FAQSection from "../components/FAQSection";
import GalleryShowcase from "../components/GalleryShowcase";

function About() {
    return (
        <div className="dark:bg-gray-900 transition-colors duration-300">
            {/* Hero Section */}
            <div className="relative h-[220px] fold:h-[280px] sm:h-[380px] md:h-[480px] lg:h-[600px] overflow-hidden">
                <img
                    src="/Images/hero_about.png"
                    alt="Urban Gardening Community"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center px-2 fold:px-3 sm:px-4 text-center">
                    <div className="max-w-4xl animate-fade-in-up">
                        <span className="inline-block py-0.5 fold:py-1 px-2 fold:px-2.5 sm:px-3 rounded-full bg-ecoGreen/20 border border-ecoGreen/50 text-ecoLight text-[9px] fold:text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 fold:mb-3 sm:mb-4 backdrop-blur-md">
                            Est. 2023
                        </span>
                        <h1 className="text-xl fold:text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-ecoHeading font-bold text-white mb-2 fold:mb-3 sm:mb-6 leading-tight">
                            Cultivating a <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ecoGreen to-ecoYellow">Greener Future</span>
                        </h1>
                        <p className="text-xs fold:text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 font-light max-w-2xl mx-auto leading-relaxed">
                            We are a digital ecosystem empowering communities to grow, learn, and live sustainably.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-2 fold:px-3 sm:px-6 lg:px-8 -mt-10 fold:-mt-12 sm:-mt-20 relative z-10 mb-10 fold:mb-12 sm:mb-20">
                {/* Video Section - Local Video for PWA Support */}
                <div className="bg-white dark:bg-gray-800 rounded-xl fold:rounded-2xl sm:rounded-3xl shadow-lg fold:shadow-xl overflow-hidden border-2 fold:border-3 sm:border-4 border-white dark:border-gray-700">
                    <div className="aspect-w-16 aspect-h-9 w-full h-[180px] fold:h-[220px] sm:h-[320px] md:h-[480px] lg:h-[600px]">
                        <video
                            className="w-full h-full object-cover"
                            src="/videos/urban_farming.mp4"
                            poster="/Images/video_poster.webp"
                            controls
                            preload="metadata"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div className="p-3 fold:p-4 sm:p-6 text-center bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm fold:text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 fold:mb-1.5 sm:mb-2">See Our Vision in Action</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-[10px] fold:text-xs sm:text-sm md:text-base">Discover how urban farming is transforming cities around the world.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-2 fold:px-3 sm:px-6 lg:px-8 mb-12 fold:mb-16 sm:mb-24">
                {/* Our Story & Mission */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fold:gap-8 sm:gap-12 lg:gap-20 items-center mb-12 fold:mb-16 sm:mb-24">
                    <div className="space-y-4 fold:space-y-5 sm:space-y-8">
                        <div>
                            <h2 className="text-lg fold:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-ecoHeading font-bold text-ecoDark dark:text-white mb-3 fold:mb-4 sm:mb-6 relative inline-block">
                                Our Story
                                <span className="absolute bottom-0 left-0 w-1/2 h-1 fold:h-1.5 sm:h-2 bg-ecoYellow/50 -mb-1.5 fold:-mb-2 rounded-full"></span>
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 text-xs fold:text-sm sm:text-base md:text-lg leading-relaxed mb-3 fold:mb-4 sm:mb-6">
                                It started with a single rooftop garden and a shared belief: that nature belongs in the city. What began as a small community project has grown into <strong>Urban Harvest Hub</strong>, a comprehensive platform connecting eco-conscious individuals with the resources they need.
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-xs fold:text-sm sm:text-base md:text-lg leading-relaxed">
                                We realized that people wanted to live sustainably but lacked a central place to find local workshops, buy organic tools, and connect with like-minded neighbors. We built this hub to bridge that gap.
                            </p>
                        </div>

                        <div className="bg-ecoGreen/5 dark:bg-ecoGreen/10 p-3 fold:p-4 sm:p-6 rounded-lg fold:rounded-xl sm:rounded-2xl border-l-3 fold:border-l-4 border-ecoGreen">
                            <FaQuoteLeft className="text-xl fold:text-2xl sm:text-3xl text-ecoGreen/30 mb-2 fold:mb-3 sm:mb-4" />
                            <p className="text-sm fold:text-base sm:text-lg md:text-xl font-medium text-ecoDark dark:text-ecoLight italic mb-2 fold:mb-3 sm:mb-4 leading-snug">
                                "Our mission is to make sustainable living accessible, educational, and community-driven for everyone, everywhere."
                            </p>
                            <div className="flex items-center gap-2 fold:gap-2.5 sm:gap-3">
                                <div className="w-7 h-7 fold:w-8 fold:h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                                    <img src="/Images/founder.avif" alt="Founder" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-[11px] fold:text-xs sm:text-sm">Alex Green</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-[9px] fold:text-[10px] sm:text-xs uppercase tracking-wide">Co-Founder</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 fold:grid-cols-2 gap-3 fold:gap-4 sm:gap-6">
                        <div className="space-y-3 fold:space-y-4 sm:space-y-6 mt-0 sm:mt-12">
                            <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-6 rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md hover:-translate-y-1 transition-transform duration-300 border border-gray-100 dark:border-gray-700">
                                <div className="w-8 h-8 fold:w-10 fold:h-10 sm:w-12 sm:h-12 bg-ecoGreen/10 dark:bg-ecoGreen/20 rounded-lg fold:rounded-xl flex items-center justify-center text-ecoGreen mb-2 fold:mb-3 sm:mb-4">
                                    <FaLeaf className="text-sm fold:text-base sm:text-2xl" />
                                </div>
                                <h3 className="text-xs fold:text-sm sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 fold:mb-1.5 sm:mb-2">Sustainability</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-[9px] fold:text-[10px] sm:text-sm leading-snug">Promoting practices that protect our planet for future generations.</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-6 rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md hover:-translate-y-1 transition-transform duration-300 border border-gray-100 dark:border-gray-700">
                                <div className="w-8 h-8 fold:w-10 fold:h-10 sm:w-12 sm:h-12 bg-ecoOrange/10 dark:bg-ecoOrange/20 rounded-lg fold:rounded-xl flex items-center justify-center text-ecoOrange mb-2 fold:mb-3 sm:mb-4">
                                    <FaUsers className="text-sm fold:text-base sm:text-2xl" />
                                </div>
                                <h3 className="text-xs fold:text-sm sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 fold:mb-1.5 sm:mb-2">Community</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-[9px] fold:text-[10px] sm:text-sm leading-snug">Building strong connections through shared green interests.</p>
                            </div>
                        </div>
                        <div className="space-y-3 fold:space-y-4 sm:space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-6 rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md hover:-translate-y-1 transition-transform duration-300 border border-gray-100 dark:border-gray-700">
                                <div className="w-8 h-8 fold:w-10 fold:h-10 sm:w-12 sm:h-12 bg-ecoYellow/10 dark:bg-ecoYellow/20 rounded-lg fold:rounded-xl flex items-center justify-center text-ecoYellow mb-2 fold:mb-3 sm:mb-4">
                                    <FaLightbulb className="text-sm fold:text-base sm:text-2xl" />
                                </div>
                                <h3 className="text-xs fold:text-sm sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 fold:mb-1.5 sm:mb-2">Education</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-[9px] fold:text-[10px] sm:text-sm leading-snug">Empowering people with the knowledge to grow and create.</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-6 rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md hover:-translate-y-1 transition-transform duration-300 border border-gray-100 dark:border-gray-700">
                                <div className="w-8 h-8 fold:w-10 fold:h-10 sm:w-12 sm:h-12 bg-statusError/10 dark:bg-statusError/20 rounded-lg fold:rounded-xl flex items-center justify-center text-statusError mb-2 fold:mb-3 sm:mb-4">
                                    <FaHandHoldingHeart className="text-sm fold:text-base sm:text-2xl" />
                                </div>
                                <h3 className="text-xs fold:text-sm sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 fold:mb-1.5 sm:mb-2">Impact</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-[9px] fold:text-[10px] sm:text-sm leading-snug">Measuring our success by the positive change we create.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Impact Stats - FIXED CONTRAST */}
                <div className="bg-gradient-to-br from-ecoGreen to-ecoDark rounded-xl fold:rounded-2xl sm:rounded-3xl p-5 fold:p-6 sm:p-10 md:p-12 mb-12 fold:mb-16 sm:mb-24 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-32 h-32 fold:w-40 fold:h-40 sm:w-56 sm:h-56 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-32 h-32 fold:w-40 fold:h-40 sm:w-56 sm:h-56 bg-ecoYellow/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10 text-center mb-6 fold:mb-8 sm:mb-12">
                        <h2 className="text-lg fold:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-ecoHeading font-bold text-white mb-2 fold:mb-3 sm:mb-4">Our Growing Impact</h2>
                        <p className="text-white/90 text-xs fold:text-sm sm:text-base md:text-lg max-w-2xl mx-auto">Together, we are making a tangible difference in our urban environments.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 fold:gap-4 sm:gap-6 md:gap-8 relative z-10">
                        <div className="text-center">
                            <div className="text-2xl fold:text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 fold:mb-1.5 sm:mb-2">50+</div>
                            <p className="text-white/85 font-semibold uppercase tracking-wider text-[9px] fold:text-[10px] sm:text-xs md:text-sm leading-tight">Community<br className="sm:hidden" /> Gardens</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl fold:text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 fold:mb-1.5 sm:mb-2">1.2k</div>
                            <p className="text-white/85 font-semibold uppercase tracking-wider text-[9px] fold:text-[10px] sm:text-xs md:text-sm leading-tight">Workshops<br className="sm:hidden" /> Held</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl fold:text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 fold:mb-1.5 sm:mb-2">15k</div>
                            <p className="text-white/85 font-semibold uppercase tracking-wider text-[9px] fold:text-[10px] sm:text-xs md:text-sm leading-tight">Active<br className="sm:hidden" /> Members</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl fold:text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 fold:mb-1.5 sm:mb-2">500t</div>
                            <p className="text-white/85 font-semibold uppercase tracking-wider text-[9px] fold:text-[10px] sm:text-xs md:text-sm leading-tight">CO2<br className="sm:hidden" /> Reduced</p>
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="text-center mb-6 fold:mb-8 sm:mb-12">
                    <h2 className="text-lg fold:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-ecoHeading font-bold text-ecoDark dark:text-white mb-2 fold:mb-3 sm:mb-4">Meet the Experts</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-xs fold:text-sm sm:text-base md:text-lg max-w-2xl mx-auto">The passionate individuals driving the Urban Harvest movement.</p>
                </div>

                <div className="grid grid-cols-1 fold:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 fold:gap-4 sm:gap-6 md:gap-8 mb-12 fold:mb-16 sm:mb-24">
                    {[
                        { name: "Sarah Jenkins", role: "Lead Agriculturist", img: "/Images/events/sarah_jenkins.jpeg" },
                        { name: "David Chen", role: "Sustainability Director", img: "/Images/workshops/john_smith.webp" },
                        { name: "Maria Rodriguez", role: "Community Manager", img: "/Images/workshops/mike_brown.jpg" },
                        { name: "James Wilson", role: "Workshop Coordinator", img: "/Images/workshops/alice_green.jpg" }
                    ].map((member, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg fold:rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group">
                            <div className="h-40 fold:h-48 sm:h-56 md:h-64 overflow-hidden">
                                <img
                                    src={member.img}
                                    alt={member.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                />
                            </div>
                            <div className="p-3 fold:p-4 sm:p-6 text-center">
                                <h3 className="text-xs fold:text-sm sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-0.5 fold:mb-1">{member.name}</h3>
                                <p className="text-ecoGreen dark:text-ecoLight font-bold text-[9px] fold:text-[10px] sm:text-sm uppercase tracking-wide">{member.role}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Gallery Showcase Section */}
                <GalleryShowcase />

                {/* FAQ Section */}
                <FAQSection />
            </div>
        </div>
    );
}

export default About;
