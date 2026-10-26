import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import EventCard from '../../components/EventCard';
import { Shield, Users, Calendar, Ticket, Trash2, AlertTriangle, X, PlusCircle } from 'lucide-react';
import { formatDate, isPastEvent } from '../../utils/date';
import PageTransition from '../../components/PageTransition';
import AnimatedList from '../../components/AnimatedList';
import MagicBentoCard from '../../components/MagicBento';
import { containerVariants, cardVariants, statCardVariants, alertVariants, backdropVariants, modalVariants } from '../../utils/animations';

// Session cache flag to ensure reloading only occurs once on first visit
let _hasLoadedOrganizerDashboardOnce = false;

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const requestedTab = new URLSearchParams(location.search).get('tab');
  const validTabs = ['overview', 'users', 'registrations'];
  const initialTab = validTabs.includes(requestedTab) ? requestedTab : 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { isAuthenticated } = useContext(AuthContext);
  const { adminData, fetchAdminData, invalidateOrganizerEvents, invalidateStudentRegistrations } = useContext(DataContext);

  const shouldShowInitialLoading = !_hasLoadedOrganizerDashboardOnce || !adminData;

  const [stats, setStats] = useState(adminData?.stats || {
    totalStudents: 0,
    totalOrganizers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    pendingEvents: 0,
    approvedEvents: 0,
  });

  const [users, setUsers] = useState(adminData?.users || []);
  const [events, setEvents] = useState(adminData?.events || []);
  const [registrations, setRegistrations] = useState(adminData?.registrations || []);

  const [loading, setLoading] = useState(shouldShowInitialLoading);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteEventId, setDeleteEventId] = useState(null);

  // Re-evaluate event expiration naturally on interval or window focus
  const [timeTick, setTimeTick] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setTimeTick(Date.now()), 30000);
    const onFocus = () => setTimeTick(Date.now());
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Filter Active College Events: must be upcoming/ongoing, not completed, not expired, not deleted
  const activeCollegeEvents = useMemo(() => {
    return events.filter((e) => {
      if (!e) return false;
      if (e.status === 'pending' || e.status === 'rejected') return false;
      if (e.isDeleted === true) return false;
      if (typeof e.status === 'string' && e.status.toLowerCase() === 'completed') return false;

      // Actual date/time check: determine if event end/completion time has passed
      if (e.date && e.time && typeof e.time === 'string' && e.time.includes('-')) {
        const parts = e.time.split('-');
        const endTime = parts[parts.length - 1].trim();
        if (isPastEvent({ ...e, time: endTime })) return false;
      } else if (isPastEvent(e)) {
        return false;
      }

      return true;
    });
  }, [events, timeTick]);

  // Auto-dismiss notification after 3 seconds
  useEffect(() => {
    if (msg.text) {
      const timer = setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  // Reset session cache if user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      _hasLoadedOrganizerDashboardOnce = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchAdminData(true);
        if (!cancelled && data) {
          if (data.stats) setStats(data.stats);
          if (data.users) setUsers(data.users);
          if (data.events) setEvents(data.events);
          if (data.registrations) setRegistrations(data.registrations);
          _hasLoadedOrganizerDashboardOnce = true;
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load organizer panel data:', error);
        }
      } finally {
        if (!cancelled) {
          _hasLoadedOrganizerDashboardOnce = true;
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchAdminData]);

  // Sync from context when it updates
  useEffect(() => {
    if (adminData) {
      if (adminData.stats) setStats(adminData.stats);
      if (adminData.users) setUsers(adminData.users);
      if (adminData.events) setEvents(adminData.events);
      if (adminData.registrations) setRegistrations(adminData.registrations);
      setLoading(false);
    }
  }, [adminData]);

  useEffect(() => {
    const tab = validTabs.includes(requestedTab) ? requestedTab : 'overview';
    setActiveTab(tab);
  }, [requestedTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const nextSearch = tab === 'overview' ? '' : `?tab=${tab}`;
    navigate(`/organizer/panel${nextSearch}`, { replace: false });
  };

  const refreshStats = async () => {
    try {
      const statsRes = await API.get('/admin/stats');
      if (statsRes.data.success) setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  // Event Approve / Reject
  const handleEventStatus = async (eventId, status) => {
    try {
      const res = await API.patch(`/events/${eventId}/status`, { status });
      if (res.data.success) {
        setMsg({ type: 'success', text: `Event status changed to '${status}'` });
        setEvents((prev) =>
          prev.map((e) => (e._id === eventId ? { ...e, status } : e))
        );
        refreshStats();
        if (invalidateOrganizerEvents) invalidateOrganizerEvents();
      }
    } catch (error) {
      setMsg({ type: 'danger', text: 'Failed to update event status' });
    }
  };

  // Event Delete
  const handleDeleteEvent = async () => {
    if (!deleteEventId) return;
    try {
      const res = await API.delete(`/events/${deleteEventId}`);
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Event deleted successfully.' });
        setEvents((prev) => prev.filter((e) => e._id !== deleteEventId));
        refreshStats();
        if (invalidateOrganizerEvents) invalidateOrganizerEvents();
      }
    } catch (error) {
      setMsg({ type: 'danger', text: 'Failed to delete event.' });
    } finally {
      setDeleteEventId(null);
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      const res = await API.delete(`/admin/users/${deleteUserId}`);
      if (res.data.success) {
        setMsg({ type: 'success', text: 'User removed from system.' });
        setUsers((prev) => prev.filter((u) => u._id !== deleteUserId));
        refreshStats();
        if (invalidateStudentRegistrations) invalidateStudentRegistrations();
      }
    } catch (error) {
      setMsg({ type: 'danger', text: error.response?.data?.message || 'Failed to delete user.' });
    } finally {
      setDeleteUserId(null);
    }
  };

  // Toggle User Role (Student <-> Organizer)
  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'organizer' ? 'student' : 'organizer';
    try {
      const res = await API.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setMsg({ type: 'success', text: `User role updated to '${newRole}'.` });
        setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
        refreshStats();
      }
    } catch (error) {
      setMsg({ type: 'danger', text: error.response?.data?.message || 'Failed to update user role.' });
    }
  };

  return (
    <PageTransition>
      <div className="container main-content">
        {/* Admin Panel Header */}
        <div className="dashboard-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Shield size={32} style={{ color: '#c084fc', filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.45))' }} />
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>CampusConnect Organizer Panel</h1>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>
            Platform Supervision • Approve events, manage user permissions, and monitor registrations.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {msg.text && (
            <motion.div
              key="msg"
              className={`alert alert-${msg.type}`}
              variants={alertVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <span>{msg.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Organizer Panel Navigation Tabs */}
        <div className="tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            Overview & Stats
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => handleTabChange('users')}
          >
            Manage Users ({users.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => handleTabChange('registrations')}
          >
            All Registrations ({registrations.length})
          </button>
        </div>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Loading Organizer Panel...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* TAB 1: OVERVIEW & STATS */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0 }}
              >
                <div className="stats-grid" style={{ marginTop: 0 }}>
                  <MagicBentoCard
                    className="stat-card sky"
                    variants={statCardVariants}
                    glowColor="rgba(56, 189, 248, 0.22)"
                    glowSecondary="rgba(99, 102, 241, 0.12)"
                  >
                    <div className="stat-icon-wrap sky">
                      <Users size={26} />
                    </div>
                    <div>
                      <div className="stat-value">{stats.totalStudents}</div>
                      <div className="stat-label">Total Students</div>
                    </div>
                  </MagicBentoCard>

                  <MagicBentoCard
                    className="stat-card amber"
                    variants={statCardVariants}
                    glowColor="rgba(245, 158, 11, 0.22)"
                    glowSecondary="rgba(249, 115, 22, 0.12)"
                  >
                    <div className="stat-icon-wrap amber">
                      <Users size={26} />
                    </div>
                    <div>
                      <div className="stat-value">{stats.totalOrganizers}</div>
                      <div className="stat-label">Total Organizers</div>
                    </div>
                  </MagicBentoCard>

                  <MagicBentoCard
                    className="stat-card indigo"
                    variants={statCardVariants}
                    glowColor="rgba(99, 102, 241, 0.22)"
                    glowSecondary="rgba(168, 85, 247, 0.12)"
                  >
                    <div className="stat-icon-wrap indigo">
                      <Calendar size={26} />
                    </div>
                    <div>
                      <div className="stat-value">{stats.totalEvents}</div>
                      <div className="stat-label">Total Platform Events</div>
                    </div>
                  </MagicBentoCard>

                  <MagicBentoCard
                    className="stat-card emerald"
                    variants={statCardVariants}
                    glowColor="rgba(16, 185, 129, 0.22)"
                    glowSecondary="rgba(6, 182, 212, 0.12)"
                  >
                    <div className="stat-icon-wrap emerald">
                      <Ticket size={26} />
                    </div>
                    <div>
                      <div className="stat-value">{stats.totalRegistrations}</div>
                      <div className="stat-label">Total Registrations</div>
                    </div>
                  </MagicBentoCard>
                </div>

                {/* Quick Actions Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.75rem', marginBottom: '2rem' }}>
                  <Link to="/organizer/create-event" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <PlusCircle size={18} /> Create New Event
                  </Link>
                  <Link to="/organizer/manage-events" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <Calendar size={18} /> Manage My Events
                  </Link>
                  <button
                    onClick={() => handleTabChange('registrations')}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Ticket size={18} /> View All Registrations ({registrations.length})
                  </button>
                  <Link to="/organizer/deleted-events" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <Trash2 size={18} /> Recycle Bin
                  </Link>
                </div>

                {/* Pending Approvals Section */}
                {events.filter((e) => e.status === 'pending').length > 0 && (
                  <div style={{ marginTop: '2rem', marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--warning)' }}>
                      ⚠️ Events Pending Approval ({events.filter((e) => e.status === 'pending').length})
                    </h3>
                    <motion.div
                      className="events-grid"
                      variants={containerVariants}
                      initial="initial"
                      animate="animate"
                    >
                      {events
                        .filter((e) => e.status === 'pending')
                        .map((event) => (
                          <motion.div key={event._id} variants={cardVariants}>
                            <EventCard
                              event={event}
                              showAdminControls={true}
                              showApprovalActions={true}
                              onApprove={(id) => handleEventStatus(id, 'approved')}
                              onReject={(id) => handleEventStatus(id, 'rejected')}
                              onDelete={(id) => setDeleteEventId(id)}
                            />
                          </motion.div>
                        ))}
                    </motion.div>
                  </div>
                )}

                {/* Active Platform Events Section */}
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      Active College Events ({activeCollegeEvents.length})
                    </h3>
                    <Link to="/organizer/manage-events" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
                      View all in Manage Events →
                    </Link>
                  </div>
                  {activeCollegeEvents.length > 0 ? (
                    <motion.div
                      className="events-grid"
                      variants={containerVariants}
                      initial="initial"
                      animate="animate"
                    >
                      {activeCollegeEvents.map((event) => (
                        <motion.div key={event._id} variants={cardVariants}>
                          <EventCard
                            event={event}
                            showAdminControls={true}
                            onDelete={(id) => setDeleteEventId(id)}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <MagicBentoCard style={{ padding: '2.5rem', textAlign: 'center' }}>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No events published yet.</p>
                      <Link to="/organizer/create-event" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <PlusCircle size={18} /> Publish Your First Event
                      </Link>
                    </MagicBentoCard>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 2: MANAGE USERS */}
            {activeTab === 'users' && (
              <motion.div
                key="users"
                className="table-responsive"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0 }}
              >
                <table className="custom-table animated-user-table">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Email Address</th>
                      <th>Current Role</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <AnimatedList
                    as="tbody"
                    itemAs="tr"
                    items={users}
                    keyExtractor={(u) => u._id}
                    itemClassName="animated-user-row"
                    renderItem={(u) => (
                      <>
                        <td><strong style={{ fontSize: '0.95rem' }}>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`user-badge ${u.role}`}>{u.role}</span>
                        </td>
                        <td>{formatDate(u.createdAt)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setDeleteUserId(u._id)}
                              className="btn btn-danger btn-sm"
                              title="Delete User"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  />
                </table>
              </motion.div>
            )}

            {/* TAB 3: ALL REGISTRATIONS */}
            {activeTab === 'registrations' && (
              <motion.div
                key="registrations"
                className="table-responsive"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0 }}
              >
                <table className="custom-table animated-registration-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Event Title</th>
                      <th>Category</th>
                      <th>Event Date</th>
                      <th>Registration Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <AnimatedList
                    as="tbody"
                    itemAs="tr"
                    items={registrations}
                    keyExtractor={(reg) => reg._id}
                    itemClassName="animated-registration-row"
                    renderItem={(reg) => (
                      <>
                        <td>
                          <div style={{ fontWeight: 700 }}>{reg.student?.name || 'Student'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{reg.student?.email}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{reg.event?.title || 'Event Deleted'}</div>
                        </td>
                        <td><span className="user-badge student">{reg.event?.category}</span></td>
                        <td className="event-date-cell">{formatDate(reg.event?.date)}</td>
                        <td className="registration-date-cell">
                          <div className="registration-date">
                            <span className="date">{reg.registeredAt ? formatDate(reg.registeredAt) : 'Recently'}</span>
                            <span className="time">{reg.registeredAt && !isNaN(new Date(reg.registeredAt).getTime()) ? new Date(reg.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: reg.status === 'confirmed' ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                            {reg.status}
                          </span>
                        </td>
                      </>
                    )}
                  />
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Delete User Dialog */}
        <AnimatePresence>
          {deleteUserId && (
            <motion.div
              className="modal-overlay"
              onClick={() => setDeleteUserId(null)}
              variants={backdropVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '440px' }}
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="modal-header">
                  <h3 className="modal-title" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={22} /> Delete User Account?
                  </h3>
                  <button type="button" onClick={() => setDeleteUserId(null)}><X size={20} /></button>
                </div>
                <p style={{ color: 'var(--slate-600)', margin: '1rem 0 1.5rem' }}>
                  Are you sure you want to delete this user? Their registrations and events will be deleted.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setDeleteUserId(null)} className="btn btn-secondary">Cancel</button>
                  <button type="button" onClick={handleDeleteUser} className="btn btn-danger">Delete Account</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Event Dialog */}
        <AnimatePresence>
          {deleteEventId && (
            <motion.div
              className="modal-overlay"
              onClick={() => setDeleteEventId(null)}
              variants={backdropVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '440px' }}
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="modal-header">
                  <h3 className="modal-title" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={22} /> Delete Inappropriate Event?
                  </h3>
                  <button type="button" onClick={() => setDeleteEventId(null)}><X size={20} /></button>
                </div>
                <p style={{ color: 'var(--slate-600)', margin: '1rem 0 1.5rem' }}>
                  Are you sure you want to remove this event from the platform?
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setDeleteEventId(null)} className="btn btn-secondary">Cancel</button>
                  <button type="button" onClick={handleDeleteEvent} className="btn btn-danger">Delete Event</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
