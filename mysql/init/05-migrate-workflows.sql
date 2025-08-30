-- Migration script to update workflows table structure
-- This script migrates existing workflows from agent_id to company_id

USE company_service;

-- Step 1: Check if company_id column exists, if not add it
SET @company_id_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                         WHERE TABLE_SCHEMA = 'company_service' 
                         AND TABLE_NAME = 'workflows' 
                         AND COLUMN_NAME = 'company_id');

SET @sql = IF(@company_id_exists = 0, 
    'ALTER TABLE workflows ADD COLUMN company_id VARCHAR(36) AFTER description',
    'SELECT "company_id column already exists" as status');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Update company_id based on the agent's company (only if company_id is NULL)
UPDATE workflows w 
JOIN agents a ON w.agent_id = a.id 
SET w.company_id = a.company_id 
WHERE w.company_id IS NULL;

-- Step 3: Make company_id NOT NULL after populating it
ALTER TABLE workflows MODIFY COLUMN company_id VARCHAR(36) NOT NULL;

-- Step 4: Add foreign key constraint for company_id if it doesn't exist
SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                  WHERE TABLE_SCHEMA = 'company_service' 
                  AND TABLE_NAME = 'workflows' 
                  AND CONSTRAINT_NAME = 'fk_workflows_company');

SET @sql = IF(@fk_exists = 0, 
    'ALTER TABLE workflows ADD CONSTRAINT fk_workflows_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE',
    'SELECT "fk_workflows_company constraint already exists" as status');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Remove the old agent_id foreign key constraint if it exists
SET @agent_fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                        WHERE TABLE_SCHEMA = 'company_service' 
                        AND TABLE_NAME = 'workflows' 
                        AND CONSTRAINT_NAME = 'workflows_ibfk_1');

SET @sql = IF(@agent_fk_exists > 0, 
    'ALTER TABLE workflows DROP FOREIGN KEY workflows_ibfk_1',
    'SELECT "workflows_ibfk_1 constraint does not exist" as status');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 6: Remove the agent_id column
SET @agent_column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                           WHERE TABLE_SCHEMA = 'company_service' 
                           AND TABLE_NAME = 'workflows' 
                           AND COLUMN_NAME = 'agent_id');

SET @sql = IF(@agent_column_exists > 0, 
    'ALTER TABLE workflows DROP COLUMN agent_id',
    'SELECT "agent_id column does not exist" as status');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 7: Update indexes
DROP INDEX IF EXISTS idx_workflows_agent ON workflows;
CREATE INDEX IF NOT EXISTS idx_workflows_company ON workflows(company_id);

-- Step 8: Verify migration
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_workflows,
    COUNT(CASE WHEN company_id IS NOT NULL THEN 1 END) as workflows_with_company
FROM workflows;
