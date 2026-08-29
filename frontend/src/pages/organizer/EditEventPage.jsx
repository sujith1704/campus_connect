import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import { Edit3, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const categories = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Gaming', 'Other'];

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const returnPath = '/organizer/manage-events';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    date: '',
    time: '',
    venue: '',
    maxParticipants: '',
    image: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const res = await API.get(`/events/${id}`);
      if (res.data.success) {
        const ev = res.data.data;
        setFormData({
          title: ev.title || '',
          description: ev.description || '',
          category: ev.category || 'Technical',
          date: ev.date || '',
          time: ev.time || '',
          venue: ev.venue || '',
          maxParticipants: ev.maxParticipants || '',
          image: ev.image || '',
        });
      }
    } catch (error) {
      setErrorMsg('Failed to load event for editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await API.put(`/events/${id}`, formData);
      if (res.data.success) {
        setSuccessMsg('Event updated successfully!');
        setTimeout(() => {
          navigate('/organizer/manage-events');
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update event.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  return (
    <div className="container main-content">
      <Link to={returnPath} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} /> Back to Managed Events
      </Link>

      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        <div className="auth-card">
          <div className="auth-header" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <h1 className="auth-title">Edit Event Details</h1>
            <p className="auth-subtitle">Update schedule, venue, capacity, or description</p>
          </div>

          {errorMsg && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Event Category</label>
                <select name="category" className="form-control" value={formData.category} onChange={handleChange}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Max Participants Capacity</label>
                <input
                  type="number"
                  name="maxParticipants"
                  className="form-control"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Event Date</label>
                <input
                  type="date"
                  name="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Event Time</label>
                <input
                  type="text"
                  name="time"
                  className="form-control"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Venue Location</label>
              <input
                type="text"
                name="venue"
                className="form-control"
                value={formData.venue}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Event Cover Image URL</label>
              <input
                type="url"
                name="image"
                className="form-control"
                value={formData.image}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Complete Event Description</label>
              <textarea
                name="description"
                rows="5"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Link to={returnPath} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>
                <Edit3 size={18} /> {submitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;
