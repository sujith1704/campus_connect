/**
 * CampusConnect — Shared Framer Motion Animation Variants
 * All animation constants are defined here to ensure a consistent
 * look and feel across the entire application.
 */

// ---------------------------------------------------------------------------
// Page-level entrance (fade + subtle slide-up)
// ---------------------------------------------------------------------------
export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const pageTransition = {
  duration: 0.3,
  ease: [0.25, 0.46, 0.45, 0.94],
};

// ---------------------------------------------------------------------------
// Stagger container — wraps a list of animated children
// ---------------------------------------------------------------------------
export const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

// ---------------------------------------------------------------------------
// Card / list item — used for event cards, stat cards, table rows
// ---------------------------------------------------------------------------
export const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
};

// ---------------------------------------------------------------------------
// Auth card entrance (slightly larger slide-up)
// ---------------------------------------------------------------------------
export const authCardVariants = {
  initial: { opacity: 0, y: 28, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ---------------------------------------------------------------------------
// Alert / notification — slides in from top
// ---------------------------------------------------------------------------
export const alertVariants = {
  initial: { opacity: 0, y: -10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.18, ease: 'easeIn' } },
};

// ---------------------------------------------------------------------------
// Modal backdrop
// ---------------------------------------------------------------------------
export const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

// ---------------------------------------------------------------------------
// Modal container — scale + fade
// ---------------------------------------------------------------------------
export const modalVariants = {
  initial: { opacity: 0, scale: 0.93, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.18, ease: 'easeIn' } },
};

// ---------------------------------------------------------------------------
// Tab content switch (used in MyRegistrations / ManageEvents tab panels)
// ---------------------------------------------------------------------------
export const tabVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

// ---------------------------------------------------------------------------
// Stat card (dashboard counters)
// ---------------------------------------------------------------------------
export const statCardVariants = {
  initial: { opacity: 0, y: 18, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ---------------------------------------------------------------------------
// Reusable whileHover / whileTap props for buttons
// ---------------------------------------------------------------------------
export const buttonHoverTap = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.96 },
  transition: { type: 'spring', stiffness: 400, damping: 20 },
};

// ---------------------------------------------------------------------------
// Subtle lift for cards on hover (used on event-card, category-card)
// ---------------------------------------------------------------------------
export const cardHover = {
  whileHover: { y: -4, transition: { duration: 0.18, ease: 'easeOut' } },
};
