import React from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Zap, 
  Settings as SettingsIcon 
} from 'lucide-react';

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange, className = '' }) => {
  const tabs: Tab[] = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'integrations', name: 'Integrations', icon: Zap },
    { id: 'system', name: 'System', icon: SettingsIcon },
  ];

  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default TabNavigation;
