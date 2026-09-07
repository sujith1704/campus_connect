import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { GraduationCap, UserPlus, AlertCircle, CheckCircle, User, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import AuthBackground from '../components/AuthBackground';
import ThreeLoginExperience from '../components/ThreeLoginExperience';
import { authCardVariants, alertVariants } from '../utils/animations';

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

const RegisterPage = () => {
  const navigate = useNavigate();

  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mascotFocus, setMascotFocus] = useState(null);

  // Auto-dismiss notifications after 3 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Redirect logged-in user away from register page
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, authLoading, navigate]);

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
    setSuccessMsg('');

    if (!name || !name.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }

    if (!email || !email.trim()) {
      setErrorMsg('Email address is required.');
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMsg('Please enter both password fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password: password,
        role: 'student',
      };

      const res = await API.post('/auth/register', payload);

      if (res.data.success) {
        setSuccessMsg('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Registration successful! You can now log in with your credentials.' },
            replace: true,
          });
        }, 1500);
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      if (serverMessage) {
        setErrorMsg(serverMessage);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setErrorMsg(
          'Network Error: Backend API server at http://localhost:5000 is not running. Please start the backend server by running "npm run dev" inside the backend folder.'
        );
      } else if (err.response?.status === 503) {
        setErrorMsg('Database is unavailable. Start MongoDB or check the MongoDB connection string in backend/.env.');
      } else if (err.message) {
        setErrorMsg(`Server Error: ${err.message}`);
      } else {
        setErrorMsg('Failed to create account. Unable to connect to server.');
      }
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

            {/* RIGHT: Register Card */}
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
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join CampusConnect as a Student</p>
                  </motion.div>

                  {/* Notifications */}
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

                  <AnimatePresence mode="wait">
                    {successMsg && (
                      <motion.div
                        key="success"
                        className="alert alert-success"
                        variants={alertVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <CheckCircle size={17} />
                        <span>{successMsg}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Register Form */}
                  <form onSubmit={handleSubmit} autoComplete="off">
                    <motion.div className="form-group" variants={staggerItem}>
                      <label className="form-label" htmlFor="register-name">Full Name</label>
                      <div className="input-icon-wrapper">
                        <User size={17} className="input-leading-icon" />
                        <input
                          id="register-name"
                          name="fullName"
                          type="text"
                          className="form-control form-control-with-icon"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onFocus={() => setMascotFocus('email')}
                          onBlur={() => setMascotFocus(null)}
                          autoComplete="off"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div className="form-group" variants={staggerItem}>
                      <label className="form-label" htmlFor="register-email">Email Address</label>
                      <div className="input-icon-wrapper">
                        <Mail size={17} className="input-leading-icon" />
                        <input
                          id="register-email"
                          name="registerEmail"
                          type="email"
                          className="form-control form-control-with-icon"
                          placeholder="Enter your institutional email"
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
                      <label className="form-label" htmlFor="register-password">Password</label>
                      <div className="input-icon-wrapper">
                        <Lock size={17} className="input-leading-icon" />
                        <input
                          id="register-password"
                          name="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          className="form-control form-control-with-icon form-control-with-trailing"
                          placeholder="Create a password (min 6 chars)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setMascotFocus('password')}
                          onBlur={(event) => {
                            if (event.relatedTarget?.type !== 'password') setMascotFocus(null);
                          }}
                          autoComplete="new-password"
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

                    <motion.div className="form-group" variants={staggerItem}>
                      <label className="form-label" htmlFor="register-confirm-password">Confirm Password</label>
                      <div className="input-icon-wrapper">
                        <Lock size={17} className="input-leading-icon" />
                        <input
                          id="register-confirm-password"
                          name="confirmNewPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="form-control form-control-with-icon form-control-with-trailing"
                          placeholder="Re-enter your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onFocus={() => setMascotFocus('password')}
                          onBlur={(event) => {
                            if (event.relatedTarget?.type !== 'password') setMascotFocus(null);
                          }}
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          title={showConfirmPassword ? 'Hide password' : 'Show password'}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </motion.div>

                    <motion.div variants={staggerItem} style={{ marginTop: '1.4rem' }}>
                      <button
                        type="submit"
                        className="btn btn-primary btn-full btn-lg auth-submit-btn"
                        disabled={loading}
                      >
                        <UserPlus size={18} /> {loading ? 'Creating Account...' : 'Register'}
                      </button>
                    </motion.div>
                  </form>

                  {/* Footer Link */}
                  <motion.div
                    variants={staggerItem}
                    className="auth-footer-nav"
                  >
                    <span>Already have an account?</span>{' '}
                    <Link to="/login" className="auth-register-link">
                      Sign In
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

export default RegisterPage;
