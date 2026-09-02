import React, { useRef, useEffect, useState, useMemo, forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * MagicBentoCard — React Bits Magic Bento Card Component
 * Provides interactive cursor-following spotlight glow, illuminating borders,
 * smooth entrance variants, and subtle responsive feedback.
 */
export const MagicBentoCard = forwardRef(({
  children,
  className = '',
  style = {},
  glowColor = 'rgba(56, 189, 248, 0.16)',
  glowSecondary = 'rgba(168, 85, 247, 0.08)',
  glowRadius = 320,
  enableTilt = false,
  tiltMax = 4,
  as: Component = 'div',
  variants,
  initial = 'initial',
  animate = 'animate',
  whileHover,
  whileTap,
  onClick,
  ...rest
}, forwardedRef) => {
  const innerRef = useRef(null);
  const cardRef = forwardedRef || innerRef;
  const isHoveredRef = useRef(false);
  const frameRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const [hasPointer, setHasPointer] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    setHasPointer(media.matches);
    const handler = (e) => setHasPointer(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || !hasPointer || shouldReduceMotion) return;

    const handleMouseMove = (e) => {
      if (!isHoveredRef.current) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        if (enableTilt) {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -tiltMax;
          const rotateY = ((x - centerX) / centerX) * tiltMax;
          card.style.setProperty('--tilt-x', `${rotateX}deg`);
          card.style.setProperty('--tilt-y', `${rotateY}deg`);
        }
      });
    };

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      card.style.setProperty('--bento-opacity', '1');
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      card.style.setProperty('--bento-opacity', '0');
      if (enableTilt) {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      }
    };

    card.addEventListener('mousemove', handleMouseMove, { passive: true });
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [hasPointer, shouldReduceMotion, enableTilt, tiltMax, cardRef]);

  // Motion component selection
  const MotionComponent = useMemo(() => {
    if (typeof Component === 'string') {
      return motion[Component] || motion.div;
    }
    return motion(Component);
  }, [Component]);

  const cardStyle = {
    '--bento-glow': glowColor,
    '--bento-glow-secondary': glowSecondary,
    '--bento-radius': `${glowRadius}px`,
    ...style,
  };

  return (
    <MotionComponent
      ref={cardRef}
      className={`magic-bento-card ${className}`}
      style={cardStyle}
      variants={variants}
      initial={initial}
      animate={animate}
      whileHover={whileHover}
      whileTap={whileTap}
      onClick={onClick}
      {...rest}
    >
      {/* Background Spotlight Layer */}
      <div className="magic-bento-spotlight" aria-hidden="true" />
      {/* Illuminating Border Layer */}
      <div className="magic-bento-border" aria-hidden="true" />
      {/* Card Content */}
      <div className="magic-bento-content" style={{ position: 'relative', zIndex: 3, width: '100%' }}>
        {children}
      </div>
    </MotionComponent>
  );
});

MagicBentoCard.displayName = 'MagicBentoCard';

/**
 * MagicBentoGrid — Staggered container wrapper for Magic Bento cards
 */
export const MagicBentoGrid = ({
  children,
  className = '',
  stagger = 0.07,
  delay = 0.04,
  style = {},
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  const gridVariants = useMemo(() => ({
    initial: {},
    animate: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : stagger,
        delayChildren: shouldReduceMotion ? 0 : delay,
      },
    },
  }), [shouldReduceMotion, stagger, delay]);

  return (
    <motion.div
      className={`magic-bento-grid ${className}`}
      variants={gridVariants}
      initial="initial"
      animate="animate"
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default MagicBentoCard;
