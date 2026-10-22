import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../auth/supabaseClient';
import PageTransition from '../components/PageTransition';
import AuthBackground from '../components/AuthBackground';
import ThreeLoginExperience from '../components/ThreeLoginExperience';
import { authCardVariants } from '../utils/animations';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, LogIn } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Recovery session state
  const [session, setSession] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isRecoverySession, setIsRecoverySession] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initRecoverySession() {
      try {
        const hash = window.location.hash ? window.location.hash.substring(1) : '';
        const search = window.location.search || '';
        const hashParams = new URLSearchParams(hash);
        const searchParams = new URLSearchParams(search);

        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const code = searchParams.get('code');

        // 1. If PKCE authorization code is present in query string
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data?.session) {
            if (isMounted) {
              setSession(data.session);
              setIsRecoverySession(true);
              setIsCheckingSession(false);
            }
            return;
          }
        }

        // 2. If access_token and refresh_token are in URL hash fragment
        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error && data?.session) {
            if (isMounted) {
              setSession(data.session);
              setIsRecoverySession(true);
              setIsCheckingSession(false);
            }
            return;
          }
        }

        // 3. Check if an active session already exists in Supabase local storage
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          if (isMounted) {
            setSession(existingSession);
            setIsRecoverySession(true);
            setIsCheckingSession(false);
          }
          return;
        }

        // 4. If none detected yet, mark as not yet ready but keep listening to onAuthStateChange
        if (isMounted) {
          setIsRecoverySession(false);
          setIsCheckingSession(false);
        }
      } catch (err) {
        console.warn('[Supabase Auth] Recovery init note:', err);
        if (isMounted) {
          setIsRecoverySession(false);
          setIsCheckingSession(false);
        }
      }
    }

    initRecoverySession();

    // Listen for auth state change event (e.g., PASSWORD_RECOVERY or SIGNED_IN)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('[Supabase Auth] ResetPassword auth event:', event, !!currentSession);
      if (!isMounted) return;

      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && currentSession)) {
        setSession(currentSession);
        setIsRecoverySession(true);
        setIsCheckingSession(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newPassword || !confirmPassword) {
      setErrorMsg('Please enter both password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify and try again.');
      return;
    }

    setLoading(true);
    try {
      // 1. Ensure an active session is established before calling updateUser
      let activeSession = session;
      if (!activeSession) {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        activeSession = currentSession;
      }

      // If session is still missing, attempt to re-read tokens from the URL hash
      if (!activeSession) {
        const hash = window.location.hash ? window.location.hash.substring(1) : '';
        const hashParams = new URLSearchParams(hash);
        const at = hashParams.get('access_token');
        const rt = hashParams.get('refresh_token');
        if (at && rt) {
          const { data } = await supabase.auth.setSession({ access_token: at, refresh_token: rt });
          activeSession = data?.session;
        }
      }

      if (!activeSession) {
        throw new Error('Your password reset session is missing or expired. Please request a new password reset link.');
      }

      // 2. Perform the password update via Supabase Auth
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      // 3. Immediately sign out the recovery session so the user is NOT automatically
      // logged into the student portal and must explicitly sign in with their new password
      await supabase.auth.signOut();

      // 4. Show success screen
      setIsSuccess(true);
    } catch (err) {
      console.error('[Supabase Auth] Password update error:', err);
      setErrorMsg(err?.message || 'Could not update password. Your reset link may have expired.');
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
                  <span>Password Security Vault</span>
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

            {/* RIGHT: Reset Password Form Card */}
            <div className="auth-split-form">
              <motion.div
                className="auth-card auth-card-refined"
                variants={authCardVariants}
                initial="initial"
                animate="animate"
              >
                {isSuccess ? (
                  /* Success View */
                  <div>
                    <div className="auth-header">
                      <h2 className="auth-title">
                        Password updated successfully.
                      </h2>
                      <p className="auth-subtitle">
                        You can now sign in with your new password.
                      </p>
                    </div>

                    <div className="auth-alert auth-alert-success" style={{ marginBottom: '1.5rem' }}>
                      <CheckCircle size={18} className="auth-alert-icon" />
                      <span>Password updated successfully.</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate('/login', { replace: true })}
                      className="btn btn-primary auth-submit-btn"
                    >
                      <LogIn size={18} />
                      <span>Back to Login</span>
                    </button>
                  </div>
                ) : (
                  /* Form View */
                  <>
                    <div className="auth-header">
                      <h2 className="auth-title">
                        Create a new password
                      </h2>
                      <p className="auth-subtitle">
                        Enter and confirm your new password below
                      </p>
                    </div>

                    {/* Error Alert */}
                    {errorMsg && (
                      <div className="auth-alert auth-alert-error">
                        <AlertCircle size={18} className="auth-alert-icon" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {!isCheckingSession && !isRecoverySession && (
                      <div
                        className="auth-alert"
                        style={{
                          background: 'rgba(238, 88, 72, 0.12)',
                          border: '1px solid rgba(238, 88, 72, 0.35)',
                          color: '#fca5a5',
                          marginBottom: '1.25rem',
                        }}
                      >
                        <AlertCircle size={18} className="auth-alert-icon" />
                        <span>
                          Please ensure you opened this page via the password reset link sent to your email.
                        </span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} autoComplete="off">
                      <div className="form-group">
                        <label className="form-label" htmlFor="reset-new-password">
                          New Password
                        </label>
                        <div className="input-icon-wrapper">
                          <span className="input-leading-icon">
                            <Lock size={18} />
                          </span>
                          <input
                            id="reset-new-password"
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="form-control form-control-with-icon form-control-with-trailing"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="password-toggle-btn"
                            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '1.4rem' }}>
                        <label className="form-label" htmlFor="reset-confirm-password">
                          Confirm New Password
                        </label>
                        <div className="input-icon-wrapper">
                          <span className="input-leading-icon">
                            <Lock size={18} />
                          </span>
                          <input
                            id="reset-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="form-control form-control-with-icon form-control-with-trailing"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="password-toggle-btn"
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary auth-submit-btn"
                      >
                        <Lock size={18} />
                        <span>{loading ? 'Updating password...' : 'Update Password'}</span>
                      </button>
                    </form>

                    {/* Footer Navigation */}
                    <div className="auth-footer-nav" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                      <Link
                        to="/login"
                        className="auth-register-link"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <ArrowLeft size={16} /> Back to Login
                      </Link>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;
