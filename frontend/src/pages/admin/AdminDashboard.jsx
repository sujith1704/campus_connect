import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import EventCard from '../../components/EventCard';
import { Shield, Users, Calendar, Ticket, Trash2, AlertTriangle, X } from 'lucide-react';
import { formatDate } from '../../utils/date';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const requestedTab = new URLSearchParams(location.search).get('tab');
  const validTabs = ['overview', 'users', 'registrations'];
  const initialTab = validTabs.includes(requestedTab) ? requestedTab : 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalOrganizers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    pendingEvents: 0,
    approvedEvents: 0,
  });

  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteEventId, setDeleteEventId] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    const tab = validTabs.includes(requestedTab) ? requestedTab : 'overview';
    setActiveTab(tab);
  }, [requestedTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const nextSearch = tab === 'overview' ? '' : `?tab=${tab}`;
    navigate(`/organizer/panel${nextSearch}`, { replace: false });
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Stats
      const statsRes = await API.get('/admin/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      // 2. Users
      const usersRes = await API.get('/admin/users');
      if (usersRes.data.success) {
        setUsers(usersRes.data.data);
      }

      // 3. Events (all status)
      const eventsRes = await API.get('/events/organizer/my-events?scope=all');
      if (eventsRes.data.success) {
        setEvents(eventsRes.data.data);
      }

      // 4. Registrations
      const regsRes = await API.get('/registrations/all');
      if (regsRes.data.success) {
        setRegistrations(regsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load organizer panel data:', error);
    } finally {
      setLoading(false);
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
        fetchAdminData(); // Refresh stats
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
        fetchAdminData();
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
        fetchAdminData();
      }
    } catch (error) {
      setMsg({ type: 'danger', text: error.response?.data?.message || 'Failed to delete user.' });
    } finally {
      setDeleteUserId(null);
    }
  };

  return (
    <div className="container main-content">
      {/* Admin Panel Header */}
      <div className="dashboard-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Shield size={32} style={{ color: '#f472b6', filter: 'drop-shadow(0 0 8px rgba(244, 114, 182, 0.5))' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>CampusConnect Organizer Panel</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>
          Platform Supervision • Approve events, manage user permissions, and monitor registrations.
        </p>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`}>
          <span>{msg.text}</span>
        </div>
      )}

      {/* Organizer Panel Navigation Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          Overview & Stats
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          Manage Users ({users.length})
        </button>
        <button
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
        <>
          {/* TAB 1: OVERVIEW & STATS */}
          {activeTab === 'overview' && (
            <div>
              <div className="stats-grid" style={{ marginTop: 0 }}>
                <div className="stat-card">
                  <div className="stat-icon-wrap" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                    <Users size={26} />
                  </div>
                  <div>
                    <div className="stat-value">{stats.totalStudents}</div>
                    <div className="stat-label">Total Students</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
                    <Users size={26} />
                  </div>
                  <div>
                    <div className="stat-value">{stats.totalOrganizers}</div>
                    <div className="stat-label">Total Organizers</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrap" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                    <Calendar size={26} />
                  </div>
                  <div>
                    <div className="stat-value">{stats.totalEvents}</div>
                    <div className="stat-label">Total Platform Events</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrap" style={{ background: '#ecfdf5', color: '#10b981' }}>
                    <Ticket size={26} />
                  </div>
                  <div>
                    <div className="stat-value">{stats.totalRegistrations}</div>
                    <div className="stat-label">Total Registrations</div>
                  </div>
                </div>
              </div>

              {/* Pending Approvals Section */}
              {events.filter((e) => e.status === 'pending').length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--warning)' }}>
                    ⚠️ Events Pending Approval ({events.filter((e) => e.status === 'pending').length})
                  </h3>
                  <div className="events-grid">
                    {events
                      .filter((e) => e.status === 'pending')
                      .map((event) => (
                        <EventCard
                          key={event._id}
                          event={event}
                          showAdminControls={true}
                          showApprovalActions={true}
                          onApprove={(id) => handleEventStatus(id, 'approved')}
                          onReject={(id) => handleEventStatus(id, 'rejected')}
                          onDelete={(id) => setDeleteEventId(id)}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANAGE USERS */}
          {activeTab === 'users' && (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email Address</th>
                    <th>Current Role</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td><strong style={{ fontSize: '0.95rem' }}>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`user-badge ${u.role}`}>{u.role}</span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            onClick={() => setDeleteUserId(u._id)}
                            className="btn btn-danger btn-sm"
                            title="Delete User"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: ALL REGISTRATIONS */}
          {activeTab === 'registrations' && (
            <div className="table-responsive">
              <table className="custom-table">
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
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg._id}>
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
                          <span className="date">{new Date(reg.registeredAt).toLocaleDateString()}</span>
                          <span className="time">{new Date(reg.registeredAt).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: reg.status === 'confirmed' ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                          {reg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </>
      )}

      {/* Delete User Dialog */}
      {deleteUserId && (
        <div className="modal-overlay" onClick={() => setDeleteUserId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={22} /> Delete User Account?
              </h3>
              <button onClick={() => setDeleteUserId(null)}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--slate-600)', margin: '1rem 0 1.5rem' }}>
              Are you sure you want to delete this user? Their registrations and events will be deleted.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setDeleteUserId(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleDeleteUser} className="btn btn-danger">Delete Account</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Event Dialog */}
      {deleteEventId && (
        <div className="modal-overlay" onClick={() => setDeleteEventId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={22} /> Delete Inappropriate Event?
              </h3>
              <button onClick={() => setDeleteEventId(null)}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--slate-600)', margin: '1rem 0 1.5rem' }}>
              Are you sure you want to remove this event from the platform?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setDeleteEventId(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleDeleteEvent} className="btn btn-danger">Delete Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
