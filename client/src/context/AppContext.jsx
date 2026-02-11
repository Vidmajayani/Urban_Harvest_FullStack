import { createContext, useState, useEffect, useContext } from "react";
import { productsAPI, eventsAPI, workshopsAPI, testimonialsAPI, heroSlidesAPI, subscriptionBoxesAPI } from "../services/api";
import { getImageUrl } from "../utils/imageUtils";

// Create Context object
const AppContext = createContext();

/**
 * AppProvider Component
 * Wraps the entire application to provide global state
 */
export const AppProvider = ({ children }) => {
    // State for Dynamic Data
    const [products, setProducts] = useState([]);
    const [events, setEvents] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [subscriptionBoxes, setSubscriptionBoxes] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [heroSlides, setHeroSlides] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // State for weather
    const [weather, setWeather] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(true);

    // Theme State (Dark Mode)
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'light';
    });

    /**
     * Initial Data Fetching from Backend API
     */
    useEffect(() => {
        const fetchAllData = async () => {
            setLoadingData(true);
            try {
                // Fetch everything in parallel
                const [
                    productsRes,
                    eventsRes,
                    workshopsRes,
                    subscriptionBoxesRes,
                    testimonialsRes,
                    heroRes
                ] = await Promise.all([
                    productsAPI.getAll(),
                    eventsAPI.getAll(),
                    workshopsAPI.getAll(),
                    subscriptionBoxesAPI.getAll(),
                    testimonialsAPI.getAll(),
                    heroSlidesAPI.getAll()
                ]);

                // Extract and map data to match card component expectations
                const productsData = (productsRes.data.products || []).map(p => ({
                    ...p,
                    id: p.product_id,
                    category: p.category_name,
                    image: getImageUrl(p.image)
                }));

                // Transform Events data to match EventCard expectations
                const eventsData = (eventsRes.data.events || []).map(e => ({
                    ...e,
                    id: e.event_id,
                    category: e.category_name,
                    image: getImageUrl(e.image),
                    // Format date from event_date
                    date: e.event_date ? new Date(e.event_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }) : 'TBA',
                    // Extract time from event_time field
                    time: e.event_time || 'TBA',
                    // Format price
                    price: e.price === 0 ? 'Free' : `Rs ${e.price}`,
                    // Use rating or default
                    rating: e.rating || 4.5,
                    // Map spots_left
                    spots_left: e.spots_left !== undefined ? e.spots_left : 0
                }));

                // Transform Workshops data to match WorkshopCard expectations
                const workshopsData = (workshopsRes.data.workshops || []).map(w => ({
                    ...w,
                    id: w.workshop_id,
                    category: w.category_name,
                    image: getImageUrl(w.image),
                    // Format date from workshop_date
                    date: w.workshop_date ? new Date(w.workshop_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }) : 'TBA',
                    // Use duration directly
                    duration: w.duration || 'TBA',
                    // Format price
                    price: w.price === 0 ? 'Free' : `Rs ${w.price}`,
                    // Map instructor name and image
                    instructor: w.instructor_name || 'TBA',
                    instructor_image: getImageUrl(w.instructor_image) || '/Images/default-instructor.jpg',
                    // Use level
                    level: w.level || 'Beginner',
                    // Map spots_left
                    spots_left: w.spots_left !== undefined ? w.spots_left : 0
                }));

                const testimonialsData = (testimonialsRes.data || []);

                const heroSlidesData = (heroRes.data || []);

                // Transform Subscription Boxes data
                const subscriptionBoxesData = (subscriptionBoxesRes.data.boxes || []).map(box => ({
                    ...box,
                    id: box.box_id,
                    category: box.frequency, // Use frequency as category badge
                    price: box.price,
                    rating: box.rating || 4.5,
                    image: getImageUrl(box.image_url)
                }));

                setProducts(productsData);
                setEvents(eventsData);
                setWorkshops(workshopsData);
                setSubscriptionBoxes(subscriptionBoxesData);
                setTestimonials(testimonialsData);
                setHeroSlides(heroSlidesData);

                // FAQs are still coming from a local source as there's no backend route yet
                // But we could easily add one if needed. For now, keeping the state.
            } catch (err) {
                console.error("Error fetching global data:", err.response?.data || err.message);
                if (err.response?.data?.details) {
                    console.error("Backend Error Details:", err.response.data.details);
                }
            } finally {
                setLoadingData(false);
            }
        };

        fetchAllData();
    }, []);

    /**
     * Fetch weather data from Open-Meteo API
     */
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch(
                    "https://api.open-meteo.com/v1/forecast?latitude=7.87&longitude=80.77&current_weather=true"
                );

                if (response.ok) {
                    const data = await response.json();
                    setWeather(data.current_weather);
                }
            } catch (err) {
                console.error("Weather API Error:", err);
            } finally {
                setLoadingWeather(false);
            }
        };

        fetchWeather();
    }, []);

    /**
     * Theme Effect
     */
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    /**
     * Toggle Theme Function
     */
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // Filter States
    const [productCategory, setProductCategory] = useState("All");
    const [eventCategory, setEventCategory] = useState("All");
    const [workshopCategory, setWorkshopCategory] = useState("All");

    // Derived Filtered Data
    const filteredProducts = productCategory === "All"
        ? products
        : products.filter(item => item.category === productCategory);

    const filteredEvents = eventCategory === "All"
        ? events
        : events.filter(item => item.category === eventCategory);

    const filteredWorkshops = workshopCategory === "All"
        ? workshops
        : workshops.filter(item => item.category === workshopCategory);

    // Package all state values to be shared
    const value = {
        products,
        events,
        workshops,
        subscriptionBoxes,
        testimonials,
        faqs,
        heroSlides,
        weather,
        loadingWeather,
        loadingData,
        // Filter exports
        productCategory, setProductCategory, filteredProducts,
        eventCategory, setEventCategory, filteredEvents,
        workshopCategory, setWorkshopCategory, filteredWorkshops,
        // Theme exports
        theme,
        toggleTheme,
    };

    // Provide the context to all children components
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Custom Hook to access AppContext
 * Usage: const { products, events, weather } = useAppContext();
 */
export const useAppContext = () => {
    return useContext(AppContext);
};