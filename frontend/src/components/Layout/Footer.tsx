import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            © 2024 AI Agent Platform. All rights reserved.
          </div>
          <div className="text-sm text-gray-500">
            Version 1.0.0
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
