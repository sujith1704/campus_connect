import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={28} style={{ color: 'var(--primary-light)' }} />
              CampusConnect
            </div>
            <p style={{ lineHeight: 1.6, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              The ultimate college event management platform. Discover upcoming hackathons, cultural nights, workshops, and sports meets seamlessly in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/events">Explore Events</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="footer-heading">Event Categories</h4>
            <ul className="footer-links">
              <li><Link to="/events?category=Technical">Technical & Hackathons</Link></li>
              <li><Link to="/events?category=Cultural">Cultural & Arts</Link></li>
              <li><Link to="/events?category=Workshop">Workshops & AI</Link></li>
              <li><Link to="/events?category=Sports">Sports & Esports</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="footer-heading">Contact Support</h4>
            <ul className="footer-links" style={{ fontSize: '0.875rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} /> College Campus, Block A
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} /> support@campusconnect.edu
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} /> +1 (800) 226-7877
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} CampusConnect – College Event Management System. Built for Students & Organizers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
