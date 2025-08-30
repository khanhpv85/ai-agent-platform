-- Create API Keys table
USE company_service;

CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    `key` TEXT NOT NULL,
    company_id VARCHAR(36) NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    status ENUM('active', 'inactive', 'expired', 'revoked') DEFAULT 'active',
    permissions JSON NOT NULL,
    expires_at TIMESTAMP NULL,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_company_id (company_id),
    INDEX idx_key_hash (`key`(64)),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add API keys relationship to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS api_keys_count INT DEFAULT 0;
