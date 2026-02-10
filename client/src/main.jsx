import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";
import "./index.css"; // Tailwind CSS imports
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker manually for better control
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('✅ App is ready for offline use');
  },
  onRegisterError(error) {
    console.error('❌ Service Worker registration error:', error);
  }
});

// Render the application
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <AppProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AppProvider>
    </AuthProvider>
  </BrowserRouter>
);

// Note: Service Worker is automatically registered by Vite PWA plugin
// No manual registration needed - it's handled in vite.config.js
