import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../auth/supabaseClient';
import PageTransition from '../components/PageTransition';
import AuthBackground from '../components/AuthBackground';
import ThreeLoginExperience from '../components/ThreeLoginExperience';
import { authCardVariants } from '../utils/animations';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo,
      });

      if (error) throw error;

      setSuccessMsg("We've sent a password reset link to your email. Please check your inbox.");
    } catch (err) {
      console.error('[Supabase Auth] Forgot Password error:', err);
      setErrorMsg(err?.message || 'Could not send reset link. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="auth-page-wrapper">
        <AuthBackground />

        <div className="container main-content auth-content-layer">
          <div className="auth-split-container">
            {/* LEFT: 3D Robot Mascot & Stage */}
            <div className="auth-split-visual">
              <div className="auth-stage-spotlight" />
              <div className="auth-stage-ambient-glow" />
              <div className="auth-stage-grid" />
              <div className="auth-stage-floor-grid" />
              <div className="auth-stage-scanline" />
              <div className="auth-stage-border-beam" />

              {/* HUD Telemetry Header */}
              <div className="auth-stage-hud-top">
                <div className="hud-metric">
                  <span className="hud-metric-dot" />
                  <span>AI_LAB // ACTIVE</span>
                </div>
                <div className="auth-stage-pill">
                  <span className="stage-pill-dot" />
                  <span>Password Recovery Portal</span>
                </div>
                <div className="hud-metric hud-metric-right">
                  <span>SYNC // 60FPS</span>
                </div>
              </div>

              {/* 3D Mascot Canvas */}
              <div className="auth-robot-canvas-wrapper">
                <ThreeLoginExperience focusTarget={null} />
              </div>

              {/* HUD Telemetry Footer */}
              <div className="auth-stage-hud-bottom">
                <span className="hud-footer-code">SYS_ID #CC-MASCOT-03</span>
                <span className="hud-footer-status">CampusConnect Robotics Lab</span>
              </div>
            </div>

            {/* RIGHT: Standalone Forgot Password Form */}
            <div className="auth-split-form">
              <motion.div
                className="auth-card auth-card-refined"
                variants={authCardVariants}
                initial="initial"
                animate="animate"
              >
                {/* Header */}
                <div className="auth-header">
                  <h2 className="auth-title">
                    Reset your password
                  </h2>
                  <p className="auth-subtitle">
                    Enter your email address and we'll send you a password reset link.
                  </p>
                </div>

                {/* Visible Error Alert */}
                {errorMsg && (
                  <div className="auth-alert auth-alert-error">
                    <AlertCircle size={18} className="auth-alert-icon" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Visible Success Alert */}
                {successMsg && (
                  <div className="auth-alert auth-alert-success">
                    <CheckCircle size={18} className="auth-alert-icon" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="form-group" style={{ marginBottom: '1.4rem' }}>
                    <label className="form-label" htmlFor="forgot-email">
                      Email Address
                    </label>
                    <div className="input-icon-wrapper">
                      <span className="input-leading-icon">
                        <Mail size={18} />
                      </span>
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="form-control form-control-with-icon"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary auth-submit-btn"
                  >
                    <Mail size={18} />
                    <span>{loading ? 'Sending link...' : 'Send Reset Link'}</span>
                  </button>

                  <div className="auth-footer-nav" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <Link
                      to="/login"
                      className="auth-register-link"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <ArrowLeft size={16} /> Back to Login
                    </Link>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ForgotPassword;
