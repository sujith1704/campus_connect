import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { Ticket, Calendar, Clock, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import MagicBentoCard from '../../components/MagicBento';
import { containerVariants, statCardVariants } from '../../utils/animations';
import { motion } from 'framer-motion';
import { isPastEvent } from '../../utils/date';

// Session cache flag to ensure reloading only occurs once on first visit
let _hasLoadedStudentDashboardOnce = false;

const StudentDashboard = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const { studentRegistrations, fetchStudentRegistrations } = useContext(DataContext);

  const shouldShowInitialLoading = !_hasLoadedStudentDashboardOnce || studentRegistrations === null;
  const [registrations, setRegistrations] = useState(studentRegistrations || []);
  const [loading, setLoading] = useState(shouldShowInitialLoading);

  // Re-evaluate event expiration naturally every 30s or on window focus
  const [, setTimeTick] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setTimeTick(Date.now()), 30000);
    const onFocus = () => setTimeTick(Date.now());
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Reset session cache if user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      _hasLoadedStudentDashboardOnce = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const data = await fetchStudentRegistrations();
        if (!cancelled && data) {
          setRegistrations(data);
          _hasLoadedStudentDashboardOnce = true;
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching student dashboard registrations:', error);
        }
      } finally {
        if (!cancelled) {
          _hasLoadedStudentDashboardOnce = true;
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [fetchStudentRegistrations]);

  // Sync from context when it updates
  useEffect(() => {
    if (studentRegistrations) {
      setRegistrations(studentRegistrations);
    }
  }, [studentRegistrations]);

  // 1. Total Registered Events & 2. Upcoming Attending Events Calculation
  const { totalRegisteredCount, upcomingAttendingCount, activeRegistrations } = useMemo(() => {
    if (!Array.isArray(registrations)) {
      return { totalRegisteredCount: 0, upcomingAttendingCount: 0, activeRegistrations: [] };
    }

    const currentStudentId = user?.id || user?._id || user?.supabaseId;
    const currentStudentEmail = (user?.email || '').toLowerCase().trim();

    // De-duplicate: do not count duplicate registrations for the same event more than once
    const seenEventIds = new Set();
    const validRegistrations = [];
    let upcomingCount = 0;

    for (const reg of registrations) {
      if (!reg) continue;

      // Rule 1: Count every valid registration belonging to the current student (exclude cancelled)
      if (reg.status === 'cancelled') continue;

      // Identity check: must match current student
      if (reg.student && typeof reg.student === 'object') {
        const regStudentId = reg.student.id || reg.student._id;
        const regStudentEmail = (reg.student.email || '').toLowerCase().trim();
        if (currentStudentId && regStudentId && String(regStudentId) !== String(currentStudentId)) {
          if (!currentStudentEmail || regStudentEmail !== currentStudentEmail) {
            continue;
          }
        }
      } else if (reg.student && typeof reg.student === 'string' && currentStudentId) {
        if (String(reg.student) !== String(currentStudentId)) {
          continue;
        }
      }

      // Rule 2 & 3: Do NOT count deleted events (associated event is deleted or missing)
      const event = reg.event;
      if (!event || event.isDeleted === true) continue;

      // Rule 4: De-duplicate registrations for the same event
      const eventId = String(event._id || event.id || reg.eventId || reg.event || '');
      if (eventId && seenEventIds.has(eventId)) {
        continue;
      }
      if (eventId) {
        seenEventIds.add(eventId);
      }

      // Valid registered event for current student (includes both upcoming and expired/completed)
      validRegistrations.push(reg);

      // Rule 5: Upcoming Attending Events: only count events whose scheduled date/time has not yet passed
      const isPast = isPastEvent(event) || event.status === 'completed';
      if (!isPast) {
        upcomingCount += 1;
      }
    }

    return {
      totalRegisteredCount: validRegistrations.length,
      upcomingAttendingCount: upcomingCount,
      activeRegistrations: validRegistrations,
    };
  }, [registrations, user]);

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
          <div className="stat-text">
            <div className="stat-value">{totalRegisteredCount}</div>
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
          <div className="stat-text">
            <div className="stat-value">{upcomingAttendingCount}</div>
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
