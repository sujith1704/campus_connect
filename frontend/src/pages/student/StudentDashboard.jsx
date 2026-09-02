import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Ticket, Calendar, Clock, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import MagicBentoCard from '../../components/MagicBento';
import { containerVariants, statCardVariants } from '../../utils/animations';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const fetchMyRegistrations = async () => {
    try {
      const res = await API.get('/registrations/my-registrations');
      if (res.data.success) {
        setRegistrations(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeRegistrations = registrations.filter(
    (r) => r.status === 'confirmed' && !r.event?.isDeleted
  );

  return (
    <div className="container main-content">
      {/* Welcome Banner */}
      <MagicBentoCard
        className="dashboard-banner"
        glowColor="rgba(56, 189, 248, 0.18)"
        glowSecondary="rgba(168, 85, 247, 0.12)"
      >
        <h1 className="dashboard-banner-title">
          Student Portal 🎟️
        </h1>
        <p className="dashboard-banner-subtitle">
          Discover college events, manage registrations, and check your official ticket passes.
        </p>
      </MagicBentoCard>

      {/* Metrics Counter Cards */}
      <motion.div
        className="stats-section"
        style={{ marginTop: 0, marginBottom: '2.5rem' }}
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <MagicBentoCard
          className="stat-card coral"
          variants={statCardVariants}
          glowColor="rgba(240, 93, 77, 0.22)"
          glowSecondary="rgba(249, 115, 22, 0.12)"
        >
          <div className="stat-icon-wrap coral">
            <Ticket size={26} />
          </div>
          <div>
            <div className="stat-value">{activeRegistrations.length}</div>
            <div className="stat-label">Total Registered Events</div>
          </div>
        </MagicBentoCard>

        <MagicBentoCard
          className="stat-card emerald"
          variants={statCardVariants}
          glowColor="rgba(16, 185, 129, 0.22)"
          glowSecondary="rgba(6, 182, 212, 0.12)"
        >
          <div className="stat-icon-wrap emerald">
            <Calendar size={26} />
          </div>
          <div>
            <div className="stat-value">{activeRegistrations.length}</div>
            <div className="stat-label">Upcoming Attending Events</div>
          </div>
        </MagicBentoCard>
      </motion.div>

      {/* Recent Registrations Table/Cards */}
      <div className="section-header">
        <div>
          <h2 className="section-title">My Registered Events</h2>
          <p className="section-subtitle">Overview of your active passes and event schedule</p>
        </div>
        <Link to="/events" className="btn btn-primary btn-sm">
          Browse More Events <ArrowRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      ) : activeRegistrations.length > 0 ? (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Category</th>
                <th>Date & Time</th>
                <th>Venue</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeRegistrations.slice(0, 5).map((reg) => (
                <tr key={reg._id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{reg.event?.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      Org: {reg.event?.organizer?.name || 'College'}
                    </div>
                  </td>
                  <td>
                    <span className="user-badge student">{reg.event?.category}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                      <span>📅 {reg.event?.date}</span>
                      <span style={{ color: 'var(--slate-500)' }}>⏰ {reg.event?.time}</span>
                    </div>
                  </td>
                  <td>{reg.event?.venue}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem' }}>
                      <CheckCircle size={14} /> Confirmed
                    </span>
                  </td>
                  <td>
                    <Link to={`/events/${reg.event?._id}`} className="btn btn-sm dashboard-pass-btn">
                      <Ticket size={15} aria-hidden="true" />
                      <span>Pass</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🎟️</div>
          <div className="empty-title">No registrations found</div>
          <div className="empty-desc">You haven't registered for any events yet. Explore upcoming hackathons and cultural events now!</div>
          <Link to="/events" className="btn btn-primary">
            Explore College Events
          </Link>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
