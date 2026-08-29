import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import { PlusCircle, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const categories = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Gaming', 'Other'];

const CreateEventPage = () => {
  const navigate = useNavigate();
  const returnPath = '/organizer/dashboard';

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

  const [loading, setLoading] = useState(false);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const { title, description, category, date, time, venue, maxParticipants } = formData;

    if (!title || !description || !date || !time || !venue || !maxParticipants) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await API.post('/events', formData);
      if (res.data.success) {
        setSuccessMsg('Event created successfully!');
        setTimeout(() => {
          navigate('/organizer/manage-events');
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container main-content">
      <Link to={returnPath} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        <div className="auth-card">
          <div className="auth-header" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <h1 className="auth-title">Create New College Event</h1>
            <p className="auth-subtitle">Publish event details to allow students to discover and register</p>
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
              <label className="form-label">Event Title *</label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="e.g. HackaMania 2026 - 24hr Hackathon"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Event Category *</label>
                <select name="category" className="form-control" value={formData.category} onChange={handleChange}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Max Participants Capacity *</label>
                <input
                  type="number"
                  name="maxParticipants"
                  className="form-control"
                  placeholder="e.g. 100"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Event Date *</label>
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
                <label className="form-label">Event Time *</label>
                <input
                  type="text"
                  name="time"
                  className="form-control"
                  placeholder="e.g. 10:00 AM - 05:00 PM"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Venue Location *</label>
              <input
                type="text"
                name="venue"
                className="form-control"
                placeholder="e.g. Main Campus Auditorium / Lab 3"
                value={formData.venue}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Event Cover Image URL (Optional)</label>
              <input
                type="url"
                name="image"
                className="form-control"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.image}
                onChange={handleChange}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Leave empty for high quality default theme banner</span>
            </div>

            <div className="form-group">
              <label className="form-label">Complete Event Description *</label>
              <textarea
                name="description"
                rows="5"
                className="form-control"
                placeholder="Provide comprehensive details about rules, schedule, eligibility, and prizes..."
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Link to={returnPath} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                <PlusCircle size={18} /> {loading ? 'Publishing Event...' : 'Publish Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
