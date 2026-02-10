import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider, useNotification } from "./context/NotificationContext";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import { subscribeToPushNotifications } from "./services/pushNotification";
import { useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute"; // Added for protected routes
import PublicRoute from "./components/PublicRoute"; // Prevents logged-in users from accessing login/signup
import HistoryBlocker from "./components/HistoryBlocker"; // Prevents back navigation after logout
// Mobile PWA install banner removed from global - moved to layout components
import Notification from "./components/Notification"; // In-app notification toast
import { useState } from "react";

// Page imports
import ScrollToTop from "./components/ScrollToTop";

// Page imports
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Workshops from "./pages/Workshops";
import WorkshopDetails from "./pages/WorkshopDetails";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CustomerDashboard from "./pages/CustomerDashboard";
import UserProfile from "./pages/UserProfile";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import ManageEvents from "./pages/ManageEvents";
import ManageWorkshops from "./pages/ManageWorkshops";
import ManageProducts from "./pages/ManageProducts";
import AdminEventDetail from "./pages/AdminEventDetail";
import AdminProductDetail from "./pages/AdminProductDetail";
import AdminWorkshopDetail from "./pages/AdminWorkshopDetail";
import AdminProfile from "./pages/AdminProfile";
import AdminCalendar from "./pages/AdminCalendar";
import ManageSubscriptionBoxes from "./pages/ManageSubscriptionBoxes";
import AdminSubscriptionBoxDetail from "./pages/AdminSubscriptionBoxDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import SubscriptionBoxes from "./pages/SubscriptionBoxes";
import SubscriptionBoxDetail from "./pages/SubscriptionBoxDetail";
import MySubscriptions from "./pages/MySubscriptions";
import Favorites from "./pages/Favorites";

// Wrapper to handle Push Notification Application Logic
const AppContent = () => {
  const { user, token } = useAuth();

  useEffect(() => {
    // Debug logging to track role and subscription status
    if (user && token) {
      console.log('👤 Auth Status Check - User:', user.name, '| Role:', user.role);
    }

    // Only subscribe if user is logged in AND is a customer
    if (user && token && user.role === 'customer') {
      console.log('🔔 Triggering push subscription for customer...');
      subscribeToPushNotifications(token);
    }
  }, [user, token]);

  // Google Translate Widget Initialization
  // Google Translate Widget Initialization
  useEffect(() => {
    const initWidget = () => {
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        if (!document.getElementById('google_translate_element').hasChildNodes()) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,fr',
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            'google_translate_element'
          );
        }
      }
    };

    if (document.getElementById('google-translate-script')) {
      // Script already exists, try to init immediately
      initWidget();
      return;
    }

    window.googleTranslateElementInit = initWidget;

    const addScript = document.createElement('script');
    addScript.id = 'google-translate-script';
    addScript.setAttribute('src', 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit');
    document.body.appendChild(addScript);
  }, []);

  // --- In-App Notification Logic ---
  const { showNotification } = useNotification();


  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event) => {
      // ONLY show the toast if the user is a CUSTOMER
      if (event.data && event.data.type === 'PUSH_RECEIVED' && user?.role === 'customer') {
        console.log('📬 In-app notification received from SW:', event.data.data);
        showNotification(`${event.data.data.title}: ${event.data.data.body}`, 'info');
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, []);
  // ---------------------------------

  return (
    <>
      <Routes>
        {/* Auth Pages - Standalone (No Layout) - Protected from logged-in users */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Public Pages with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="workshops" element={<Workshops />} />
          <Route path="workshops/:id" element={<WorkshopDetails />} />
          <Route path="about" element={<About />} />
          <Route path="subscription-boxes" element={<SubscriptionBoxes />} />
          <Route path="subscription-boxes/:id" element={<SubscriptionBoxDetail />} />

          {/* Protected User Pages */}
          <Route path="my-activity" element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          } />
          <Route path="my-subscriptions" element={
            <ProtectedRoute>
              <MySubscriptions />
            </ProtectedRoute>
          } />
          <Route path="favorites" element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          } />
          {/* Redirect old route to new dashboard */}
          <Route path="my-bookings" element={<Navigate to="/my-activity" replace />} />
          <Route path="profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
        </Route>

        {/* Admin Pages */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="events" element={<ManageEvents />} />
          <Route path="events/:id" element={<AdminEventDetail />} />
          <Route path="workshops" element={<ManageWorkshops />} />
          <Route path="workshops/:id" element={<AdminWorkshopDetail />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="products/:id" element={<AdminProductDetail />} />
          <Route path="subscription-boxes" element={<ManageSubscriptionBoxes />} />
          <Route path="subscription-boxes/:id" element={<AdminSubscriptionBoxDetail />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <div className="font-ecoFont bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
          {/* Steiner Container: Hidden but technically visible to let Google scripts populate it */}
          <div
            id="google_translate_element"
            style={{
              position: 'absolute',
              top: '-9999px',
              left: '-9999px',
              visibility: 'hidden',
              height: '0',
              width: '0',
              overflow: 'hidden'
            }}
          ></div>

          <HistoryBlocker />
          <ScrollToTop />
          <AppContent />
        </div>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;