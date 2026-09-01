import React, { useRef, useEffect, useState } from 'react';

const ParticleText = ({ children, className = '', style = {} }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationIdRef = useRef(null);
  const mousePos = useRef({ x: -9999, y: -9999 });
  const [isReduced, setIsReduced] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 900 : false
  );

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReduced(mediaQuery.matches);
    const handleChange = (e) => setIsReduced(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Check for mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
      setupCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize particles from an offscreen rendering of the actual heading text.
  const initializeParticles = (width, height, text, font) => {
    const canvas = canvasRef.current;
    if (!canvas) return [];

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = width;
    sourceCanvas.height = height;
    const ctx = sourceCanvas.getContext('2d');
    if (!ctx) return [];

    ctx.font = font;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    // Extract particles from text pixels
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const particles = [];
    const sampleRate = isMobile ? 4 : 3;
    const particleSize = isMobile ? 1.25 : 1.6;

    for (let y = 0; y < height; y += sampleRate) {
      for (let x = 0; x < width; x += sampleRate) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 128) {

          particles.push({
            x,
            y,
            vx: 0,
            vy: 0,
            originalX: x,
            originalY: y,
            size: particleSize,
            opacity: 0.72 + Math.random() * 0.28,
          });
        }
      }
    }
    return particles;
  };

  // Physics and rendering loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const particles = particlesRef.current;

    // Clear canvas with transparency
    ctx.clearRect(0, 0, width, height);

    // Physics constants
    const repulsionRadius = 70;
    const repulsionForce = 2.5;
    const springForce = 0.06;
    const damping = 0.93;

    // Update and draw particles
    particles.forEach((particle) => {
      const dx = particle.x - mousePos.current.x;
      const dy = particle.y - mousePos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Cursor repulsion (only on desktop)
      if (!isMobile && distance < repulsionRadius && distance > 0) {
        const angle = Math.atan2(dy, dx);
        const force = (1 - distance / repulsionRadius) * repulsionForce;
        particle.vx += Math.cos(angle) * force;
        particle.vy += Math.sin(angle) * force;
      }

      // Spring force toward original position
      const springDx = particle.originalX - particle.x;
      const springDy = particle.originalY - particle.y;
      particle.vx += springDx * springForce;
      particle.vy += springDy * springForce;

      // Apply damping
      particle.vx *= damping;
      particle.vy *= damping;

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Draw particle
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });

    animationIdRef.current = requestAnimationFrame(animate);
  };

  // Setup canvas and start animation
  const setupCanvas = () => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || isReduced) return;

    const heading = container.parentElement;
    const headingStyle = heading ? getComputedStyle(heading) : getComputedStyle(container);
    const width = Math.max(1, Math.floor(heading?.clientWidth || container.clientWidth));
    const font = `${headingStyle.fontWeight} ${headingStyle.fontSize} ${headingStyle.fontFamily}`;
    const height = Math.max(1, Math.ceil(parseFloat(headingStyle.lineHeight) || parseFloat(headingStyle.fontSize) * 1.15));

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const particles = initializeParticles(width, height, String(children), font);
    particlesRef.current = particles;

    if (!animationIdRef.current) {
      animate();
    }
  };

  // Initialize on mount and when text changes
  useEffect(() => {
    if (isReduced) return;

    setupCanvas();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, [children, isReduced, isMobile]);

  // Mouse tracking (desktop only)
  useEffect(() => {
    if (isReduced || isMobile) return;

    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mousePos.current = { x: -9999, y: -9999 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isReduced, isMobile]);

  // Touch tracking (mobile)
  useEffect(() => {
    if (isReduced || !isMobile) return;

    const handleTouchMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas || !e.touches.length) return;

      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    };

    const handleTouchEnd = () => {
      mousePos.current = { x: -9999, y: -9999 };
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isReduced, isMobile]);

  if (isReduced) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`particle-text-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        ...style,
      }}
    >
      {/* Canvas for particle rendering */}
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          cursor: isMobile ? 'auto' : 'pointer',
          pointerEvents: 'auto',
        }}
      />
    </div>
  );
};

export default ParticleText;
