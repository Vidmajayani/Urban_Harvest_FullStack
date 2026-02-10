import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import ConfirmDialog from './ConfirmDialog';
import { FaHome, FaCalendarAlt, FaChalkboardTeacher, FaShoppingCart, FaBox, FaSignOutAlt, FaUserCircle, FaUserCog, FaChevronRight, FaBars, FaTimes } from 'react-icons/fa';

function AdminLayout() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [logoutConfirm, setLogoutConfirm] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setLogoutConfirm(false);
        navigate('/login');
    };

    // Use useEffect for navigation to avoid "Cannot update a component while rendering" warning
    useEffect(() => {
        if (!isAdmin()) {
            navigate('/login');
        }
    }, [user, isAdmin, navigate]);

    if (!isAdmin()) {
        return null;
    }

    const isActive = (path) => location.pathname.startsWith(path);

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="xl:hidden fixed top-4 left-4 z-50 p-3 bg-adminGreen dark:bg-gray-800 text-white rounded-lg shadow-lg hover:bg-green-700 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle sidebar"
            >
                {sidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="xl:hidden fixed inset-0 bg-black/50 z-30 transition-opacity"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Sidebar - Responsive */}
            <aside className={`
                fixed left-0 top-0 h-screen w-56 bg-adminGreen dark:bg-gray-900 shadow-lg flex flex-col transition-all duration-300 z-40
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                xl:translate-x-0
            `}>
                {/* User Info Section with Theme Toggle */}
                <div className="p-3 lg:p-4 border-b border-white/20 dark:border-gray-700">
                    {/* Theme Toggle - Top Right */}
                    <div className="flex justify-end mb-2">
                        <ThemeToggle />
                    </div>

                    {/* Profile Image - Centered and Bigger */}
                    <div className="flex justify-center mb-2">
                        {user?.profile_image ? (
                            <img
                                src={user.profile_image}
                                alt={user.name}
                                className="w-14 h-14 lg:w-16 lg:h-16 rounded-full object-cover border-2 border-white shadow-lg"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                        ) : null}
                        <FaUserCircle
                            className="text-4xl lg:text-5xl text-white dark:text-white"
                            style={{ display: user?.profile_image ? 'none' : 'block' }}
                        />
                    </div>

                    {/* Name and Email - Centered */}
                    <div className="text-center">
                        <h2 className="text-base lg:text-lg font-bold text-white dark:text-white mb-0.5 truncate">{user?.name || 'Admin User'}</h2>
                        <p className="text-[10px] lg:text-xs text-white dark:text-gray-300 font-medium truncate">{user?.email}</p>
                    </div>
                </div>

                <nav className="p-2 lg:p-3 flex-1">
                    {/* Dashboard */}
                    <Link
                        to="/admin"
                        onClick={closeSidebar}
                        className={`flex items-center justify-between px-3 lg:px-4 py-2 lg:py-2.5 mb-1 rounded-lg transition-all duration-200 group ${location.pathname === '/admin'
                            ? 'bg-white/20 text-white border-l-4 border-white'
                            : 'text-white hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                            <FaHome className="text-base lg:text-xl flex-shrink-0" />
                            <span className="text-sm lg:text-lg truncate">Dashboard</span>
                        </div>
                        <FaChevronRight className={`text-xs transition-transform duration-200 flex-shrink-0 ${location.pathname === '/admin' ? 'translate-x-0.5' : 'opacity-40 group-hover:opacity-100'}`} />
                    </Link>

                    {/* Events */}
                    <Link
                        to="/admin/events"
                        onClick={closeSidebar}
                        className={`flex items-center justify-between px-3 lg:px-4 py-2 lg:py-2.5 mb-1 rounded-lg transition-all duration-200 group ${isActive('/admin/events')
                            ? 'bg-white/20 text-white border-l-4 border-white'
                            : 'text-white hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                            <FaCalendarAlt className="text-base lg:text-xl flex-shrink-0" />
                            <span className="text-sm lg:text-lg truncate">Events</span>
                        </div>
                        <FaChevronRight className={`text-xs transition-transform duration-200 flex-shrink-0 ${isActive('/admin/events') ? 'translate-x-0.5' : 'opacity-40 group-hover:opacity-100'}`} />
                    </Link>

                    {/* Workshops */}
                    <Link
                        to="/admin/workshops"
                        onClick={closeSidebar}
                        className={`flex items-center justify-between px-3 lg:px-4 py-2 lg:py-2.5 mb-1 rounded-lg transition-all duration-200 group ${isActive('/admin/workshops')
                            ? 'bg-white/20 text-white border-l-4 border-white'
                            : 'text-white hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                            <FaChalkboardTeacher className="text-base lg:text-xl flex-shrink-0" />
                            <span className="text-sm lg:text-lg truncate">Workshops</span>
                        </div>
                        <FaChevronRight className={`text-xs transition-transform duration-200 flex-shrink-0 ${isActive('/admin/workshops') ? 'translate-x-0.5' : 'opacity-40 group-hover:opacity-100'}`} />
                    </Link>

                    {/* Products */}
                    <Link
                        to="/admin/products"
                        onClick={closeSidebar}
                        className={`flex items-center justify-between px-3 lg:px-4 py-2 lg:py-2.5 mb-1 rounded-lg transition-all duration-200 group ${isActive('/admin/products')
                            ? 'bg-white/20 text-white border-l-4 border-white'
                            : 'text-white hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                            <FaShoppingCart className="text-base lg:text-xl flex-shrink-0" />
                            <span className="text-sm lg:text-lg truncate">Products</span>
                        </div>
                        <FaChevronRight className={`text-xs transition-transform duration-200 flex-shrink-0 ${isActive('/admin/products') ? 'translate-x-0.5' : 'opacity-40 group-hover:opacity-100'}`} />
                    </Link>

                    {/* Subscription Boxes */}
                    <Link
                        to="/admin/subscription-boxes"
                        onClick={closeSidebar}
                        className={`flex items-center justify-between px-3 lg:px-4 py-2 lg:py-2.5 mb-1 rounded-lg transition-all duration-200 group ${isActive('/admin/subscription-boxes')
                            ? 'bg-white/20 text-white border-l-4 border-white'
                            : 'text-white hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                            <FaBox className="text-base lg:text-xl flex-shrink-0" />
                            <span className="text-sm lg:text-lg">Subscription Boxes</span>
                        </div>
                        <FaChevronRight className={`text-xs transition-transform duration-200 flex-shrink-0 ${isActive('/admin/subscription-boxes') ? 'translate-x-0.5' : 'opacity-40 group-hover:opacity-100'}`} />
                    </Link>

                    {/* Schedule */}
                    <Link
                        to="/admin/calendar"
                        onClick={closeSidebar}
                        className={`flex items-center justify-between px-3 lg:px-4 py-2 lg:py-2.5 mb-1 rounded-lg transition-all duration-200 group ${isActive('/admin/calendar')
                            ? 'bg-white/20 text-white border-l-4 border-white'
                            : 'text-white hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                            <FaCalendarAlt className="text-base lg:text-xl flex-shrink-0" />
                            <span className="text-sm lg:text-lg truncate">Schedule</span>
                        </div>
                        <FaChevronRight className={`text-xs transition-transform duration-200 flex-shrink-0 ${isActive('/admin/calendar') ? 'translate-x-0.5' : 'opacity-40 group-hover:opacity-100'}`} />
                    </Link>

                    {/* Divider */}
                    <div className="border-t border-white/20 dark:border-gray-700 my-4"></div>

                    {/* Profile */}
                    <Link
                        to="/admin/profile"
                        onClick={closeSidebar}
                        className={`flex items-center justify-between px-3 lg:px-4 py-2 lg:py-2.5 mb-1 rounded-lg transition-all duration-200 group ${isActive('/admin/profile')
                            ? 'bg-white/20 text-white border-l-4 border-white'
                            : 'text-white hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                            <FaUserCog className="text-base lg:text-xl flex-shrink-0" />
                            <span className="text-sm lg:text-lg truncate">Profile</span>
                        </div>
                        <FaChevronRight className={`text-xs transition-transform duration-200 flex-shrink-0 ${isActive('/admin/profile') ? 'translate-x-0.5' : 'opacity-40 group-hover:opacity-100'}`} />
                    </Link>
                </nav>

                {/* Logout - Moved to Bottom */}
                <div className="p-3 lg:p-4 border-t border-white/20 dark:border-gray-700 mt-auto bg-adminGreen dark:bg-gray-900 transition-colors duration-300">
                    <button
                        onClick={() => setLogoutConfirm(true)}
                        className="flex items-center justify-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-2.5 w-full bg-red-600 text-white rounded-xl hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md font-bold text-sm lg:text-base"
                    >
                        <FaSignOutAlt className="flex-shrink-0" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content - Responsive padding */}
            <main className="flex-1 xl:ml-56 overflow-auto min-h-screen pt-16 xl:pt-0">
                <Outlet />
            </main>

            {/* Logout Confirmation Dialog */}
            <ConfirmDialog
                isOpen={logoutConfirm}
                onClose={() => setLogoutConfirm(false)}
                onConfirm={handleLogout}
                title="Logout"
                message="Are you sure you want to logout?"
                confirmText="Logout"
                confirmColor="green"
            />
        </div>
    );
}

export default AdminLayout;
