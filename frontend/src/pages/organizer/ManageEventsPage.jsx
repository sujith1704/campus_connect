import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { DataContext } from '../../context/DataContext';
import { PlusCircle, Edit3, Trash2, Users, AlertTriangle, X } from 'lucide-react';
import { formatDate, isPastEvent } from '../../utils/date';
import PageTransition from '../../components/PageTransition';
import { containerVariants, cardVariants, cardHover, alertVariants, tabVariants, backdropVariants, modalVariants } from '../../utils/animations';

const ManageEventsPage = () => {
  const { organizerEvents, organizerEventsLoading, fetchOrganizerEvents, invalidateOrganizerEvents, invalidateDeletedEvents } = useContext(DataContext);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = location.state?.fromTab || location.state?.tab || searchParams.get('tab') || 'present';
  const [events, setEvents] = useState(organizerEvents || []);
  const [loading, setLoading] = useState(!organizerEvents);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [filterTab, setFilterTab] = useState(initialTab === 'past' ? 'past' : 'present');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchOrganizerEvents();
        if (!cancelled) {
          setEvents(data || []);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading organizer events:', error);
          setMsg({ type: 'danger', text: error.response?.data?.message || 'Failed to load your events.' });
          setLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Sync from context when it updates (e.g., cache hit from another page)
  useEffect(() => {
    if (organizerEvents) {
      setEvents(organizerEvents);
    }
  }, [organizerEvents]);

  // Auto-dismiss notification after 3 seconds
  useEffect(() => {
    if (msg.text) {
      const timer = setTimeout(() => {
        setMsg({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const handleTabChange = (tab) => {
    setFilterTab(tab);
    if (tab === 'past') {
      setSearchParams({ tab: 'past' });
    } else {
      setSearchParams({});
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await API.delete(`/events/${deleteId}`);
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Event and associated registrations deleted successfully.' });
        setEvents((prev) => prev.filter((e) => e._id !== deleteId));
        invalidateOrganizerEvents();
      }
    } catch (error) {
      setMsg({ type: 'danger', text: error.response?.data?.message || 'Failed to delete event.' });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <PageTransition>
      <div className="container main-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">Manage My Events</h1>
            <p className="section-subtitle" style={{ marginBottom: '0.6rem' }}>Edit details, track seat occupancy, and manage attendees</p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <motion.button
                type="button"
                className={`btn btn-sm ${filterTab === 'present' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleTabChange('present')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Present Events
              </motion.button>
              <motion.button
                type="button"
                className={`btn btn-sm ${filterTab === 'past' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleTabChange('past')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Past Events
              </motion.button>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link to="/organizer/create-event" className="btn btn-primary btn-sm">
              <PlusCircle size={16} /> Create New Event
            </Link>
          </motion.div>
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

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Loading your events list...</p>
          </div>
        ) : (() => {
          const filteredEvents = filterTab === 'present'
            ? events.filter((event) => !isPastEvent(event))
            : events.filter((event) => isPastEvent(event));

          return (
            <AnimatePresence mode="wait">
              {filteredEvents.length > 0 ? (
                <motion.div
                  key={filterTab}
                  className="events-grid"
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {filteredEvents.map((event) => {
                    const availableSeats = Math.max(0, event.maxParticipants - (event.registeredCount || 0));
                    const occupancyPercent = Math.round(((event.registeredCount || 0) / event.maxParticipants) * 100);

                    return (
                      <motion.div
                        key={event._id}
                        className="event-card"
                        variants={cardVariants}
                        {...cardHover}
                      >
                        <div className="event-card-image-wrap">
                          <img src={event.image} alt={event.title} className="event-card-img" />
                          <span className="event-category-badge">{event.category}</span>
                          <span className={`event-status-badge ${event.status}`}>{event.status}</span>
                        </div>

                        <div className="event-card-body">
                          <h3 className="event-card-title">{event.title}</h3>

                          <div className="event-card-meta">
                            <div>📅 <strong>Date:</strong> {formatDate(event.date)}</div>
                            <div>⏰ <strong>Time:</strong> {event.time}</div>
                            <div>📍 <strong>Venue:</strong> {event.venue}</div>
                          </div>

                          <div className="seat-progress-container">
                            <div className="seat-label">
                              <span>Occupied Seats</span>
                              <span>{event.registeredCount || 0}/{event.maxParticipants} ({occupancyPercent}%)</span>
                            </div>
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill" style={{ width: `${occupancyPercent}%` }}></div>
                            </div>
                          </div>

                          <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: filterTab === 'present' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0.4rem' }}>
                            <Link
                              to={`/organizer/registrations/${event._id}`}
                              state={{ fromTab: filterTab }}
                              className="btn btn-primary btn-sm"
                              title="Attendees"
                            >
                              <Users size={14} /> Attendees
                            </Link>
                            {filterTab === 'present' && (
                              <Link to={`/organizer/edit-event/${event._id}`} className="btn btn-secondary btn-sm" title="Edit">
                                <Edit3 size={14} /> Edit
                              </Link>
                            )}
                            <motion.button
                              onClick={() => setDeleteId(event._id)}
                              className="btn btn-danger btn-sm"
                              title="Delete"
                              whileTap={{ scale: 0.95 }}
                            >
                              <Trash2 size={14} /> Delete
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key={`${filterTab}-empty`}
                  className="empty-state"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <div className="empty-icon">{filterTab === 'present' ? '📅' : '📋'}</div>
                  <div className="empty-title">
                    {filterTab === 'present' ? 'No upcoming events' : 'No past events'}
                  </div>
                  <div className="empty-desc">
                    {filterTab === 'present'
                      ? 'Create a new college event to start receiving student signups.'
                      : 'None of your events have concluded yet.'}
                  </div>
                  {filterTab === 'present' && (
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                      <Link to="/organizer/create-event" className="btn btn-primary">
                        Create Event
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          );
        })()}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteId && (
            <motion.div
              className="modal-overlay"
              onClick={() => setDeleteId(null)}
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
                    <AlertTriangle size={22} /> Delete Event?
                  </h3>
                  <motion.button onClick={() => setDeleteId(null)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <X size={20} />
                  </motion.button>
                </div>

                <p style={{ color: 'var(--slate-600)', margin: '1rem 0 1.5rem' }}>
                  Are you sure you want to permanently delete this event? This will also remove all student registrations for this event.
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <motion.button onClick={() => setDeleteId(null)} className="btn btn-secondary" disabled={deleting} whileTap={{ scale: 0.96 }}>
                    Cancel
                  </motion.button>
                  <motion.button onClick={handleDelete} className="btn btn-danger" disabled={deleting} whileTap={{ scale: 0.96 }}>
                    {deleting ? 'Deleting...' : 'Yes, Delete Event'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default ManageEventsPage;
