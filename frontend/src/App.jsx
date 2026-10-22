import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { DataProvider } from './context/DataContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './auth/ProtectedRoute';
import SplashScreen from './components/SplashScreen';

const HomePage = lazy(() => import('./pages/HomePage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailsPage = lazy(() => import('./pages/EventDetailsPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const MyRegistrationsPage = lazy(() => import('./pages/student/MyRegistrationsPage'));
const StudentDeletedEventsPage = lazy(() => import('./pages/student/DeletedEventsPage'));
const ProfilePage = lazy(() => import('./pages/student/ProfilePage'));

const CreateEventPage = lazy(() => import('./pages/organizer/CreateEventPage'));
const EditEventPage = lazy(() => import('./pages/organizer/EditEventPage'));
const ManageEventsPage = lazy(() => import('./pages/organizer/ManageEventsPage'));
const DeletedEventsPage = lazy(() => import('./pages/organizer/DeletedEventsPage'));
const EventRegistrationsPage = lazy(() => import('./pages/organizer/EventRegistrationsPage'));
const OrganizerPanel = lazy(() => import('./pages/admin/AdminDashboard'));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CampusConnect ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          color: '#f8fafc',
        }}>
          <h2 style={{ color: '#ee5848', marginBottom: '1rem', fontSize: '1.5rem' }}>Session Refresh Required</h2>
          <p style={{ color: '#9ab0c8', maxWidth: '480px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Your account credentials updated. Click below to refresh your CampusConnect dashboard.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.75rem', borderRadius: '10px', fontWeight: 600 }}
          >
            Refresh Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { isAuthenticated, isStudent, isOrganizer } = useAuth();
  const location = useLocation();

  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  const hasPortalSidebar = !isAuthPage && isAuthenticated && (isStudent || isOrganizer);

  return (
    <ErrorBoundary>
      <Navbar />
      <div className={hasPortalSidebar ? 'portal-main' : ''} style={{ flex: 1 }}>
        <Suspense fallback={
          <div className="spinner-container container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', color: '#9ab0c8', fontSize: '0.95rem' }}>Loading CampusConnect...</p>
          </div>
        }>
          <Routes>
            {/* Public Standalone Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/sign-in/*" element={<Navigate to="/login" replace />} />
            <Route path="/sign-in" element={<Navigate to="/login" replace />} />
            <Route path="/sign-up/*" element={<Navigate to="/register" replace />} />
            <Route path="/sign-up" element={<Navigate to="/register" replace />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/*" element={<ResetPassword />} />

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

            {/* Student Protected Routes - Open to all authenticated users */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/my-registrations"
              element={
                <ProtectedRoute>
                  <MyRegistrationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/deleted-events"
              element={
                <ProtectedRoute>
                  <StudentDeletedEventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Organizer Routes */}
            <Route
              path="/organizer/dashboard"
              element={
                <ProtectedRoute>
                  <OrganizerPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/panel"
              element={
                <ProtectedRoute>
                  <OrganizerPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/create-event"
              element={
                <ProtectedRoute>
                  <CreateEventPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/edit-event/:id"
              element={
                <ProtectedRoute>
                  <EditEventPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/manage-events"
              element={
                <ProtectedRoute>
                  <ManageEventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/deleted-events"
              element={
                <ProtectedRoute>
                  <DeletedEventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/registrations/:eventId"
              element={
                <ProtectedRoute>
                  <EventRegistrationsPage />
                </ProtectedRoute>
              }
            />

            <Route path="/admin/*" element={<Navigate to="/organizer/panel" replace />} />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <SplashScreen />
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
