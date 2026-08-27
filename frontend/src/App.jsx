import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthContext } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import StudentDashboard from './pages/student/StudentDashboard';
import MyRegistrationsPage from './pages/student/MyRegistrationsPage';
import StudentDeletedEventsPage from './pages/student/DeletedEventsPage';
import ProfilePage from './pages/student/ProfilePage';

import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEventPage from './pages/organizer/CreateEventPage';
import EditEventPage from './pages/organizer/EditEventPage';
import ManageEventsPage from './pages/organizer/ManageEventsPage';
import DeletedEventsPage from './pages/organizer/DeletedEventsPage';
import EventRegistrationsPage from './pages/organizer/EventRegistrationsPage';

import OrganizerPanel from './pages/admin/AdminDashboard';

function AppContent() {
  const { isAuthenticated, isStudent, isOrganizer } = useContext(AuthContext);
  const hasPortalSidebar = isAuthenticated && (isStudent || isOrganizer);

  return (
    <Router>
      <Navbar />
      <div className={hasPortalSidebar ? 'portal-main' : ''} style={{ flex: 1 }}>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />

            {/* General Protected Routes - Require Login */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <EventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id"
              element={
                <ProtectedRoute>
                  <EventDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Student Protected Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/my-registrations"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyRegistrationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/deleted-events"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDeletedEventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Organizer Protected Routes */}
            <Route
              path="/organizer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/panel"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <OrganizerPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/create-event"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <CreateEventPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/edit-event/:id"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <EditEventPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/manage-events"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <ManageEventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/deleted-events"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <DeletedEventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/registrations/:eventId"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <EventRegistrationsPage />
                </ProtectedRoute>
              }
            />

            {/* Legacy Admin URL redirects to the Organizer Panel */}
            <Route path="/admin/*" element={<Navigate to="/organizer/panel" replace />} />

            {/* Catch-all route: Redirect to /login if unauthenticated or unknown path */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
