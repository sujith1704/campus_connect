import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GraduationCap, LogOut } from 'lucide-react';
import PortalSidebar from './PortalSidebar';

const Navbar = () => {
  const { user, isAuthenticated, logout, isStudent, isOrganizer } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  if (isAuthenticated && (isStudent || isOrganizer)) {
    return <PortalSidebar />;
  }

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to={isAuthenticated ? "/" : "/login"} className="brand-logo">
          <div className="brand-icon">
            <GraduationCap size={24} />
          </div>
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
                  <Link to="/organizer/dashboard" className={`nav-link ${isActive('/organizer/dashboard') ? 'active' : ''}`}>
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
                to={isStudent ? "/student/profile" : "/organizer/dashboard"}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span className={`user-badge ${user?.role}`}>
                  {user?.role}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</span>
              </Link>

              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Logout">
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
