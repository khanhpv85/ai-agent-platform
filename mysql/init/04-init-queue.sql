-- Queue Service Database
-- This script creates a separate database for the queue service

-- Create queue service database
CREATE DATABASE IF NOT EXISTS queue_service;

USE queue_service;

-- Queue Messages table
CREATE TABLE IF NOT EXISTS queue_messages (
    id VARCHAR(36) PRIMARY KEY,
    queue_name VARCHAR(255) NOT NULL,
    message_type VARCHAR(255) NOT NULL,
    payload JSON NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'retry') DEFAULT 'pending',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    processed_at TIMESTAMP NULL,
    scheduled_at TIMESTAMP NULL,
    error_message TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_queue_name (queue_name),
    INDEX idx_status (status),
    INDEX idx_message_type (message_type),
    INDEX idx_created_at (created_at),
    INDEX idx_priority (priority)
);

-- Create indexes for better performance
CREATE INDEX idx_queue_status ON queue_messages(queue_name, status);
CREATE INDEX idx_queue_created ON queue_messages(queue_name, created_at);
CREATE INDEX idx_retry_count ON queue_messages(retry_count);



-- Create queue service user and grant permissions
CREATE USER IF NOT EXISTS 'queue_user'@'%' IDENTIFIED BY 'queue_password123';
GRANT ALL PRIVILEGES ON queue_service.* TO 'queue_user'@'%';
FLUSH PRIVILEGES;
