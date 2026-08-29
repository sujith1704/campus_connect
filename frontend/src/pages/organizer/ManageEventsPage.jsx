import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { DataContext } from '../../context/DataContext';
import { PlusCircle, Edit3, Trash2, Users, AlertTriangle, X } from 'lucide-react';
import { formatDate, isPastEvent } from '../../utils/date';

const ManageEventsPage = () => {
  const { organizerEvents, organizerEventsLoading, fetchOrganizerEvents, invalidateOrganizerEvents } = useContext(DataContext);
  const [events, setEvents] = useState(organizerEvents || []);
  const [loading, setLoading] = useState(!organizerEvents);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [filterTab, setFilterTab] = useState('present');

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
    <div className="container main-content">
      <div className="section-header">
        <div>
          <h1 className="section-title">Manage My Events</h1>
          <p className="section-subtitle" style={{ marginBottom: '0.6rem' }}>Edit details, track seat occupancy, and manage attendees</p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              className={`btn btn-sm ${filterTab === 'present' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterTab('present')}
            >
              Present Events
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterTab === 'past' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterTab('past')}
            >
              Past Events
            </button>
          </div>
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
      ) : (() => {
        const filteredEvents = filterTab === 'present'
          ? events.filter((event) => !isPastEvent(event))
          : events.filter((event) => isPastEvent(event));

        return filteredEvents.length > 0 ? (
          <div className="events-grid">
            {filteredEvents.map((event) => {
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

                    <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: filterTab === 'present' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0.4rem' }}>
                      <Link to={`/organizer/registrations/${event._id}`} className="btn btn-primary btn-sm" title="Attendees">
                        <Users size={14} /> Attendees
                      </Link>
                      {filterTab === 'present' && (
                        <Link to={`/organizer/edit-event/${event._id}`} className="btn btn-secondary btn-sm" title="Edit">
                          <Edit3 size={14} /> Edit
                        </Link>
                      )}
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
              <Link to="/organizer/create-event" className="btn btn-primary">
                Create Event
              </Link>
            )}
          </div>
        );
      })()}

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
