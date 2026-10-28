import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import OrganizerControlDesk from '../components/OrganizerControlDesk';
import ParticleText from '../components/ParticleText';
import TextType from '../components/TextType';
import { Sparkles, Calendar, Users, Award, ShieldCheck, ArrowRight, Code, Music, Trophy, BookOpen, Gamepad2, Mic } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { containerVariants, statCardVariants, cardVariants, cardHover } from '../utils/animations';
import { MagicBentoCard, MagicBentoGrid } from '../components/MagicBento';

const categoriesList = [
  {
    name: 'Technical',
    icon: <Code size={22} />,
    desc: 'Hackathons, Coding & Tech',
    accentBar: 'linear-gradient(180deg, #6366f1, #38bdf8)',
    iconBg: 'rgba(99, 102, 241, 0.12)',
    iconColor: '#818cf8',
    iconBorder: 'rgba(99, 102, 241, 0.28)',
    iconGlow: '0 0 12px rgba(99, 102, 241, 0.22)',
    accentGlow: 'rgba(99, 102, 241, 0.16)',
  },
  {
    name: 'Cultural',
    icon: <Music size={22} />,
    desc: 'Music, Dance & Fest',
    accentBar: 'linear-gradient(180deg, #f43f5e, #e11d48)',
    iconBg: 'rgba(244, 63, 94, 0.12)',
    iconColor: '#fb7185',
    iconBorder: 'rgba(244, 63, 94, 0.28)',
    iconGlow: '0 0 12px rgba(244, 63, 94, 0.22)',
    accentGlow: 'rgba(244, 63, 94, 0.16)',
  },
  {
    name: 'Sports',
    icon: <Trophy size={22} />,
    desc: 'Tournaments & Athletics',
    accentBar: 'linear-gradient(180deg, #f59e0b, #ea580c)',
    iconBg: 'rgba(245, 158, 11, 0.12)',
    iconColor: '#fbbf24',
    iconBorder: 'rgba(245, 158, 11, 0.28)',
    iconGlow: '0 0 12px rgba(245, 158, 11, 0.22)',
    accentGlow: 'rgba(245, 158, 11, 0.16)',
  },
  {
    name: 'Workshop',
    icon: <BookOpen size={22} />,
    desc: 'Hands-on AI & Skill Dev',
    accentBar: 'linear-gradient(180deg, #10b981, #06b6d4)',
    iconBg: 'rgba(16, 185, 129, 0.12)',
    iconColor: '#34d399',
    iconBorder: 'rgba(16, 185, 129, 0.28)',
    iconGlow: '0 0 12px rgba(16, 185, 129, 0.22)',
    accentGlow: 'rgba(16, 185, 129, 0.16)',
  },
  {
    name: 'Gaming',
    icon: <Gamepad2 size={22} />,
    desc: 'Esports & LAN Battles',
    accentBar: 'linear-gradient(180deg, #a855f7, #6366f1)',
    iconBg: 'rgba(168, 85, 247, 0.12)',
    iconColor: '#c084fc',
    iconBorder: 'rgba(168, 85, 247, 0.28)',
    iconGlow: '0 0 12px rgba(168, 85, 247, 0.22)',
    accentGlow: 'rgba(168, 85, 247, 0.16)',
  },
  {
    name: 'Seminar',
    icon: <Mic size={22} />,
    desc: 'Keynotes & Higher Ed',
    accentBar: 'linear-gradient(180deg, #ee5848, #38bdf8)',
    iconBg: 'rgba(238, 88, 72, 0.12)',
    iconColor: '#f87171',
    iconBorder: 'rgba(238, 88, 72, 0.28)',
    iconGlow: '0 0 12px rgba(238, 88, 72, 0.22)',
    accentGlow: 'rgba(238, 88, 72, 0.16)',
  },
];

// Reusable premium category card with Magic Bento spotlight
const CategoryCard = ({ cat }) => (
  <MagicBentoCard
    className="category-card"
    glowColor={cat.accentGlow}
    glowSecondary="rgba(56, 189, 248, 0.1)"
    style={{
      '--cat-accent-bar': cat.accentBar,
      '--cat-icon-bg': cat.iconBg,
      '--cat-icon-color': cat.iconColor,
      '--cat-icon-border': cat.iconBorder,
      '--cat-icon-glow': cat.iconGlow,
      '--cat-accent-glow': cat.accentGlow,
      padding: 0,
      display: 'flex',
    }}
  >
    <Link
      to={`/events?category=${cat.name}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        padding: '1.25rem 1.5rem',
        textDecoration: 'none',
        color: 'inherit',
        gap: '1rem',
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
  </MagicBentoCard>
);

// Smooth counter component for real-time stats
const AnimatedStatValue = ({ value, suffix = '' }) => {
  const numericValue = typeof value === 'number' ? value : (parseInt(value, 10) || 0);
  const [displayValue, setDisplayValue] = useState(numericValue);

  // Sync immediately when incoming numeric value updates
  useEffect(() => {
    const end = typeof value === 'number' ? value : (parseInt(value, 10) || 0);
    let start = displayValue;
    if (start === end) return;

    // Animate smoothly between start and end
    const duration = 700; // ms
    const startTime = performance.now();

    const updateNumber = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };

    const animId = requestAnimationFrame(updateNumber);
    return () => cancelAnimationFrame(animId);
  }, [value]);

  return <span>{displayValue.toLocaleString()}{suffix}</span>;
};

const HomePage = () => {
  const { user, isOrganizer, authSessionId } = useContext(AuthContext);
  const { platformStats, fetchPlatformStats } = useContext(DataContext);

  // Retrieve cached stats from context or localStorage to display immediately on first login/mount
  const getInitialStats = () => {
    if (platformStats && (platformStats.eventsHosted > 0 || platformStats.activeRegistrations > 0 || platformStats.organizers > 0)) {
      return platformStats;
    }
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('cc_platform_stats') : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch {}
    return {
      eventsHosted: platformStats?.eventsHosted ?? 0,
      activeRegistrations: platformStats?.activeRegistrations ?? 0,
      organizers: platformStats?.organizers ?? 0,
      verifiedEvents: 100,
    };
  };

  const [stats, setStats] = useState(getInitialStats);

  // Fetch fresh stats immediately whenever user is logged in or component mounts
  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        const data = await fetchPlatformStats(true);
        if (!cancelled && data) {
          setStats(data);
        }
      } catch (error) {
        console.warn('Error fetching platform statistics:', error);
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [fetchPlatformStats, user?.id, user?._id]);

  // Sync from context whenever it updates with fresh live data
  useEffect(() => {
    if (platformStats) {
      setStats((prev) => ({
        eventsHosted: typeof platformStats.eventsHosted === 'number' ? platformStats.eventsHosted : prev.eventsHosted,
        activeRegistrations: typeof platformStats.activeRegistrations === 'number' ? platformStats.activeRegistrations : prev.activeRegistrations,
        organizers: typeof platformStats.organizers === 'number' ? platformStats.organizers : prev.organizers,
        verifiedEvents: 100,
      }));
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
              <ParticleText>{`Welcome back, ${user?.name ? user.name.split(' ')[0] : 'Student'}! 🎓`}</ParticleText>
            </h2>

            <p className="hero-subtitle">
              <TextType
                text="Welcome to CampusConnect – the all-in-one college event management platform. Discover technical hackathons, cultural festivals, sports tournaments, and workshops hosted by your college clubs and departments."
                typingSpeed={30}
                initialDelay={250}
                loop={false}
                showCursor={true}
                hideCursorWhileTyping={false}
                className="text-type-inline"
                cursorClassName="text-type-cursor"
                sessionKey={authSessionId}
              />
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
          <motion.div
            className="stats-section"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <MagicBentoCard
              className="stat-card"
              variants={statCardVariants}
              glowColor="rgba(240, 93, 77, 0.2)"
              glowSecondary="rgba(249, 115, 22, 0.1)"
            >
              <div className="stat-icon-wrap coral">
                <Calendar size={28} />
              </div>
              <div>
                <div className="stat-value">
                  <AnimatedStatValue value={stats.eventsHosted} />
                </div>
                <div className="stat-label">College Events Hosted</div>
              </div>
            </MagicBentoCard>

            <MagicBentoCard
              className="stat-card"
              variants={statCardVariants}
              glowColor="rgba(56, 189, 248, 0.2)"
              glowSecondary="rgba(99, 102, 241, 0.1)"
            >
              <div className="stat-icon-wrap sky">
                <Users size={28} />
              </div>
              <div>
                <div className="stat-value">
                  <AnimatedStatValue value={stats.activeRegistrations} />
                </div>
                <div className="stat-label">Active Students</div>
              </div>
            </MagicBentoCard>

            <MagicBentoCard
              className="stat-card"
              variants={statCardVariants}
              glowColor="rgba(168, 85, 247, 0.2)"
              glowSecondary="rgba(236, 72, 153, 0.1)"
            >
              <div className="stat-icon-wrap purple">
                <Award size={28} />
              </div>
              <div>
                <div className="stat-value">
                  <AnimatedStatValue value={stats.organizers} />
                </div>
                <div className="stat-label">Clubs & Organizers</div>
              </div>
            </MagicBentoCard>

            <MagicBentoCard
              className="stat-card"
              variants={statCardVariants}
              glowColor="rgba(16, 185, 129, 0.2)"
              glowSecondary="rgba(6, 182, 212, 0.1)"
            >
              <div className="stat-icon-wrap emerald">
                <ShieldCheck size={28} />
              </div>
              <div>
                <div className="stat-value">100%</div>
                <div className="stat-label">Verified College Events</div>
              </div>
            </MagicBentoCard>
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
