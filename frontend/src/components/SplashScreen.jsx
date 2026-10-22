import React, { useState, useEffect } from 'react';
import '../styles/splash.css';

const SPLASH_SESSION_KEY = 'campusconnect_splash_shown';

const SplashScreen = () => {
  const [showSplash, setShowSplash] = useState(() => {
    try {
      // Only show if not previously shown in this browser session
      return sessionStorage.getItem(SPLASH_SESSION_KEY) !== 'true';
    } catch (e) {
      return false;
    }
  });

  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!showSplash) return;

    // Immediately mark as shown for the current session to ensure F5 / reload NEVER repeats the splash
    try {
      sessionStorage.setItem(SPLASH_SESSION_KEY, 'true');
    } catch (e) {
      // Handle private browsing or restricted environments safely
    }

    // Keep the splash screen and animations active for ~1.8 seconds, then begin smooth fade-out
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1800);

    // Completely unmount splash from DOM after fade-out transition finishes (~2.25 seconds total)
    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2250);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [showSplash]);

  if (!showSplash) {
    return null;
  }

  return (
    <div
      className={`splash-overlay ${isFadingOut ? 'fade-out' : ''}`}
      aria-label="CampusConnect Loading Splash"
      role="status"
    >
      {/* Ambient background glow */}
      <div className="splash-ambient-glow" />

      <div className="splash-card">
        {/* CampusConnect Bespoke Brand Symbol: Graduation Cap + Event Community Network Nodes */}
        <div className="splash-brand-badge">
          <svg
            className="splash-symbol-svg"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="capGrad" x1="10" y1="12" x2="54" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ee5848" />
                <stop offset="55%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <linearGradient id="nodeGrad" x1="16" y1="42" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ee5848" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Graduation Cap Mortarboard Diamond */}
            <path
              d="M32 9L56 20.5L32 32L8 20.5L32 9Z"
              fill="url(#capGrad)"
              filter="url(#glowFilter)"
            />

            {/* Cap Headband / Rim */}
            <path
              d="M18 25.5V33.5C18 39.5 46 39.5 46 33.5V25.5"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />

            {/* Mortarboard Tassel */}
            <path
              d="M48 21.5L48 31.5C48 33 49 34 50.5 34"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="50.5" cy="34" r="1.5" fill="#fbbf24" />

            {/* Connected Community Event Network (Nodes & Links) */}
            {/* Connection Arcs */}
            <path
              d="M17 50Q32 42 47 50"
              stroke="url(#nodeGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="2 3"
              opacity="0.85"
            />
            <path
              d="M32 41V47"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Left Node */}
            <circle cx="17" cy="50" r="3.5" fill="#ee5848" />
            <circle cx="17" cy="50" r="1.5" fill="#ffffff" />

            {/* Center Node */}
            <circle cx="32" cy="47" r="4.5" fill="#a855f7" />
            <circle cx="32" cy="47" r="2" fill="#ffffff" />

            {/* Right Node */}
            <circle cx="47" cy="50" r="3.5" fill="#38bdf8" />
            <circle cx="47" cy="50" r="1.5" fill="#ffffff" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="splash-title">
          <span className="splash-title-campus">Campus</span>
          <span className="splash-title-connect">Connect</span>
        </h1>

        {/* Tagline */}
        <p className="splash-tagline">College Event & Community Platform</p>

        {/* Uiverse.io Loader by SelfMadeSystem */}
        <div className="splash-loader-container">
          <div className="loader">
            {/* Dash Ring */}
            <svg height="46" width="46" viewBox="0 0 130 130" className="inline-block">
              <defs>
                <linearGradient id="splashLoaderGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ee5848" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              <circle
                cx="65"
                cy="65"
                r="57.3"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="8"
              />
              <circle
                cx="65"
                cy="65"
                r="57.3"
                fill="none"
                stroke="url(#splashLoaderGrad1)"
                strokeWidth="8"
                strokeLinecap="round"
                className="dash"
              />
            </svg>

            {/* Spacer */}
            <div className="w-2" />

            {/* Spin Ring */}
            <svg height="46" width="46" viewBox="0 0 130 130" className="inline-block spin">
              <defs>
                <linearGradient id="splashLoaderGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#ee5848" />
                </linearGradient>
              </defs>
              <circle
                cx="65"
                cy="65"
                r="57.3"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="8"
              />
              <circle
                cx="65"
                cy="65"
                r="57.3"
                fill="none"
                stroke="url(#splashLoaderGrad2)"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
