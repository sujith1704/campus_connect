import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import OrganizerControlDesk from '../components/OrganizerControlDesk';
import ParticleText from '../components/ParticleText';
import { Sparkles, Calendar, Users, Award, ShieldCheck, ArrowRight, Code, Music, Trophy, BookOpen, Gamepad2, Mic } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { containerVariants, statCardVariants, cardVariants, cardHover } from '../utils/animations';

const categoriesList = [
  {
    name: 'Technical',
    icon: <Code size={22} />,
    desc: 'Hackathons, Coding & Tech',
    accentBar: 'linear-gradient(180deg, #6366f1, #38bdf8)',
    iconBg: 'rgba(99, 102, 241, 0.15)',
    iconColor: '#818cf8',
    iconBorder: 'rgba(99, 102, 241, 0.35)',
    iconGlow: '0 0 16px rgba(99, 102, 241, 0.35)',
    accentGlow: 'rgba(99, 102, 241, 0.1)',
  },
  {
    name: 'Cultural',
    icon: <Music size={22} />,
    desc: 'Music, Dance & Fest',
    accentBar: 'linear-gradient(180deg, #ec4899, #f43f5e)',
    iconBg: 'rgba(236, 72, 153, 0.15)',
    iconColor: '#f472b6',
    iconBorder: 'rgba(236, 72, 153, 0.35)',
    iconGlow: '0 0 16px rgba(236, 72, 153, 0.35)',
    accentGlow: 'rgba(236, 72, 153, 0.1)',
  },
  {
    name: 'Sports',
    icon: <Trophy size={22} />,
    desc: 'Tournaments & Athletics',
    accentBar: 'linear-gradient(180deg, #f59e0b, #f97316)',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: '#fbbf24',
    iconBorder: 'rgba(245, 158, 11, 0.35)',
    iconGlow: '0 0 16px rgba(245, 158, 11, 0.35)',
    accentGlow: 'rgba(245, 158, 11, 0.1)',
  },
  {
    name: 'Workshop',
    icon: <BookOpen size={22} />,
    desc: 'Hands-on AI & Skill Dev',
    accentBar: 'linear-gradient(180deg, #10b981, #06b6d4)',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#34d399',
    iconBorder: 'rgba(16, 185, 129, 0.35)',
    iconGlow: '0 0 16px rgba(16, 185, 129, 0.35)',
    accentGlow: 'rgba(16, 185, 129, 0.1)',
  },
  {
    name: 'Gaming',
    icon: <Gamepad2 size={22} />,
    desc: 'Esports & LAN Battles',
    accentBar: 'linear-gradient(180deg, #a855f7, #6366f1)',
    iconBg: 'rgba(168, 85, 247, 0.15)',
    iconColor: '#c084fc',
    iconBorder: 'rgba(168, 85, 247, 0.35)',
    iconGlow: '0 0 16px rgba(168, 85, 247, 0.35)',
    accentGlow: 'rgba(168, 85, 247, 0.1)',
  },
  {
    name: 'Seminar',
    icon: <Mic size={22} />,
    desc: 'Keynotes & Higher Ed',
    accentBar: 'linear-gradient(180deg, #f05d4d, #38bdf8)',
    iconBg: 'rgba(240, 93, 77, 0.15)',
    iconColor: '#f87171',
    iconBorder: 'rgba(240, 93, 77, 0.35)',
    iconGlow: '0 0 16px rgba(240, 93, 77, 0.35)',
    accentGlow: 'rgba(240, 93, 77, 0.1)',
  },
];

// Reusable premium category card
const CategoryCard = ({ cat }) => (
  <Link
    to={`/events?category=${cat.name}`}
    className="category-card"
    style={{
      '--cat-accent-bar': cat.accentBar,
      '--cat-icon-bg': cat.iconBg,
      '--cat-icon-color': cat.iconColor,
      '--cat-icon-border': cat.iconBorder,
      '--cat-icon-glow': cat.iconGlow,
      '--cat-accent-glow': cat.accentGlow,
    }}
  >
    <div className="category-icon-wrap">
      <div className="category-icon">{cat.icon}</div>
    </div>
    <div className="category-text">
      <div className="category-name">{cat.name}</div>
      <div className="category-desc">{cat.desc}</div>
    </div>
  </Link>
);

const HomePage = () => {
  const { user, isOrganizer } = useContext(AuthContext);
  const { platformStats, fetchPlatformStats } = useContext(DataContext);
  const [stats, setStats] = useState({
    eventsHosted: null,
    activeRegistrations: null,
    organizers: null,
    verifiedEvents: 100,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    
    // Defer stats loading to after initial render for better performance
    const timer = setTimeout(() => {
      if (!cancelled) {
        const loadStats = async () => {
          try {
            const data = await fetchPlatformStats();
            if (!cancelled && data) {
              setStats(data);
              setStatsLoading(false);
            }
          } catch (error) {
            if (!cancelled) {
              console.error('Error fetching platform statistics:', error);
              setStatsLoading(false);
            }
          }
        };

        loadStats();
      }
    }, 100); // Small delay to allow page to render first

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fetchPlatformStats]);

  // Sync from context when it updates
  useEffect(() => {
    if (platformStats) {
      setStats(platformStats);
      setStatsLoading(false);
    }
  }, [platformStats]);

  if (isOrganizer) {
    return (
      <PageTransition>
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

            <motion.div
              className="category-grid"
              variants={containerVariants}
              initial="initial"
              animate="animate"
            >
              {categoriesList.map((cat) => (
                <motion.div key={cat.name} variants={cardVariants} {...cardHover}>
                  <CategoryCard cat={cat} />
                </motion.div>
              ))}
            </motion.div>
          </section>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div>
        {/* Hero Section */}
        <section className="hero container">
          <div className="hero-content">
            <div className="hero-pill">
              <Sparkles size={16} /> Campus Event Portal 2026
            </div>
            <h2 className="hero-title">
              <ParticleText>Welcome back, sujith! 🎓</ParticleText>
            </h2>

            <p className="hero-subtitle">
              Welcome to <strong>CampusConnect</strong> – the all-in-one college event management platform. Discover technical hackathons, cultural festivals, sports tournaments, and workshops hosted by your college clubs and departments.
            </p>
            <div className="hero-actions">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link to="/events" className="btn btn-primary btn-lg">
                  Explore Events <ArrowRight size={18} />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Counter Section */}
        <section className="container">
          <motion.div
            className="stats-section"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <motion.div className="stat-card" variants={statCardVariants}>
              <div className="stat-icon-wrap">
                <Calendar size={28} />
              </div>
              <div>
                <div className="stat-value">
                  {statsLoading && stats.eventsHosted === null ? '—' : stats.eventsHosted}
                </div>
                <div className="stat-label">College Events Hosted</div>
              </div>
            </motion.div>

            <motion.div className="stat-card" variants={statCardVariants}>
              <div className="stat-icon-wrap">
                <Users size={28} />
              </div>
              <div>
                <div className="stat-value">
                  {statsLoading && stats.activeRegistrations === null ? '—' : stats.activeRegistrations.toLocaleString()}
                </div>
                <div className="stat-label">Active Student Registrations</div>
              </div>
            </motion.div>

            <motion.div className="stat-card" variants={statCardVariants}>
              <div className="stat-icon-wrap">
                <Award size={28} />
              </div>
              <div>
                <div className="stat-value">
                  {statsLoading && stats.organizers === null ? '—' : stats.organizers}
                </div>
                <div className="stat-label">Clubs & Organizers</div>
              </div>
            </motion.div>

            <motion.div className="stat-card" variants={statCardVariants}>
              <div className="stat-icon-wrap">
                <ShieldCheck size={28} />
              </div>
              <div>
                <div className="stat-value">100%</div>
                <div className="stat-label">Verified College Events</div>
              </div>
            </motion.div>
          </motion.div>
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

          <motion.div
            className="category-grid"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {categoriesList.map((cat) => (
              <motion.div key={cat.name} variants={cardVariants} {...cardHover}>
                <CategoryCard cat={cat} />
              </motion.div>
            ))}
          </motion.div>
        </section>

      </div>
    </PageTransition>
  );
};

export default HomePage;
