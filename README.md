# 🎓 CampusConnect – College Event Management System

A modern, complete full-stack web application designed for colleges and universities to manage campus events, student registrations, event approvals, and organizer control desks.

Built with **React.js**, **Node.js + Express.js**, **MongoDB (Mongoose)**, and **JWT Authentication**.

---

## 🌟 Key Features & User Roles

### 1. 👨‍🎓 Student Role
* **Register & Login**: Simple authentication with role-based access.
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
* **User Management**: View all users, change user roles (`student`, `organizer`, `admin`), and delete user accounts.
* **Platform Audit Logs**: View platform-wide registration logs.

---

## 📁 Project Folder Structure

```
campus-connect/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection setup
│   ├── controllers/
│   │   ├── adminController.js    # System stats & user management
│   │   ├── authController.js     # User registration & JWT login
│   │   ├── eventController.js    # Event CRUD & status approval
│   │   └── registrationController.js # Seat reservation & cancellation
│   ├── middleware/
│   │   └── auth.js               # JWT verification & role auth
│   ├── models/
│   │   ├── Event.js              # Event schema
│   │   ├── Registration.js       # Registration schema (unique index)
│   │   └── User.js               # User schema (bcrypt password hashing)
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   └── registrationRoutes.js
│   ├── .env                      # Environment variables configuration
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   ├── seed.js                   # Database seed script for test data
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Footer, EventCard, ProtectedRoute
│   │   ├── context/              # AuthContext for user state & JWT storage
│   │   ├── pages/
│   │   │   ├── admin/            # AdminDashboard
│   │   │   ├── organizer/        # OrganizerDashboard, Create, Edit, Attendees
│   │   │   ├── student/          # StudentDashboard, MyRegistrations, Profile
│   │   │   ├── EventDetailsPage.jsx
│   │   │   ├── EventsPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios client with JWT interceptor
│   │   ├── styles/
│   │   │   └── index.css         # Modern responsive CSS styles
│   │   ├── App.jsx               # React Router layout
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
2. **MongoDB** (Local MongoDB running at `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

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

3. Ensure the local `backend/.env` is configured with your existing MongoDB Atlas URI:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/campusconnect
   JWT_SECRET=campusconnect_super_secret_jwt_key_2026
   NODE_ENV=development
   ```

   Keep `backend/.env` local. It is ignored by Git and must never be copied into the frontend.

4. Optionally populate the database with the demo Organizer and Student accounts:
   ```bash
   npm run seed
   ```

   `npm run seed` is the only command that runs the seed script. It clears and recreates the demo users, so do not run it when you need to preserve existing application data.

5. Start the Backend Server:
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

3. Start Vite Development Server:
   ```bash
   npm run dev
   # App will run on http://localhost:3000
   ```

---

## 🔐 Default Demo Login Credentials

The seed script creates two ready-to-use accounts. You can also click the **"Quick Demo Autofill"** buttons on the Login screen!

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@campusconnect.com` | `student123` |
| **Organizer** | `organizer@campusconnect.com` | `organizer123` |

---

## 📡 REST API Endpoint Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register` - Create student or organizer account
* `POST /api/auth/login` - Authenticate user & receive JWT token
* `GET /api/auth/me` - Fetch logged in user profile *(Protected)*

### Events (`/api/events`)
* `GET /api/events` - Fetch approved events (supports `category` & `search` filters)
* `GET /api/events/:id` - Fetch single event details
* `POST /api/events` - Create event *(Organizer/Admin)*
* `PUT /api/events/:id` - Update event *(Creator/Admin)*
* `DELETE /api/events/:id` - Delete event *(Creator/Admin)*
* `GET /api/events/organizer/my-events` - Get organizer's created events *(Organizer)*
* `PATCH /api/events/:id/status` - Approve or reject event *(Admin)*

### Registrations (`/api/registrations`)
* `POST /api/registrations/register/:eventId` - Register student for an event *(Student)*
* `DELETE /api/registrations/:id` - Cancel registration *(Student/Admin)*
* `GET /api/registrations/my-registrations` - List student's registrations *(Student)*
* `GET /api/registrations/event/:eventId` - Get event attendee list *(Organizer/Admin)*
* `GET /api/registrations/all` - List all platform registrations *(Admin)*

### Admin (`/api/admin`)
* `GET /api/admin/stats` - Fetch overall dashboard statistics *(Admin)*
* `GET /api/admin/users` - Fetch user directory *(Admin)*
* `PATCH /api/admin/users/:id/role` - Update user role *(Admin)*
* `DELETE /api/admin/users/:id` - Remove user account *(Admin)*

---

## 🔮 Code Architecture for Future Feature Extensions

The codebase is built cleanly using modular components and schemas, ready for future enhancements:
1. **QR Code Event Tickets**: Integrate `qrcode` library in `MyRegistrationsPage.jsx` to render downloadable QR codes encoding registration ticket IDs `#TKT-...`.
2. **Email Notifications**: Add `nodemailer` service in `controllers/registrationController.js` to dispatch automated confirmation emails upon successful registration.
3. **Event Certificates**: Create a PDF generation endpoint using `pdfkit` once an event date passes.
4. **Event Feedback & Ratings**: Extend `Event.js` schema with a `reviews` array containing `{ studentId, rating, comment }`.
5. **AI Event Recommendation & Chatbot**: Connect an OpenAI / Gemini API endpoint in `backend/routes/aiRoutes.js` for personalized event recommendations and campus event query answering.

---

## 💡 Notes for B.Tech First-Year Students

- **Mongoose Schemas**: Define structure for objects saved in MongoDB. `ref: 'User'` creates a relationship similar to foreign keys in SQL.
- **JWT (JSON Web Token)**: Encodes user ID and role securely into a string token sent in HTTP headers (`Authorization: Bearer <token>`) so the server knows who is logged in.
- **React Context API (`AuthContext.jsx`)**: Avoids prop drilling by storing user session globally.
