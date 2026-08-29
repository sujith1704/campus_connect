import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { GraduationCap, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

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
        setErrorMsg('Network Error: Backend API server at http://localhost:5000 is not running. Please start the backend server by running "npm run dev" inside the backend folder.');
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
    <div className="container main-content">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="brand-icon" style={{ margin: '0 auto 1rem', width: '48px', height: '48px' }}>
              <GraduationCap size={28} />
            </div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join CampusConnect as a Student</p>
          </div>

          {errorMsg && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <label className="form-label">I am registering as a:</label>
              <button
                type="button"
                className="btn btn-primary btn-full"
                style={{ width: '100%', cursor: 'default' }}
              >
                Student
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="john.doe@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password (Min 6 chars)</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              <UserPlus size={18} /> {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
