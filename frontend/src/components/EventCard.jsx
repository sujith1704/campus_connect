import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, ArrowRight, Edit3, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/date';
import { cardHover, buttonHoverTap } from '../utils/animations';
import MagicBentoCard from './MagicBento';

const EventCard = ({ event, showAdminControls, showApprovalActions = false, onApprove, onReject, onDelete }) => {
  const { _id, title, category, date, time, venue, image, status } = event;

  return (
    <MagicBentoCard
      className="event-card"
      glowColor="rgba(56, 189, 248, 0.22)"
      glowSecondary="rgba(168, 85, 247, 0.14)"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.45rem' }}>
                <Link to={`/organizer/registrations/${_id}`} className="btn btn-primary btn-sm event-action-btn" title="Attendance" style={{ width: '100%' }}>
                  <Users size={14} style={{ flexShrink: 0 }} />
                  <span>Attendees</span>
                </Link>
                <Link to={`/organizer/edit-event/${_id}`} className="btn btn-secondary btn-sm event-action-btn" title="Edit" style={{ width: '100%' }}>
                  <Edit3 size={14} style={{ flexShrink: 0 }} />
                  <span>Edit</span>
                </Link>
                <motion.button onClick={() => onDelete(_id)} className="btn btn-danger btn-sm event-action-btn" title="Delete" style={{ width: '100%' }} whileTap={{ scale: 0.96 }}>
                  <Trash2 size={14} style={{ flexShrink: 0 }} />
                  <span>Delete</span>
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
    </MagicBentoCard>
  );
};

export default EventCard;
