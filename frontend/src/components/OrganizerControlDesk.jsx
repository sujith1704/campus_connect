import React, { useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { Calendar, Users, PlusCircle, Clock } from 'lucide-react';

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
        <button type="button" className="btn btn-primary btn-lg" onClick={(e) => e.preventDefault()}>
          <PlusCircle size={20} /> Create New Event
        </button>
      </div>

      {/* Metrics Section */}
      <div className="stats-section" style={{ marginTop: 0, marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon-wrap">
            <Calendar size={26} />
          </div>
          <div>
            <div className="stat-value">{organizerEventsLoading && !organizerEvents ? '—' : totalEvents}</div>
            <div className="stat-label">Total Events Created</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <Users size={26} />
          </div>
          <div>
            <div className="stat-value">{organizerEventsLoading && !organizerEvents ? '—' : totalRegistrations}</div>
            <div className="stat-label">Total Student Registrations</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={26} />
          </div>
          <div>
            <div className="stat-value">{organizerEventsLoading && !organizerEvents ? '—' : availableSeats}</div>
            <div className="stat-label">Available Seats Left</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerControlDesk;
