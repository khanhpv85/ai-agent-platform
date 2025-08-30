-- Company Service Database Initialization
-- This script creates the company database with business logic tables

-- Create company database
CREATE DATABASE IF NOT EXISTS company_service;
USE company_service;

-- Companies table (business data)
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    subscription_plan ENUM('free', 'pro', 'enterprise') DEFAULT 'free',
    max_agents INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User profiles table (non-sensitive user data for business logic)
CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user', 'manager') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User-Company relationships (business logic)
CREATE TABLE IF NOT EXISTS user_companies (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    company_id VARCHAR(36) NOT NULL,
    role ENUM('owner', 'admin', 'member') DEFAULT 'member',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_company (user_id, company_id)
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    company_id VARCHAR(36) NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    status ENUM('active', 'inactive', 'draft') DEFAULT 'draft',
    agent_type ENUM('workflow', 'chatbot', 'assistant') DEFAULT 'workflow',
    configuration JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Workflows table (Updated: Removed agent_id, added company_id for direct company association)
CREATE TABLE IF NOT EXISTS workflows (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    company_id VARCHAR(36) NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    status ENUM('active', 'inactive', 'draft') DEFAULT 'draft',
    steps JSON NOT NULL,
    triggers JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Workflow executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id VARCHAR(36) PRIMARY KEY,
    workflow_id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'running', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    input_data JSON,
    output_data JSON,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Knowledge bases table
CREATE TABLE IF NOT EXISTS knowledge_bases (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    company_id VARCHAR(36) NOT NULL,
    source_type ENUM('s3', 'google_drive', 'local', 'api') NOT NULL,
    source_config JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Agent-Knowledge base relationships
CREATE TABLE IF NOT EXISTS agent_knowledge_bases (
    id VARCHAR(36) PRIMARY KEY,
    agent_id VARCHAR(36) NOT NULL,
    knowledge_base_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    FOREIGN KEY (knowledge_base_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE,
    UNIQUE KEY unique_agent_kb (agent_id, knowledge_base_id)
);

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('slack', 'email', 'calendar', 'crm', 'custom') NOT NULL,
    company_id VARCHAR(36) NOT NULL,
    configuration JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- AI Service logs table
CREATE TABLE IF NOT EXISTS ai_service_logs (
    id VARCHAR(36) PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    request_type VARCHAR(100) NOT NULL,
    request_data JSON,
    response_data JSON,
    model_used VARCHAR(100),
    tokens_used INT,
    cost DECIMAL(10,4),
    execution_time_ms INT,
    status ENUM('success', 'error') NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for company database
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_company ON user_companies(company_id);
CREATE INDEX idx_agents_company ON agents(company_id);
CREATE INDEX idx_workflows_company ON workflows(company_id);
CREATE INDEX idx_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_executions_status ON workflow_executions(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_ai_logs_service ON ai_service_logs(service_name);
CREATE INDEX idx_ai_logs_created ON ai_service_logs(created_at);

-- Insert default company
INSERT IGNORE INTO companies (id, name, domain, subscription_plan, max_agents) 
VALUES ('company-001', 'AI Agent Platform', 'aiagentplatform.com', 'enterprise', 100);

-- Insert default user profile (will be synced via gRPC from auth service)
INSERT IGNORE INTO user_profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role
) VALUES (
    'admin-001', 
    'admin@aiagentplatform.com', 
    'Admin', 
    'User', 
    'admin'
);

-- Link admin user to default company
INSERT IGNORE INTO user_companies (id, user_id, company_id, role) 
VALUES ('uc-001', 'admin-001', 'company-001', 'owner');

-- Grant permissions to ai_user for company_service database
GRANT ALL PRIVILEGES ON company_service.* TO 'ai_user'@'%';
FLUSH PRIVILEGES;
