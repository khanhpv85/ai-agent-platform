import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

interface User {
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface UserMenuProps {
  user: User | null;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, isOpen, onToggle, onLogout }) => {
  return (
    <div className="ml-3 relative">
      <div>
        <button
          type="button"
          className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          onClick={onToggle}
        >
          <UserCircleIcon className="h-8 w-8 text-gray-400" />
          <span className="ml-2 text-gray-700">
            {user?.first_name} {user?.last_name}
          </span>
        </button>
      </div>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <button
            onClick={onLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
