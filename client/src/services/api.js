/**
 * API Service
 * Centralized API calls with token management
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api`;

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    getCurrentUser: () => api.get('/auth/me')
};

// Events API
export const eventsAPI = {
    getAll: () => api.get('/events'),
    getOne: (id) => api.get(`/events/${id}`),
    getBookings: (id) => api.get(`/events/${id}/bookings`),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.put(`/events/${id}`, data),
    delete: (id) => api.delete(`/events/${id}`)
};

// Workshops API
export const workshopsAPI = {
    getAll: () => api.get('/workshops'),
    getOne: (id) => api.get(`/workshops/${id}`),
    getBookings: (id) => api.get(`/workshops/${id}/bookings`),
    create: (data) => api.post('/workshops', data),
    update: (id, data) => api.put(`/workshops/${id}`, data),
    delete: (id) => api.delete(`/workshops/${id}`)
};

// Products API
export const productsAPI = {
    getAll: () => api.get('/products'),
    getOne: (id) => api.get(`/products/${id}`),
    getSales: (id) => api.get(`/products/${id}/sales`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`)
};

// Bookings API
export const bookingsAPI = {
    create: (data) => api.post('/bookings', data),
    getMyBookings: () => api.get('/bookings')
};

// Orders API
export const ordersAPI = {
    create: (data) => api.post('/orders', data),
    createBulkOrder: (data) => api.post('/orders/bulk', data),
    getMyOrders: () => api.get('/orders'),
    getOne: (id) => api.get(`/orders/${id}`)
};

// Product Reviews API
export const productReviewsAPI = {
    getReviews: (productId) => api.get(`/product-reviews/${productId}`),
    fetchProductReviews: () => api.get('/product-reviews/my-reviews'),
    canReview: (productId) => api.get(`/product-reviews/can-review/${productId}`),
    create: (data) => api.post('/product-reviews', data),
    delete: (id) => api.delete(`/product-reviews/${id}`)
};

// Event Reviews API
export const eventReviewsAPI = {
    getReviews: (eventId) => api.get(`/event-reviews/${eventId}`),
    canReview: (eventId) => api.get(`/event-reviews/can-review/${eventId}`),
    create: (data) => api.post('/event-reviews', data)
};

// Workshop Reviews API
export const workshopReviewsAPI = {
    getReviews: (workshopId) => api.get(`/workshop-reviews/${workshopId}`),
    canReview: (workshopId) => api.get(`/workshop-reviews/can-review/${workshopId}`),
    create: (data) => api.post('/workshop-reviews', data)
};

// Testimonials API
export const testimonialsAPI = {
    getAll: () => api.get('/testimonials'),
    getFeatured: () => api.get('/testimonials/featured')
};

// Hero Slides API
export const heroSlidesAPI = {
    getAll: () => api.get('/hero-slides')
};

// Subscription Boxes API
export const subscriptionBoxesAPI = {
    getAll: () => api.get('/subscription-boxes'),
    getOne: (id) => api.get(`/subscription-boxes/${id}`),
    create: (data) => api.post('/subscription-boxes', data),
    update: (id, data) => api.put(`/subscription-boxes/${id}`, data),
    delete: (id) => api.delete(`/subscription-boxes/${id}`)
};

// Subscriptions API
export const subscriptionsAPI = {
    create: (data) => api.post('/subscriptions', data),
    getMy: () => api.get('/subscriptions/my'),
    getHistory: () => api.get('/subscriptions/history'),
    cancel: (id) => api.put(`/subscriptions/${id}/cancel`),
    pause: (id) => api.put(`/subscriptions/${id}/pause`),
    resume: (id) => api.put(`/subscriptions/${id}/resume`),
    reactivate: (id) => api.put(`/subscriptions/${id}/reactivate`),
    addReview: (id, data) => api.post(`/subscriptions/${id}/review`, data),
    getReview: (id) => api.get(`/subscriptions/${id}/review`)
};

// Reviews API
export const reviewsAPI = {
    getByBox: (boxId) => api.get(`/subscription-reviews/box/${boxId}`),
    getMyReviews: () => api.get('/subscription-reviews/my-reviews'),
    create: (data) => api.post('/subscription-reviews', data),
    update: (id, data) => api.put(`/subscription-reviews/${id}`, data),
    delete: (id) => api.delete(`/subscription-reviews/${id}`)
};

// Favorites API
export const favoritesAPI = {
    getAll: () => api.get('/favorites'),
    add: (data) => api.post('/favorites', data), // { item_type, item_id }
    remove: (favoriteId) => api.delete(`/favorites/${favoriteId}`),
    removeByItem: (type, id) => api.delete(`/favorites/item/${type}/${id}`),
    checkStatus: (type, id) => api.get(`/favorites/check/${type}/${id}`)
};

export default api;
