import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GraduationCap, LogIn, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading: authLoading, login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState(location.state?.message || '');

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
        setErrorMsg('Network Error: Backend API server at http://localhost:5000 is not running. Please start the backend server by running "npm run dev" inside the backend folder.');
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
    <div className="container main-content">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="brand-icon" style={{ margin: '0 auto 1rem', width: '48px', height: '48px' }}>
              <GraduationCap size={28} />
            </div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Login to your CampusConnect account</p>
          </div>

          {infoMsg && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{infoMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
            <div>
              <Link to="/forgot-password" style={{ color: 'var(--slate-600)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                <KeyRound size={15} /> Forgot Password?
              </Link>
            </div>
            <div>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
