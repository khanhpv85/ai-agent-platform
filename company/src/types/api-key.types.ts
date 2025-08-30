export enum ApiKeyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

export enum ApiKeyPermission {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
  WORKFLOW_EXECUTE = 'workflow_execute',
  CHAT = 'chat'
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  company_id: string;
  created_by: string;
  status: ApiKeyStatus;
  permissions: ApiKeyPermission[];
  expires_at?: Date;
  last_used_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ApiKeyValidationResult {
  company_id: string;
  user_id: string;
  plan: string;
  permissions: ApiKeyPermission[];
  internal_token: string;
}
