import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { Calendar, Users, PlusCircle, Clock } from 'lucide-react';
import { containerVariants, statCardVariants } from '../utils/animations';

const OrganizerControlDesk = () => {
  const { user } = useContext(AuthContext);
  const { organizerEvents, organizerEventsLoading, fetchOrganizerEvents } = useContext(DataContext);

  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

  const events = organizerEvents || [];

  // Compute metrics
  const totalEvents = events.length;
  const totalRegistrations = events.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0);
  const totalCapacity = events.reduce((acc, curr) => acc + (curr.maxParticipants || 0), 0);
  const availableSeats = Math.max(0, totalCapacity - totalRegistrations);

  return (
    <div>
      {/* Header Banner */}
      <div
        className="dashboard-banner"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>
            Organizer Control Desk 🎙️
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Logged in as <strong style={{ color: '#ffffff' }}>{user?.name}</strong> • Publish, edit, and track student registrations.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link to="/organizer/create-event" className="btn btn-primary btn-lg">
            <PlusCircle size={20} /> Create New Event
          </Link>
        </motion.div>
      </div>

      {/* Metrics Section */}
      <motion.div
        className="stats-section"
        style={{ marginTop: 0, marginBottom: '2.5rem' }}
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div className="stat-card coral" variants={statCardVariants}>
          <div className="stat-icon-wrap coral">
            <Calendar size={26} />
          </div>
          <div>
            <div className="stat-value">{organizerEventsLoading && !organizerEvents ? '—' : totalEvents}</div>
            <div className="stat-label">Total Events Created</div>
          </div>
        </motion.div>

        <motion.div className="stat-card emerald" variants={statCardVariants}>
          <div className="stat-icon-wrap emerald">
            <Users size={26} />
          </div>
          <div>
            <div className="stat-value">{organizerEventsLoading && !organizerEvents ? '—' : totalRegistrations}</div>
            <div className="stat-label">Total Student Registrations</div>
          </div>
        </motion.div>

        <motion.div className="stat-card amber" variants={statCardVariants}>
          <div className="stat-icon-wrap amber">
            <Clock size={26} />
          </div>
          <div>
            <div className="stat-value">{organizerEventsLoading && !organizerEvents ? '—' : availableSeats}</div>
            <div className="stat-label">Available Seats Left</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrganizerControlDesk;
