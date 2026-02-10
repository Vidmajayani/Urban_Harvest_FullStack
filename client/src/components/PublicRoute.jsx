import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PublicRoute - Prevents authenticated users from accessing login/signup pages
 * If user is already logged in, redirect to appropriate dashboard
 */
const PublicRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-ecoGreen border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // If user is authenticated, redirect to their dashboard
    if (isAuthenticated()) {
        if (isAdmin()) {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default PublicRoute;
