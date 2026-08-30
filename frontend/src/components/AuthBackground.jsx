import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  CalendarDays,
  Sparkles,
  Ticket,
  Compass,
  Award,
  BookOpen,
} from 'lucide-react';

const floatingIcons = [
  {
    Icon: GraduationCap,
    size: 42,
    top: '12%',
    left: '8%',
    duration: 7,
    delay: 0,
    rotate: [0, 8, -8, 0],
    color: 'rgba(240, 93, 77, 0.18)',
  },
  {
    Icon: CalendarDays,
    size: 38,
    top: '20%',
    right: '10%',
    duration: 8,
    delay: 1,
    rotate: [0, -10, 6, 0],
    color: 'rgba(56, 189, 248, 0.18)',
  },
  {
    Icon: Sparkles,
    size: 32,
    bottom: '22%',
    left: '12%',
    duration: 6.5,
    delay: 0.5,
    rotate: [0, 15, -10, 0],
    color: 'rgba(251, 191, 36, 0.20)',
  },
  {
    Icon: Ticket,
    size: 44,
    bottom: '15%',
    right: '8%',
    duration: 8.5,
    delay: 1.5,
    rotate: [0, -12, 12, 0],
    color: 'rgba(240, 93, 77, 0.16)',
  },
  {
    Icon: Compass,
    size: 36,
    top: '48%',
    left: '5%',
    duration: 9,
    delay: 2,
    rotate: [0, 360],
    color: 'rgba(168, 85, 247, 0.16)',
  },
  {
    Icon: Award,
    size: 36,
    top: '52%',
    right: '6%',
    duration: 7.5,
    delay: 1.2,
    rotate: [0, 10, -10, 0],
    color: 'rgba(52, 211, 153, 0.16)',
  },
  {
    Icon: BookOpen,
    size: 30,
    bottom: '38%',
    left: '15%',
    duration: 8,
    delay: 2.2,
    rotate: [0, -8, 8, 0],
    color: 'rgba(129, 140, 248, 0.15)',
  },
];

const AuthBackground = () => {
  return (
    <div className="auth-ambient-bg" aria-hidden="true">
      {/* Soft Ambient Glowing Orbs */}
      <motion.div
        className="auth-glow-orb orb-primary"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.5, 0.35],
          x: [0, 25, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="auth-glow-orb orb-cyan"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.45, 0.25],
          x: [0, -30, 0],
          y: [0, 25, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="auth-glow-orb orb-purple"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.35, 0.2],
          x: [0, 20, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Floating Themed Icons */}
      {floatingIcons.map((item, idx) => {
        const { Icon, size, top, bottom, left, right, duration, delay, rotate, color } = item;
        return (
          <motion.div
            key={idx}
            className="auth-floating-icon"
            style={{
              position: 'absolute',
              top,
              bottom,
              left,
              right,
              color,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: [1, 1.08, 1],
              y: [0, -16, 0],
              rotate,
            }}
            transition={{
              opacity: { duration: 1 },
              scale: { duration, repeat: Infinity, ease: 'easeInOut', delay },
              y: { duration, repeat: Infinity, ease: 'easeInOut', delay },
              rotate: { duration: duration * 1.5, repeat: Infinity, ease: 'easeInOut', delay },
            }}
          >
            <Icon size={size} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default AuthBackground;
