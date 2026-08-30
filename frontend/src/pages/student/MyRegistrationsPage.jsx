import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { Ticket, Calendar, Clock, MapPin, CheckCircle, X } from 'lucide-react';
import { formatDate, isPastEvent } from '../../utils/date';
import TicketPassModal from '../../components/TicketPassModal';
import PageTransition from '../../components/PageTransition';
import { containerVariants, cardVariants, alertVariants, tabVariants } from '../../utils/animations';

// Session cache to prevent reloading and flickering on tab switches or route revisits
let _cachedApprovedEvents = null;

const MyRegistrationsPage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const { studentRegistrations, fetchStudentRegistrations } = useContext(DataContext);
  const [registrations, setRegistrations] = useState(studentRegistrations || []);
  const [allEvents, setAllEvents] = useState(_cachedApprovedEvents || []);
  const [loading, setLoading] = useState(!studentRegistrations || _cachedApprovedEvents === null);
  const [eventsLoading, setEventsLoading] = useState(_cachedApprovedEvents === null);
  const [filterTab, setFilterTab] = useState('present'); // Default to 'present'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Reset session cache if user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      _cachedApprovedEvents = null;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const promises = [fetchStudentRegistrations()];

        if (_cachedApprovedEvents !== null) {
          promises.push(Promise.resolve({ data: { success: true, data: _cachedApprovedEvents } }));
        } else {
          promises.push(
            API.get('/events?status=approved').catch((err) => {
              console.error('Error fetching events for past tab:', err);
              return { data: { success: true, data: [] } };
            })
          );
        }

        const [regsData, eventsRes] = await Promise.all(promises);

        if (!cancelled) {
          setRegistrations(regsData || []);
          if (eventsRes && eventsRes.data && eventsRes.data.success) {
            const evs = eventsRes.data.data || [];
            _cachedApprovedEvents = evs;
            setAllEvents(evs);
          }
          setLoading(false);
          setEventsLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching registrations or events:', error);
          setLoading(false);
          setEventsLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [fetchStudentRegistrations]);

  // Sync from context when it updates
  useEffect(() => {
    if (studentRegistrations) {
      setRegistrations(studentRegistrations);
    }
  }, [studentRegistrations]);

  // Auto-dismiss notification after 3 seconds
  useEffect(() => {
    if (msg.text) {
      const timer = setTimeout(() => {
        setMsg({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  // Present: Show only the student's active/current registrations whose date/time is in the future
  const presentRegistrations = registrations.filter((reg) => !isPastEvent(reg.event));

  // Past: Show ALL platform events whose date/time has expired
  const pastEvents = allEvents.filter((event) => isPastEvent(event));

  const isTabLoading = loading || (filterTab === 'past' && eventsLoading);

  return (
    <PageTransition>
      <div className="container main-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">My Registrations & Tickets</h1>
            <p className="section-subtitle" style={{ marginBottom: '0.6rem' }}>Manage your registered campus events and access your entry passes</p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <motion.button
                type="button"
                className={`btn btn-sm ${filterTab === 'present' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterTab('present')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Present
              </motion.button>
              <motion.button
                type="button"
                className={`btn btn-sm ${filterTab === 'past' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterTab('past')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Past
              </motion.button>
            </div>
          </div>
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

        {isTabLoading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Loading your event tickets...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filterTab === 'present' ? (
              /* ================= PRESENT TAB ================= */
              presentRegistrations.length > 0 ? (
                <motion.div
                  key="present"
                  className="events-grid"
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {presentRegistrations.map((reg) => {
                    const event = reg.event;
                    const isCancelled = reg.status === 'cancelled';
                    const isDeleted = !!event?.isDeleted;
                    const displayStatus = isDeleted
                      ? 'Deleted'
                      : isCancelled
                        ? 'Cancelled'
                        : reg.status === 'confirmed'
                          ? 'Confirmed'
                          : reg.status;

                    return (
                      <motion.div key={reg._id} className="event-card" style={{ opacity: isCancelled || isDeleted ? 0.7 : 1 }} variants={cardVariants}>
                        <div className="event-card-image-wrap">
                          <img src={event?.image} alt={event?.title} className="event-card-img" />
                          <span className="event-category-badge">{event?.category}</span>
                          <span className={`event-status-badge ${isDeleted || isCancelled ? 'rejected' : 'approved'}`}>
                            {displayStatus}
                          </span>
                        </div>

                        <div className="event-card-body">
                          <h3 className="event-card-title">{event?.title}</h3>

                          <div className="event-card-meta">
                            <div className="meta-item">
                              <Calendar size={15} style={{ color: 'var(--primary)' }} />
                              <span>{formatDate(event?.date)}</span>
                            </div>
                            <div className="meta-item">
                              <Clock size={15} style={{ color: 'var(--primary)' }} />
                              <span>{event?.time}</span>
                            </div>
                            <div className="meta-item">
                              <MapPin size={15} style={{ color: 'var(--primary)' }} />
                              <span>{event?.venue}</span>
                            </div>
                          </div>

                          <div className="event-card-footer" style={{ marginTop: 'auto', paddingTop: '1.15rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '0.5rem' }}>
                            {!isCancelled && !isDeleted && (
                              <motion.button
                                onClick={() => setSelectedTicket(reg)}
                                className="btn btn-primary btn-full"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <Ticket size={16} /> View Ticket Pass
                              </motion.button>
                            )}
                            {isCancelled && !isDeleted && (
                              <span style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600 }}>
                                Registration Cancelled
                              </span>
                            )}
                            {isDeleted && (
                              <span style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600 }}>
                                Event Deleted
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="present-empty"
                  className="empty-state"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <div className="empty-icon">🎟️</div>
                  <div className="empty-title">No Upcoming Event Registrations</div>
                  <div className="empty-desc">Discover upcoming campus hackathons, cultural festivals, and workshops.</div>
                  <Link to="/events" className="btn btn-primary">
                    Explore Events
                  </Link>
                </motion.div>
              )
            ) : (
              /* ================= PAST TAB ================= */
              pastEvents.length > 0 ? (
                <motion.div
                  key="past"
                  className="events-grid"
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {pastEvents.map((event) => {
                    // Check if current student registered for this past event
                    const reg = registrations.find(
                      (r) => (r.event?._id === event._id || r.event === event._id) && r.status === 'confirmed'
                    );
                    const isUserRegistered = !!reg;

                    return (
                      <motion.div key={event._id} className="event-card" style={{ opacity: isUserRegistered ? 1 : 0.85 }} variants={cardVariants}>
                        <div className="event-card-image-wrap">
                          <img src={event.image} alt={event.title} className="event-card-img" />
                          <span className="event-category-badge">{event.category}</span>
                          {/* No top badge in Past tab — status shown inline below location */}
                        </div>

                        <div className="event-card-body">
                          <h3 className="event-card-title">{event.title}</h3>

                          <div className="event-card-meta">
                            <div className="meta-item">
                              <Calendar size={15} style={{ color: 'var(--primary)' }} />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="meta-item">
                              <Clock size={15} style={{ color: 'var(--primary)' }} />
                              <span>{event.time}</span>
                            </div>
                            <div className="meta-item">
                              <MapPin size={15} style={{ color: 'var(--primary)' }} />
                              <span>{event.venue}</span>
                            </div>
                            {/* Inline status row — below location */}
                            <div className="meta-item">
                              {isUserRegistered ? (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  fontWeight: 700,
                                  fontSize: '0.82rem',
                                  color: '#10b981',
                                  background: 'rgba(16, 185, 129, 0.12)',
                                  border: '1px solid rgba(16, 185, 129, 0.35)',
                                  borderRadius: '999px',
                                  padding: '0.2rem 0.75rem',
                                }}>
                                  ✓ Status: COMPLETED
                                </span>
                              ) : (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  fontWeight: 700,
                                  fontSize: '0.82rem',
                                  color: '#ef4444',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  borderRadius: '999px',
                                  padding: '0.2rem 0.75rem',
                                }}>
                                  ✕ Status: NOT REGISTERED
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="event-card-footer" style={{ marginTop: 'auto', paddingTop: '1.15rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '0.5rem' }}>
                            {isUserRegistered && (
                              <motion.button
                                onClick={() => setSelectedTicket(reg)}
                                className="btn btn-primary btn-full"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <Ticket size={16} /> View Ticket Pass
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="past-empty"
                  className="empty-state"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <div className="empty-icon">📅</div>
                  <div className="empty-title">No Past Events</div>
                  <div className="empty-desc">There are no concluded campus events at this time.</div>
                  <Link to="/events" className="btn btn-primary">
                    Explore Events
                  </Link>
                </motion.div>
              )
            )}
          </AnimatePresence>
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

export default MyRegistrationsPage;
