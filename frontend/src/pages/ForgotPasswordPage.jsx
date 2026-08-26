import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { GraduationCap, Mail, ArrowLeft, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

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
    <div className="container main-content">
      <div className="auth-container">
        <div className="auth-card">
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>

          <div className="auth-header">
            <div className="brand-icon" style={{ margin: '0 auto 1rem', width: '48px', height: '48px' }}>
              <GraduationCap size={28} />
            </div>
            <h1 className="auth-title">Forgot Password</h1>
            <p className="auth-subtitle">Enter your registered email address to reset your password</p>
          </div>

          {errorMsg && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successData && (
            <div className="alert alert-success" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <CheckCircle size={18} /> Password Reset Link Generated!
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                {successData.message}
              </p>

              {/* Safe Development Link Display */}
              {successData.resetUrl && (
                <div style={{ marginTop: '0.5rem', width: '100%', padding: '0.75rem', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block', fontWeight: 600 }}>DEVELOPMENT RESET LINK:</span>
                  <Link
                    to={successData.resetUrl}
                    style={{ color: 'var(--primary)', fontWeight: 700, wordBreak: 'break-all', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem' }}
                  >
                    Click here to reset password <ExternalLink size={14} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {!successData && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Registered Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="student@campusconnect.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                <Mail size={18} /> {loading ? 'Checking Email...' : 'Send Password Reset Link'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
            Remembered your password?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
