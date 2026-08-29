import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import API from '../../services/api';
import { Users, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

const EventRegistrationsPage = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const fromTab = location.state?.fromTab || location.state?.tab || 'present';

  const [registrations, setRegistrations] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, [eventId]);

  const fetchRegistrations = async () => {
    try {
      const res = await API.get(`/registrations/event/${eventId}`);
      if (res.data.success) {
        setRegistrations(res.data.data);
        setEventTitle(res.data.eventTitle);
      }
    } catch (error) {
      console.error('Error fetching event attendees:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container main-content">
      <Link
        to={fromTab === 'past' ? '/organizer/manage-events?tab=past' : '/organizer/manage-events'}
        state={{ fromTab, tab: fromTab }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--slate-600)', marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={18} /> Back to Managed Events
      </Link>

      <div className="section-header">
        <div>
          <h1 className="section-title">Registered Students List</h1>
          <p className="section-subtitle">Event: <strong>{eventTitle || 'College Event'}</strong> ({registrations.length} confirmed attendees)</p>
        </div>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading student registrations...</p>
        </div>
      ) : registrations.length > 0 ? (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Email Address</th>
                <th>Registration Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg, index) => (
                <tr key={reg._id}>
                  <td>{index + 1}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{reg.student?.name || 'Student'}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-600)' }}>
                      <Mail size={14} /> {reg.student?.email}
                    </div>
                  </td>
                  <td>
                    <div className="registration-date">
                      <span className="date">{new Date(reg.registeredAt).toLocaleDateString()}</span>
                      <span className="time">{new Date(reg.registeredAt).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle size={14} /> Confirmed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <div className="empty-title">No Students Registered Yet</div>
          <div className="empty-desc">Share your event page link with college students to start receiving registrations!</div>
        </div>
      )}
    </div>
  );
};

export default EventRegistrationsPage;
