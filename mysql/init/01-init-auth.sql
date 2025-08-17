-- Auth Service Database Initialization
-- This script creates only auth-related tables in a separate database

-- Create auth service database
CREATE DATABASE IF NOT EXISTS auth_service;
USE auth_service;

-- Users table with enhanced auth features (auth service only)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user', 'manager') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    -- Enhanced auth fields
    refresh_token VARCHAR(500) NULL,
    refresh_token_expires_at TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255) NULL,
    email_verification_expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Refresh tokens table for better security
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_ip VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User sessions table for better session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    session_token TEXT NOT NULL,
    refresh_token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    refresh_expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info JSON,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Auth audit log table for auth events
CREATE TABLE IF NOT EXISTS auth_audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    event_type ENUM('login', 'logout', 'login_failed', 'password_change', 'password_reset', 'account_lock', 'account_unlock', 'email_verification', 'refresh_token') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for auth database
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_refresh_token ON users(refresh_token);
CREATE INDEX idx_users_email_verification ON users(email_verification_token);
CREATE INDEX idx_users_last_login ON users(last_login_at);

-- Create indexes for auth-related tables
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_revoked ON refresh_tokens(is_revoked);

CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_refresh ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);

CREATE INDEX idx_auth_audit_user ON auth_audit_logs(user_id);
CREATE INDEX idx_auth_audit_event ON auth_audit_logs(event_type);
CREATE INDEX idx_auth_audit_created ON auth_audit_logs(created_at);
CREATE INDEX idx_auth_audit_success ON auth_audit_logs(success);

-- Add security constraints
ALTER TABLE users 
ADD CONSTRAINT chk_login_attempts CHECK (login_attempts >= 0),
ADD CONSTRAINT chk_password_length CHECK (LENGTH(password_hash) >= 60);

-- Create a view for user authentication status
CREATE OR REPLACE VIEW user_auth_status AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    u.is_active,
    u.email_verified,
    u.last_login_at,
    u.login_attempts,
    u.locked_until,
    CASE 
        WHEN u.locked_until IS NOT NULL AND u.locked_until > NOW() THEN 'locked'
        WHEN u.login_attempts >= 5 THEN 'suspicious'
        WHEN u.email_verified = FALSE THEN 'unverified'
        ELSE 'active'
    END as auth_status,
    COUNT(us.id) as active_sessions
FROM users u
LEFT JOIN user_sessions us ON u.id = us.user_id AND us.is_active = TRUE AND us.expires_at > NOW()
GROUP BY u.id;

-- Insert default admin user (password: admin123) with enhanced auth fields
INSERT IGNORE INTO users (
    id, 
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role,
    email_verified,
    password_changed_at
) VALUES (
    'admin-001', 
    'admin@aiagentplatform.com', 
    '$2a$12$htYUWStIG8WIrF6LhAOfIOKDkJmtFcd2grq35I4LHf3kKiBec0x1.', 
    'Admin', 
    'User', 
    'admin',
    TRUE,
    CURRENT_TIMESTAMP
);

-- Grant permissions to ai_user for auth_service database
GRANT ALL PRIVILEGES ON auth_service.* TO 'ai_user'@'%';
FLUSH PRIVILEGES;
