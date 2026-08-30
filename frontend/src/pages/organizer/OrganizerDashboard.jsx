import React from 'react';
import OrganizerControlDesk from '../../components/OrganizerControlDesk';
import PageTransition from '../../components/PageTransition';

const OrganizerDashboard = () => {
  return (
    <PageTransition>
      <div className="container main-content">
        <OrganizerControlDesk />
      </div>
    </PageTransition>
  );
};

export default OrganizerDashboard;
