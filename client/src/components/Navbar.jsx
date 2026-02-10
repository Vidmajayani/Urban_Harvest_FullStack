import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { FaUser, FaSignInAlt, FaSignOutAlt, FaChevronDown, FaBoxOpen, FaCalendarAlt, FaTools, FaGift, FaHeart } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";
import CartIcon from "./CartIcon";
import ConfirmDialog from "./ConfirmDialog";
import { useAuth } from "../context/AuthContext";

// import { useTranslation } from "react-auto-google-translate"; // Library doesn't export this

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMyAccountOpen, setIsMyAccountOpen] = useState(false);

  // Sync state with cookie on mount
  useEffect(() => {
    const cookies = document.cookie.split(';');
    const googtrans = cookies.find(c => c.trim().startsWith('googtrans='));
    if (googtrans && googtrans.includes('/fr')) {
      setCurrentLang('fr');
    }
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();



  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);



  const handleLogout = () => {
    logout();
    setLogoutConfirm(false);
    navigate('/login');
    setIsOpen(false);
  };

  const [isTranslating, setIsTranslating] = useState(false);

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'fr' : 'en';
    setIsTranslating(true);

    if (newLang === 'en') {
      // Revert to English: Clear cookies and reload
      document.cookie = 'googtrans=; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.reload();
      return;
    }

    // Function to set cookie and reload (Fallback for French)
    const setCookieAndReload = () => {
      document.cookie = 'googtrans=/en/fr; path=/; domain=' + window.location.hostname;
      document.cookie = 'googtrans=/en/fr; path=/;';
      window.location.reload();
    };

    // Function to attempt translation via Widget
    const attemptTranslation = (retryCount = 0) => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = 'fr';
        select.dispatchEvent(new Event('change'));
        setCurrentLang('fr');
        setIsTranslating(false);
        return true;
      } else if (retryCount < 20) {
        // Retry every 300ms
        setTimeout(() => attemptTranslation(retryCount + 1), 300);
        return false;
      }

      // If we get here, the widget is stuck. Use Nuclear Option: Cookies.
      console.warn('Google Translate widget stuck. Using cookie fallback.');
      setCookieAndReload();
      return false;
    };

    attemptTranslation();
  };

  const categoryLinks = [
    { name: "Products", path: "/products", icon: <FaBoxOpen /> },
    { name: "Events", path: "/events", icon: <FaCalendarAlt /> },
    { name: "Workshops", path: "/workshops", icon: <FaTools /> },
    { name: "Subscription Boxes", path: "/subscription-boxes", icon: <FaGift /> },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${scrolled
        ? "bg-ecoGreen/95 dark:bg-gray-900/95 shadow-lg backdrop-blur-md"
        : "bg-ecoGreen dark:bg-gray-900"
        } text-white dark:text-gray-100 px-6 py-4 flex items-center justify-between lg:justify-start border-b border-transparent dark:border-gray-800`}
    >
      <div className="flex items-center">
        <img
          src="/Images/logo.png"
          alt="Urban Harvest Hub Logo"
          className="h-10 w-10 lg:h-12 lg:w-12 mr-2 lg:mr-3 transition-transform duration-300 hover:scale-110"
        />
        <h1 className="text-sm sm:text-base lg:text-xl xl:text-2xl font-ecoHeading tracking-wide lg:block hidden transition-all duration-300 text-white animate-fade-in whitespace-nowrap">
          Urban Harvest
        </h1>
      </div>

      <h1 className="text-xs fold:text-sm sm:text-lg font-ecoHeading tracking-wide lg:hidden absolute left-1/2 transform -translate-x-1/2 text-white text-center pointer-events-none transition-all duration-300 select-none whitespace-nowrap">
        Urban Harvest
      </h1>

      <div className="hidden lg:flex gap-4 ml-auto items-center">
        {/* Home Link */}
        <Link
          to="/"
          className={`font-ecoFont font-medium transition-all duration-300 hover:text-ecoYellowDark dark:hover:text-ecoLight ${location.pathname === "/"
            ? "text-ecoYellowDark dark:text-ecoLight border-b-2 border-ecoYellowDark dark:border-ecoLight"
            : "text-white dark:text-gray-300"
            }`}
        >
          Home
        </Link>

        {/* Categories Dropdown - Only show for non-admin users */}
        {!isAdmin() && (
          <div
            className="relative group"
            onMouseEnter={() => setIsCategoriesOpen(true)}
            onMouseLeave={() => setIsCategoriesOpen(false)}
          >
            <button
              className="font-ecoFont font-medium transition-all duration-300 hover:text-ecoYellowDark dark:hover:text-ecoLight text-white dark:text-gray-300 flex items-center gap-1"
            >
              Categories
              <FaChevronDown className={`text-xs transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${isCategoriesOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
              {categoryLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:bg-ecoGreen hover:text-white dark:hover:bg-ecoGreen ${location.pathname === link.path
                    ? "bg-ecoGreen/10 text-ecoGreen dark:bg-ecoGreen/20 dark:text-ecoLight font-semibold"
                    : "text-gray-700 dark:text-gray-300"
                    }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {isAuthenticated() && (
          <div className="flex items-center gap-4">
            {!isAdmin() && (
              <div
                className="relative group"
                onMouseEnter={() => setIsMyAccountOpen(true)}
                onMouseLeave={() => setIsMyAccountOpen(false)}
              >
                <button
                  className="font-ecoFont font-medium transition-all duration-300 hover:text-ecoYellowDark dark:hover:text-ecoLight text-white dark:text-gray-300 flex items-center gap-1"
                >
                  My Account
                  <FaChevronDown className={`text-xs transition-transform duration-300 ${isMyAccountOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <div className={`absolute top-full right-0 lg:left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 z-[60] ${isMyAccountOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                  <div className="p-2 space-y-1">
                    <Link
                      to="/my-activity"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${location.pathname === '/my-activity'
                        ? "bg-ecoGreen text-white font-bold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                    >
                      <FaCalendarAlt className={location.pathname === '/my-activity' ? 'text-white' : 'text-ecoGreen'} />
                      <span className="whitespace-nowrap">My Activity</span>
                    </Link>
                    <Link
                      to="/my-subscriptions"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${location.pathname === '/my-subscriptions'
                        ? "bg-ecoGreen text-white font-bold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                    >
                      <FaGift className={location.pathname === '/my-subscriptions' ? 'text-white' : 'text-ecoGreen'} />
                      <span className="whitespace-nowrap">My Subscriptions</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {isAdmin() && (
              <Link
                to="/admin"
                className={`font-ecoFont font-medium transition-all duration-300 hover:text-ecoYellowDark dark:hover:text-ecoLight ${location.pathname.startsWith('/admin')
                  ? "text-ecoYellowDark dark:text-ecoLight border-b-2 border-ecoYellowDark dark:border-ecoLight"
                  : "text-white dark:text-gray-300"
                  }`}
              >
                Admin Panel
              </Link>
            )}

            {/* Favorites Heart Icon - Quick Access */}
            {!isAdmin() && (
              <Link
                to="/favorites"
                className="relative group"
                title="My Favorites"
              >
                <FaHeart className={`text-xl transition-all duration-300 ${location.pathname === '/favorites'
                  ? 'text-statusError scale-110'
                  : 'text-white dark:text-gray-300 hover:text-statusError dark:hover:text-statusError hover:scale-110'
                  }`} />
              </Link>
            )}

            {!isAdmin() && <CartIcon />}

            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="text-white hover:text-ecoYellowDark dark:hover:text-ecoLight transition p-2"
                title={user?.name}
              >
                <FaUser className="text-xl" />
              </Link>
              <button
                onClick={() => setLogoutConfirm(true)}
                className="text-white hover:text-red-400 transition p-2"
                title="Logout"
              >
                <FaSignOutAlt className="text-xl" />
              </button>
            </div>
          </div>
        )}

        {!isAuthenticated() && (
          <Link
            to="/login"
            className="px-5 py-2 border-2 border-white/50 text-white hover:bg-white hover:text-ecoGreen rounded-full transition-all duration-300 font-bold tracking-tight text-sm"
          >
            Login
          </Link>
        )}

        {/* Custom Language Toggle Button */}
        <button
          onClick={toggleLanguage}
          disabled={isTranslating}
          className={`px-3 py-1.5 bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-full transition-all duration-300 font-bold text-xs uppercase tracking-widest flex items-center gap-2 ${isTranslating ? 'opacity-50 cursor-wait' : ''}`}
        >
          {isTranslating ? (
            <span className="flex items-center gap-1">
              <span className="animate-pulse">...</span>
            </span>
          ) : (
            <>
              <span className={currentLang === 'en' ? 'text-ecoYellowDark' : 'text-white/50'}>EN</span>
              <span className="w-[1px] h-3 bg-white/20"></span>
              <span className={currentLang === 'fr' ? 'text-ecoYellowDark' : 'text-white/50'}>FR</span>
            </>
          )}
        </button>

        <div>
          <ThemeToggle />
        </div>


      </div>

      <div className="lg:hidden flex items-center ml-auto gap-3">
        {isAuthenticated() && !isAdmin() && <CartIcon />}
        <button
          onClick={toggleMenu}
          className="p-1.5 rounded-lg hover:bg-white/20 active:scale-95 transition-all duration-300 text-white"
          aria-label="Toggle menu"
        >
          {isOpen ? <HiX className="w-7 h-7" /> : <HiMenu className="w-7 h-7" />}
        </button>
      </div>

      <div
        className={`fixed top-[72px] left-0 w-full bg-ecoGreen dark:bg-gray-900 lg:hidden z-40 shadow-lg transition-all duration-300 overflow-hidden border-t dark:border-gray-800 ${isOpen ? "max-h-screen py-6 opacity-100" : "max-h-0 py-0 opacity-0"}`}
      >
        <div className="flex flex-col items-center gap-4 pb-8">
          {/* Home Link */}
          <Link
            onClick={toggleMenu}
            to="/"
            className={`text-lg font-medium py-2 transition-all duration-300 ${location.pathname === "/" ? "text-ecoYellowDark dark:text-ecoLight" : "text-white dark:text-gray-300"
              }`}
          >
            Home
          </Link>

          {/* Categories Section - Only for non-admin */}
          {!isAdmin() && (
            <div className="w-full px-6">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="w-full text-lg font-medium text-white dark:text-gray-300 flex items-center justify-center gap-2 py-2"
              >
                Categories
                <FaChevronDown className={`text-sm transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Dropdown Items */}
              <div className={`overflow-hidden transition-all duration-500 ${isCategoriesOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white/5 dark:bg-black/20 rounded-xl border border-white/10 dark:border-white/5 overflow-hidden backdrop-blur-sm">
                  {categoryLinks.map((link) => (
                    <Link
                      key={link.path}
                      onClick={toggleMenu}
                      to={link.path}
                      className={`flex items-center gap-4 px-5 py-4 transition-all duration-300 ${location.pathname === link.path
                        ? "bg-white/20 text-white font-bold"
                        : "text-white/80 hover:bg-white/10 active:bg-white/20"
                        }`}
                    >
                      <span className="text-xl opacity-90">{link.icon}</span>
                      <span className="text-base">{link.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isAuthenticated() && (
            <>
              {!isAdmin() && (
                <div className="w-full px-6">
                  <button
                    onClick={() => setIsMyAccountOpen(!isMyAccountOpen)}
                    className="w-full text-lg font-medium text-white dark:text-gray-300 flex items-center justify-center gap-2 py-2"
                  >
                    My Account
                    <FaChevronDown className={`text-sm transition-transform duration-300 ${isMyAccountOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Mobile Dropdown Items */}
                  <div className={`overflow-hidden transition-all duration-500 ${isMyAccountOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-white/5 dark:bg-black/20 rounded-xl border border-white/10 dark:border-white/5 overflow-hidden backdrop-blur-sm">
                      <Link
                        onClick={toggleMenu}
                        to="/my-activity"
                        className={`flex items-center gap-4 px-5 py-4 transition-all duration-300 ${location.pathname === '/my-activity'
                          ? "bg-white/20 text-white font-bold"
                          : "text-white/80 hover:bg-white/10 active:bg-white/20"
                          }`}
                      >
                        <FaCalendarAlt className="text-xl opacity-90" />
                        <span className="text-base">My Activity</span>
                      </Link>
                      <Link
                        onClick={toggleMenu}
                        to="/my-subscriptions"
                        className={`flex items-center gap-4 px-5 py-4 transition-all duration-300 ${location.pathname === '/my-subscriptions'
                          ? "bg-white/20 text-white font-bold"
                          : "text-white/80 hover:bg-white/10 active:bg-white/20"
                          }`}
                      >
                        <FaGift className="text-xl opacity-90" />
                        <span className="text-base">My Subscriptions</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              {isAdmin() && (
                <Link
                  onClick={toggleMenu}
                  to="/admin"
                  className="text-lg font-medium py-2 text-white dark:text-gray-300"
                >
                  Admin Panel
                </Link>
              )}
              {!isAdmin() && (
                <Link
                  onClick={toggleMenu}
                  to="/favorites"
                  className="text-lg font-medium py-2 text-white dark:text-gray-300"
                >
                  My Favorites
                </Link>
              )}
              <Link
                onClick={toggleMenu}
                to="/profile"
                className="text-lg font-medium py-2 text-white dark:text-gray-300"
              >
                Profile
              </Link>
              <button
                onClick={() => { setLogoutConfirm(true); setIsOpen(false); }}
                className="px-8 py-3 bg-white/10 border border-white/20 text-white rounded-full font-bold transition-all active:scale-95"
              >
                Logout
              </button>
            </>
          )}

          {!isAuthenticated() && (
            <Link
              onClick={toggleMenu}
              to="/login"
              className="px-8 py-3 border-2 border-white/50 text-white hover:bg-white hover:text-ecoGreen rounded-full font-bold transition-all transition-all active:scale-95"
            >
              Login
            </Link>
          )}

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={toggleLanguage}
              disabled={isTranslating}
              className={`px-6 py-2 bg-white/10 border border-white/20 text-white rounded-full font-bold transition-all active:scale-95 text-sm uppercase tracking-widest ${isTranslating ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isTranslating ? 'Translating...' : (currentLang === 'en' ? 'Switch to French (FR)' : 'Switch to English (EN)')}
            </button>

            <ThemeToggle />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={logoutConfirm}
        onClose={() => setLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        confirmColor="green"
      />
    </nav>
  );
}

export default Navbar;