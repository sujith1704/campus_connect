import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { GraduationCap, LogIn, AlertCircle, CheckCircle, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import AuthBackground from '../components/AuthBackground';
import { authCardVariants, alertVariants } from '../utils/animations';
import ThreeLoginExperience from '../components/ThreeLoginExperience';

const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading: authLoading, login, loginWithGoogle } = useContext(AuthContext);

  // Email and password start completely empty
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState(location.state?.message || '');
  const [mascotFocus, setMascotFocus] = useState(null);

  // Auto-dismiss notifications after 3 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  useEffect(() => {
    if (infoMsg) {
      const timer = setTimeout(() => setInfoMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [infoMsg]);

  const from = location.state?.from || null;

  // Redirect logged-in user away from login page to the Home page
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, authLoading, navigate, from]);

  if (authLoading) {
    return (
      <div className="spinner-container container">
        <div className="spinner"></div>
        <p>Loading session...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      if (data && data.user) {
        if (from) {
          navigate(from, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      if (serverMessage) {
        setErrorMsg(serverMessage);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setErrorMsg(
          'Network Error: Backend API server at http://localhost:5000 is not running. Please start the backend server.'
        );
      } else if (err.response?.status === 503) {
        setErrorMsg('Database is unavailable. Start MongoDB or check the MongoDB connection string in backend/.env.');
      } else if (err.message) {
        setErrorMsg(`Server Error: ${err.message}`);
      } else {
        setErrorMsg('Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (authPayload) => {
    try {
      setGoogleLoading(true);
      setErrorMsg('');
      setInfoMsg('');
      const data = await loginWithGoogle(authPayload);
      if (data && data.user) {
        if (from) {
          navigate(from, { replace: true });
        } else if (data.user.role === 'organizer') {
          navigate('/organizer/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      if (serverMessage) {
        setErrorMsg(serverMessage);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setErrorMsg(
          'Network Error: Backend API server at http://localhost:5000 is not running. Please start the backend server.'
        );
      } else if (err.response?.status === 403) {
        setErrorMsg('Unauthorized: No CampusConnect account found for this Google email. Please contact your administrator.');
      } else {
        setErrorMsg(err.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setErrorMsg('');
    setInfoMsg('');

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      setErrorMsg(
        'Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID in frontend/.env and GOOGLE_CLIENT_ID in backend/.env.'
      );
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      setErrorMsg(
        'Google Identity Services is still loading. Please check your network connection and try again.'
      );
      return;
    }

    setGoogleLoading(true);

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'openid email profile',
        prompt: 'select_account',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setGoogleLoading(false);
            if (tokenResponse.error !== 'popup_closed_by_user') {
              setErrorMsg(`Google Sign-In failed: ${tokenResponse.error}`);
            }
            return;
          }

          if (tokenResponse.access_token) {
            await handleGoogleSuccess({ access_token: tokenResponse.access_token });
          } else {
            setGoogleLoading(false);
          }
        },
        error_callback: (err) => {
          setGoogleLoading(false);
          if (err?.type !== 'popup_closed') {
            setErrorMsg('Google Sign-In window was closed or interrupted.');
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (err) {
      setGoogleLoading(false);
      console.error('Error initiating Google OAuth:', err);
      setErrorMsg('Failed to open Google Sign-In window: ' + err.message);
    }
  };

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (response.credential) {
              handleGoogleSuccess({ credential: response.credential });
            }
          },
        });
      } catch (e) {
        console.warn('GSI ID init error:', e);
      }
    }
  }, []);

  return (
    <PageTransition>
      <div className="auth-page-wrapper">
        <AuthBackground />

        <div className="container main-content auth-content-layer">
          <div className="auth-split-container">
            {/* LEFT: Clean 3D Robot Mascot */}
            <div className="auth-split-visual">
              {/* Multi-layered luxury studio background */}
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

              {/* 3D Interactive Mascot Canvas */}
              <div className="auth-robot-canvas-wrapper">
                <ThreeLoginExperience focusTarget={mascotFocus} />
              </div>

              {/* HUD Telemetry Footer */}
              <div className="auth-stage-hud-bottom">
                <span className="hud-footer-code">SYS_ID #CC-MASCOT-03</span>
                <span className="hud-footer-status">CampusConnect Robotics Lab</span>
              </div>
            </div>

            {/* RIGHT: Professional Glass Login Card */}
            <div className="auth-split-form">
              <motion.div
                className="auth-card auth-card-refined"
                variants={authCardVariants}
                initial="initial"
                animate="animate"
              >
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {/* Header with Logo */}
                  <motion.div className="auth-header" variants={staggerItem}>
                    <div className="brand-icon auth-logo-glow" style={{ margin: '0 auto 1rem', width: '48px', height: '48px' }}>
                      <GraduationCap size={26} />
                    </div>
                    <h1 className="auth-title">Sign In</h1>
                  </motion.div>

                  {/* Notifications */}
                  <AnimatePresence mode="wait">
                    {infoMsg && (
                      <motion.div
                        key="info"
                        className="alert alert-success"
                        variants={alertVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <CheckCircle size={17} />
                        <span>{infoMsg}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {errorMsg && (
                      <motion.div
                        key="error"
                        className="alert alert-danger"
                        variants={alertVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <AlertCircle size={17} />
                        <span>{errorMsg}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email & Password Form */}
                  <form onSubmit={handleSubmit} autoComplete="off">
                    <motion.div className="form-group" variants={staggerItem}>
                      <label className="form-label">Email Address</label>
                      <div className="input-icon-wrapper">
                        <Mail size={17} className="input-leading-icon" />
                        <input
                          type="email"
                          className="form-control form-control-with-icon"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setMascotFocus('email')}
                          onBlur={() => setMascotFocus(null)}
                          autoComplete="off"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div className="form-group" variants={staggerItem}>
                      <div className="password-header-row">
                        <label className="form-label">Password</label>
                        <Link
                          to="/forgot-password"
                          className="forgot-password-link"
                        >
                          Forgot Password?
                        </Link>
                      </div>
                      <div className="input-icon-wrapper">
                        <Lock size={17} className="input-leading-icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control form-control-with-icon form-control-with-trailing"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setMascotFocus('password')}
                          onBlur={(event) => {
                            if (event.relatedTarget?.type !== 'password') setMascotFocus(null);
                          }}
                          autoComplete="off"
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? 'Hide password' : 'Show password'}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </motion.div>

                    <motion.div variants={staggerItem} style={{ marginTop: '1.4rem' }}>
                      <button
                        type="submit"
                        className="btn btn-primary btn-full btn-lg auth-submit-btn"
                        disabled={loading || googleLoading}
                      >
                        <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In'}
                      </button>
                    </motion.div>
                  </form>

                  {/* Register Footer */}
                  <motion.div
                    variants={staggerItem}
                    className="auth-footer-nav"
                  >
                    <span>Don't have an account?</span>{' '}
                    <Link to="/register" className="auth-register-link">
                      Register
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
