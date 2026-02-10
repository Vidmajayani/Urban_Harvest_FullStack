import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt,
    FaBox, FaCalendarCheck, FaHeart, FaStar,
    FaSignOutAlt, FaShieldAlt
} from 'react-icons/fa';
import ProfileImageUpload from '../components/ProfileImageUpload';
import ThemeToggle from '../components/ThemeToggle';
import { ordersAPI, bookingsAPI, favoritesAPI, reviewsAPI } from '../services/api';

function UserProfile() {
    const { user, setUser, logout } = useAuth();
    const [profileImage, setProfileImage] = useState(user?.profile_image);
    const [stats, setStats] = useState({
        orders: 0,
        bookings: 0,
        favorites: 0,
        reviews: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [orders, bookings, favorites, reviews] = await Promise.all([
                    ordersAPI.getMyOrders(),
                    bookingsAPI.getMyBookings(),
                    favoritesAPI.getAll(),
                    reviewsAPI.getMyReviews()
                ]);

                setStats({
                    orders: orders.data.orders?.length || 0,
                    bookings: bookings.data.bookings?.length || 0,
                    favorites: (favorites.data.products?.length || 0) + (favorites.data.events?.length || 0),
                    reviews: reviews.data.reviews?.length || 0
                });
            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
            }
        };

        if (user) fetchStats();
    }, [user]);

    const handleImageUpdate = (newImageUrl) => {
        setProfileImage(newImageUrl);
        if (user) {
            setUser({ ...user, profile_image: newImageUrl });
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen pt-24 px-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 border border-black dark:border-white shadow-xl text-center">
                    <FaShieldAlt className="text-5xl text-ecoGreen mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Access Denied</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Please sign in to access your member dashboard.</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest hover:bg-ecoGreen dark:hover:bg-ecoGreen dark:hover:text-white transition-all shadow-lg"
                    >
                        Sign In Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-8 lg:pt-10 bg-gray-50 dark:bg-gray-950">
            <div className="max-w-[1200px] mx-auto pb-12">

                <main className="p-4 fold:p-5 lg:p-10">
                    <header className="mb-8 fold:mb-10">
                        <h1 className="text-3xl fold:text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                            Profile
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm fold:text-base">Welcome back, {user.name}. Here is your profile overview.</p>
                    </header>

                    {/* Member Identity Banner (Full Width) */}
                    <div className="mb-10 bg-white dark:bg-gray-900 pb-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 fold:gap-4 group min-h-[180px] rounded-2xl shadow-sm">
                        {/* Decorative background element */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-ecoGreen"></div>
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-ecoGreen/[0.03] dark:bg-ecoGreen/[0.01] rounded-full group-hover:scale-110 transition-transform duration-700"></div>

                        {/* Left Side: Profile Image */}
                        <div className="flex-shrink-0 relative ml-0 md:ml-10 mt-10 md:mt-0">
                            <ProfileImageUpload
                                currentImage={profileImage}
                                onImageUpdate={handleImageUpdate}
                                userName={user.name}
                            />
                        </div>

                        {/* Right Side: Identity Details */}
                        <div className="text-center md:text-left flex-1 px-4 md:px-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-ecoGreen/10 dark:bg-ecoGreen/5 mb-4 rounded-full">
                                <span className="text-xs font-bold text-ecoGreen">Verified Member Identity</span>
                            </div>
                            <h3 className="text-3xl fold:text-2xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-none">{user.name}</h3>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 fold:gap-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                                    <FaCalendarAlt className="text-ecoGreen" /> Member Since {new Date(user.created_at).getFullYear()}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 italic">
                                    <FaShieldAlt className="text-ecoGreen/40" /> Active Member
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                        <div className="bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="text-3xl font-black text-blue-500 mb-1">{stats.orders}</div>
                            <div className="text-xs font-bold text-gray-400">Orders</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="text-3xl font-black text-ecoGreen mb-1">{stats.bookings}</div>
                            <div className="text-xs font-bold text-gray-400">Bookings</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="text-3xl font-black text-rose-500 mb-1">{stats.favorites}</div>
                            <div className="text-xs font-bold text-gray-400">Loved Items</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="text-3xl font-black text-amber-500 mb-1">{stats.reviews}</div>
                            <div className="text-xs font-bold text-gray-400">Reviews</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {/* Profile Details */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-900/50 p-6 fold:p-8 rounded-2xl shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-ecoGreen"></div>
                                    Personal Information
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fold:gap-6">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 transition-all group rounded-xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <FaEnvelope className="text-sm" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white opacity-60">Email Address</span>
                                        </div>
                                        <p className="text-gray-900 dark:text-white font-medium break-all pl-1">{user.email}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 transition-all group rounded-xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                <FaPhone className="text-sm" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white opacity-60">Phone Number</span>
                                        </div>
                                        <p className="text-gray-900 dark:text-white font-medium pl-1">{user.phone || 'Not Provided'}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 transition-all group lg:col-span-1 rounded-xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                                <FaMapMarkerAlt className="text-sm" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white opacity-60">Residential Address</span>
                                        </div>
                                        <p className="text-gray-900 dark:text-white font-medium pl-1">{user.address || 'Not Provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity & Preferences */}
                    <div className="bg-white dark:bg-gray-900/50 p-6 fold:p-8 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-ecoGreen"></div>
                            Preferences
                        </h2>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Appearance</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    <ThemeToggle mode="text-only" />
                                </span>
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default UserProfile;
