import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import { GraduationCap, Mail, ArrowLeft, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
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

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Auto-dismiss notification after 3 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessData(null);

    if (!email) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await API.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSuccessData(res.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'No account found with that email address.');
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
                <motion.div variants={staggerItem}>
                  <Link
                    to="/login"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--slate-600)',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <ArrowLeft size={16} /> Back to Login
                  </Link>
                </motion.div>

                <motion.div className="auth-header" variants={staggerItem}>
                  <motion.div
                    className="brand-icon auth-logo-glow"
                    style={{ margin: '0 auto 1.25rem', width: '52px', height: '52px' }}
                    whileHover={{ scale: 1.1, rotate: 6 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <GraduationCap size={30} />
                  </motion.div>
                  <h1 className="auth-title">Forgot Password</h1>
                  <p className="auth-subtitle">Enter your registered email address to reset your password</p>
                </motion.div>

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
                  {successData && (
                    <motion.div
                      key="success"
                      className="alert alert-success"
                      style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}
                      variants={alertVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                        <CheckCircle size={18} /> Password Reset Link Generated!
                      </div>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                        {successData.message}
                      </p>

                      {/* Safe Development Link Display */}
                      {successData.resetUrl && (
                        <div
                          style={{
                            marginTop: '0.5rem',
                            width: '100%',
                            padding: '0.75rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid rgba(52, 211, 153, 0.3)',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--slate-400)',
                              display: 'block',
                              fontWeight: 600,
                            }}
                          >
                            DEVELOPMENT RESET LINK:
                          </span>
                          <Link
                            to={successData.resetUrl}
                            style={{
                              color: 'var(--primary)',
                              fontWeight: 700,
                              wordBreak: 'break-all',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              marginTop: '0.25rem',
                            }}
                          >
                            Click here to reset password <ExternalLink size={14} />
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!successData && (
                  <form onSubmit={handleSubmit}>
                    <motion.div className="form-group" variants={staggerItem}>
                      <label className="form-label">Registered Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="student@campusconnect.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <button
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        disabled={loading}
                      >
                        <Mail size={18} /> {loading ? 'Sending link...' : 'Send Reset Link'}
                      </button>
                    </motion.div>
                  </form>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ForgotPasswordPage;
