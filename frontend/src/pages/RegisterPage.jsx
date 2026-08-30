import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { GraduationCap, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import AuthBackground from '../components/AuthBackground';
import { authCardVariants, alertVariants } from '../utils/animations';

const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
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

const RegisterPage = () => {
  const navigate = useNavigate();

  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
                      <AlertCircle size={18} />
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
                      <CheckCircle size={18} />
                      <span>{successMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Register Form */}
                <form onSubmit={handleSubmit} autoComplete="off">
                  <motion.div className="form-group" variants={staggerItem}>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </motion.div>

                  <motion.div className="form-group" variants={staggerItem}>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your institutional email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </motion.div>

                  <motion.div className="form-group" variants={staggerItem}>
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Create a password (min 6 chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </motion.div>

                  <motion.div className="form-group" variants={staggerItem}>
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      <UserPlus size={18} /> {loading ? 'Creating Account...' : 'Register'}
                    </button>
                  </motion.div>
                </form>

                {/* Footer Link */}
                <motion.div
                  variants={staggerItem}
                  style={{
                    textAlign: 'center',
                    marginTop: '1.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--slate-600)',
                  }}
                >
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    Sign In
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default RegisterPage;
