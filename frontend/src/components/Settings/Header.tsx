import React from 'react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <div className={className}>
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="mt-1 text-sm text-gray-600">
        Manage your account settings and preferences
      </p>
    </div>
  );
};

export default Header;
