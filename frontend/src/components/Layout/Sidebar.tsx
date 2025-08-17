import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { navigationConfig } from './navigationConfig';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}



const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
            onClick={onClose}
          />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-16' : 'w-64'}
        lg:relative lg:translate-x-0 lg:inset-auto lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-primary-600 truncate">
              AI Agent Platform
            </h1>
          )}
          
          <div className="flex items-center gap-2">
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
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
                title={isCollapsed ? item.name : undefined}
                onClick={onClose}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-3 truncate">{item.name}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        {/* {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Admin User
                </p>
                <p className="text-xs text-gray-500 truncate">
                  admin@example.com
                </p>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </>
  );
};

export default Sidebar;
