import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { GraduationCap, LogOut } from 'lucide-react';
import PortalSidebar from './PortalSidebar';

const Navbar = () => {
  const { user, isAuthenticated, logout, isStudent, isOrganizer } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true, state: { loggedOut: true } });
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login', { replace: true, state: { loggedOut: true } });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

  // Standalone password reset pages must not show student portal sidebar, student portal navbar, or portal layout
  if (['/forgot-password', '/reset-password'].includes(location.pathname)) {
    return null;
  }

  if (!isAuthPage && isAuthenticated && (isStudent || isOrganizer)) {
    return <PortalSidebar />;
  }

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to={isAuthenticated ? "/" : "/login"} className="brand-logo">
          <motion.div
            className="brand-icon"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <GraduationCap size={24} />
          </motion.div>
          CampusConnect
        </Link>

        {/* Navigation Links - Only visible when authenticated */}
        {isAuthenticated && (
          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/events" className={`nav-link ${isActive('/events') ? 'active' : ''}`}>
                Events
              </Link>
            </li>

            {/* Student Links */}
            {isStudent && (
              <>
                <li>
                  <Link to="/student/dashboard" className={`nav-link ${isActive('/student/dashboard') ? 'active' : ''}`}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/student/my-registrations" className={`nav-link ${isActive('/student/my-registrations') ? 'active' : ''}`}>
                    My Registrations
                  </Link>
                </li>
              </>
            )}

            {/* Organizer Links */}
            {isOrganizer && (
              <>
                <li>
                  <Link to="/organizer/panel" className={`nav-link ${isActive('/organizer/panel') ? 'active' : ''}`}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/organizer/manage-events" className={`nav-link ${isActive('/organizer/manage-events') ? 'active' : ''}`}>
                    My Events
                  </Link>
                </li>
                <li>
                  <Link to="/organizer/deleted-events" className={`nav-link ${isActive('/organizer/deleted-events') ? 'active' : ''}`}>
                    Deleted Events
                  </Link>
                </li>
                <li>
                  <Link to="/organizer/create-event" className={`nav-link ${isActive('/organizer/create-event') ? 'active' : ''}`}>
                    Create Event
                  </Link>
                </li>
              </>
            )}

          </ul>
        )}

        {/* Auth Action Buttons */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link
                to="/student/profile"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span className={`user-badge ${user?.role}`}>
                  {user?.role}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Logout"
                disabled={isLoggingOut}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline btn-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
