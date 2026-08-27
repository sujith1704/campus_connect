import React from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import OrganizerControlDesk from '../components/OrganizerControlDesk';
import { Sparkles, Calendar, Users, Award, ShieldCheck, ArrowRight, Code, Music, Trophy, BookOpen, Gamepad2, Mic } from 'lucide-react';

const categoriesList = [
  { name: 'Technical', icon: <Code size={24} />, desc: 'Hackathons, Coding & Tech' },
  { name: 'Cultural', icon: <Music size={24} />, desc: 'Music, Dance & Fest' },
  { name: 'Sports', icon: <Trophy size={24} />, desc: 'Tournaments & Athletics' },
  { name: 'Workshop', icon: <BookOpen size={24} />, desc: 'Hands-on AI & Skill Dev' },
  { name: 'Gaming', icon: <Gamepad2 size={24} />, desc: 'Esports & LAN Battles' },
  { name: 'Seminar', icon: <Mic size={24} />, desc: 'Keynotes & Higher Ed' },
];

const HomePage = () => {
  const { user, isStudent, isOrganizer } = React.useContext(AuthContext);

  if (isOrganizer) {
    return (
      <div className="container main-content">
        <OrganizerControlDesk />

        {/* Event Categories */}
        <section style={{ marginTop: '3rem' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">Main Categories</h2>
              <p className="section-subtitle">
                Create, organize, and manage college events that inspire students and align with their interests.
              </p>
            </div>
          </div>

          <div className="category-grid">
            {categoriesList.map((cat) => (
              <Link key={cat.name} to={`/events?category=${cat.name}`} className="category-card">
                <div className="category-icon" style={{ color: 'var(--primary)' }}>{cat.icon}</div>
                <div className="category-name">{cat.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>{cat.desc}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="hero container">
        <div className="hero-content">
          <div className="hero-pill">
            <Sparkles size={16} /> Campus Event Portal 2026
          </div>
          <h2 className="hero-title">
            Welcome back, {user?.name}! 🎓
          </h2>
          
          <p className="hero-subtitle">
            Welcome to <strong>CampusConnect</strong> – the all-in-one college event management platform. Discover technical hackathons, cultural festivals, sports tournaments, and workshops hosted by your college clubs and departments.
          </p>
          <div className="hero-actions">
            <Link to="/events" className="btn btn-primary btn-lg">
              Explore Events <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="container">
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Calendar size={28} />
            </div>
            <div>
              <div className="stat-value">50+</div>
              <div className="stat-label">College Events Hosted</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Users size={28} />
            </div>
            <div>
              <div className="stat-value">1,200+</div>
              <div className="stat-label">Active Student Registrations</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Award size={28} />
            </div>
            <div>
              <div className="stat-value">25+</div>
              <div className="stat-label">Clubs & Organizers</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="stat-value">100%</div>
              <div className="stat-label">Verified College Events</div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Categories */}
      <section className="container" style={{ marginTop: '3rem' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Explore Categories</h2>
            <p className="section-subtitle">
              Find college events that match your passion and field of interest
            </p>
          </div>
        </div>

        <div className="category-grid">
          {categoriesList.map((cat) => (
            <Link key={cat.name} to={`/events?category=${cat.name}`} className="category-card">
              <div className="category-icon" style={{ color: 'var(--primary)' }}>{cat.icon}</div>
              <div className="category-name">{cat.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>{cat.desc}</div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};

export default HomePage;
