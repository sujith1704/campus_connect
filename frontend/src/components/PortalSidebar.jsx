import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CalendarDays, ClipboardList, Home, LayoutDashboard, LogOut, Menu, PanelLeftClose, PanelLeftOpen, PlusCircle, Trash2, X, GraduationCap, UserRound } from 'lucide-react';

const PortalSidebar = () => {
  const { user, logout, isStudent, isOrganizer } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('campusconnect_sidebar_collapsed') === 'true');
  const sidebarCollapsed = isOrganizer && isCollapsed;

  const groups = [
    {
      label: 'Main',
      links: [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Events', path: '/events', icon: CalendarDays },
        { label: 'Dashboard', path: isStudent ? '/student/dashboard' : '/organizer/panel', icon: LayoutDashboard },
      ],
    },
    {
      label: isStudent ? 'My Account' : 'Event Management',
      links: isStudent
        ? [
            { label: 'My Registrations', path: '/student/my-registrations', icon: ClipboardList },
            { label: 'Deleted Events', path: '/student/deleted-events', icon: Trash2 },
          ]
        : [
            { label: 'My Events', path: '/organizer/manage-events', icon: ClipboardList },
            { label: 'Create Event', path: '/organizer/create-event', icon: PlusCircle },
            { label: 'Deleted Events', path: '/organizer/deleted-events', icon: Trash2 },
          ],
    },
  ];

  useEffect(() => {
    if (!isOrganizer) {
      document.body.classList.remove('sidebar-collapsed');
      return undefined;
    }

    localStorage.setItem('campusconnect_sidebar_collapsed', String(isCollapsed));
    document.body.classList.toggle('sidebar-collapsed', isCollapsed);
    return () => document.body.classList.remove('sidebar-collapsed');
  }, [isCollapsed, isOrganizer]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const closeSidebar = () => setIsOpen(false);
  const isLinkActive = (path) => `${location.pathname}${location.hash}` === path;
  const profilePath = '/student/profile';

  return (
    <>
      <button
        className="sidebar-menu-button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      {isOpen && <button className="sidebar-backdrop" onClick={closeSidebar} aria-label="Close navigation menu" />}
      <aside className={`portal-sidebar ${isStudent ? 'student-sidebar' : 'organizer-sidebar'} ${isOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="portal-sidebar-brand-row">
          <Link to="/" className="portal-sidebar-brand" onClick={closeSidebar} title="CampusConnect">
            <span className="brand-icon"><GraduationCap size={24} /></span>
            <span className="portal-sidebar-brand-text">CampusConnect</span>
          </Link>
          {isOrganizer && (
            <button
              className="sidebar-collapse-button"
              onClick={() => setIsCollapsed((collapsed) => !collapsed)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          )}
        </div>

        <nav className="portal-sidebar-nav" aria-label={`${isStudent ? 'Student' : 'Organizer'} navigation`}>
          {groups.map((group) => (
            <div key={group.label} className="portal-sidebar-group">
              <div className="portal-sidebar-group-label">{group.label}</div>
              {group.links.map(({ label, path, icon: Icon }) => (
                <Link
                  key={label}
                  to={path}
                  onClick={closeSidebar}
                  title={sidebarCollapsed ? label : undefined}
                  className={`portal-sidebar-link ${isLinkActive(path) || (path === '/student/dashboard' && location.pathname === path && !location.hash) ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          ))}

          <div className="portal-sidebar-group portal-sidebar-account-group">
            <div className="portal-sidebar-group-label">Account</div>
            <Link to={profilePath} onClick={closeSidebar} title={sidebarCollapsed ? 'Profile' : undefined} className={`portal-sidebar-link ${isLinkActive(profilePath) ? 'active' : ''}`}>
              <UserRound size={18} />
              <span>Profile</span>
            </Link>
          </div>
        </nav>

        <div className="portal-sidebar-footer">
          <Link to={profilePath} className="portal-sidebar-user" onClick={closeSidebar} title={sidebarCollapsed ? user?.name : undefined}>
            <span className={`user-badge ${user?.role}`}>{user?.role}</span>
            <strong>{user?.name}</strong>
          </Link>
          <button onClick={handleLogout} className="portal-sidebar-logout" title={sidebarCollapsed ? 'Logout' : undefined}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default PortalSidebar;
