import React, { useEffect, useRef, useState } from 'react';

const LoginMascot = ({ focusTarget = null }) => {
  const mascotRef = useRef(null);
  const frameRef = useRef(null);
  const previousPointerRef = useRef(null);
  const currentRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const followStrengthRef = useRef(0.09);
  const desiredStrengthRef = useRef(0.09);
  const [canTrackPointer, setCanTrackPointer] = useState(false);

  useEffect(() => {
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updatePointerSupport = () => setCanTrackPointer(pointerQuery.matches);
    updatePointerSupport();
    pointerQuery.addEventListener('change', updatePointerSupport);

    return () => pointerQuery.removeEventListener('change', updatePointerSupport);
  }, []);

  useEffect(() => {
    if (!canTrackPointer || focusTarget === 'password') return undefined;

    const animate = () => {
      followStrengthRef.current += (desiredStrengthRef.current - followStrengthRef.current) * 0.12;
      const followStrength = followStrengthRef.current;
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * followStrength;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * followStrength;

      if (mascotRef.current) {
        mascotRef.current.style.setProperty('--look-x', `${currentRef.current.x}px`);
        mascotRef.current.style.setProperty('--look-y', `${currentRef.current.y}px`);
        mascotRef.current.style.setProperty('--head-x', `${currentRef.current.x * 0.18}px`);
        mascotRef.current.style.setProperty('--head-y', `${currentRef.current.y * 0.12}px`);
      }

      const settled = Math.abs(targetRef.current.x - currentRef.current.x) < 0.05
        && Math.abs(targetRef.current.y - currentRef.current.y) < 0.05;
      frameRef.current = settled ? null : window.requestAnimationFrame(animate);
    };

    const updateTarget = (event) => {
      const now = performance.now();
      const previousPointer = previousPointerRef.current;
      if (previousPointer) {
        const distance = Math.hypot(event.clientX - previousPointer.x, event.clientY - previousPointer.y);
        const elapsed = Math.max(now - previousPointer.time, 1);
        const speed = distance / elapsed;
        desiredStrengthRef.current = 0.08 + Math.min(speed / 2.5, 0.24);
      }
      previousPointerRef.current = { x: event.clientX, y: event.clientY, time: now };

      const pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      const pointerY = (event.clientY / window.innerHeight) * 2 - 1;
      targetRef.current = { x: pointerX * 7, y: pointerY * 5 };

      if (!frameRef.current) {
        frameRef.current = window.requestAnimationFrame(animate);
      }
    };

    window.addEventListener('mousemove', updateTarget, { passive: true });

    return () => {
      window.removeEventListener('mousemove', updateTarget);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [canTrackPointer, focusTarget]);

  return (
    <div
      ref={mascotRef}
      className={`login-mascot ${focusTarget ? `login-mascot-focus-${focusTarget}` : ''}`}
      aria-hidden="true"
    >
      <div className="login-mascot-aura" />
      <div className="login-mascot-antenna"><span /></div>
      <div className="login-mascot-head">
        <div className="login-mascot-face-panel">
          <div className="login-mascot-eye"><span /></div>
          <div className="login-mascot-eye"><span /></div>
          <div className="login-mascot-mouth" />
        </div>
      </div>
      <div className="login-mascot-body">
        <div className="login-mascot-badge">CC</div>
        <div className="login-mascot-chest-light" />
      </div>
      <div className="login-mascot-leg login-mascot-leg-left"><div className="login-mascot-foot" /></div>
      <div className="login-mascot-leg login-mascot-leg-right"><div className="login-mascot-foot" /></div>
      <div className="login-mascot-shadow" />
    </div>
  );
};

export default LoginMascot;
