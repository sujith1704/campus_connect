import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Shield, Calendar, GraduationCap } from 'lucide-react';
import { formatDate } from '../../utils/date';
import PageTransition from '../../components/PageTransition';
import { authCardVariants, containerVariants, cardVariants } from '../../utils/animations';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);

  return (
    <PageTransition>
      <div className="container main-content">
        <div className="auth-container" style={{ maxWidth: '600px' }}>
          <motion.div
            className="auth-card"
            variants={authCardVariants}
            initial="initial"
            animate="animate"
          >
            <div className="auth-header">
              <motion.div
                className="brand-icon"
                style={{
                  margin: '0 auto 1rem',
                  width: '64px',
                  height: '64px',
                  fontSize: '1.75rem',
                  borderRadius: '50%',
                }}
                whileHover={{ scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </motion.div>
              <h1 className="auth-title">{user?.name}</h1>
              <span className={`user-badge ${user?.role}`} style={{ marginTop: '0.5rem' }}>
                {user?.role} Account
              </span>
            </div>

            <motion.div
              className="profile-info-grid"
              variants={containerVariants}
              initial="initial"
              animate="animate"
            >
              <motion.div
                variants={cardVariants}
                className="profile-info-card coral"
              >
                <div className="profile-info-icon-wrap coral">
                  <Mail size={22} />
                </div>
                <div>
                  <span className="profile-info-label">EMAIL ADDRESS</span>
                  <strong className="profile-info-value">{user?.email}</strong>
                </div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                className="profile-info-card sky"
              >
                <div className="profile-info-icon-wrap sky">
                  <Shield size={22} />
                </div>
                <div>
                  <span className="profile-info-label">USER ROLE</span>
                  <strong className="profile-info-value" style={{ textTransform: 'capitalize' }}>{user?.role}</strong>
                </div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                className="profile-info-card purple"
              >
                <div className="profile-info-icon-wrap purple">
                  <Calendar size={22} />
                </div>
                <div>
                  <span className="profile-info-label">MEMBER SINCE</span>
                  <strong className="profile-info-value">
                    {user?.createdAt ? formatDate(user.createdAt) : 'Active Member'}
                  </strong>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;
