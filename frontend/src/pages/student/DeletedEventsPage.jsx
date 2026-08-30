import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { formatDate } from '../../utils/date';
import PageTransition from '../../components/PageTransition';
import { containerVariants, cardVariants, cardHover } from '../../utils/animations';

const DeletedEventsPage = () => {
  const { user } = useContext(AuthContext);
  const { deletedEvents: cachedDeletedEvents, fetchDeletedEvents } = useContext(DataContext);
  const [deletedEvents, setDeletedEvents] = useState(cachedDeletedEvents || []);
  const [loading, setLoading] = useState(cachedDeletedEvents === null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (cachedDeletedEvents !== null) {
      setDeletedEvents(cachedDeletedEvents);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await fetchDeletedEvents();
        if (!cancelled) {
          setDeletedEvents(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching deleted events:', err);
          setError(true);
          setLoading(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [fetchDeletedEvents, cachedDeletedEvents]);

  // Sync from context when it updates
  useEffect(() => {
    if (cachedDeletedEvents !== null) {
      setDeletedEvents(cachedDeletedEvents);
      setLoading(false);
    }
  }, [cachedDeletedEvents]);

  return (
    <PageTransition>
      <div className="container main-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">Deleted Events</h1>
            <p className="section-subtitle">Your deleted events that are still visible for reference</p>
          </div>
        </div>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Loading deleted events...</p>
          </div>
        ) : deletedEvents.length > 0 ? (
          <motion.div
            className="events-grid"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {deletedEvents.map((event) => (
              <motion.div
                key={event._id}
                className="event-card"
                variants={cardVariants}
                {...cardHover}
              >
                <div className="event-card-image-wrap">
                  <img src={event.image} alt={event.title} className="event-card-img" />
                  <span className="event-category-badge">{event.category}</span>
                  <span className="event-status-badge rejected">Deleted Event</span>
                </div>
                <div className="event-card-body">
                  <h3 className="event-card-title">{event.title}</h3>
                  <div className="event-card-meta">
                    <div>📅 <strong>Date:</strong> {formatDate(event.date)}</div>
                    <div>⏰ <strong>Time:</strong> {event.time}</div>
                    <div>📍 <strong>Venue:</strong> {event.venue}</div>
                  </div>
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                    <div><strong>Organizer:</strong> {event.organizer?.name || 'Unknown'}</div>
                    <div><strong>Deleted:</strong> {formatDate(event.deletedAt || event.createdAt)}</div>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                      <Link to={`/events/${event._id}`} state={{ from: '/student/deleted-events' }} className="btn btn-secondary btn-sm btn-full">
                        View Event Details
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🗑️</div>
            <div className="empty-title">No deleted events</div>
            <div className="empty-desc">Deleted events will appear here for reference.</div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default DeletedEventsPage;
