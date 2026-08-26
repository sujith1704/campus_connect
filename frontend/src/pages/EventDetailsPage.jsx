import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, MapPin, User, Users, CheckCircle, AlertTriangle, ArrowLeft, Ticket } from 'lucide-react';
import { formatDate } from '../utils/date';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isStudent } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const res = await API.get(`/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.data);

        // If student logged in, check if already registered
        if (isAuthenticated && isStudent) {
          checkUserRegistration();
        }
      }
    } catch (error) {
      setErrorMsg('Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const checkUserRegistration = async () => {
    try {
      const res = await API.get('/registrations/my-registrations');
      if (res.data.success) {
        const found = res.data.data.find(
          (reg) => reg.event?._id === id && reg.status === 'confirmed'
        );
        if (found) {
          setIsRegistered(true);
          setRegistrationId(found._id);
        }
      }
    } catch (error) {
      console.error('Check registration error:', error);
    }
  };

  const handleCancelRegistration = async () => {
    if (!registrationId) return;

    setCancelling(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await API.delete(`/registrations/${registrationId}`);
      if (res.data.success) {
        setIsRegistered(false);
        setRegistrationId(null);
        setShowCancelConfirmation(false);
        setSuccessMsg('Registration cancelled successfully.');
        setEvent((prev) => ({
          ...prev,
          registeredCount: Math.max(0, (prev.registeredCount || 0) - 1),
        }));
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to cancel registration.');
    } finally {
      setCancelling(false);
    }
  };

  const handleRegister = async () => {
    if (event?.isDeleted) {
      setErrorMsg('This event has been deleted and is no longer available for registration.');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    if (!isStudent) {
      setErrorMsg('Only registered Student accounts can register for college events.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await API.post(`/registrations/register/${id}`);
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Successfully registered for this event!');
        setIsRegistered(true);
        setRegistrationId(res.data.data?._id || null);
        // Refresh event data to show updated seats
        setEvent((prev) => ({
          ...prev,
          registeredCount: (prev.registeredCount || 0) + 1,
        }));
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to complete registration.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container container">
        <div className="spinner"></div>
        <p>Loading event information...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container main-content">
        <div className="empty-state">
          <div className="empty-title">Event Not Found</div>
          <Link to="/events" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            <ArrowLeft size={16} /> Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const availableSeats = Math.max(0, event.maxParticipants - (event.registeredCount || 0));
  const isFull = availableSeats === 0;
  const showDeletedNotice = !!event.isDeleted;
  const showRegistrationCard = !showDeletedNotice && (!isAuthenticated || isStudent);

  return (
    <div className="container main-content">
      {/* Back Link */}
      <Link to="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} /> Back to Events
      </Link>

      {/* Event information */}
      <div className="event-details-shell">
        <h1 className="event-details-title">{event.title}</h1>

        <div className="event-details-image-wrap">
          <img src={event.image} alt={event.title} className="event-details-image" />
          <span className="event-details-category">{event.category}</span>
        </div>

        <div className="event-details-content">

          {/* Quick Meta Grid */}
          <div className="event-details-meta">
            <div className="event-details-meta-item">
              <Calendar size={22} className="event-details-icon" />
              <div>
                <div className="event-details-label">DATE</div>
                <div className="event-details-value">{formatDate(event.date)}</div>
              </div>
            </div>

            <div className="event-details-meta-item">
              <Clock size={22} className="event-details-icon" />
              <div>
                <div className="event-details-label">TIME</div>
                <div className="event-details-value">{event.time}</div>
              </div>
            </div>

            <div className="event-details-meta-item">
              <MapPin size={22} className="event-details-icon" />
              <div>
                <div className="event-details-label">VENUE</div>
                <div className="event-details-value">{event.venue}</div>
              </div>
            </div>

            <div className="event-details-meta-item">
              <Users size={22} className="event-details-icon" />
              <div>
                <div className="event-details-label">SEATS CAPACITY</div>
                <div className="event-details-value" style={{ color: isFull ? 'var(--danger)' : 'var(--dark)' }}>
                  {availableSeats} / {event.maxParticipants} Seats Left
                </div>
              </div>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className={`event-details-main${showRegistrationCard ? ' has-registration' : ''}`}>
            {/* Left: Description & Organizer */}
            <div className="event-details-copy">
              <h2 className="event-details-section-title">About the Event</h2>
              <p className="event-details-description">
                {event.description}
              </p>

              <h2 className="event-details-section-title">Event Organizer</h2>
              <div className="event-details-organizer">
                <div className="event-details-avatar">
                  {event.organizer?.name ? event.organizer.name.charAt(0) : 'O'}
                </div>
                <div>
                  <div className="event-details-organizer-name">{event.organizer?.name || 'College Department'}</div>
                  <div className="event-details-organizer-email">{event.organizer?.email}</div>
                </div>
              </div>
            </div>

            {showDeletedNotice ? (
              <div className="event-details-registration">
                <div className="event-registration-card">
                  <div className="event-registration-deleted-notice">
                    <h3 className="event-registration-deleted-title">Event Deleted</h3>
                    <p className="event-registration-deleted-message">
                      This event has been deleted and is no longer available for registration.
                    </p>
                  </div>
                </div>
              </div>
            ) : showRegistrationCard && (
              <div className="event-details-registration">
                <div className="event-registration-card">
                  <h3 className="event-registration-card-title">Event Registration</h3>

                  {errorMsg && (
                    <div className="alert alert-danger">
                      <AlertTriangle size={18} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="alert alert-success">
                      <CheckCircle size={18} />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {isRegistered ? (
                    <div className="event-registration-status">
                      <div className="event-registration-status-badge">
                        <CheckCircle size={24} /> Registered & Confirmed
                      </div>
                      <p className="event-registration-status-message">
                        Your ticket has been generated. You can view your pass in your my registration section.
                      </p>
                      <div className="event-registration-content">
                        <Link to="/student/my-registrations" className="btn btn-secondary btn-full">
                          <Ticket size={16} /> View My Ticket Pass
                        </Link>
                        <button
                          onClick={() => setShowCancelConfirmation(true)}
                          className="btn btn-danger btn-full"
                        >
                          Cancel Registration
                        </button>
                      </div>
                    </div>
                  ) : isFull ? (
                    <div className="event-registration-content">
                      <button className="btn btn-secondary btn-full btn-lg" disabled>
                        Registration Full (0 Seats Left)
                      </button>
                    </div>
                  ) : (
                    <div className="event-registration-content">
                      <p className="event-registration-card-subtitle">
                        Click below to instantly register and reserve your entry pass.
                      </p>
                      <button
                        onClick={handleRegister}
                        disabled={submitting}
                        className="btn btn-primary btn-full btn-lg"
                      >
                        {submitting ? 'Registering...' : isAuthenticated ? 'Register Now' : 'Login to Register'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCancelConfirmation && (
        <div className="modal-overlay" onClick={() => setShowCancelConfirmation(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--danger)' }}>Cancel Registration?</h3>
              <button onClick={() => setShowCancelConfirmation(false)} disabled={cancelling}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <p style={{ color: 'var(--slate-600)', margin: '1rem 0 1.5rem' }}>
              Are you sure you want to cancel your registration for this event?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setShowCancelConfirmation(false)} className="btn btn-secondary" disabled={cancelling}>
                Keep Registration
              </button>
              <button onClick={handleCancelRegistration} className="btn btn-danger" disabled={cancelling}>
                {cancelling ? 'Cancelling...' : 'Cancel Registration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
