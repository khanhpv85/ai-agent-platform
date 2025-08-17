-- OAuth Client Credentials and Service Tokens
-- This script creates tables for OAuth 2.0 client credentials flow

USE auth_service;

-- Client Credentials table
CREATE TABLE IF NOT EXISTS client_credentials (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(255) UNIQUE NOT NULL,
    client_secret_hash VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    description TEXT,
    scopes TEXT NOT NULL, -- JSON array of scopes
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_client_id (client_id),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at)
);

-- Service Tokens table for tracking issued tokens
CREATE TABLE IF NOT EXISTS service_tokens (
    id VARCHAR(36) PRIMARY KEY,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    scopes TEXT NOT NULL, -- JSON array of scopes
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP NULL,
    revoked_reason VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token_hash (token_hash),
    INDEX idx_client_id (client_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_revoked_at (revoked_at),
    FOREIGN KEY (client_id) REFERENCES client_credentials(client_id) ON DELETE CASCADE
);

-- Insert default client credentials for services
-- Note: These are example credentials, replace with secure ones in production
INSERT IGNORE INTO client_credentials (
    id, 
    client_id, 
    client_secret_hash, 
    client_name, 
    description, 
    scopes, 
    is_active
) VALUES (
    UUID(),
    'company_service',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.i8eO', -- 'company_secret_123'
    'Company Service',
    'OAuth client for company service',
    '["read", "write", "admin"]',
    TRUE
), (
    UUID(),
    'ai_service',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.i8eO', -- 'ai_secret_123'
    'AI Service',
    'OAuth client for AI service',
    '["read", "write"]',
    TRUE
), (
    UUID(),
    'notifications_service',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.i8eO', -- 'notifications_secret_123'
    'Notifications Service',
    'OAuth client for notifications service',
    '["read", "write"]',
    TRUE
);
