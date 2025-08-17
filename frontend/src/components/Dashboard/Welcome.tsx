import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';

interface WelcomeProps {
  className?: string;
}

const Welcome: React.FC<WelcomeProps> = ({ className = '' }) => {
  const auth = useSelector((state: RootState) => state.auth);

  return (
    <div className={`bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white ${className}`}>
      <h1 className="text-2xl font-bold mb-2">
        Welcome back, {auth.user?.first_name || 'User'}!
      </h1>
      <p className="text-primary-100">
        Here's what's happening with your AI agents and workflows today.
      </p>
    </div>
  );
};

export default Welcome;
