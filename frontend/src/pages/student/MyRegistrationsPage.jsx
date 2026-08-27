import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { Ticket, Calendar, Clock, MapPin, CheckCircle, X } from 'lucide-react';
import { formatDate } from '../../utils/date';
import TicketPassModal from '../../components/TicketPassModal';

const MyRegistrationsPage = () => {
  const { user } = useContext(AuthContext);
  const { studentRegistrations, studentRegistrationsLoading, fetchStudentRegistrations } = useContext(DataContext);
  const [registrations, setRegistrations] = useState(studentRegistrations || []);
  const [loading, setLoading] = useState(!studentRegistrations);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

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

  return (
    <div className="container main-content">
      <div className="section-header">
        <div>
          <h1 className="section-title">My Registrations & Tickets</h1>
          <p className="section-subtitle">Manage your registered campus events and access your entry passes</p>
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
      ) : registrations.length > 0 ? (
        <div className="events-grid">
          {registrations.map((reg) => {
            const event = reg.event;
            const isCancelled = reg.status === 'cancelled';
            const isDeleted = !!event?.isDeleted;
            const displayStatus = isDeleted ? 'Deleted' : (isCancelled ? 'Cancelled' : (reg.status === 'confirmed' ? 'Confirmed' : reg.status));

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
          <div className="empty-title">No Event Registrations Yet</div>
          <div className="empty-desc">Discover upcoming campus hackathons, cultural festivals, and workshops.</div>
          <Link to="/events" className="btn btn-primary">
            Explore Events
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
  );
};

export default MyRegistrationsPage;
