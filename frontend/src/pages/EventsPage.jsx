import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { Search, Filter, Calendar } from 'lucide-react';

const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Gaming', 'Seminar', 'Other'];

const EventsPage = () => {
  const { isOrganizer } = React.useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = '/events?status=approved';
      if (selectedCategory !== 'All') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      const res = await API.get(url);
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  // Local text search filter
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="container main-content">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">{isOrganizer ? 'College Events' : 'Discover College Events'}</h1>
        <p className="section-subtitle">
          {isOrganizer
            ? 'Create and manage college events that engage students and match their interests.'
            : 'Explore and register for upcoming campus events and competitions'}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-panel">
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Search by event title, venue, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Filter size={15} /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Listing */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No events found</div>
          <div className="empty-desc">
            We couldn't find any events matching your search or category filter. Try clearing your search query.
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              handleCategoryChange('All');
            }}
            className="btn btn-outline"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
