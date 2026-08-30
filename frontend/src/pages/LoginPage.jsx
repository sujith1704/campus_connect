import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { GraduationCap, LogIn, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import AuthBackground from '../components/AuthBackground';
import { authCardVariants, alertVariants } from '../utils/animations';

const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading: authLoading, login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState(location.state?.message || '');

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
          'Network Error: Backend API server at http://localhost:5000 is not running. Please start the backend server by running "npm run dev" inside the backend folder.'
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

  return (
    <PageTransition>
      <div className="auth-page-wrapper">
        <AuthBackground />

        <div className="container main-content auth-content-layer">
          <div className="auth-container">
            <motion.div
              className="auth-card"
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
                  <motion.div
                    className="brand-icon auth-logo-glow"
                    style={{ margin: '0 auto 1.25rem', width: '52px', height: '52px' }}
                    whileHover={{ scale: 1.1, rotate: 6 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <GraduationCap size={30} />
                  </motion.div>
                  <h1 className="auth-title">Welcome Back</h1>
                  <p className="auth-subtitle">Login to your CampusConnect account</p>
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
                      <CheckCircle size={18} />
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
                      <AlertCircle size={18} />
                      <span>{errorMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login Form */}
                <form onSubmit={handleSubmit} autoComplete="off">
                  <motion.div className="form-group" variants={staggerItem}>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </motion.div>

                  <motion.div className="form-group" variants={staggerItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="form-label">Password</label>
                      <Link
                        to="/forgot-password"
                        style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600 }}
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </motion.div>

                  <motion.div variants={staggerItem}>
                    <button
                      type="submit"
                      className="btn btn-primary btn-full btn-lg"
                      disabled={loading}
                    >
                      <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                  </motion.div>
                </form>

                {/* Footer Links */}
                <motion.div
                  variants={staggerItem}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    textAlign: 'center',
                    marginTop: '1.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--slate-600)',
                  }}
                >
                  <div>
                    <Link
                      to="/forgot-password"
                      style={{
                        color: 'var(--slate-600)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontWeight: 600,
                      }}
                    >
                      <KeyRound size={15} /> Forgot Password?
                    </Link>
                  </div>
                  <div>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      Register
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
