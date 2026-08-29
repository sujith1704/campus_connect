import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { Ticket, Calendar, Clock, MapPin, CheckCircle, X } from 'lucide-react';
import { formatDate, isPastEvent } from '../../utils/date';
import TicketPassModal from '../../components/TicketPassModal';

const MyRegistrationsPage = () => {
  const { user } = useContext(AuthContext);
  const { studentRegistrations, studentRegistrationsLoading, fetchStudentRegistrations } = useContext(DataContext);
  const [registrations, setRegistrations] = useState(studentRegistrations || []);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(!studentRegistrations);
  const [filterTab, setFilterTab] = useState('present'); // Default to 'present'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [regsData, eventsRes] = await Promise.all([
          fetchStudentRegistrations(),
          API.get('/events?status=approved').catch((err) => {
            console.error('Error fetching events for past tab:', err);
            return { data: { data: [] } };
          }),
        ]);

        if (!cancelled) {
          setRegistrations(regsData || []);
          if (eventsRes && eventsRes.data && eventsRes.data.success) {
            setAllEvents(eventsRes.data.data || []);
          }
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching registrations or events:', error);
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

  return (
    <div className="container main-content">
      <div className="section-header">
        <div>
          <h1 className="section-title">My Registrations & Tickets</h1>
          <p className="section-subtitle" style={{ marginBottom: '0.6rem' }}>Manage your registered campus events and access your entry passes</p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              className={`btn btn-sm ${filterTab === 'present' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterTab('present')}
            >
              Present
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterTab === 'past' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterTab('past')}
            >
              Past
            </button>
          </div>
        </div>
      </div>



      {msg.text && (
        <div className={`alert alert-${msg.type}`}>
          <span>{msg.text}</span>
        </div>
      )}

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading your event tickets...</p>
        </div>
      ) : filterTab === 'present' ? (
        /* ================= PRESENT TAB ================= */
        presentRegistrations.length > 0 ? (
          <div className="events-grid">
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
                <div key={reg._id} className="event-card" style={{ opacity: isCancelled || isDeleted ? 0.7 : 1 }}>
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
                        <button
                          onClick={() => setSelectedTicket(reg)}
                          className="btn btn-primary btn-full"
                        >
                          <Ticket size={16} /> View Ticket Pass
                        </button>
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
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎟️</div>
            <div className="empty-title">No Upcoming Event Registrations</div>
            <div className="empty-desc">Discover upcoming campus hackathons, cultural festivals, and workshops.</div>
            <Link to="/events" className="btn btn-primary">
              Explore Events
            </Link>
          </div>
        )
      ) : (
        /* ================= PAST TAB ================= */
        pastEvents.length > 0 ? (
          <div className="events-grid">
            {pastEvents.map((event) => {
              // Check if current student registered for this past event
              const reg = registrations.find(
                (r) => (r.event?._id === event._id || r.event === event._id) && r.status === 'confirmed'
              );
              const isUserRegistered = !!reg;

              return (
                <div key={event._id} className="event-card" style={{ opacity: isUserRegistered ? 1 : 0.85 }}>
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
                            ✕ Status: EXPIRED
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="event-card-footer" style={{ marginTop: 'auto', paddingTop: '1.15rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '0.5rem' }}>
                      {isUserRegistered && (
                        <button
                          onClick={() => setSelectedTicket(reg)}
                          className="btn btn-primary btn-full"
                        >
                          <Ticket size={16} /> View Ticket Pass
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <div className="empty-title">No Past Events</div>
            <div className="empty-desc">There are no concluded campus events at this time.</div>
            <Link to="/events" className="btn btn-primary">
              Explore Events
            </Link>
          </div>
        )
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
  );
};

export default MyRegistrationsPage;
