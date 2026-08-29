import React, { useState } from 'react';
import { Ticket, Calendar, Clock, MapPin, CheckCircle, X, Copy, Check, Printer, User, ShieldCheck, Sparkles, Building } from 'lucide-react';
import { formatDate, isPastEvent } from '../utils/date';

const TicketPassModal = ({ ticket, user, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!ticket) return null;

  const event = ticket.event || {};
  const expired = isPastEvent(event);
  const ticketId = `CC-PASS-${ticket._id.slice(-8).toUpperCase()}`;
  const attendeeName = user?.name || ticket.student?.name || 'Registered Attendee';
  const attendeeEmail = user?.email || ticket.student?.email || '';
  const organizerName = event.organizer?.name || 'Campus Connect Organizer';

  const handleCopyId = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="ticket-modal-overlay" onClick={onClose}>
      <div className="ticket-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Control Bar */}
        <div className="ticket-modal-actions">
          <div className="ticket-modal-title">
            <Sparkles size={18} className="ticket-sparkle-icon" />
            <span>Official Event Pass</span>
          </div>
          <div className="ticket-action-buttons">
            <button onClick={handlePrint} className="ticket-action-btn" title="Print or Save Pass">
              <Printer size={16} />
              <span>Print Pass</span>
            </button>
            <button onClick={onClose} className="ticket-close-btn" title="Close Pass">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* The Official Ticket Pass Card with Linear Gradient Background */}
        <div className="official-ticket-card" id="printable-ticket">
          {/* Card Top Header / Holographic Ribbon */}
          <div className="ticket-header-ribbon">
            <div className="ticket-brand">
              <Ticket size={20} className="ticket-brand-icon" />
              <span className="ticket-brand-name">CAMPUS CONNECT</span>
            </div>
            <div className="ticket-badge-pill">
              <ShieldCheck size={14} />
              <span>OFFICIAL ENTRY PASS</span>
            </div>
          </div>

          {/* Ticket Hero / Event Info Section */}
          <div className="ticket-main-section">
            {event.image && (
              <div className="ticket-image-banner">
                <img src={event.image} alt={event.title} className="ticket-banner-img" />
                <div className="ticket-image-overlay"></div>
                <span className="ticket-category-tag">{event.category || 'CAMPUS EVENT'}</span>
              </div>
            )}

            <div className="ticket-event-details">
              {!event.image && (
                <span className="ticket-category-tag-inline">{event.category || 'CAMPUS EVENT'}</span>
              )}
              <h2 className="ticket-event-title">{event.title}</h2>

              {/* Event Meta Glass Grid */}
              <div className="ticket-meta-grid">
                <div className="ticket-meta-cell">
                  <div className="ticket-meta-label">
                    <Calendar size={13} />
                    <span>DATE</span>
                  </div>
                  <div className="ticket-meta-value">{formatDate(event.date)}</div>
                </div>

                <div className="ticket-meta-cell">
                  <div className="ticket-meta-label">
                    <Clock size={13} />
                    <span>TIME</span>
                  </div>
                  <div className="ticket-meta-value">{event.time || 'TBA'}</div>
                </div>

                <div className="ticket-meta-cell ticket-meta-cell-wide">
                  <div className="ticket-meta-label">
                    <MapPin size={13} />
                    <span>VENUE & LOCATION</span>
                  </div>
                  <div className="ticket-meta-value">{event.venue || 'Campus Main Ground'}</div>
                </div>

                <div className="ticket-meta-cell">
                  <div className="ticket-meta-label">
                    <User size={13} />
                    <span>ATTENDEE</span>
                  </div>
                  <div className="ticket-meta-value ticket-attendee-name">{attendeeName}</div>
                  {attendeeEmail && <div className="ticket-attendee-email">{attendeeEmail}</div>}
                </div>

                <div className="ticket-meta-cell">
                  <div className="ticket-meta-label">
                    <Building size={13} />
                    <span>HOST / ORGANIZER</span>
                  </div>
                  <div className="ticket-meta-value">{organizerName}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Tear Perforation / Realistic Cutout Notches */}
          <div className="ticket-perforation-wrap">
            <div className="ticket-notch ticket-notch-left"></div>
            <div className="ticket-perforation-line"></div>
            <div className="ticket-notch ticket-notch-right"></div>
          </div>

          {/* Ticket Stub / Security / QR & Barcode Section */}
          <div className="ticket-stub-section">
            <div className="ticket-stub-left">
              <div className="ticket-pass-id-block">
                <span className="ticket-pass-id-label">PASS ID NUMBER</span>
                <div className="ticket-pass-id-row">
                  <span className="ticket-pass-id-code">{ticketId}</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="ticket-copy-btn"
                    title="Copy Ticket ID"
                  >
                    {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="ticket-status-row">
                <div className="ticket-status-pill verified">
                  <CheckCircle size={14} />
                  <span>ENTRY GRANTED • ADMIT ONE</span>
                </div>
                <div className="ticket-live-indicator">
                  <span
                    className="live-dot"
                    style={expired ? {
                      background: '#ef4444',
                      boxShadow: '0 0 8px #ef4444',
                      animation: 'none',
                    } : undefined}
                  ></span>
                  <span>{expired ? 'TICKET IS EXPIRED' : 'ACTIVE PASS'}</span>
                </div>
              </div>

              {/* Realistic Laser Barcode Graphic */}
              <div className="ticket-barcode-wrap">
                <div className="ticket-barcode-lines">
                  <span className="bar w1"></span>
                  <span className="bar w2"></span>
                  <span className="bar w1"></span>
                  <span className="bar w3"></span>
                  <span className="bar w2"></span>
                  <span className="bar w1"></span>
                  <span className="bar w4"></span>
                  <span className="bar w2"></span>
                  <span className="bar w1"></span>
                  <span className="bar w3"></span>
                  <span className="bar w1"></span>
                  <span className="bar w2"></span>
                  <span className="bar w3"></span>
                  <span className="bar w1"></span>
                  <span className="bar w2"></span>
                  <span className="bar w4"></span>
                  <span className="bar w1"></span>
                  <span className="bar w3"></span>
                  <span className="bar w2"></span>
                  <span className="bar w1"></span>
                  <span className="bar w2"></span>
                  <span className="bar w3"></span>
                  <span className="bar w1"></span>
                  <span className="bar w4"></span>
                  <span className="bar w2"></span>
                </div>
                <span className="ticket-barcode-num">{ticketId}</span>
              </div>
            </div>

            {/* Scannable Gate QR Code block */}
            <div className="ticket-stub-right">
              <div className="ticket-qr-frame">
                <svg
                  className="ticket-qr-svg"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* QR Position Squares */}
                  <rect x="6" y="6" width="26" height="26" rx="4" fill="white" />
                  <rect x="10" y="10" width="18" height="18" rx="2" fill="#0f172a" />
                  <rect x="14" y="14" width="10" height="10" rx="1" fill="#f05d4d" />

                  <rect x="68" y="6" width="26" height="26" rx="4" fill="white" />
                  <rect x="72" y="10" width="18" height="18" rx="2" fill="#0f172a" />
                  <rect x="76" y="14" width="10" height="10" rx="1" fill="#f05d4d" />

                  <rect x="6" y="68" width="26" height="26" rx="4" fill="white" />
                  <rect x="10" y="72" width="18" height="18" rx="2" fill="#0f172a" />
                  <rect x="14" y="76" width="10" height="10" rx="1" fill="#f05d4d" />

                  {/* QR Matrix Elements */}
                  <rect x="38" y="8" width="6" height="6" rx="1" fill="white" />
                  <rect x="48" y="14" width="6" height="6" rx="1" fill="white" />
                  <rect x="58" y="8" width="6" height="6" rx="1" fill="white" />
                  <rect x="38" y="24" width="6" height="6" rx="1" fill="white" />
                  <rect x="48" y="28" width="8" height="8" rx="1" fill="white" />
                  <rect x="58" y="22" width="6" height="6" rx="1" fill="white" />

                  <rect x="8" y="38" width="6" height="6" rx="1" fill="white" />
                  <rect x="18" y="44" width="6" height="6" rx="1" fill="white" />
                  <rect x="28" y="38" width="6" height="6" rx="1" fill="white" />
                  <rect x="8" y="54" width="6" height="6" rx="1" fill="white" />
                  <rect x="22" y="54" width="8" height="8" rx="1" fill="white" />

                  <rect x="38" y="40" width="10" height="10" rx="2" fill="#16b8a6" />
                  <rect x="52" y="44" width="8" height="8" rx="1" fill="white" />
                  <rect x="42" y="54" width="8" height="8" rx="1" fill="white" />
                  <rect x="56" y="56" width="6" height="6" rx="1" fill="white" />

                  <rect x="68" y="38" width="8" height="8" rx="1" fill="white" />
                  <rect x="80" y="44" width="6" height="6" rx="1" fill="white" />
                  <rect x="72" y="52" width="6" height="6" rx="1" fill="white" />
                  <rect x="84" y="54" width="8" height="8" rx="1" fill="white" />

                  <rect x="38" y="70" width="6" height="6" rx="1" fill="white" />
                  <rect x="48" y="76" width="8" height="8" rx="1" fill="white" />
                  <rect x="60" y="70" width="6" height="6" rx="1" fill="white" />
                  <rect x="72" y="76" width="8" height="8" rx="1" fill="white" />
                  <rect x="84" y="70" width="6" height="6" rx="1" fill="white" />
                  <rect x="40" y="86" width="8" height="8" rx="1" fill="white" />
                  <rect x="54" y="86" width="6" height="6" rx="1" fill="white" />
                  <rect x="68" y="86" width="8" height="8" rx="1" fill="white" />
                  <rect x="82" y="84" width="8" height="8" rx="1" fill="white" />
                </svg>
                <div className="ticket-qr-label">SCAN AT GATE</div>
              </div>
            </div>
          </div>

          {/* Card Footer Warning Note */}
          <div className="ticket-footer-note">
            <span>🛡️ Valid official pass for campus event entry. Present at registration desk along with Student ID.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPassModal;
