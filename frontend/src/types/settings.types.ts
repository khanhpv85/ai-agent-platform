/**
 * Settings-related types and interfaces
 */

export type SettingsTab = 'profile' | 'security' | 'notifications' | 'appearance' | 'integrations' | 'system';

export interface SettingsTabConfig {
  id: SettingsTab;
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description?: string;
}
