import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, Navigate } from "react-router-dom";
import { FaBox, FaCalendarAlt, FaTools, FaUser, FaHistory } from "react-icons/fa";
import MyOrders from "./MyOrders";
import MyBookings from "./MyBookings";


function CustomerDashboard() {
    const { user, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState("orders");

    // Redirect admins to admin dashboard if they try to access this page
    if (isAdmin()) {
        return <Navigate to="/admin" replace />;
    }

    const tabs = [
        { id: "orders", label: "My Orders", icon: <FaBox className="text-xl" /> },
        { id: "events", label: "My Events", icon: <FaCalendarAlt className="text-xl" /> },
        { id: "workshops", label: "My Workshops", icon: <FaTools className="text-xl" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 text-gray-900 dark:text-white transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-ecoGreen to-ecoDark rounded-full flex items-center justify-center shadow-lg text-white text-3xl font-bold flex-shrink-0">
                            {user?.profile_image ? (
                                <img src={user.profile_image} alt={user.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <FaUser />
                            )}
                        </div>
                        <div className="text-center md:text-left flex-1 min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-black mb-2 truncate">Hello, {user?.name || 'Customer'}!</h1>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center md:justify-start gap-2 text-sm font-medium">
                                <FaHistory className="text-ecoGreen" /> Your activity tracking dashboard
                            </p>
                        </div>
                    </div>
                </div>

                {/* Professional Filter Section */}
                <div className="bg-ecoGreen/[0.08] dark:bg-gray-800/40 rounded-none p-4 sm:p-5 mb-8 border border-ecoGreen/40 dark:border-ecoGreen/30 shadow-sm">
                    <div className="max-w-xs">
                        <label htmlFor="dashboard-filter" className="block text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-2">
                            Filter by Activity
                        </label>
                        <select
                            id="dashboard-filter"
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-none border border-black/20 dark:border-white/20 bg-white/50 dark:bg-gray-900 text-gray-800 dark:text-white font-bold text-sm focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all cursor-pointer"
                        >
                            <option value="orders">My Orders</option>
                            <option value="events">My Events</option>
                            <option value="workshops">My Workshops</option>

                        </select>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 min-h-[600px]">

                    {/* Tab Panels */}
                    <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-gray-900/50 min-h-[500px]">
                        <div className={`transition-opacity duration-500 ${activeTab === 'orders' ? 'opacity-100' : 'hidden opacity-0'}`}>
                            <MyOrders isWidget={true} />
                        </div>

                        <div className={`transition-opacity duration-500 ${activeTab === 'events' ? 'opacity-100' : 'hidden opacity-0'}`}>
                            <MyBookings isWidget={true} filterType="event" />
                        </div>

                        <div className={`transition-opacity duration-500 ${activeTab === 'workshops' ? 'opacity-100' : 'hidden opacity-0'}`}>
                            <MyBookings isWidget={true} filterType="workshop" />
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomerDashboard;
