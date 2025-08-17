// Route constants
export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Protected routes
  DASHBOARD: '/',
  AGENTS: '/agents',
  WORKFLOWS: '/workflows',
  QUEUE: '/queue',
  SETTINGS: '/settings',
  COMPANIES: '/companies',
  ANALYTICS: '/analytics',
  INTEGRATIONS: '/integrations',
} as const;

// Route names for navigation
export const ROUTE_NAMES = {
  [ROUTES.LOGIN]: 'Login',
  [ROUTES.REGISTER]: 'Register',
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.AGENTS]: 'Agents',
  [ROUTES.WORKFLOWS]: 'Workflows',
  [ROUTES.QUEUE]: 'Queue',
  [ROUTES.SETTINGS]: 'Settings',
  [ROUTES.COMPANIES]: 'Companies',
  [ROUTES.ANALYTICS]: 'Analytics',
  [ROUTES.INTEGRATIONS]: 'Integrations',
} as const;
