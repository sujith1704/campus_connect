# 🎓 CampusConnect – College Event Management System

A modern, complete full-stack web application designed for colleges and universities to manage campus events, student registrations, event approvals, and organizer control desks.

Built with **React.js**, **Node.js + Express.js**, **Firebase Firestore**, and **Clerk Authentication**.

---

## 🌟 Key Features & User Roles

### 1. 👨‍🎓 Student Role
* **Register & Login via Clerk**: Secure authentication with Clerk (supporting email/password and social logins like Google).
* **Discover Events**: Search by keywords (title/venue) and filter by category (Technical, Cultural, Sports, Workshop, Gaming, Seminar).
* **Event Details**: Real-time seat capacity counter, date, time, venue, description, and organizer details.
* **Single-Click Registration**: Atomic seat reservation, duplicate registration prevention, and instant confirmation ticket pass.
* **My Registrations**: View active event passes, generate printable ticket pass, or cancel registrations.

### 2. 🎙️ Organizer Role
* **Organizer Dashboard**: View total created events, total student registrations, and available seat metrics.
* **Create & Edit Events**: Add event title, description, category, date, time, venue, max capacity, and cover image URL.
* **Manage Events**: Delete events with confirmation dialogs and update schedules.
* **Attendee List**: View detailed list of registered students (names, emails, registration timestamp).

### 3. 🛡️ Admin Role
* **Organizer Panel**: System stats, event approvals, registrations, attendance, and user management.
* **Event Approval Queue**: Approve or reject newly created events, or delete inappropriate events.
* **User Management**: View all users, change user roles (`student`, `organizer`), and delete user accounts.
* **Platform Audit Logs**: View platform-wide registration logs.

---

## 📁 Project Folder Structure

```
campus-connect/
├── backend/
│   ├── config/
│   │   └── firebase.js           # Firebase Admin SDK & Firestore initialization
│   ├── controllers/
│   │   ├── adminController.js    # System stats, user management & role promotion
│   │   ├── authController.js     # User sync & profile retrieval
│   │   ├── eventController.js    # Event CRUD & status approval
│   │   ├── registrationController.js # Seat reservation & cancellation
│   │   └── statsController.js    # Analytics & platform stats
│   ├── middleware/
│   │   ├── auth.js               # Clerk verification, user linking & role enforcement
│   │   └── security.js           # ID validation & rate limiters
│   ├── services/
│   │   ├── eventService.js       # Firestore Event collection operations
│   │   ├── registrationService.js# Firestore Registration collection operations
│   │   └── userService.js        # Firestore User collection operations
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   └── statsRoutes.js
│   ├── .env                      # Environment variables configuration
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   ├── seed.js                   # Firestore seed script for default events
│   └── server.js                 # Express server with clerkMiddleware()
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Footer, EventCard, ProtectedRoute, MascotCanvas
│   │   ├── context/              # AuthContext bridging Clerk state with backend Firestore user
│   │   ├── pages/
│   │   │   ├── admin/            # AdminDashboard
│   │   │   ├── organizer/        # OrganizerDashboard, Create, Edit, Attendees
│   │   │   ├── student/          # StudentDashboard, MyRegistrations, Profile
│   │   │   ├── EventDetailsPage.jsx
│   │   │   ├── EventsPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx     # Clerk <SignIn /> integration
│   │   │   └── RegisterPage.jsx  # Clerk <SignUp /> integration
│   │   ├── services/
│   │   │   └── api.js            # Axios client with dynamic Clerk Bearer token injection
│   │   ├── styles/
│   │   │   └── index.css         # Modern responsive CSS styles and Clerk dark theme
│   │   ├── App.jsx               # React Router with ClerkProvider wrapper
│   │   └── main.jsx              # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js            # Vite configuration
└── README.md
```

---

## 🚀 Quick Setup & Installation Guide

### Prerequisites
Make sure you have installed:
1. **Node.js** (v18.x or higher)
2. **Firebase Project**: Create a project in [Firebase Console](https://console.firebase.google.com/) with Cloud Firestore enabled.
3. **Clerk Account**: Free account at [clerk.com](https://clerk.com) to obtain API keys.

---

### Step 1: Set Up Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Ensure local `backend/.env` is configured:
   ```env
   PORT=5000
   FIREBASE_PROJECT_ID=your-project-id
   # Optional: Service account credentials (if running outside Google Cloud)
   # FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
   # FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NODE_ENV=development
   ```

   Keep `backend/.env` local. It is ignored by Git and must never be exposed to the client.

4. Start the Backend Server:
   ```bash
   npm run dev
   # Server will start on http://localhost:5000
   ```

---

### Step 2: Set Up Frontend

1. Open a new terminal window and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install Frontend dependencies:
   ```bash
   npm install
   ```

3. Ensure `frontend/.env` is configured with your Clerk Publishable Key:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start Vite Development Server:
   ```bash
   npm run dev
   # App will run on http://localhost:3000
   ```

---

## 🔐 Authentication & Roles (Clerk Integration)

- **Single Auth Provider**: Clerk handles all sign-up, sign-in, session tokens, password reset, email verification, and social auth (e.g. Google).
- **Default Role**: All newly registered accounts default strictly to the `student` role in Firestore.
- **Organizer Promotion**: Organizers/admins promote students securely via the Organizer Dashboard / Admin route (`PATCH /api/admin/users/:id/role`), which syncs the role to Clerk `publicMetadata` server-side with `CLERK_SECRET_KEY`.
- **Existing Account Linking**: Existing database records (e.g., `organizer@campusconnect.com`) are automatically linked to Clerk when the user signs in with the matching verified email address, retaining their existing role and event records.

---

## 📡 REST API Endpoint Reference

### Authentication & Profile (`/api/auth`)
* `GET /api/auth/me` - Fetch authenticated user profile and role *(Protected by Clerk)*
* `POST /api/auth/sync` - Sync Clerk session with Firestore profile *(Protected by Clerk)*

### Events (`/api/events`)
* `GET /api/events` - Fetch approved events (supports `category` & `search` filters)
* `GET /api/events/:id` - Fetch single event details
* `POST /api/events` - Create event *(Organizer/Admin only)*
* `PUT /api/events/:id` - Update event *(Creator/Admin only)*
* `DELETE /api/events/:id` - Delete event *(Creator/Admin only)*
* `GET /api/events/organizer/my-events` - Get organizer's created events *(Organizer)*
* `PATCH /api/events/:id/status` - Approve or reject event *(Admin)*

### Registrations (`/api/registrations`)
* `POST /api/registrations/register/:eventId` - Register student for an event *(Student)*
* `DELETE /api/registrations/:id` - Cancel registration *(Student/Admin)*
* `GET /api/registrations/my-registrations` - List student's registrations *(Student)*
* `GET /api/registrations/event/:eventId` - Get event attendee list *(Organizer/Admin)*
* `GET /api/registrations/all` - List all platform registrations *(Admin)*

### Admin (`/api/admin`)
* `GET /api/admin/stats` - Fetch overall dashboard statistics *(Admin/Organizer)*
* `GET /api/admin/users` - Fetch user directory *(Admin/Organizer)*
* `PATCH /api/admin/users/:id/role` - Update user role & sync Clerk metadata *(Admin/Organizer)*
* `DELETE /api/admin/users/:id` - Remove user account *(Admin)*
