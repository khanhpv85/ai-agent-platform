/**
 * Integration-related types and enums
 */

export enum IntegrationType {
  SLACK = 'slack',
  EMAIL = 'email',
  CALENDAR = 'calendar',
  CRM = 'crm',
  CUSTOM = 'custom',
}

export enum SourceType {
  S3 = 's3',
  GOOGLE_DRIVE = 'google_drive',
  LOCAL = 'local',
  API = 'api',
}
