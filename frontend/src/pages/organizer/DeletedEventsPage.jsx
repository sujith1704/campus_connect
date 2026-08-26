import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { formatDate } from '../../utils/date';

const DeletedEventsPage = () => {
  const { user } = useContext(AuthContext);
  const [deletedEvents, setDeletedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeletedEvents();
  }, []);

  const fetchDeletedEvents = async () => {
    try {
      const res = await API.get('/events/deleted');
      if (res.data.success) {
        setDeletedEvents(res.data.data.filter((event) => event.organizer?._id === user?._id || event.organizer?.email === user?.email));
      }
    } catch (error) {
      console.error('Error fetching deleted events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <div className="events-grid">
          {deletedEvents.map((event) => (
            <div key={event._id} className="event-card">
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
                  <div><strong>Organizer:</strong> {event.organizer?.name || 'You'}</div>
                  <div><strong>Deleted:</strong> {formatDate(event.deletedAt || event.createdAt)}</div>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <Link to={`/events/${event._id}`} className="btn btn-secondary btn-sm btn-full">
                    View Event Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🗑️</div>
          <div className="empty-title">No deleted events</div>
          <div className="empty-desc">Events you delete will appear here.</div>
        </div>
      )}
    </div>
  );
};

export default DeletedEventsPage;
