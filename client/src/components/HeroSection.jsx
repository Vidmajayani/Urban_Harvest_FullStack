import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaLeaf, FaArrowRight } from "react-icons/fa";
import { useAppContext } from "../context/AppContext";

function HeroSection() {
  const { heroSlides } = useAppContext();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Manual navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (!heroSlides || heroSlides.length === 0) return null;

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative bg-gray-900 text-white rounded-2xl fold:rounded-3xl sm:rounded-4xl shadow-lg fold:shadow-xl sm:shadow-2xl overflow-hidden min-h-[300px] fold:min-h-[350px] sm:min-h-[450px] md:min-h-[550px] lg:min-h-[600px] flex items-center group">

      {/* Background Images Slider */}
      {heroSlides.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          style={{
            backgroundImage: `url('${item.image}')`,
          }}
        >
          {/* Dark Overlay per slide */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
      ))}

      {/* Decorative Elements (Permanent) */}
      <div className="absolute top-10 right-10 w-20 h-20 fold:w-32 fold:h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-ecoLight/10 rounded-full blur-2xl fold:blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-32 h-32 fold:w-48 fold:h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-ecoOrange/10 rounded-full blur-2xl fold:blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>

      {/* Content Container */}
      <div className="relative z-10 w-full p-4 fold:p-6 sm:p-12 md:p-20">
        <div className="max-w-4xl transition-all duration-500 transform translate-y-0 opacity-100">

          {/* Badge */}
          <div className="inline-flex items-center gap-1 fold:gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-sm px-2 fold:px-3 sm:px-5 py-1 fold:py-1.5 sm:py-2 rounded-full mb-2 fold:mb-3 sm:mb-6 border border-white/30 animate-fadeIn">
            <FaLeaf className="text-ecoLight animate-jump text-[10px] fold:text-xs sm:text-sm" />
            <span className="text-[10px] fold:text-xs sm:text-sm font-semibold uppercase tracking-wide">100% Eco-Friendly</span>
          </div>

          {/* Main Heading - Keyed to trigger animation on change */}
          <h1 key={`title-${currentSlide}`} className="text-xl fold:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-ecoHeading font-bold mb-2 fold:mb-3 sm:mb-6 leading-tight animate-slideUp">
            {slide.title}
          </h1>

          {/* Description - Keyed to trigger animation on change */}
          <p key={`desc-${currentSlide}`} className="text-xs fold:text-sm sm:text-base md:text-lg lg:text-xl font-ecoFont leading-relaxed mb-4 fold:mb-6 sm:mb-10 text-white/95 max-w-3xl animate-slideUp" style={{ animationDelay: '0.1s' }}>
            {slide.subtitle}
          </p>

          {/* CTA Buttons - Dynamic Link */}
          <div className="flex flex-col sm:flex-row gap-2 fold:gap-3 sm:gap-4 mb-4 fold:mb-6 sm:mb-12">
            <Link
              to={slide.ctaLink}
              className="group btn-primary text-xs fold:text-sm sm:text-lg hover:bg-ecoLight hover:text-ecoDark shadow-lg fold:shadow-xl hover:shadow-2xl hover:scale-105"
            >
              {slide.ctaText}
              <FaArrowRight className="group-hover:translate-x-1 transition-transform text-[10px] fold:text-xs sm:text-base" />
            </Link>

            <Link
              to="/about"
              className="group btn-secondary text-xs fold:text-sm sm:text-lg shadow-lg fold:shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Slider Dots Navigation */}
      <div className="absolute bottom-6 fold:bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2 fold:gap-3 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 fold:w-2.5 sm:w-3 h-2 fold:h-2.5 sm:h-3 rounded-full transition-all duration-300 ${index === currentSlide
              ? "bg-ecoOrange scale-125 w-6 fold:w-8 sm:w-10"
              : "bg-white/50 hover:bg-white"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Decorative bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 fold:h-1.5 sm:h-2 bg-gradient-to-r from-ecoLight via-ecoOrange to-ecoYellow"></div>
    </section>
  );
}

export default HeroSection;