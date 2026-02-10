# Urban Harvest Hub - Task 2: Full-Stack PWA

## 📋 Project Overview

Urban Harvest Hub is a comprehensive full-stack Progressive Web Application (PWA) that connects communities with sustainable living resources. The platform features events, workshops, and eco-friendly products, with a complete backend database and REST API.

**Assignment:** Task 2 - Full-Stack Implementation with Database Integration

---

## ✨ Features

### **User Features**
- ✅ User registration and authentication (JWT-based)
- ✅ Browse events, workshops, and products from database
- ✅ Book events and workshops
- ✅ View booking history
- ✅ Category filtering
- ✅ Responsive design (mobile-first)

### **Admin Features**
- ✅ Admin login (pre-configured accounts)
- ✅ Role-based access control
- ✅ Manage events, workshops, and products via API

### **Technical Features**
- ✅ 20-table normalized SQLite database
- ✅ RESTful API with Express.js
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ React frontend with Context API
- ✅ Axios for API calls
- ✅ Loading states and error handling

---

## 🛠️ Tech Stack

### **Frontend**
- React 18
- React Router v6
- Axios
- Tailwind CSS
- Vite

### **Backend**
- Node.js
- Express.js
- SQLite3
- JWT (jsonwebtoken)
- bcryptjs
- CORS

---

## 📦 Installation & Setup

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd UrbanHarvest_FullStack
```

### **2. Backend Setup**
```bash
cd server
npm install
```

Create `.env` file in `server` directory:
```env
PORT=5000
JWT_SECRET=urbanharvest_secret_key_2024_change_in_production
NODE_ENV=development
```

Initialize database:
```bash
cd database
node init-db.js
node seed.js
cd ..
```

Start backend server:
```bash
npm start
```

Backend will run on: `http://localhost:5000`

### **3. Frontend Setup**
```bash
cd ../client
npm install
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

## 🗄️ Database Schema

### **Tables (20 Total)**

**User Management:**
- `users` - All users (customers + admins by role)

**Master Data:**
- `categories` - Event/workshop/product categories
- `organizers` - Event organizers
- `instructors` - Workshop instructors

**Main Content:**
- `events` - Community events
- `workshops` - Educational workshops
- `products` - Sustainable products
- `faqs` - FAQ section
- `testimonials` - Customer testimonials
- `hero_slides` - Homepage carousel

**Transactions:**
- `orders` - Product purchases
- `order_items` - Items in orders
- `bookings` - Event/workshop bookings
- `reviews` - Product reviews

**Detail Tables:**
- `event_agenda` - Event schedules
- `event_highlights` - Event features
- `event_expectations` - What to expect
- `workshop_outcomes` - Learning outcomes
- `workshop_requirements` - What to bring
- `product_details` - Product attributes

---

## 🔐 Test Credentials

### **Customer Account**
```
Email: john@example.com
Password: user123
```

### **Admin Account**
```
Email: admin@urbanharvest.com
Password: admin123
```

---

## 🌐 API Endpoints

### **Authentication**
- `POST /api/auth/signup` - Register new customer
- `POST /api/auth/login` - Login (customers + admins)
- `GET /api/auth/me` - Get current user (requires auth)

### **Events**
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

### **Workshops**
- `GET /api/workshops` - Get all workshops
- `GET /api/workshops/:id` - Get single workshop
- `POST /api/workshops` - Create workshop (admin only)

### **Products**
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)

### **Bookings**
- `POST /api/bookings` - Create booking (logged in users)
- `GET /api/bookings` - Get user's bookings (logged in users)

---

## 📱 Application Routes

### **Public Routes**
- `/` - Homepage
- `/events` - Events listing
- `/events/:id` - Event details
- `/workshops` - Workshops listing
- `/workshops/:id` - Workshop details
- `/products` - Products listing
- `/products/:id` - Product details
- `/about` - About page
- `/login` - Login page
- `/signup` - Signup page

### **Protected Routes**
- `/my-bookings` - User's bookings (requires login)

---

## 🧪 Testing

### **Test the Application**

1. **Start both servers** (backend and frontend)
2. **Visit:** `http://localhost:5173`
3. **Test pages:**
   - Events: Should show 20 events from database
   - Workshops: Should show 20 workshops from database
   - Products: Should show 14 products from database
4. **Test authentication:**
   - Signup with new account
   - Login with test credentials
   - View My Bookings page

### **Test API Directly**
```bash
# Get all events
curl http://localhost:5000/api/events

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"user123"}'
```

---

## 📂 Project Structure

```
UrbanHarvest_FullStack/
├── server/                    # Backend
│   ├── database/
│   │   ├── urbanharvest.db   # SQLite database
│   │   ├── schema.sql        # Database schema
│   │   ├── seed.js           # Seed script
│   │   ├── init-db.js        # DB initialization
│   │   └── db.js             # Connection module
│   ├── middleware/
│   │   └── auth.js           # JWT middleware
│   ├── routes/
│   │   ├── auth.js           # Auth routes
│   │   ├── events.js         # Events routes
│   │   ├── workshops.js      # Workshops routes
│   │   ├── products.js       # Products routes
│   │   └── bookings.js       # Bookings routes
│   ├── .env                  # Environment variables
│   ├── server.js             # Main server file
│   └── package.json
│
└── client/                    # Frontend
    ├── src/
    │   ├── components/        # Reusable components
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Events.jsx
    │   │   ├── Workshops.jsx
    │   │   ├── Products.jsx
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   └── MyBookings.jsx
    │   ├── services/
    │   │   └── api.js         # API service
    │   ├── styles/
    │   │   └── Auth.css
    │   └── App.jsx
    └── package.json
```

---

## 🎯 Key Implementation Details

### **Database Design**
- Fully normalized to 3NF
- No data redundancy
- Proper foreign key relationships
- Single USERS table with role field

### **Authentication**
- JWT tokens (7-day expiry)
- Password hashing with bcrypt (10 rounds)
- Role-based access control
- Token stored in localStorage

### **API Design**
- RESTful conventions
- Consistent error handling
- CORS enabled for development
- Request logging

### **Frontend**
- Context API for state management
- Axios interceptors for token management
- Loading states for all API calls
- Error handling with user feedback

---

## 🚀 Deployment

### **Backend Deployment (Render/Railway)**
1. Push code to GitHub
2. Connect repository to hosting service
3. Set environment variables
4. Deploy

### **Frontend Deployment (Vercel/Netlify)**
1. Update API base URL to production
2. Build: `npm run build`
3. Deploy `dist` folder

---

## 📝 Assignment Requirements Met

✅ Database design and implementation (20 tables)
✅ Backend API with Node.js/Express
✅ SQLite database
✅ JWT authentication
✅ User signup/login
✅ Data from database (not JSON files)
✅ CRUD operations
✅ Role-based access control
✅ Responsive design
✅ Professional UI/UX

---

## 🎁 Bonus Features Implemented

✅ FAQs, Testimonials, Hero Slides tables
✅ Fully normalized database (20 tables)
✅ Password hashing
✅ Loading states
✅ Error handling
✅ Category filtering
✅ Booking system

---

## 📞 Support

For issues or questions:
1. Check both servers are running
2. Check browser console (F12)
3. Check backend terminal for errors
4. Test API endpoints directly

---

## 👨‍💻 Author

**Task 2 - Full-Stack PWA Implementation**
Urban Harvest Hub

---

## 📄 License

This project is for educational purposes (University Assignment).

---

**🎉 Project Complete! Ready for Submission!**
