import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * HistoryBlocker - Prevents browser back button from accessing protected pages after logout
 * This component should be placed at the root level of the app
 */
const HistoryBlocker = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // STRICT BACK BUTTON BLOCKING FOR AUTHENTICATED USERS
        if (isAuthenticated()) {
            // Push a new state to the history stack
            window.history.pushState(null, document.title, window.location.href);

            const handlePopState = (event) => {
                // When back button is pressed, push the state again to keep user forward
                window.history.pushState(null, document.title, window.location.href);
            };

            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }

        // Existing Logout Protection (for unauthenticated users trying to access protected routes)
        const handleLogoutProtection = (event) => {
            if (!isAuthenticated()) {
                const protectedRoutes = ['/admin', '/my-bookings', '/profile'];
                const isProtectedRoute = protectedRoutes.some(route =>
                    location.pathname.startsWith(route)
                );

                if (isProtectedRoute) {
                    event.preventDefault();
                    navigate('/login', { replace: true });
                }
            }
        };

        window.addEventListener('popstate', handleLogoutProtection);

        return () => {
            window.removeEventListener('popstate', handleLogoutProtection);
        };
    }, [isAuthenticated, navigate, location]);

    return null; // This component doesn't render anything
};

export default HistoryBlocker;
