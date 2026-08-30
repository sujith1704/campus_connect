import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { Calendar, Clock, MapPin, Users, CheckCircle, AlertTriangle, ArrowLeft, Ticket } from 'lucide-react';
import { formatDate } from '../utils/date';
import PageTransition from '../components/PageTransition';
import { alertVariants, backdropVariants, modalVariants } from '../utils/animations';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isStudent, isOrganizer } = useContext(AuthContext);
  const {
    eventDetailsCache,
    fetchEventDetails,
    studentRegistrations,
    fetchStudentRegistrations,
    invalidateStudentRegistrations,
    invalidateEvent,
  } = useContext(DataContext);

  const cachedEvent = eventDetailsCache[id]?.data;
  const [event, setEvent] = useState(cachedEvent || null);
  const [loading, setLoading] = useState(!cachedEvent);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Determine initial registration status from cached registrations if available
  const getInitialRegStatus = () => {
    if (!isAuthenticated || !isStudent) return 'not_registered';
    if (!studentRegistrations) return 'loading';
    const found = studentRegistrations.find(
      (reg) => (reg.event?._id === id || reg.event === id) && reg.status === 'confirmed'
    );
    return found ? 'registered' : 'not_registered';
  };

  const getInitialRegId = () => {
    if (!isAuthenticated || !isStudent || !studentRegistrations) return null;
    const found = studentRegistrations.find(
      (reg) => (reg.event?._id === id || reg.event === id) && reg.status === 'confirmed'
    );
    return found ? found._id : null;
  };

  const [registrationStatus, setRegistrationStatus] = useState(getInitialRegStatus);
  const [registrationId, setRegistrationId] = useState(getInitialRegId);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Auto-dismiss notifications after 3 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    let isCancelled = false;

    const loadEventAndRegistration = async () => {
      if (!cachedEvent) {
        setLoading(true);
      }
      setErrorMsg('');

      try {
        const promises = [fetchEventDetails(id)];
        if (isAuthenticated && isStudent) {
          promises.push(fetchStudentRegistrations());
        }

        const [eventData, regsData] = await Promise.all(promises);

        if (isCancelled) return;

        if (eventData) {
          setEvent(eventData);
        }

        if (isAuthenticated && isStudent && regsData) {
          const found = regsData.find(
            (reg) => (reg.event?._id === id || reg.event === id) && reg.status === 'confirmed'
          );
          if (found) {
            setRegistrationStatus('registered');
            setRegistrationId(found._id);
          } else {
            setRegistrationStatus('not_registered');
            setRegistrationId(null);
          }
        } else {
          setRegistrationStatus('not_registered');
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load event details:', error);
          setErrorMsg('Failed to load event details.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadEventAndRegistration();

    return () => {
      isCancelled = true;
    };
  }, [id, isAuthenticated, isStudent, fetchEventDetails, fetchStudentRegistrations]);

  const handleCancelRegistration = async () => {
    if (!registrationId) return;

    setCancelling(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await API.delete(`/registrations/${registrationId}`);
      if (res.data.success) {
        setRegistrationStatus('not_registered');
        setRegistrationId(null);
        setShowCancelConfirmation(false);
        setSuccessMsg('Registration cancelled successfully.');
        if (invalidateStudentRegistrations) {
          invalidateStudentRegistrations();
        }
        if (invalidateEvent) {
          invalidateEvent(id);
        }
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
        setRegistrationStatus('registered');
        setRegistrationId(res.data.data?._id || null);
        if (invalidateStudentRegistrations) {
          invalidateStudentRegistrations();
        }
        if (invalidateEvent) {
          invalidateEvent(id);
        }
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

  const fromPath = location.state?.from;
  let backPath = '/events';
  if (typeof fromPath === 'string' && fromPath.length > 0) {
    backPath = fromPath;
  } else if (event?.isDeleted) {
    if (isOrganizer) {
      backPath = '/organizer/deleted-events';
    } else if (isStudent) {
      backPath = '/student/deleted-events';
    }
  }

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
      <PageTransition>
        <div className="container main-content">
          <div className="empty-state">
            <div className="empty-title">Event Not Found</div>
            <Link to={backPath} className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <ArrowLeft size={16} /> Back to Events
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  const availableSeats = Math.max(0, event.maxParticipants - (event.registeredCount || 0));
  const isFull = availableSeats === 0;
  const showDeletedNotice = !!event.isDeleted;
  const showRegistrationCard = !showDeletedNotice && (!isAuthenticated || isStudent);

  return (
    <PageTransition>
      <div className="container main-content">
        {/* Back Link */}
        <Link to={backPath} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
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
                <div className="event-details-icon-wrap">
                  <Calendar size={22} className="event-details-icon" />
                </div>
                <div>
                  <div className="event-details-label">DATE</div>
                  <div className="event-details-value">{formatDate(event.date)}</div>
                </div>
              </div>

              <div className="event-details-meta-item">
                <div className="event-details-icon-wrap">
                  <Clock size={22} className="event-details-icon" />
                </div>
                <div>
                  <div className="event-details-label">TIME</div>
                  <div className="event-details-value">{event.time}</div>
                </div>
              </div>

              <div className="event-details-meta-item">
                <div className="event-details-icon-wrap">
                  <MapPin size={22} className="event-details-icon" />
                </div>
                <div>
                  <div className="event-details-label">VENUE</div>
                  <div className="event-details-value">{event.venue}</div>
                </div>
              </div>

              <div className="event-details-meta-item">
                <div className="event-details-icon-wrap">
                  <Users size={22} className="event-details-icon" />
                </div>
                <div>
                  <div className="event-details-label">SEATS CAPACITY</div>
                  <div className="event-details-value" style={{ color: isFull ? 'var(--danger)' : '#ffffff' }}>
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

                    <AnimatePresence mode="wait">
                      {errorMsg && (
                        <motion.div
                          key="error"
                          className="alert alert-danger"
                          variants={alertVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                        >
                          <AlertTriangle size={18} />
                          <span>{errorMsg}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                      {successMsg && (
                        <motion.div
                          key="success"
                          className="alert alert-success"
                          variants={alertVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                        >
                          <CheckCircle size={18} />
                          <span>{successMsg}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {registrationStatus === 'loading' ? (
                      <div className="event-registration-content">
                        <button className="btn btn-secondary btn-full btn-lg" disabled>
                          Checking Registration Status...
                        </button>
                      </div>
                    ) : registrationStatus === 'registered' ? (
                      <div className="event-registration-status">
                        <div className="event-registration-status-badge">
                          <CheckCircle size={24} /> Registered & Confirmed
                        </div>
                        <p className="event-registration-status-message">
                          Your ticket has been generated. You can view your pass in your my registration section.
                        </p>
                        <div className="event-registration-content">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                            <Link to="/student/my-registrations" className="btn btn-secondary btn-full">
                              <Ticket size={16} /> View My Ticket Pass
                            </Link>
                          </motion.div>
                          <motion.button
                            onClick={() => setShowCancelConfirmation(true)}
                            className="btn btn-danger btn-full"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            Cancel Registration
                          </motion.button>
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
                        <motion.button
                          onClick={handleRegister}
                          disabled={submitting}
                          className="btn btn-primary btn-full btn-lg"
                          whileHover={!submitting ? { scale: 1.02 } : {}}
                          whileTap={!submitting ? { scale: 0.97 } : {}}
                        >
                          {submitting ? 'Registering...' : isAuthenticated ? 'Register Now' : 'Login to Register'}
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
          {showCancelConfirmation && (
            <motion.div
              className="modal-overlay"
              onClick={() => setShowCancelConfirmation(false)}
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
                  <h3 className="modal-title" style={{ color: 'var(--danger)' }}>Cancel Registration?</h3>
                  <button onClick={() => setShowCancelConfirmation(false)} disabled={cancelling}>
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <p style={{ color: 'var(--slate-600)', margin: '1rem 0 1.5rem' }}>
                  Are you sure you want to cancel your registration for this event?
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <motion.button
                    onClick={() => setShowCancelConfirmation(false)}
                    className="btn btn-secondary"
                    disabled={cancelling}
                    whileTap={{ scale: 0.95 }}
                  >
                    Keep Registration
                  </motion.button>
                  <motion.button
                    onClick={handleCancelRegistration}
                    className="btn btn-danger"
                    disabled={cancelling}
                    whileTap={{ scale: 0.95 }}
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Registration'}
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

export default EventDetailsPage;
