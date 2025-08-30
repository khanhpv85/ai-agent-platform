import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Header, 
  TabNavigation, 
  ProfileTab, 
  SecurityTab, 
  NotificationsTab, 
  AppearanceTab, 
  IntegrationsTab, 
  SystemTab,
  ApiKeyManagement
} from '@components/Settings';
import { SettingsTab } from '@types';

const Settings: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get initial tab from URL hash or default to 'profile'
  const getInitialTab = (): SettingsTab => {
    const hash = location.hash.replace('#', '');
    const validTabs: SettingsTab[] = ['profile', 'security', 'notifications', 'appearance', 'integrations', 'api-keys', 'system'];
    return validTabs.includes(hash as SettingsTab) ? (hash as SettingsTab) : 'profile';
  };

  const [activeTab, setActiveTab] = useState<SettingsTab>(getInitialTab);

  // Update URL hash when tab changes
  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    navigate(`/settings#${tab}`, { replace: true });
  };

  // Listen for hash changes (e.g., browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const newTab = getInitialTab();
      if (newTab !== activeTab) {
        setActiveTab(newTab);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab, location.hash]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'security':
        return <SecurityTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'appearance':
        return <AppearanceTab />;
      case 'integrations':
        return <IntegrationsTab />;
      case 'api-keys':
        return <ApiKeyManagement />;
      case 'system':
        return <SystemTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="space-y-4">
      <Header />
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Settings;
