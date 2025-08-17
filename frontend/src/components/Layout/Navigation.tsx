import React from 'react';
import { NavLink } from 'react-router-dom';
import { navigationConfig } from './navigationConfig';

const Navigation: React.FC = () => {
  return (
    <nav className="space-y-1">
      {navigationConfig.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default Navigation;
