import React, { useState, useContext, useEffect, useRef } from 'react';
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
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

// Lazy-load the mascot only on non-touch devices (it's purely decorative)
const LoginMascotLazy = React.lazy(() => import('../components/LoginMascot'));
// Feature-detect hover/pointer support once at module level
const hasFinePointer =
  typeof window !== 'undefined'
    ? window.matchMedia('(hover: hover) and (pointer: fine)').matches
    : false;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading: authLoading, login, loginWithGoogle } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState(location.state?.message || '');
  const [mascotFocus, setMascotFocus] = useState(null);
  // Mount mascot after first paint — it's decorative and should not block UI
  const [showMascot, setShowMascot] = useState(false);

  useEffect(() => {
    // Only load the mascot on devices with fine pointer (desktop/laptop)
    // Touch devices get it hidden via CSS already, so avoid the overhead entirely
    if (!hasFinePointer) return;
    let raf1 = requestAnimationFrame(() => {
      let raf2 = requestAnimationFrame(() => setShowMascot(true));
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, []);

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
          <div className="auth-container">
            {showMascot && (
              <React.Suspense fallback={null}>
                <LoginMascotLazy focusTarget={mascotFocus} />
              </React.Suspense>
            )}
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
                  <h1 className="auth-title">Sign In</h1>
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
                      onFocus={() => setMascotFocus('email')}
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
                      onFocus={() => setMascotFocus('password')}
                      onBlur={(event) => {
                        if (event.relatedTarget?.type !== 'password') setMascotFocus(null);
                      }}
                      autoComplete="off"
                      required
                    />
                  </motion.div>

                  <motion.div variants={staggerItem}>
                    <button
                      type="submit"
                      className="btn btn-primary btn-full btn-lg"
                      disabled={loading || googleLoading}
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
