# Queue Service OAuth Architecture

## Overview

The queue service implements a centralized authentication architecture where all service-to-service communication is authenticated through the **Auth Service**. This approach provides better security, centralized token management, and simplified architecture.

## Architecture Flow

```
┌─────────────┐    OAuth Token    ┌─────────────┐    Validate Token    ┌─────────────┐
│   Company   │ ────────────────► │    Auth     │ ──────────────────► │   Queue     │
│  Service    │                   │  Service    │                     │  Service    │
└─────────────┘                   └─────────────┘                     └─────────────┘
       │                                 │                                   │
       │                                 │                                   │
       │ 1. Get OAuth Token              │ 2. Validate Token                 │ 3. Process Request
       │    (client_credentials)         │    (introspect)                   │
       │                                 │                                   │
       │ 4. Use Token for Queue Access   │                                   │
```

## Key Components

### 1. Auth Service (Central OAuth Provider)
- **Location**: `auth/src/oauth.service.ts`
- **Database**: `auth` database with `client_credentials` and `service_tokens` tables
- **Endpoints**:
  - `POST /oauth/token` - Issue OAuth tokens
  - `POST /oauth/introspect` - Validate tokens
  - `POST /auth/validate-token` - General token validation

### 2. Queue Service (Protected Resource)
- **Location**: `queue/src/guards/auth.guard.ts`
- **Authentication**: Validates tokens through Auth Service
- **No OAuth tables**: Queue service doesn't store OAuth data
- **Endpoints**: All protected by `AuthGuard`

### 3. Company Service (OAuth Client)
- **Location**: `company/src/services/queue-oauth-client.service.ts`
- **Function**: Gets OAuth tokens from Auth Service
- **Usage**: Uses tokens to access Queue Service

## Implementation Details

### Auth Service OAuth Implementation

The Auth Service handles all OAuth 2.0 Client Credentials flow:

```typescript
// auth/src/oauth.service.ts
@Injectable()
export class OAuthService {
  async issueToken(tokenDto: ClientCredentialsTokenDto): Promise<TokenResponseDto> {
    // Validate client credentials
    // Generate JWT token
    // Store token hash for revocation
    // Return access token
  }

  async introspectToken(introspectDto: TokenIntrospectionDto): Promise<TokenIntrospectionResponseDto> {
    // Verify JWT token
    // Check if token is revoked
    // Return token details
  }
}
```

### Queue Service Authentication

The Queue Service validates all requests through the Auth Service:

```typescript
// queue/src/guards/auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract token from request
    // Validate token through Auth Service
    // Attach user/service info to request
    // Allow/deny access
  }
}
```

### Company Service OAuth Client

The Company Service obtains tokens from Auth Service:

```typescript
// company/src/services/queue-oauth-client.service.ts
@Injectable()
export class QueueOAuthClientService {
  async getAccessToken(): Promise<string> {
    // Get client credentials from environment
    // Request token from Auth Service
    // Cache token for reuse
    // Return access token
  }
}
```

## Database Schema

### Auth Service Database (`auth`)

```sql
-- Client credentials for services
CREATE TABLE client_credentials (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(255) UNIQUE NOT NULL,
    client_secret_hash VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    description TEXT,
    scopes TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Service tokens for tracking
CREATE TABLE service_tokens (
    id VARCHAR(36) PRIMARY KEY,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    scopes TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP NULL,
    revoked_reason VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Queue Service Database (`queue_service`)

```sql
-- Only queue-specific tables
CREATE TABLE queue_messages (
    id VARCHAR(36) PRIMARY KEY,
    queue_name VARCHAR(255) NOT NULL,
    message_type VARCHAR(255) NOT NULL,
    payload JSON NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'retry') DEFAULT 'pending',
    -- ... other queue fields
);
```

## Environment Configuration

### Auth Service
```bash
# OAuth configuration
OAUTH_CLIENT_ID=company_service
OAUTH_CLIENT_SECRET=company_secret_123
JWT_SECRET=your-jwt-secret
```

### Queue Service
```bash
# Auth service connection
AUTH_SERVICE_URL=http://auth-service:3000
# Queue configuration
QUEUE_PROVIDER=redis
REDIS_HOST=redis
```

### Company Service
```bash
# Auth service connection
AUTH_SERVICE_URL=http://auth-service:3000
# Queue service connection
QUEUE_SERVICE_URL=http://queue-service:3005
```

## Benefits of This Architecture

### 1. **Centralized Authentication**
- Single source of truth for OAuth tokens
- Consistent token validation across all services
- Easier token revocation and management

### 2. **Security**
- No OAuth secrets stored in multiple services
- Centralized audit trail for service-to-service authentication
- Token introspection for real-time validation

### 3. **Simplified Architecture**
- Queue service focuses only on queue functionality
- Auth service handles all authentication concerns
- Clear separation of responsibilities

### 4. **Scalability**
- Easy to add new services without duplicating OAuth logic
- Centralized client credential management
- Consistent authentication patterns

## Usage Example

### 1. Company Service Gets Token
```typescript
// company/src/services/queue-oauth-client.service.ts
const token = await this.queueOAuthClient.getAccessToken();
// Makes request to: POST http://auth-service:3000/oauth/token
```

### 2. Company Service Accesses Queue
```typescript
// Uses token to access queue service
const response = await this.makeAuthenticatedRequest('/queue/publish', 'POST', messageData);
// Token automatically included in Authorization header
```

### 3. Queue Service Validates Token
```typescript
// queue/src/guards/auth.guard.ts
const isValid = await this.validateTokenThroughAuthService(token);
// Makes request to: POST http://auth-service:3000/auth/validate-token
```

## Migration from Previous Implementation

The previous implementation had OAuth tables in the queue service database. This has been cleaned up:

1. **Removed from Queue Service**:
   - `client_credentials` table
   - `service_tokens` table
   - OAuth controller and service
   - OAuth-specific environment variables

2. **Centralized in Auth Service**:
   - All OAuth tables remain in auth database
   - All OAuth endpoints remain in auth service
   - Token validation centralized

3. **Updated Company Service**:
   - OAuth client now connects to auth service
   - Simplified token management
   - Better error handling

This architecture provides a more secure, maintainable, and scalable solution for service-to-service authentication.
