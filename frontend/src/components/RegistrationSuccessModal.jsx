import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { GraduationCap, CheckCircle2, Ticket, Calendar, Clock, MapPin, X, Sparkles } from 'lucide-react';
import { formatDate } from '../utils/date';

/**
 * Premium Multi-Blaster Confetti — Slow Float Edition
 *
 * 7 blasters: top-left, upper-left-center, top-center-left, top-center,
 *             top-center-right, upper-right-center, top-right
 * + left-side and right-side burst blasters
 *
 * Physics:
 *  • Fast initial burst that slows to near-zero as gravity is very gentle
 *  • Air-drag coefficient bleeds off horizontal velocity over time
 *  • Very low gravity (0.04–0.09 px/frame²) → elegant slow float
 *  • Sinusoidal lateral oscillation adds natural paper-like waft
 *  • 5 shape variants: rect, square, streamer, oval, dot
 *  • 🎉 emoji pop-in → hold → fade
 *  • Total: 3 s — fade starts at 2.7 s, full cleanup at 3 s
 */
const ConfettiCanvas = () => {
  const canvasRef = useRef(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // ── Brand colour palette ──────────────────────────────────────────────
    const COLORS = [
      '#f05d4d', '#38bdf8', '#10b981', '#fbbf24',
      '#a855f7', '#ec4899', '#6366f1', '#ffffff',
      '#fb923c', '#34d399', '#f472b6', '#818cf8',
    ];

    const isMobile = width < 600;

    const shapes = ['rect', 'square', 'streamer', 'oval', 'dot'];
    const DURATION = 3000;
    const FADE_START = 2700;

    // ── Wide-area uniform emitter ─────────────────────────────────────────
    // Particles spawn uniformly across 10%–90% of screen width so the
    // entire middle of the screen fills with celebration — no visible gaps
    // or separate columns. A small stagger delay (0–300ms) makes them
    // feel like a natural cascade rather than a single instant burst.
    const totalParticles = isMobile ? 260 : 440;
    const particles = [];

    for (let i = 0; i < totalParticles; i++) {
      // Spread emitters across the upper viewport with enough overlap to read as one burst.
      const x = width * (0.08 + Math.random() * 0.84);
      const y = -10 - Math.random() * 70;

      // Wider independent horizontal burst gives each emission area a roughly 9 cm spread.
      const speed = 2.4 + Math.random() * 6;
      const vx = (Math.random() - 0.5) * speed;
      const targetFallDistance = height * (1.2 + Math.random() * 0.15) + 80;
      const baseFallSpeed = targetFallDistance / ((DURATION - 300) / 1000 * 60);
      const vy = baseFallSpeed * (0.78 + Math.random() * 0.44);

      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size = shape === 'streamer'
        ? { w: 1.5 + Math.random() * 2, h: 11 + Math.random() * 16 }
        : shape === 'dot'
          ? { w: 3 + Math.random() * 3.5, h: 3 + Math.random() * 3.5 }
          : shape === 'square'
            ? (() => { const s = 4 + Math.random() * 7; return { w: s, h: s }; })()
            : { w: 5 + Math.random() * 10, h: 3 + Math.random() * 5 };

      particles.push({
        x,
        y,
        vx,
        vy,
        // Small per-piece gravity and air resistance keep speeds independent.
        gravity: 0.008 + Math.random() * 0.018,
        drag: 0.985 + Math.random() * 0.012,
        verticalDrag: 0.9992 + Math.random() * 0.0006,
        // Independent smooth lateral waft prevents parallel trajectories.
        waveAmp: 0.45 + Math.random() * 1.35,
        waveFreq: 0.012 + Math.random() * 0.026,
        wavePhase: Math.random() * Math.PI * 2,
        driftAmp: 0.25 + Math.random() * 0.75,
        driftFreq: 0.006 + Math.random() * 0.012,
        driftPhase: Math.random() * Math.PI * 2,
        driftDirection: Math.random() < 0.5 ? -1 : 1,
        w: size.w,
        h: size.h,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * (2.5 + Math.random() * 6),
        tiltAngle: Math.random() * Math.PI * 2,
        tiltSpeed: 0.02 + Math.random() * 0.04,
        shape,
        // Stagger spawn over first 300ms so it feels like a natural cascade
        spawnDelay: Math.random() * 300,
        opacity: 1,
      });
    }

    // ── Emoji ─────────────────────────────────────────────────────────────
    const emoji = {
      x: width * 0.5,
      y: height * 0.22,
      size: isMobile ? 38 : 50,
      scale: 0,
    };

    // ── Animation loop ────────────────────────────────────────────────────
    let rafId;
    const startTime = Date.now();
    const render = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > DURATION) {
        ctx.clearRect(0, 0, width, height);
        setIsFinished(true);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const globalAlpha = elapsed > FADE_START
        ? Math.max(0, (DURATION - elapsed) / (DURATION - FADE_START))
        : 1;

      // ── Particles ────────────────────────────────────────────────────────
      particles.forEach((p) => {
        if (elapsed < p.spawnDelay) return;

        // Keep horizontal motion gentle while preserving viewport-relative fall speed.
        p.vx *= p.drag;
        p.vy *= p.verticalDrag;
        p.vy += p.gravity;
        // Sinusoidal lateral waft
        const wave = Math.sin(p.wavePhase + elapsed * p.waveFreq) * p.waveAmp;
        const drift = Math.sin(p.driftPhase + elapsed * p.driftFreq) * p.driftAmp * p.driftDirection;

        p.x += p.vx + wave + drift;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.tiltAngle += p.tiltSpeed;

        // Soft horizontal clamp — no scroll
        if (p.x < -p.w) p.x = -p.w;
        if (p.x > width + p.w) p.x = width + p.w;

        // Fade only near and just below the viewport bottom.
        const bottomFade = p.y > height * 0.88
          ? Math.max(0, 1 - (p.y - height * 0.88) / (height * 0.22))
          : 1;

        ctx.save();
        ctx.globalAlpha = Math.max(0, globalAlpha * p.opacity * bottomFade);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        switch (p.shape) {
          case 'rect':
          case 'square':
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.tiltAngle)));
            break;
          case 'streamer':
            // Streamers are tall thin strips — always draw full height, rotate handles twist
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            break;
          case 'oval':
            ctx.beginPath();
            ctx.ellipse(0, 0, p.w * 0.55, p.h * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'dot':
          default:
            ctx.beginPath();
            ctx.arc(0, 0, p.w * 0.5, 0, Math.PI * 2);
            ctx.fill();
            break;
        }

        ctx.restore();
      });

      // ── 🎉 Emoji — pop-in with overshoot, hold, then fade ────────────────
      if (elapsed < 320) {
        const t = elapsed / 320;
        // Cubic overshoot easing: shoots to 1.3x then settles to 1.0
        emoji.scale = t < 0.55
          ? (t / 0.55) * 1.3
          : 1.3 - ((t - 0.55) / 0.45) * 0.3;
      } else {
        emoji.scale = 1.0;
      }

      const emojiAlpha = elapsed > FADE_START ? globalAlpha : 1;

      ctx.save();
      ctx.globalAlpha = emojiAlpha;
      ctx.translate(emoji.x, emoji.y);
      ctx.scale(emoji.scale, emoji.scale);
      ctx.font = `${emoji.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎉', 0, 0);
      ctx.restore();

      rafId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (isFinished) return null;

  return createPortal(
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1070,
        overflow: 'hidden',
      }}
    />,
    document.body
  );
};



const RegistrationSuccessModal = ({ event, registration, onViewPass, onClose }) => {
  if (!event) return null;

  return (
    <AnimatePresence>
      <div className="registration-success-overlay" onClick={onClose}>
        <ConfettiCanvas />

        <motion.div
          className="registration-success-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.85, y: 24 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 380,
              damping: 26,
            },
          }}
          exit={{ opacity: 0, scale: 0.9, y: 15, transition: { duration: 0.2 } }}
        >
          {/* Close Button */}
          <button
            className="registration-success-close-btn"
            onClick={onClose}
            aria-label="Close celebration modal"
            type="button"
          >
            <X size={18} />
          </button>

          {/* Top Brand Tag */}
          <div className="registration-success-brand">
            <div className="registration-success-logo-icon">
              <GraduationCap size={18} />
            </div>
            <span className="registration-success-brand-text">CampusConnect</span>
          </div>

          {/* Success Checkmark with glowing pulsing rings */}
          <div className="registration-success-icon-wrap">
            <div className="registration-success-pulse-ring" />
            <motion.div
              className="registration-success-icon"
              initial={{ scale: 0, rotate: -25 }}
              animate={{
                scale: 1,
                rotate: 0,
                transition: {
                  type: 'spring',
                  stiffness: 450,
                  damping: 18,
                  delay: 0.12,
                },
              }}
            >
              <CheckCircle2 size={44} strokeWidth={2.4} />
            </motion.div>
          </div>

          {/* Title and Subtitle */}
          <h2 className="registration-success-title">Registration Successful!</h2>
          <p className="registration-success-subtitle">
            Your event ticket is ready. We've reserved your official entry pass!
          </p>

          {/* Event Details Card Preview */}
          <div className="registration-success-event-box">
            <div className="registration-success-event-header">
              <span className="registration-success-category-tag">{event.category || 'College Event'}</span>
              <span className="registration-success-status-tag">
                <Sparkles size={12} /> Confirmed
              </span>
            </div>

            <h3 className="registration-success-event-title">{event.title}</h3>

            <div className="registration-success-event-meta">
              <div className="registration-meta-item">
                <Calendar size={14} className="meta-icon" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="registration-meta-item">
                <Clock size={14} className="meta-icon" />
                <span>{event.time}</span>
              </div>
              <div className="registration-meta-item">
                <MapPin size={14} className="meta-icon" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {event.venue}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="registration-success-actions">
            {onViewPass && (
              <motion.button
                onClick={onViewPass}
                className="btn btn-primary btn-full registration-view-pass-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
              >
                <Ticket size={18} /> View Ticket Pass
              </motion.button>
            )}

            <button
              onClick={onClose}
              className="btn btn-secondary btn-full registration-done-btn"
              type="button"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RegistrationSuccessModal;
