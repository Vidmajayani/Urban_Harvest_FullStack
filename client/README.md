# Urban Harvest Hub - Web Development Assignment Task 1

## 🌿 Project Overview
Urban Harvest Hub is a **Single Page Application (SPA)** built with React + Vite, designed to connect eco-conscious communities. This submission satisfies the requirements for **Task 1**, demonstrating a component-based architecture for showcasing sustainable products, events, and workshops.

---

## 🚀 How to Run the Application

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation Steps
1. **Unzip** the submission folder.
2. Open a terminal in the project root folder.
3. Run the following command to install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server
1. Start the application:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

---

## ✨ Features Implemented

### 1. **Core SPA Functionality**
- **Client-Side Routing:** Seamless navigation between Home, Products, Events, Workshops, and About pages.
- **Dynamic Content:** Item details pages (Master-Detail pattern) populated from JSON data.
- **Filtering System:** Category-based filtering for all main sections.

### 2. **Component-Based Architecture**
- **Reusable Components:** Modular design using `ProductCard`, `EventCard`, `BookingForm`, etc.
- **State Management:** Centralized `AppContext` for managing data and themes.

### 3. **Advanced Features**
- **Complete Booking System:** 
  - Payment forms with validation (Luhn algorithm for cards).
  - Dynamic price calculation.
  - Handling of "Free" vs "Paid" events.
- **Subscribe Feature (Preview):** UI implementation for product subscriptions (Task 2 preview).
- **Interactive Elements:**
  - Dark Mode (persisted in localStorage).
  - Testimonials Carousel.
  - Video Player (Local assets).
  - Image Gallery with Lightbox.
  - FAQ Accordion.

### 4. **Styling & Design**
- **Tailwind CSS:** Custom configuration with brand colors (`ecoGreen`, `ecoOrange`).
- **Responsive Design:** Mobile-first approach optimized for all screens (starting from **280px Fold devices**).
- **Accessibility:** Semantic HTML, ARIA labels, and focus management throughout.

---

## 🛠️ Tech Stack
- **Frontend Framework:** React (18.x)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Icons:** React Icons (FontAwesome)

---

## 📦 Project Structure
```
src/
├── components/   # Reusable UI components (Cards, Forms, Layouts)
├── context/      # Global state (AppContext)
├── data/         # JSON data files (products, events, workshops)
├── pages/        # Main route pages (Home, About, Details)
└── main.jsx      # Entry point
```

---

## 📝 Student Notes
- **Data Source:** This application uses local JSON files for data seeding as per Task 1 spec.
- **Images:** External images have been replaced with local assets where possible to support future PWA requirements.
- **Subscribe Feature:** Implemented as a UI capability ("Coming Soon") to demonstrate architectural readiness for Task 2's backend requirements.
