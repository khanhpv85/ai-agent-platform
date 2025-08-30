import {
  HomeIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  QueueListIcon,
  BuildingOfficeIcon,
  ChartPieIcon,
  PuzzlePieceIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { ROUTES, ROUTE_NAMES } from '@router';

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const navigationConfig: NavigationItem[] = [
  { name: ROUTE_NAMES[ROUTES.DASHBOARD], href: ROUTES.DASHBOARD, icon: HomeIcon },
  { name: ROUTE_NAMES[ROUTES.USERS], href: ROUTES.USERS, icon: UsersIcon },
  { name: ROUTE_NAMES[ROUTES.COMPANIES], href: ROUTES.COMPANIES, icon: BuildingOfficeIcon },
  { name: ROUTE_NAMES[ROUTES.AGENTS], href: ROUTES.AGENTS, icon: UserGroupIcon },
  { name: ROUTE_NAMES[ROUTES.INTEGRATIONS], href: ROUTES.INTEGRATIONS, icon: PuzzlePieceIcon },
  { name: ROUTE_NAMES[ROUTES.WORKFLOWS], href: ROUTES.WORKFLOWS, icon: ChartBarIcon },
  { name: ROUTE_NAMES[ROUTES.QUEUE], href: ROUTES.QUEUE, icon: QueueListIcon },
  { name: ROUTE_NAMES[ROUTES.ANALYTICS], href: ROUTES.ANALYTICS, icon: ChartPieIcon },
  { name: ROUTE_NAMES[ROUTES.SETTINGS], href: ROUTES.SETTINGS, icon: CogIcon },
];
