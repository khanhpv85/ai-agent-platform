-- Create knowledge_bases table
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  company_id VARCHAR(36) NOT NULL,
  source_type ENUM('document', 'database', 'api', 'website', 'file') DEFAULT 'document',
  source_config JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_company_id (company_id),
  INDEX idx_source_type (source_type),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample knowledge bases for testing
INSERT INTO knowledge_bases (id, name, description, company_id, source_type, source_config, is_active) VALUES
('kb-1', 'Company Documentation', 'Internal company policies and procedures', 'company-1', 'document', '{"path": "/docs/company"}', TRUE),
('kb-2', 'Product Knowledge Base', 'Product specifications and user guides', 'company-1', 'api', '{"endpoint": "https://api.example.com/products"}', TRUE),
('kb-3', 'Customer Support Database', 'FAQ and troubleshooting guides', 'company-1', 'database', '{"table": "support_articles"}', FALSE)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  source_type = VALUES(source_type),
  source_config = VALUES(source_config),
  is_active = VALUES(is_active);
