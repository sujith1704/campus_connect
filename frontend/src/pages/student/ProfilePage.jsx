import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Shield, Calendar, GraduationCap } from 'lucide-react';
import { formatDate } from '../../utils/date';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container main-content">
      <div className="auth-container" style={{ maxWidth: '600px' }}>
        <div className="auth-card">
          <div className="auth-header">
            <div
              className="brand-icon"
              style={{
                margin: '0 auto 1rem',
                width: '64px',
                height: '64px',
                fontSize: '1.75rem',
                borderRadius: '50%',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h1 className="auth-title">{user?.name}</h1>
            <span className={`user-badge ${user?.role}`} style={{ marginTop: '0.5rem' }}>
              {user?.role} Account
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.15rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Mail size={22} style={{ color: '#f05d4d' }} />
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block', fontWeight: 800, letterSpacing: '0.05em' }}>EMAIL ADDRESS</span>
                <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{user?.email}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.15rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Shield size={22} style={{ color: '#38bdf8' }} />
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block', fontWeight: 800, letterSpacing: '0.05em' }}>USER ROLE</span>
                <strong style={{ fontSize: '1rem', textTransform: 'capitalize', color: '#ffffff' }}>{user?.role}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.15rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Calendar size={22} style={{ color: '#a855f7' }} />
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block', fontWeight: 800, letterSpacing: '0.05em' }}>MEMBER SINCE</span>
                <strong style={{ fontSize: '1rem', color: '#ffffff' }}>
                  {user?.createdAt ? formatDate(user.createdAt) : 'Active Member'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
