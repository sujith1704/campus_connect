import React, { useContext, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthContext } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailsPage = lazy(() => import('./pages/EventDetailsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const MyRegistrationsPage = lazy(() => import('./pages/student/MyRegistrationsPage'));
const StudentDeletedEventsPage = lazy(() => import('./pages/student/DeletedEventsPage'));
const ProfilePage = lazy(() => import('./pages/student/ProfilePage'));

const OrganizerDashboard = lazy(() => import('./pages/organizer/OrganizerDashboard'));
const CreateEventPage = lazy(() => import('./pages/organizer/CreateEventPage'));
const EditEventPage = lazy(() => import('./pages/organizer/EditEventPage'));
const ManageEventsPage = lazy(() => import('./pages/organizer/ManageEventsPage'));
const DeletedEventsPage = lazy(() => import('./pages/organizer/DeletedEventsPage'));
const EventRegistrationsPage = lazy(() => import('./pages/organizer/EventRegistrationsPage'));

const OrganizerPanel = lazy(() => import('./pages/admin/AdminDashboard'));

function AppContent() {
  const { isAuthenticated, isStudent, isOrganizer } = useContext(AuthContext);
  const hasPortalSidebar = isAuthenticated && (isStudent || isOrganizer);

  return (
    <Router>
      <Navbar />
      <div className={hasPortalSidebar ? 'portal-main' : ''} style={{ flex: 1 }}>
        <Suspense fallback={null}>
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
        </Suspense>
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
