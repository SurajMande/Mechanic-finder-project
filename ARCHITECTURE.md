# Mech Project - Architecture Documentation

## 1. Project Overview

**Mech Project** is a full-stack web application that connects users with professional mechanics. It provides a platform for:
- Service requests and booking management
- Mechanic portfolio showcasing
- Real-time mechanic tracking
- Rating and review system
- User authentication and role-based access

---

## 2. Technology Stack

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **State Management**: React Context/Hooks
- **Features**: PWA with Service Workers, Real-time tracking

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQL/MongoDB (via connection.js)
- **Caching**: Redis
- **Authentication**: JWT-based auth middleware

### Infrastructure
- **Package Manager**: npm
- **Service Workers**: PWA support for offline capabilities

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Screens: Login, Signup, Dashboard, Tracking, Requests │  │
│  │  Components: Forms, Cards, Filters, Navigation          │  │
│  │  Utils: Auth, Location, Notifications, Image handling   │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/REST API
┌──────────────────────────┴──────────────────────────────────────┐
│                    Backend (Express.js)                         │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Routes → Controllers → Services → Models/DB           │   │
│  │ Middleware: Auth, Cache, Role-based Access            │   │
│  │ Caching Layer: Redis for performance optimization      │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
    ┌───▼────┐                   ┌───▼────┐
    │Database│                   │ Redis  │
    │(SQL/   │                   │Cache   │
    │MongoDB)│                   │        │
    └────────┘                   └────────┘
```

---

## 4. Directory Structure & Purpose

### Backend (`/backend`)

```
backend/
├── app.js                    # Express app initialization & server setup
├── connection.js             # Database connection configuration
├── package.json              # Dependencies & scripts
├── test.js                   # Testing utilities/test cases
│
├── config/
│   ├── db.js                 # Database configuration & connection pool
│   └── redis.js              # Redis client setup & configuration
│
├── controllers/              # Business logic for each feature
│   ├── userController.js     # User CRUD & profile management
│   ├── mechanicController.js # Mechanic profile & availability
│   ├── requestController.js  # Service request handling
│   ├── portfolioController.js# Mechanic portfolio management
│   └── (others)
│
├── models/                   # Data schemas & ORM models
│   ├── User.js              # User schema
│   ├── Mechanic.js          # Mechanic profiles
│   ├── Booking.js           # Booking/appointment records
│   ├── Request.js           # Service requests
│   ├── MechanicPortfolio.js  # Mechanic work samples
│   ├── Rating.js            # Review & rating system
│
├── routes/                   # API endpoint definitions
│   ├── authRoutes.js         # Authentication (login, signup, logout)
│   ├── userRoutes.js         # User profile & management
│   ├── mechanicRoutes.js     # Mechanic endpoints
│   ├── requestRoutes.js      # Request management
│   ├── bookingRoutes.js      # Booking operations
│   ├── ratingRoutes.js       # Rating/review endpoints
│   └── portfolioRoutes.js    # Portfolio management
│
├── middlewares/              # Express middleware
│   ├── authMiddleware.js     # JWT verification & auth protection
│   ├── roleMiddleware.js     # Role-based access control (user/mechanic/admin)
│   └── cacheMiddleware.js    # Cache layer for frequently accessed data
│
└── services/
    └── cacheService.js       # Redis cache operations & utilities
```

### Frontend (`/frontend`)

```
frontend/
├── package.json              # Dependencies & scripts
├── tailwind.config.js        # Tailwind CSS configuration
│
├── public/
│   ├── index.html            # Main HTML entry point
│   └── sw.js                 # Service Worker for PWA
│
└── src/
    ├── index.js              # React app entry point
    ├── App.js                # Main App component & routing
    ├── config.js             # API endpoints & app configuration
    ├── index.css             # Global styles
    │
    ├── screens/              # Page-level components
    │   ├── LandingPage.jsx    # Home/welcome page
    │   ├── LoginPage.jsx      # User login
    │   ├── SignupPage.jsx     # New user registration
    │   ├── UserDashboard.jsx  # User main dashboard
    │   ├── MechanicDashboard.jsx # Mechanic dashboard
    │   ├── RequestPage.jsx    # View/create service requests
    │   └── TrackMechanic.jsx  # Real-time mechanic location tracking
    │
    ├── components/           # Reusable UI components
    │   ├── Navbar.jsx               # Navigation bar
    │   ├── Footer.jsx               # Footer component
    │   ├── ProfileForm.jsx          # User/mechanic profile form
    │   ├── RequestCard.jsx          # Request card display
    │   ├── BookingHistory.jsx       # Booking records view
    │   ├── AvailabilityToggle.jsx   # Mechanic availability toggle
    │   ├── RatingDisplay.jsx        # Star rating display
    │   ├── RatingModal.jsx          # Rating submission modal
    │   ├── MechanicPortfolio.jsx    # Portfolio gallery
    │   ├── RealTimeTracker.jsx      # Live tracking component
    │   ├── AdvancedSearchFilters.jsx# Search & filter UI
    │   ├── Features.jsx             # Feature showcase
    │   └── HowItWorks.jsx           # Platform guide
    │
    └── utils/                # Utility functions & helpers
        ├── auth.js                  # Authentication helpers (tokens, login state)
        ├── locationUtils.js         # Geolocation & distance calculations
        ├── notificationUtils.js    # Push notifications & alerts
        └── imageUtils.js            # Image upload & processing
```

---

## 5. Data Models

### User Model
```javascript
{
  id: UUID,
  name: String,
  email: String (unique),
  phone: String,
  userType: Enum['user', 'mechanic', 'admin'],
  password: String (hashed),
  profilePicture: URL,
  location: GeoLocation,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Mechanic Model
```javascript
{
  id: UUID,
  userId: FK(User),
  experience: Number (years),
  specializations: Array[String],
  hourlyRate: Number,
  isAvailable: Boolean,
  currentLocation: GeoLocation,
  averageRating: Number,
  totalJobs: Number,
  verificationStatus: Enum['pending', 'verified', 'rejected'],
  createdAt: Timestamp
}
```

### Request Model
```javascript
{
  id: UUID,
  userId: FK(User),
  mechanicId: FK(Mechanic) | null,
  serviceType: String,
  description: Text,
  location: GeoLocation,
  status: Enum['open', 'assigned', 'completed', 'cancelled'],
  budget: Number,
  createdAt: Timestamp,
  completedAt: Timestamp | null
}
```

### Booking Model
```javascript
{
  id: UUID,
  requestId: FK(Request),
  userId: FK(User),
  mechanicId: FK(Mechanic),
  scheduledTime: Timestamp,
  completedTime: Timestamp | null,
  status: Enum['pending', 'confirmed', 'started', 'completed', 'cancelled'],
  totalCost: Number
}
```

### Rating Model
```javascript
{
  id: UUID,
  bookingId: FK(Booking),
  userId: FK(User),
  mechanicId: FK(Mechanic),
  rating: Number (1-5),
  comment: Text,
  createdAt: Timestamp
}
```

### MechanicPortfolio Model
```javascript
{
  id: UUID,
  mechanicId: FK(Mechanic),
  imageUrl: URL,
  projectTitle: String,
  description: Text,
  uploadedAt: Timestamp
}
```

---

## 6. API Endpoints Overview

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh` - Refresh JWT token

### User Routes (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /bookings` - User's booking history
- `DELETE /account` - Delete account

### Mechanic Routes (`/api/mechanics`)
- `GET /` - List all mechanics (with filters)
- `GET /:id` - Get mechanic details
- `GET /:id/availability` - Check mechanic availability
- `PUT /:id/availability` - Update availability
- `GET /nearby` - Find mechanics by location

### Request Routes (`/api/requests`)
- `POST /` - Create service request
- `GET /` - List requests (filters by status)
- `GET /:id` - Get request details
- `PUT /:id` - Update request
- `DELETE /:id` - Cancel request

### Booking Routes (`/api/bookings`)
- `POST /` - Create booking
- `GET /` - List user bookings
- `PUT /:id/status` - Update booking status
- `GET /:id/track` - Real-time tracking data

### Rating Routes (`/api/ratings`)
- `POST /` - Create rating/review
- `GET /mechanic/:id` - Get ratings for mechanic
- `GET /user/:id` - Get ratings from user

### Portfolio Routes (`/api/portfolio`)
- `POST /upload` - Upload portfolio image
- `GET /:mechanicId` - Get mechanic portfolio
- `DELETE /:id` - Delete portfolio item

---

## 7. Key Features & Implementation

### 1. Authentication & Authorization
- JWT-based token authentication
- Role-based access control (User, Mechanic, Admin)
- Password hashing with bcrypt
- Token refresh mechanism

### 2. Real-time Features
- Live mechanic tracking with GPS
- Real-time request updates
- Service Worker for PWA notifications

### 3. Caching Strategy
- Redis caching for:
  - Mechanic listings
  - User profiles
  - Rating aggregations
  - Popular searches
- Cache invalidation on updates

### 4. Location-based Services
- Geolocation queries
- Distance calculations
- Nearby mechanic recommendations

### 5. Rating & Review System
- 5-star rating scale
- Detailed comments
- Weighted average calculation
- Mechanic verification based on ratings

---

## 8. Middleware Architecture

```
Request → Auth Middleware → Role Check → Cache Check → Route Handler
                 ↓              ↓            ↓
         JWT Validation   Permission Check  Hit/Miss
                                           ↓
                                   (Cache Hit: Return)
                                   (Cache Miss: Continue)
                                           ↓
                                    Controller Logic
                                           ↓
                                    Database/Service
                                           ↓
                                    Cache Update
                                           ↓
                                      Response
```

---

## 9. Security Considerations

- ✅ JWT tokens for stateless authentication
- ✅ HTTPS enforcement (in production)
- ✅ CORS configuration for frontend domain
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (parameterized queries)
- ✅ Rate limiting on auth endpoints
- ✅ Secure password hashing (bcrypt)
- ✅ Environment variables for sensitive data

---

## 10. Scalability & Performance

### Optimization Strategies
1. **Database Indexing**: Indexes on frequently queried fields (userId, mechanicId, status)
2. **Caching Layer**: Redis for hot data
3. **API Pagination**: Limit response sizes
4. **Connection Pooling**: Database connection management
5. **CDN**: Static assets delivery (frontend build files)
6. **Load Balancing**: Horizontal scaling with multiple backend instances

### Performance Monitoring
- Response time tracking
- Database query optimization
- Cache hit ratio monitoring
- Real-time analytics

---

## 11. Deployment Architecture

### Development
```
Local: Frontend (npm start) + Backend (npm run dev)
```

### Production
```
┌─────────────────────────────────────────┐
│   Load Balancer (nginx/AWS ELB)        │
│   ├── Health checks                     │
│   └── SSL/TLS termination               │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────┐           ┌───▼────┐
│Backend  │           │Backend  │
│Instance │           │Instance │
│   #1    │           │   #2    │
└───┬────┘           └───┬────┘
    │                     │
    └──────────┬──────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────────┐       ┌───▼──────┐
│Primary DB  │ ◄──── │Replica DB│
│            │       │(Backup)  │
└────────────┘       └──────────┘
    │
┌───▼────────┐
│Redis Cache │
│ (Cluster)  │
└────────────┘
```

---

## 12. Development Workflow

### Setup
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in separate terminal)
cd frontend
npm install
npm start
```

### Environment Variables
```
# Backend (.env)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mechproject
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
NODE_ENV=development

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
```

---

## 13. Testing Strategy

### Backend Testing
- Unit tests: Controller & service layer
- Integration tests: API endpoints
- Database: Test fixtures & migrations

### Frontend Testing
- Component tests: React Testing Library
- E2E tests: Cypress/Selenium
- Visual regression testing

---

## 14. Future Enhancements

- [ ] Payment integration (Stripe, PayPal)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered mechanic matching
- [ ] Video call support for consultations
- [ ] Subscription/loyalty program
- [ ] Mechanic certification system
- [ ] Emergency service tier

---

## 15. System Dependencies

### Backend
- express, express-cors, express-dotenv
- jsonwebtoken, bcrypt
- redis, mongoose/sql (based on DB choice)
- morgan, axios, multer

### Frontend
- react, react-dom, react-router
- tailwindcss, axios
- date-fns, leaflet (maps)

---

**Last Updated**: February 18, 2026
**Version**: 1.0
**Status**: Active Development
