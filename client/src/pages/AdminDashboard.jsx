import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventsAPI, workshopsAPI, productsAPI, subscriptionBoxesAPI } from '../services/api';
import {
    FaCalendarAlt, FaChalkboardTeacher, FaShoppingCart,
    FaBox, FaArrowRight, FaMapMarkerAlt, FaClock, FaUser, FaUserCircle
} from 'react-icons/fa';
import SendNotificationPanel from '../components/SendNotificationPanel';

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalWorkshops: 0,
        totalProducts: 0,
        totalSubscriptionBoxes: 0
    });
    const [upcomingItems, setUpcomingItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    // Get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    useEffect(() => {
        if (!isAdmin()) {
            navigate('/login');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const [eventsRes, workshopsRes, productsRes, subscriptionBoxesRes] = await Promise.all([
                    eventsAPI.getAll(),
                    workshopsAPI.getAll(),
                    productsAPI.getAll(),
                    subscriptionBoxesAPI.getAll()
                ]);

                const events = eventsRes.data.events || [];
                const workshops = workshopsRes.data.workshops || [];
                const products = productsRes.data.products || [];
                const subscriptionBoxes = subscriptionBoxesRes.data.boxes || [];

                setStats({
                    totalEvents: events.length,
                    totalWorkshops: workshops.length,
                    totalProducts: products.length,
                    totalSubscriptionBoxes: subscriptionBoxes.length
                });

                // Combine and find upcoming items (Upcoming section)
                const combined = [
                    ...events.map(e => ({
                        ...e,
                        id: e.event_id,
                        type: 'Event',
                        displayDate: e.event_date,
                        displayTime: e.event_time,
                        owner: e.organizer_name,
                        path: `/admin/events/${e.event_id}`
                    })),
                    ...workshops.map(w => ({
                        ...w,
                        id: w.workshop_id,
                        type: 'Workshop',
                        displayDate: w.workshop_date,
                        displayTime: w.workshop_time,
                        owner: w.instructor_name,
                        path: `/admin/workshops/${w.workshop_id}`
                    }))
                ];

                // Sort by date (nearest first)
                const sortedUpcoming = combined
                    .filter(item => new Date(item.displayDate) >= new Date())
                    .sort((a, b) => new Date(a.displayDate) - new Date(b.displayDate))
                    .slice(0, 5);

                setUpcomingItems(sortedUpcoming);

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [isAdmin, navigate]);

    const formatDateBadge = (dateString) => {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
            year: date.getFullYear()
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-ecoGreen border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Side (8/12) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Header Section - Enhanced */}
                    <div className="animate-fade-in-up">
                        <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-ecoGreen overflow-hidden group">
                            {/* Animated Background Gradient on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {/* Content */}
                            <div className="relative z-10 flex items-center gap-4">
                                {/* Animated Icon */}
                                <div className="hidden md:flex w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl items-center justify-center text-green-600 dark:text-green-400 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                    <FaUserCircle className="text-3xl" />
                                </div>

                                {/* Text */}
                                <div className="flex-1">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                                        {getGreeting()}, {user?.name || 'Admin'}! 👋
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mt-1 font-medium">
                                        Quick summary of your platform's status
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - 2 per line */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Events Card */}
                        <div
                            onClick={() => navigate('/admin/events')}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-6 group hover:shadow-xl transition-all cursor-pointer hover:scale-105 hover:border-orange-400 dark:hover:border-orange-500"
                        >
                            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600">
                                <FaCalendarAlt className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-gray-900 dark:text-white">{stats.totalEvents}</h3>
                                <p className="text-gray-600 dark:text-gray-400 font-bold">Total Events</p>
                            </div>
                        </div>

                        {/* Workshops Card */}
                        <div
                            onClick={() => navigate('/admin/workshops')}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-6 group hover:shadow-xl transition-all cursor-pointer hover:scale-105 hover:border-yellow-400 dark:hover:border-yellow-500"
                        >
                            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center text-ecoYellow">
                                <FaChalkboardTeacher className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-gray-900 dark:text-white">{stats.totalWorkshops}</h3>
                                <p className="text-gray-600 dark:text-gray-400 font-bold">Total Workshops</p>
                            </div>
                        </div>

                        {/* Products Card */}
                        <div
                            onClick={() => navigate('/admin/products')}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-6 group hover:shadow-xl transition-all cursor-pointer hover:scale-105 hover:border-blue-400 dark:hover:border-blue-500"
                        >
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                                <FaShoppingCart className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-gray-900 dark:text-white">{stats.totalProducts}</h3>
                                <p className="text-gray-600 dark:text-gray-400 font-bold">Total Products</p>
                            </div>
                        </div>

                        {/* Subscription Boxes Card */}
                        <div
                            onClick={() => navigate('/admin/subscription-boxes')}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-6 group hover:shadow-xl transition-all cursor-pointer hover:scale-105 hover:border-teal-400 dark:hover:border-teal-500"
                        >
                            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center text-teal-600">
                                <FaBox className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-gray-800 dark:text-white">{stats.totalSubscriptionBoxes}</h3>
                                <p className="text-gray-600 dark:text-gray-400 font-bold">Total Subscription Boxes</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button onClick={() => navigate('/admin/events?add=true')} className="flex items-center justify-center gap-2 p-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all hover:scale-105">
                                <FaCalendarAlt /> Add Event
                            </button>
                            <button onClick={() => navigate('/admin/workshops?add=true')} className="flex items-center justify-center gap-2 p-4 bg-ecoYellow hover:bg-yellow-600 text-white font-bold rounded-xl transition-all hover:scale-105">
                                <FaChalkboardTeacher /> Add Workshop
                            </button>
                            <button onClick={() => navigate('/admin/products?add=true')} className="flex items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-105">
                                <FaShoppingCart /> Add Product
                            </button>
                        </div>
                    </div>

                    {/* Management Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div onClick={() => navigate('/admin/events')} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border-l-4 border-orange-500 cursor-pointer hover:shadow-lg transition-all">
                            <h4 className="font-bold text-gray-800 dark:text-white">Events</h4>
                            <p className="text-sm text-gray-500">View & Manage</p>
                        </div>
                        <div onClick={() => navigate('/admin/workshops')} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border-l-4 border-ecoYellow cursor-pointer hover:shadow-lg transition-all">
                            <h4 className="font-bold text-gray-800 dark:text-white">Workshops</h4>
                            <p className="text-sm text-gray-500">View & Manage</p>
                        </div>
                        <div onClick={() => navigate('/admin/products')} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-all">
                            <h4 className="font-bold text-gray-800 dark:text-white">Products</h4>
                            <p className="text-sm text-gray-500">View & Manage</p>
                        </div>
                    </div>

                    {/* Send Notification Panel */}
                    <SendNotificationPanel />
                </div>

                {/* Right Side - Upcoming Highlights (4/12) */}
                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-8">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Upcoming Highlights</h2>
                            </div>
                            <span className="bg-ecoGreen/10 text-ecoGreen text-[10px] font-black px-2 py-0.5 rounded-full border border-ecoGreen/20">LIVE</span>
                        </div>

                        <div className="p-2 space-y-2">
                            {upcomingItems.length > 0 ? (
                                upcomingItems.map((item, idx) => {
                                    const dateInfo = formatDateBadge(item.displayDate);
                                    const isEvent = item.type === 'Event';

                                    return (
                                        <div
                                            key={`${item.type}-${item.id || item.event_id || item.workshop_id}`}
                                            onClick={() => navigate(item.path)}
                                            className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-600 transition-all cursor-pointer"
                                        >
                                            {/* Date Badge */}
                                            <div className={`flex-shrink-0 w-12 h-14 rounded-lg flex flex-col items-center justify-center text-white shadow-md transition-transform group-hover:scale-105 ${isEvent ? 'bg-gradient-to-br from-orange-500 to-rose-600' : 'bg-gradient-to-br from-ecoYellow to-yellow-600'
                                                }`}>
                                                <span className="text-base font-bold leading-none">{dateInfo.day}</span>
                                                <span className="text-[9px] font-bold uppercase mt-0.5">{dateInfo.month}</span>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${isEvent ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {item.type}
                                                    </span>
                                                    <h3 className="font-bold text-gray-800 dark:text-white truncate text-sm">
                                                        {item.title}
                                                    </h3>
                                                </div>
                                                <div className="mt-2 space-y-1.5">
                                                    <div className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-gray-300 font-medium">
                                                        <FaUser className="opacity-80 text-gray-500" />
                                                        <span className="truncate">{item.owner}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-gray-300 font-medium">
                                                        <FaMapMarkerAlt className="opacity-80 text-gray-500" />
                                                        <span className="truncate">{item.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[11px] text-ecoGreen font-bold">
                                                        <FaClock className="text-ecoGreen/80" />
                                                        <span>{item.displayTime}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 italic">No upcoming activities scheduled</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
