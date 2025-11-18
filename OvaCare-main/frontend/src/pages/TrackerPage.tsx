import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PeriodTracker from '../components/PeriodTracker';

const TrackerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <PeriodTracker />
      </div>
      <Footer />
    </div>
  );
};

export default TrackerPage;