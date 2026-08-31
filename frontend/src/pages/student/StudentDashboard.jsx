import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { Ticket, Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';
import { formatDate, isPastEvent } from '../../utils/date';
import TicketPassModal from '../../components/TicketPassModal';
import PageTransition from '../../components/PageTransition';
import { containerVariants, statCardVariants, cardVariants } from '../../utils/animations';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const { studentRegistrations, studentRegistrationsLoading, fetchStudentRegistrations } = useContext(DataContext);
  const [registrations, setRegistrations] = useState(studentRegistrations || []);
  const [loading, setLoading] = useState(!studentRegistrations);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchStudentRegistrations();
        if (!cancelled) {
          setRegistrations(data || []);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching registrations:', error);
          setLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Sync from context when it updates
  useEffect(() => {
    if (studentRegistrations) {
      setRegistrations(studentRegistrations);
    }
  }, [studentRegistrations]);

  // All confirmed registrations on non-deleted events (for the Total count)
  const activeRegistrations = registrations.filter(
    (r) => r.status === 'confirmed' && !r.event?.isDeleted
  );

  // Only upcoming (future date/time) confirmed registrations
  const upcomingRegistrations = activeRegistrations.filter(
    (r) => !isPastEvent(r.event)
  );

  return (
    <PageTransition>
      <div className="container main-content">
        {/* Welcome Banner */}
        <div className="dashboard-banner">
          <h1 className="dashboard-banner-title">
            Student Portal 🎟️
          </h1>
          <p className="dashboard-banner-subtitle">
            Discover college events, manage registrations, and check your official ticket passes.
          </p>
        </div>

        {/* Metrics Counter Cards */}
        <motion.div
          className="stats-section"
          style={{ marginTop: 0, marginBottom: '2.5rem' }}
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div className="stat-card coral" variants={statCardVariants}>
            <div className="stat-icon-wrap coral">
              <Ticket size={26} />
            </div>
            <div>
              <div className="stat-value">{loading ? '—' : activeRegistrations.length}</div>
              <div className="stat-label">Total Registered Events</div>
            </div>
          </motion.div>

          <motion.div className="stat-card emerald" variants={statCardVariants}>
            <div className="stat-icon-wrap emerald">
              <Calendar size={26} />
            </div>
            <div>
              <div className="stat-value">{loading ? '—' : upcomingRegistrations.length}</div>
              <div className="stat-label">Upcoming Attending Events</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Registrations Table/Cards */}
        <div className="section-header">
          <div>
            <h2 className="section-title">My Registered Events</h2>
            <p className="section-subtitle">Overview of your active passes and event schedule</p>
          </div>
        </div>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        ) : activeRegistrations.length > 0 ? (
          <div className="table-responsive dashboard-table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Category</th>
                  <th className="event-date-cell" style={{ whiteSpace: 'nowrap' }}>Date & Time</th>
                  <th>Venue</th>
                  <th>Status</th>
                  <th>Official Pass</th>
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="initial" animate="animate">
                {activeRegistrations.slice(0, 5).map((reg) => (
                  <motion.tr key={reg._id} variants={cardVariants} className="dashboard-reg-row">
                    <td className="dashboard-col-title">
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{reg.event?.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        Org: {reg.event?.organizer?.name || 'College'}
                      </div>
                    </td>
                    <td className="dashboard-col-category">
                      <span className="user-badge student">{reg.event?.category}</span>
                    </td>
                    <td className="event-date-cell dashboard-col-date">
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                        <span>📅 {formatDate(reg.event?.date)}</span>
                        <span style={{ color: 'var(--slate-500)' }}>⏰ {reg.event?.time}</span>
                      </div>
                    </td>
                    <td className="dashboard-col-venue">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <span>📍</span>
                        <span>{reg.event?.venue}</span>
                      </div>
                    </td>
                    <td className="dashboard-col-status">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem' }}>
                        <CheckCircle size={14} /> Confirmed
                      </span>
                    </td>
                    <td className="dashboard-col-action">
                      <motion.button
                        onClick={() => setSelectedTicket(reg)}
                        className="btn btn-secondary btn-sm dashboard-pass-btn"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Ticket size={14} /> Pass
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎟️</div>
            <div className="empty-title">No registrations found</div>
            <div className="empty-desc">You haven't registered for any events yet. Explore upcoming hackathons and cultural events now!</div>
            <Link to="/events" className="btn btn-primary">
              Explore College Events
            </Link>
          </div>
        )}

        {/* Official Ticket Pass Modal */}
        {selectedTicket && (
          <TicketPassModal
            ticket={selectedTicket}
            user={user}
            onClose={() => setSelectedTicket(null)}
          />
        )}

      </div>
    </PageTransition>
  );
};

export default StudentDashboard;
