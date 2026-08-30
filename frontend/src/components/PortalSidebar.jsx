import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import {
  CalendarDays,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Trash2,
  X,
  GraduationCap,
} from 'lucide-react';

const EXPAND_DURATION = 0.52;
const COLLAPSE_DURATION = 0.68;
const EASE = [0.22, 1, 0.36, 1];

const sidebarVariants = {
  collapsed: {
    width: 76,
    transition: { duration: COLLAPSE_DURATION, ease: EASE },
  },
  expanded: {
    width: 245,
    transition: { duration: EXPAND_DURATION, ease: EASE },
  },
};

const iconMotionVariants = {
  collapsed: {
    x: 0,
    transition: { duration: COLLAPSE_DURATION, ease: EASE },
  },
  expanded: {
    x: 10,
    transition: { duration: EXPAND_DURATION, ease: EASE },
  },
};

const labelMotionVariants = {
  collapsed: {
    opacity: 0,
    x: -14,
    transition: { duration: 0.45, ease: 'easeInOut' },
  },
  expanded: {
    opacity: 1,
    x: 10,
    transition: { duration: EXPAND_DURATION, ease: EASE, delay: 0.05 },
  },
};

const PortalSidebar = () => {
  const { user, logout, isStudent, isOrganizer } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const studentLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Events', path: '/events', icon: CalendarDays },
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Registrations', path: '/student/my-registrations', icon: ClipboardList },
    { label: 'Deleted Events', path: '/student/deleted-events', icon: Trash2 },
  ];

  const organizerLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Events', path: '/events', icon: CalendarDays },
    { label: 'Dashboard', path: '/organizer/panel', icon: LayoutDashboard },
    { label: 'My Events', path: '/organizer/manage-events', icon: ClipboardList },
    { label: 'Create Event', path: '/organizer/create-event', icon: PlusCircle },
    { label: 'Deleted Events', path: '/organizer/deleted-events', icon: Trash2 },
  ];

  const links = isStudent ? studentLinks : organizerLinks;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const closeSidebar = () => setIsOpen(false);

  const isLinkActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/events') return location.pathname === '/events';
    if (path === '/student/dashboard') return location.pathname === '/student/dashboard';
    if (path === '/organizer/panel') return location.pathname.startsWith('/organizer/panel');
    return location.pathname === path;
  };

  const profilePath = '/student/profile';
  const isProfileActive = location.pathname === profilePath;
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const motionState = isHovered ? 'expanded' : 'collapsed';

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        className="sidebar-menu-button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <button
          className="sidebar-backdrop"
          onClick={closeSidebar}
          aria-label="Close navigation menu"
        />
      )}

      {/* Hover-Expandable Vertical Sidebar */}
      <motion.aside
        className={`portal-sidebar ${isStudent ? 'student-sidebar' : 'organizer-sidebar'} ${
          isOpen ? 'open' : ''
        } ${isHovered ? 'hover-expanded' : ''}`}
        initial="collapsed"
        animate={motionState}
        variants={sidebarVariants}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`${isStudent ? 'Student' : 'Organizer'} Portal Navigation`}
      >
        {/* Top Branding Section */}
        <div className="portal-sidebar-brand-section">
          <Link
            to="/"
            className="portal-sidebar-brand"
            onClick={closeSidebar}
            title="CampusConnect"
          >
            <motion.div
              className="portal-sidebar-logo-icon"
              variants={iconMotionVariants}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
            >
              <GraduationCap size={22} />
            </motion.div>
            <motion.div
              className="portal-sidebar-brand-text-wrap"
              variants={labelMotionVariants}
            >
              <span className="portal-sidebar-brand-title">CampusConnect</span>
              <span className="portal-sidebar-portal-tag">
                {isStudent ? 'STUDENT PORTAL' : 'ORGANIZER PORTAL'}
              </span>
            </motion.div>
          </Link>
        </div>

        <div className="portal-sidebar-divider" />

        {/* Navigation Items */}
        <nav className="portal-sidebar-nav" aria-label="Portal Menu">
          <div className="portal-sidebar-nav-list">
            {links.map(({ label, path, icon: Icon }) => {
              const active = isLinkActive(path);
              return (
                <Link
                  key={label}
                  to={path}
                  onClick={closeSidebar}
                  className={`portal-sidebar-link ${active ? 'active' : ''}`}
                  title={!isHovered ? label : undefined}
                >
                  <motion.div
                    className="portal-sidebar-icon-wrap"
                    variants={iconMotionVariants}
                  >
                    <Icon size={19} />
                  </motion.div>
                  <motion.span
                    className="portal-sidebar-link-label"
                    variants={labelMotionVariants}
                  >
                    {label}
                  </motion.span>
                  {active && <div className="portal-sidebar-active-pill" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section: Profile & Logout */}
        <div className="portal-sidebar-footer">
          <div className="portal-sidebar-divider" />

          {/* User Profile */}
          <Link
            to={profilePath}
            className={`portal-sidebar-user-link ${isProfileActive ? 'active' : ''}`}
            onClick={closeSidebar}
            title={!isHovered ? `Profile (${user?.name || 'User'})` : undefined}
          >
            <motion.div
              className={`portal-sidebar-avatar ${user?.role || 'student'}`}
              variants={iconMotionVariants}
            >
              {userInitial}
            </motion.div>
            <motion.div
              className="portal-sidebar-user-info"
              variants={labelMotionVariants}
            >
              <strong className="portal-sidebar-user-name">{user?.name || 'User'}</strong>
              <span className={`portal-sidebar-role-badge ${user?.role || 'student'}`}>
                {user?.role || 'student'}
              </span>
            </motion.div>
            {isProfileActive && <div className="portal-sidebar-active-pill" />}
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="portal-sidebar-logout-btn"
            title={!isHovered ? 'Logout' : undefined}
            type="button"
          >
            <motion.div
              className="portal-sidebar-icon-wrap logout-icon-wrap"
              variants={iconMotionVariants}
            >
              <LogOut size={19} />
            </motion.div>
            <motion.span
              className="portal-sidebar-link-label logout-text"
              variants={labelMotionVariants}
            >
              Logout
            </motion.span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default PortalSidebar;
