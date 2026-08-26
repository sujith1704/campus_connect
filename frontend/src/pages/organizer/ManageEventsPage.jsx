import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { PlusCircle, Edit3, Trash2, Users, AlertTriangle, X } from 'lucide-react';
import { formatDate } from '../../utils/date';

const ManageEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get('/events/organizer/my-events');
      if (res.data.success) {
        setEvents(res.data.data);
      } else {
        setMsg({ type: 'danger', text: res.data.message || 'Failed to load your events.' });
      }
    } catch (error) {
      console.error('Error loading organizer events:', error);
      setMsg({ type: 'danger', text: error.response?.data?.message || 'Failed to load your events.' });
    } finally {
      setLoading(false);
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
      }
    } catch (error) {
      setMsg({ type: 'danger', text: error.response?.data?.message || 'Failed to delete event.' });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="container main-content">
      <div className="section-header">
        <div>
          <h1 className="section-title">Manage My Events</h1>
          <p className="section-subtitle">Edit details, track seat occupancy, and manage attendees</p>
        </div>
        <Link to="/organizer/create-event" className="btn btn-primary btn-sm">
          <PlusCircle size={16} /> Create New Event
        </Link>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`}>
          <span>{msg.text}</span>
        </div>
      )}

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading your events list...</p>
        </div>
      ) : events.length > 0 ? (
        <div className="events-grid">
          {events.map((event) => {
            const availableSeats = Math.max(0, event.maxParticipants - (event.registeredCount || 0));
            const occupancyPercent = Math.round(((event.registeredCount || 0) / event.maxParticipants) * 100);

            return (
              <div key={event._id} className="event-card">
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

                  <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                    <Link to={`/organizer/registrations/${event._id}`} className="btn btn-primary btn-sm" title="Attendees">
                      <Users size={14} /> Attendees
                    </Link>
                    <Link to={`/organizer/edit-event/${event._id}`} className="btn btn-secondary btn-sm" title="Edit">
                      <Edit3 size={14} /> Edit
                    </Link>
                    <button onClick={() => setDeleteId(event._id)} className="btn btn-danger btn-sm" title="Delete">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <div className="empty-title">No events published</div>
          <div className="empty-desc">Create a new college event to start receiving student signups.</div>
          <Link to="/organizer/create-event" className="btn btn-primary">
            Create Event
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={22} /> Delete Event?
              </h3>
              <button onClick={() => setDeleteId(null)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--slate-600)', margin: '1rem 0 1.5rem' }}>
              Are you sure you want to permanently delete this event? This will also remove all student registrations for this event.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setDeleteId(null)} className="btn btn-secondary" disabled={deleting}>
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-danger" disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEventsPage;
