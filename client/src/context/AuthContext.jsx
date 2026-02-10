import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount using JWT token
    useEffect(() => {
        const savedToken = sessionStorage.getItem('token');
        const savedUser = sessionStorage.getItem('user');

        if (savedToken && savedUser) {
            // Restore user session from sessionStorage (clears on browser close)
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }

        setLoading(false);
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { token: newToken, user: newUser } = response.data;

            // Save to sessionStorage (clears on browser close)
            sessionStorage.setItem('token', newToken);
            sessionStorage.setItem('user', JSON.stringify(newUser));

            // Update state
            setToken(newToken);
            setUser(newUser);

            return { success: true, user: newUser };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    // Signup function (does NOT auto-login)
    const signup = async (name, email, password, phone, address) => {
        try {
            const response = await authAPI.signup({ name, email, password, phone, address });

            // Do NOT save token or user - user must login after signup
            return { success: true, message: 'Account created successfully! Please login.' };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Signup failed'
            };
        }
    };

    // Logout function - clears everything and prevents back navigation
    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);

        // Clear browser history to prevent back navigation
        window.history.pushState(null, '', window.location.href);
        window.history.replaceState(null, '', '/login');
    };

    // Check if user is admin
    const isAdmin = () => {
        return user?.role === 'admin' || user?.role === 'super_admin';
    };

    // Check if user is customer
    const isCustomer = () => {
        return user?.role === 'customer';
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        return !!user;
    };

    const value = {
        user,
        token, // ← ADD THIS!
        setUser, // Expose setUser for profile updates
        loading,
        login,
        signup,
        logout,
        isAdmin,
        isCustomer,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
