import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthProvider';
import PageTransition from '../components/PageTransition';
import AuthBackground from '../components/AuthBackground';
import ThreeLoginExperience from '../components/ThreeLoginExperience';
import { authCardVariants } from '../utils/animations';
import { Mail, Lock, UserPlus, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerWithEmail, loginWithGoogle, isAuthenticated, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If already authenticated, redirect straight to Home page
  useEffect(() => {
    if (location.state?.loggedOut) {
      return;
    }
    if (isAuthenticated && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email and a password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const data = await registerWithEmail(email, password, {
        role: 'student',
      });

      // If Supabase immediately returns a session (email auto-confirm is enabled in Supabase)
      if (data?.session) {
        navigate('/', { replace: true });
      } else {
        // If email confirmation is enabled on Supabase project
        setSuccessMsg('Account created successfully! If confirmation email is enabled, please check your inbox, or you can sign in directly.');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1200);
      }
    } catch (err) {
      console.error('[Supabase Auth] Registration error:', err);
      setErrorMsg(err?.message || 'Could not complete registration. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMsg('');
    try {
      await loginWithGoogle();
      // Supabase redirects to Google OAuth
    } catch (err) {
      console.error('[Supabase Auth] Google OAuth error:', err);
      setErrorMsg(err?.message || 'Google sign-up could not be initiated. Please try again.');
    }
  };

  if (authLoading) {
    return (
      <div className="spinner-container container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', color: '#9ab0c8', fontSize: '0.95rem' }}>Loading session...</p>
      </div>
    );
  }

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
                  <span>Interactive Campus Trio</span>
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

            {/* RIGHT: Supabase Registration Form */}
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
                    Create Account
                  </h2>
                  <p className="auth-subtitle">
                    Join CampusConnect to explore and register for campus events
                  </p>
                </div>

                {/* Visible Success Alert */}
                {successMsg && (
                  <div className="auth-alert auth-alert-success">
                    <CheckCircle size={18} className="auth-alert-icon" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Visible Error Alert */}
                {errorMsg && (
                  <div className="auth-alert auth-alert-error">
                    <AlertCircle size={18} className="auth-alert-icon" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Google Sign Up Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="btn-google-login"
                >
                  <span className="google-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </span>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="auth-divider">
                  <span>or</span>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="form-group">
                    <label className="form-label" htmlFor="register-email">
                      Email Address
                    </label>
                    <div className="input-icon-wrapper">
                      <span className="input-leading-icon">
                        <Mail size={18} />
                      </span>
                      <input
                        id="register-email"
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

                  <div className="form-group" style={{ marginBottom: '1.4rem' }}>
                    <label className="form-label" htmlFor="register-password">
                      Password
                    </label>
                    <div className="input-icon-wrapper">
                      <span className="input-leading-icon">
                        <Lock size={18} />
                      </span>
                      <input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Choose a password (min. 6 characters)"
                        className="form-control form-control-with-icon form-control-with-trailing"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle-btn"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary auth-submit-btn"
                  >
                    <UserPlus size={18} />
                    <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                  </button>
                </form>

                {/* Footer Navigation */}
                <div className="auth-footer-nav">
                  <span>Already have an account? </span>
                  <Link to="/login" className="auth-register-link">
                    Sign In
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Register;
