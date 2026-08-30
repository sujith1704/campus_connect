import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, ArrowRight, Edit3, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/date';
import { cardHover, buttonHoverTap } from '../utils/animations';

const EventCard = ({ event, showAdminControls, showApprovalActions = false, onApprove, onReject, onDelete }) => {
  const { _id, title, category, date, time, venue, maxParticipants, registeredCount, image, status } = event;

  const availableSeats = Math.max(0, maxParticipants - (registeredCount || 0));
  const occupancyPercentage = Math.min(100, Math.round(((registeredCount || 0) / maxParticipants) * 100));

  return (
    <motion.div
      className="event-card"
      {...cardHover}
      style={{ willChange: 'transform' }}
    >
      <div className="event-card-image-wrap">
        <img src={image} alt={title} className="event-card-img" />
        <span className="event-category-badge">{category}</span>
        {status && status !== 'approved' && (
          <span className={`event-status-badge ${status}`}>{status}</span>
        )}
      </div>

      <div className="event-card-body">
        <h3 className="event-card-title">{title}</h3>

        <div className="event-card-meta">
          <div className="meta-item">
            <Calendar size={15} style={{ color: 'var(--primary)' }} />
            <span>{formatDate(date)}</span>
          </div>
          <div className="meta-item">
            <Clock size={15} style={{ color: 'var(--primary)' }} />
            <span>{time}</span>
          </div>
          <div className="meta-item">
            <MapPin size={15} style={{ color: 'var(--primary)' }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{venue}</span>
          </div>
        </div>

        {/* Seat Availability Bar */}
        <div className="seat-progress-container">
          <div className="seat-label">
            <span>Seats Filled</span>
            <span style={{ color: availableSeats === 0 ? '#ef4444' : 'var(--text-muted)', fontWeight: 700 }}>
              {availableSeats === 0 ? 'FULL' : `${availableSeats} seats left`} ({registeredCount || 0}/{maxParticipants})
            </span>
          </div>
          <div className="progress-bar-bg">
            <div
              className={`progress-bar-fill ${availableSeats === 0 ? 'full' : ''}`}
              style={{ width: `${occupancyPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="event-card-footer">
          {showAdminControls ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {showApprovalActions && status === 'pending' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <motion.button onClick={() => onApprove(_id)} className="btn btn-primary btn-sm" whileTap={{ scale: 0.96 }}>
                    Approve
                  </motion.button>
                  <motion.button onClick={() => onReject(_id)} className="btn btn-secondary btn-sm" whileTap={{ scale: 0.96 }}>
                    Reject
                  </motion.button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <Link to={`/organizer/registrations/${_id}`} className="btn btn-primary btn-sm" title="Attendance" style={{ width: '100%' }}>
                  <Users size={14} /> Attendance
                </Link>
                <Link to={`/organizer/edit-event/${_id}`} className="btn btn-secondary btn-sm" title="Edit" style={{ width: '100%' }}>
                  <Edit3 size={14} /> Edit
                </Link>
                <motion.button onClick={() => onDelete(_id)} className="btn btn-danger btn-sm" title="Delete" style={{ width: '100%' }} whileTap={{ scale: 0.96 }}>
                  <Trash2 size={14} /> Delete
                </motion.button>
              </div>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link to={`/events/${_id}`} className="btn btn-primary btn-full">
                View Details <ArrowRight size={16} />
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
