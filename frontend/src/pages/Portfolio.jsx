import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Server,
  Database,
  Terminal,
  Cpu,
  Layers,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Menu,
  X,
  ChevronUp,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Calendar,
  Layout,
  Globe,
  Bot
} from 'lucide-react';
import './portfolio.css';

export default function Portfolio() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setFormSubmitted(false), 6000);
    }, 800);
  };

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Education', href: '#education' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <div className="portfolio-container">
      {/* Ambient background glow */}
      <div className="ambient-glow glow-top" />
      <div className="ambient-glow glow-mid" />
      <div className="ambient-glow glow-bottom" />

      {/* 1. STICKY NAVBAR */}
      <nav className="portfolio-nav">
        <div className="nav-inner">
          <a href="#hero" className="brand-logo">
            <span>Sujith</span>
            <span className="brand-dot" />
          </a>

          {/* Desktop Nav */}
          <div className="nav-links-desktop">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="nav-link">
                {link.name}
              </a>
            ))}
          </div>

          <div className="nav-cta-desktop">
            <a href="#contact" className="btn-nav-cta">
              Get in Touch
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle-btn"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mobile-dropdown"
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-nav-link"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary mobile-cta"
              >
                Get in Touch
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. HERO SECTION */}
      <section id="hero" className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-badge"
        >
          <span className="status-dot" />
          <span>Open to opportunities</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hero-subtitle"
        >
          Hi, I'm Sujith
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hero-headline"
        >
          Building Digital <br />
          <span className="gradient-text">Experiences That Matter.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="hero-desc"
        >
          B.Tech Computer Science student and aspiring full-stack developer passionate about building modern, scalable and user-focused applications.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="hero-actions"
        >
          <a href="#projects" className="btn-primary">
            View My Projects
            <ArrowRight size={16} />
          </a>
          <a href="#contact" className="btn-secondary">
            Contact Me
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="hero-socials"
        >
          <a
            href="https://github.com/sujith1704"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-btn"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-btn"
            aria-label="LinkedIn"
          >
            <Linkedin size={18} />
          </a>
          <a
            href="mailto:sujith@example.com"
            className="social-icon-btn"
            aria-label="Email"
          >
            <Mail size={18} />
          </a>
        </motion.div>
      </section>

      {/* 3. ABOUT ME */}
      <section id="about" className="section-container">
        <div className="about-grid">
          <div className="about-content">
            <span className="section-tag">// ABOUT ME</span>
            <h2 className="section-title">
              Crafting reliable, scalable software with purpose & precision.
            </h2>
            <p className="text-body mb-4">
              I'm a B.Tech Computer Science student who enjoys turning ideas into practical digital products. I work with modern web technologies and enjoy building full-stack applications, experimenting with AI, and solving real-world problems through code.
            </p>
            <p className="text-muted">
              I believe in clean architecture, type safety, modular systems, and creating frictionless user journeys. Every application I design balances technical rigor with elegant, intuitive frontends.
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card glass-panel">
              <span className="stat-number text-indigo">B.Tech</span>
              <span className="stat-label">CS Student</span>
              <span className="stat-sub">Computer Science & Engg</span>
            </div>
            <div className="stat-card glass-panel">
              <span className="stat-number text-cyan">10+</span>
              <span className="stat-label">Technologies</span>
              <span className="stat-sub">Full-Stack & Systems</span>
            </div>
            <div className="stat-card glass-panel">
              <span className="stat-number text-purple">Multiple</span>
              <span className="stat-label">Projects</span>
              <span className="stat-sub">Real-World Utility</span>
            </div>
            <div className="stat-card glass-panel">
              <span className="stat-number text-emerald">Always</span>
              <span className="stat-label">Learning</span>
              <span className="stat-sub">Modern Web & AI</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SKILLS */}
      <section id="skills" className="section-container">
        <div className="section-header">
          <span className="section-tag">// TECHNICAL STACK</span>
          <h2 className="section-title">Skills & Technologies</h2>
          <p className="section-subtitle">
            A structured toolkit for building robust frontends, backends, and data systems.
          </p>
        </div>

        <div className="skills-grid">
          {/* Frontend */}
          <div className="skill-category-card glass-panel">
            <div className="skill-cat-header">
              <div className="cat-icon-box bg-indigo-subtle text-indigo">
                <Code2 size={20} />
              </div>
              <div>
                <h3 className="cat-title">Frontend</h3>
                <span className="cat-sub">Client UI & Interaction</span>
              </div>
            </div>
            <div className="skill-pill-list">
              <span className="skill-pill">HTML</span>
              <span className="skill-pill">CSS</span>
              <span className="skill-pill">JavaScript</span>
              <span className="skill-pill pill-highlight">React.js</span>
            </div>
          </div>

          {/* Backend */}
          <div className="skill-category-card glass-panel">
            <div className="skill-cat-header">
              <div className="cat-icon-box bg-cyan-subtle text-cyan">
                <Server size={20} />
              </div>
              <div>
                <h3 className="cat-title">Backend</h3>
                <span className="cat-sub">Services & Business Logic</span>
              </div>
            </div>
            <div className="skill-pill-list">
              <span className="skill-pill">Node.js</span>
              <span className="skill-pill">Express.js</span>
              <span className="skill-pill pill-highlight">REST APIs</span>
            </div>
          </div>

          {/* Database */}
          <div className="skill-category-card glass-panel">
            <div className="skill-cat-header">
              <div className="cat-icon-box bg-emerald-subtle text-emerald">
                <Database size={20} />
              </div>
              <div>
                <h3 className="cat-title">Database</h3>
                <span className="cat-sub">Persistence & Modeling</span>
              </div>
            </div>
            <div className="skill-pill-list">
              <span className="skill-pill pill-highlight">MongoDB</span>
            </div>
          </div>

          {/* Programming */}
          <div className="skill-category-card glass-panel">
            <div className="skill-cat-header">
              <div className="cat-icon-box bg-purple-subtle text-purple">
                <Terminal size={20} />
              </div>
              <div>
                <h3 className="cat-title">Programming</h3>
                <span className="cat-sub">Core Computational Langs</span>
              </div>
            </div>
            <div className="skill-pill-list">
              <span className="skill-pill">Python</span>
              <span className="skill-pill">C++</span>
            </div>
          </div>

          {/* Tools */}
          <div className="skill-category-card glass-panel skill-wide-card">
            <div className="skill-cat-header">
              <div className="cat-icon-box bg-amber-subtle text-amber">
                <Cpu size={20} />
              </div>
              <div>
                <h3 className="cat-title">Tools & Workflow</h3>
                <span className="cat-sub">Version Control & Dev Environment</span>
              </div>
            </div>
            <div className="skill-pill-list">
              <span className="skill-pill">Git</span>
              <span className="skill-pill">GitHub</span>
              <span className="skill-pill">VS Code</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PROJECTS */}
      <section id="projects" className="section-container">
        <div className="section-header">
          <span className="section-tag">// SELECTED WORK</span>
          <h2 className="section-title">Featured Projects</h2>
          <p className="section-subtitle">
            Engineered full-stack applications with an emphasis on performance and clean UX.
          </p>
        </div>

        {/* Flagship: CampusConnect */}
        <div className="flagship-card glass-panel">
          <div className="flagship-info">
            <div className="flagship-badges">
              <span className="badge-featured">Featured Flagship</span>
              <span className="badge-type">Full-Stack Application</span>
            </div>

            <h3 className="flagship-title">CampusConnect</h3>

            <p className="flagship-desc">
              A college event management platform that helps students discover events, register for them, manage registrations, and access event passes while providing organizers with tools to manage events and users.
            </p>

            <div className="project-tags">
              {['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JWT', 'REST API'].map(
                (t) => (
                  <span key={t} className="project-tag-pill">
                    {t}
                  </span>
                )
              )}
            </div>

            <div className="project-actions">
              <a href="#" className="btn-primary">
                <span>Live Demo</span>
                <ExternalLink size={14} />
              </a>
              <a
                href="https://github.com/sujith1704"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <Github size={14} />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Interactive UI Mockup graphic */}
          <div className="flagship-mockup">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <span className="mockup-url">campusconnect.dev/events</span>
              <div style={{ width: 24 }} />
            </div>

            <div className="mockup-body">
              <div className="mockup-bar" />
              <div className="mockup-columns">
                <div className="mockup-card">
                  <div className="mockup-skeleton h-4 w-3/4" />
                  <div className="mockup-skeleton h-2 w-1/2" />
                  <div className="mockup-btn" />
                </div>
                <div className="mockup-card">
                  <div className="mockup-skeleton h-4 w-3/4" />
                  <div className="mockup-skeleton h-2 w-1/2" />
                  <div className="mockup-btn btn-alt" />
                </div>
              </div>
            </div>

            <div className="mockup-footer">
              <span>Dynamic Passes & Attendance Verification</span>
              <span className="status-live">● Operational</span>
            </div>
          </div>
        </div>

        {/* Additional Project Cards */}
        <div className="secondary-projects-grid">
          <div className="sub-project-card glass-panel">
            <span className="sub-proj-category">Web Application</span>
            <h4 className="sub-proj-title">AI Task Intelligence</h4>
            <p className="sub-proj-desc">
              Context-aware productivity tool utilizing algorithmic prioritization and automated breakdown of complex engineering tasks.
            </p>
            <div className="project-tags">
              {['React.js', 'Node.js', 'MongoDB', 'AI API'].map((t) => (
                <span key={t} className="project-tag-pill">
                  {t}
                </span>
              ))}
            </div>
            <div className="sub-proj-links">
              <a href="#" className="link-sub">
                Live Demo <ExternalLink size={12} />
              </a>
              <a
                href="https://github.com/sujith1704"
                target="_blank"
                rel="noopener noreferrer"
                className="link-sub text-muted"
              >
                GitHub <Github size={12} />
              </a>
            </div>
          </div>

          <div className="sub-project-card glass-panel">
            <span className="sub-proj-category">Developer Tooling</span>
            <h4 className="sub-proj-title">Cloud Code Vault</h4>
            <p className="sub-proj-desc">
              Collaborative developer snippet repository with rapid keyword search, syntax highlighting, and secure public/private endpoints.
            </p>
            <div className="project-tags">
              {['JavaScript', 'Express.js', 'MongoDB', 'Tailwind'].map((t) => (
                <span key={t} className="project-tag-pill">
                  {t}
                </span>
              ))}
            </div>
            <div className="sub-proj-links">
              <a href="#" className="link-sub">
                Live Demo <ExternalLink size={12} />
              </a>
              <a
                href="https://github.com/sujith1704"
                target="_blank"
                rel="noopener noreferrer"
                className="link-sub text-muted"
              >
                GitHub <Github size={12} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. EDUCATION / EXPERIENCE */}
      <section id="education" className="section-container">
        <div className="section-header">
          <span className="section-tag">// BACKGROUND</span>
          <h2 className="section-title">Education & Journey</h2>
          <p className="section-subtitle">
            Academic milestones and ongoing technical specialization.
          </p>
        </div>

        <div className="timeline-wrapper">
          <div className="timeline-track" />

          <div className="timeline-item">
            <div className="timeline-marker">
              <GraduationCap size={16} />
            </div>
            <div className="timeline-content glass-panel">
              <div className="timeline-heading-row">
                <h3 className="timeline-degree">B.Tech in Computer Science</h3>
                <span className="timeline-status-badge">Current Status: Student</span>
              </div>
              <span className="timeline-field">Undergraduate Engineering</span>
              <p className="timeline-text">
                Focusing on Data Structures & Algorithms, Object-Oriented Software Design (C++, Python), Database Management Systems (SQL & NoSQL), and Computer Networks.
              </p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker marker-alt">
              <Calendar size={16} />
            </div>
            <div className="timeline-content glass-panel">
              <div className="timeline-heading-row">
                <h3 className="timeline-degree">Full-Stack Exploration & Projects</h3>
                <span className="timeline-status-badge badge-neutral">Independent Study</span>
              </div>
              <span className="timeline-field">Web Stacks & Modern Architectures</span>
              <p className="timeline-text">
                Actively engineering end-to-end applications including CampusConnect, writing scalable REST APIs with Express and Node.js, and creating rich React client interfaces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SERVICES ("What I Can Build") */}
      <section id="services" className="section-container">
        <div className="section-header">
          <span className="section-tag">// EXPERTISE</span>
          <h2 className="section-title">What I Can Build</h2>
          <p className="section-subtitle">
            Specialized solutions delivered with high performance, scalability, and modern standards.
          </p>
        </div>

        <div className="services-grid">
          <div className="service-card glass-panel">
            <div className="service-icon-box text-indigo">
              <Layout size={22} />
            </div>
            <h3 className="service-title">Web Applications</h3>
            <p className="service-desc">
              Dynamic, performant single-page applications built using modern React.js patterns and responsive state management.
            </p>
          </div>

          <div className="service-card glass-panel">
            <div className="service-icon-box text-purple">
              <Layers size={22} />
            </div>
            <h3 className="service-title">Full-Stack Applications</h3>
            <p className="service-desc">
              Cohesive applications uniting polished frontends with scalable Node.js and Express backend infrastructure.
            </p>
          </div>

          <div className="service-card glass-panel">
            <div className="service-icon-box text-cyan">
              <Globe size={22} />
            </div>
            <h3 className="service-title">Responsive Websites</h3>
            <p className="service-desc">
              Pixel-perfect layouts optimized meticulously across mobile devices, tablets, laptops, and wide desktop screens.
            </p>
          </div>

          <div className="service-card glass-panel">
            <div className="service-icon-box text-emerald">
              <Server size={22} />
            </div>
            <h3 className="service-title">REST APIs</h3>
            <p className="service-desc">
              Structured, secure backend endpoints designed with JSON contracts, middleware authentication, and error resilience.
            </p>
          </div>

          <div className="service-card glass-panel">
            <div className="service-icon-box text-amber">
              <Database size={22} />
            </div>
            <h3 className="service-title">Database-Driven Applications</h3>
            <p className="service-desc">
              Robust data architectures utilizing MongoDB schemas, indexing, and high-performance aggregation pipelines.
            </p>
          </div>

          <div className="service-card glass-panel">
            <div className="service-icon-box text-rose">
              <Bot size={22} />
            </div>
            <h3 className="service-title">AI-Powered Applications</h3>
            <p className="service-desc">
              Clever integrations with modern AI APIs to bring natural-language intelligence and task automation to users.
            </p>
          </div>
        </div>
      </section>

      {/* 8. CONTACT */}
      <section id="contact" className="section-container">
        <div className="contact-grid">
          <div className="contact-meta">
            <span className="section-tag">// GET IN TOUCH</span>
            <h2 className="section-title">Let's Build Something Great.</h2>
            <p className="text-body mb-8">
              Have an idea or want to work together? I'd love to hear from you. Reach out through the form or my social channels.
            </p>

            <div className="contact-direct-list">
              <a href="mailto:sujith@example.com" className="direct-item glass-panel">
                <div className="direct-icon text-indigo">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="direct-label">Email</div>
                  <div className="direct-val">sujith@example.com</div>
                </div>
              </a>

              <a
                href="https://github.com/sujith1704"
                target="_blank"
                rel="noopener noreferrer"
                className="direct-item glass-panel"
              >
                <div className="direct-icon text-slate">
                  <Github size={18} />
                </div>
                <div>
                  <div className="direct-label">GitHub</div>
                  <div className="direct-val">github.com/sujith1704</div>
                </div>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="direct-item glass-panel"
              >
                <div className="direct-icon text-cyan">
                  <Linkedin size={18} />
                </div>
                <div>
                  <div className="direct-label">LinkedIn</div>
                  <div className="direct-val">Connect on LinkedIn</div>
                </div>
              </a>
            </div>
          </div>

          <div className="contact-form-wrapper glass-panel">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Alex Johnson"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Your Email</label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell me about your project or opportunity..."
                  className="form-input form-textarea"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center"
              >
                {isSubmitting ? (
                  <span>Sending message...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {formSubmitted && (
                <div className="form-alert-success">
                  Thank you! Your message has been prepared. (Ready to be wired to EmailJS, Formspree, or your backend endpoint).
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="portfolio-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-name">Sujith</span>
            <span className="footer-copy">© 2026. All rights reserved.</span>
          </div>

          <div className="footer-links">
            <a
              href="https://github.com/sujith1704"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              LinkedIn
            </a>
            <a href="mailto:sujith@example.com" className="footer-link">
              Email
            </a>
            <a href="#hero" className="footer-link text-indigo flex items-center gap-1">
              Top <ChevronUp size={14} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
