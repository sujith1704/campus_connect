import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import EventCard from '../components/EventCard';
import { Search, Filter } from 'lucide-react';
import { isPastEvent } from '../utils/date';
import PageTransition from '../components/PageTransition';
import { containerVariants, cardVariants } from '../utils/animations';

const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Gaming', 'Seminar', 'Other'];

const EventsPage = () => {
  const { isOrganizer } = useContext(AuthContext);
  const { approvedEvents, fetchApprovedEvents } = useContext(DataContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [events, setEvents] = useState(approvedEvents || []);
  const [loading, setLoading] = useState(!approvedEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchApprovedEvents();
        if (!cancelled && data) {
          setEvents(data);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading approved events:', error);
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchApprovedEvents]);

  // Sync from context when it updates
  useEffect(() => {
    if (approvedEvents) {
      setEvents(approvedEvents);
      setLoading(false);
    }
  }, [approvedEvents]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  // Local text search filter + category filter + hide expired events
  const filteredEvents = events.filter((event) => {
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    // Only show events whose date/time is still upcoming
    const notExpired = !isPastEvent(event);
    return matchesCategory && matchesSearch && notExpired;
  });

  return (
    <PageTransition>
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
              <motion.button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {cat}
              </motion.button>
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
          <motion.div
            className="events-grid"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {filteredEvents.map((event) => (
              <motion.div key={event._id} variants={cardVariants}>
                <EventCard event={event} />
              </motion.div>
            ))}
          </motion.div>
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
    </PageTransition>
  );
};

export default EventsPage;
