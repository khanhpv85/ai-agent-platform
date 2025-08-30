# Database Integration Implementation

## Overview

This document outlines the complete implementation of database integration for the Agent Configuration system, including knowledge base management and agent configuration persistence.

## Backend Implementation

### 1. Knowledge Base Entity

**File**: `company/src/modules/integrations/entities/knowledge-base.entity.ts`

```typescript
@Entity('knowledge_bases')
export class KnowledgeBase {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { length: 36 })
  company_id: string;

  @Column({
    type: 'enum',
    enum: SourceType,
    default: SourceType.DOCUMENT,
  })
  source_type: SourceType;

  @Column('json', { nullable: true })
  source_config: any;

  @Column('boolean', { default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Company, company => company.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
```

### 2. Knowledge Base DTOs

**File**: `company/src/modules/integrations/dto/knowledge-base.dto.ts`

```typescript
export class CreateKnowledgeBaseDto {
  @ApiProperty({ example: 'Company Documentation' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Internal company policies and procedures', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'company-123' })
  @IsString()
  company_id: string;

  @ApiProperty({ enum: SourceType, example: SourceType.DOCUMENT })
  @IsEnum(SourceType)
  source_type: SourceType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  source_config?: any;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
```

### 3. Knowledge Base Service

**File**: `company/src/modules/integrations/knowledge-base.service.ts`

**Key Methods**:
- `getCompanyKnowledgeBases()` - Retrieve all knowledge bases for a company
- `createKnowledgeBase()` - Create new knowledge base
- `updateKnowledgeBase()` - Update existing knowledge base
- `deleteKnowledgeBase()` - Delete knowledge base
- `toggleKnowledgeBaseStatus()` - Toggle active status

### 4. Knowledge Base Controller

**File**: `company/src/modules/integrations/knowledge-base.controller.ts`

**API Endpoints**:
- `GET /knowledge-bases/company/:companyId` - Get company knowledge bases
- `GET /knowledge-bases/:id` - Get knowledge base by ID
- `POST /knowledge-bases` - Create knowledge base
- `PUT /knowledge-bases/:id` - Update knowledge base
- `DELETE /knowledge-bases/:id` - Delete knowledge base
- `PUT /knowledge-bases/:id/toggle-status` - Toggle status

### 5. Database Migration

**File**: `mysql/init/06-create-knowledge-bases.sql`

```sql
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
```

## Frontend Implementation

### 1. Agent Service Enhancement

**File**: `frontend/src/services/agent.service.ts`

**New API Functions**:
```typescript
// Knowledge Base API functions
fetchKnowledgeBases: async (companyId: string): Promise<KnowledgeBase[]>
createKnowledgeBase: async (knowledgeBaseData: any): Promise<KnowledgeBase>
updateKnowledgeBase: async (id: string, data: any): Promise<KnowledgeBase>
deleteKnowledgeBase: async (id: string): Promise<void>
toggleKnowledgeBaseStatus: async (id: string): Promise<KnowledgeBase>

// Save agent configuration
saveAgentConfiguration: async ({ agentId, configuration }: { agentId: string; configuration: AgentConfiguration })
```

**Async Thunks**:
```typescript
export const fetchKnowledgeBases = createAsyncThunk(...)
export const createKnowledgeBase = createAsyncThunk(...)
export const updateKnowledgeBase = createAsyncThunk(...)
export const deleteKnowledgeBase = createAsyncThunk(...)
export const toggleKnowledgeBaseStatus = createAsyncThunk(...)
export const saveAgentConfiguration = createAsyncThunk(...)
```

### 2. Agent Configuration Modal Integration

**File**: `frontend/src/components/Agents/AgentConfigurationModal.tsx`

**Key Features**:
- Real-time configuration updates
- Database persistence on save
- Knowledge base integration
- Error handling and validation
- Loading states

**Save Functionality**:
```typescript
const handleSave = async () => {
  if (!agent?.id) {
    toast.error('Agent ID not found');
    return;
  }

  try {
    await dispatch(saveAgentConfiguration({ 
      agentId: agent.id, 
      configuration 
    })).unwrap();
    
    toast.success('Agent configuration saved successfully');
    onSave(configuration);
    onClose();
  } catch (error: any) {
    toast.error(error.message || 'Failed to save agent configuration');
  }
};
```

### 3. Integrations Page Enhancement

**File**: `frontend/src/pages/Integrations.tsx`

**Key Features**:
- Real-time knowledge base management
- CRUD operations with database persistence
- Status toggling
- Error handling and loading states
- Optimistic updates

## API Endpoints

### Knowledge Base Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/company/knowledge-bases/company/:companyId` | Get company knowledge bases | Yes |
| GET | `/api/company/knowledge-bases/:id` | Get knowledge base by ID | Yes |
| POST | `/api/company/knowledge-bases` | Create knowledge base | Yes |
| PUT | `/api/company/knowledge-bases/:id` | Update knowledge base | Yes |
| DELETE | `/api/company/knowledge-bases/:id` | Delete knowledge base | Yes |
| PUT | `/api/company/knowledge-bases/:id/toggle-status` | Toggle status | Yes |

### Agent Configuration Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| PUT | `/api/company/agents/:id` | Update agent (including configuration) | Yes |

## Database Schema

### Knowledge Bases Table

```sql
CREATE TABLE knowledge_bases (
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
);
```

### Agents Table (Enhanced)

The existing agents table includes a `configuration` JSON column that stores the complete agent configuration:

```sql
ALTER TABLE agents ADD COLUMN configuration JSON;
```

## Security Implementation

### 1. Access Control

- **Company-based isolation**: Users can only access knowledge bases within their companies
- **Role-based permissions**: Admin users have full access, regular users have limited access
- **JWT authentication**: All endpoints require valid JWT tokens

### 2. Data Validation

- **DTO validation**: All input data is validated using class-validator
- **Type safety**: TypeScript interfaces ensure type safety
- **SQL injection prevention**: Parameterized queries prevent SQL injection

### 3. Error Handling

- **Comprehensive error responses**: Detailed error messages for debugging
- **Graceful degradation**: Frontend handles API errors gracefully
- **User feedback**: Toast notifications for success/error states

## Usage Examples

### Creating a Knowledge Base

```typescript
// Frontend
const newKB = await dispatch(createKnowledgeBase({
  name: 'Company Documentation',
  description: 'Internal policies and procedures',
  company_id: currentCompany.id,
  source_type: SourceType.DOCUMENT,
  source_config: { path: '/docs/company' }
})).unwrap();

// Backend API
POST /api/company/knowledge-bases
{
  "name": "Company Documentation",
  "description": "Internal policies and procedures",
  "company_id": "company-123",
  "source_type": "document",
  "source_config": { "path": "/docs/company" }
}
```

### Saving Agent Configuration

```typescript
// Frontend
await dispatch(saveAgentConfiguration({
  agentId: 'agent-123',
  configuration: {
    llm: { provider: 'openai', model: 'gpt-4' },
    knowledge_bases: ['kb-1', 'kb-2'],
    tools: [...],
    // ... other configuration
  }
})).unwrap();

// Backend API
PUT /api/company/agents/agent-123
{
  "configuration": {
    "llm": { "provider": "openai", "model": "gpt-4" },
    "knowledge_bases": ["kb-1", "kb-2"],
    "tools": [...]
  }
}
```

## Testing

### Backend Testing

```bash
# Test knowledge base endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -X GET http://localhost/api/company/knowledge-bases/company/company-123

curl -H "Authorization: Bearer YOUR_TOKEN" \
     -X POST http://localhost/api/company/knowledge-bases \
     -H "Content-Type: application/json" \
     -d '{"name":"Test KB","company_id":"company-123","source_type":"document"}'
```

### Frontend Testing

```typescript
// Test knowledge base creation
const result = await dispatch(createKnowledgeBase({
  name: 'Test Knowledge Base',
  company_id: 'company-123',
  source_type: SourceType.DOCUMENT
})).unwrap();

// Test agent configuration save
const result = await dispatch(saveAgentConfiguration({
  agentId: 'agent-123',
  configuration: agentConfig
})).unwrap();
```

## Performance Considerations

### 1. Database Optimization

- **Indexes**: Proper indexing on frequently queried columns
- **JSON columns**: Efficient storage for configuration data
- **Cascade deletes**: Automatic cleanup of related data

### 2. Frontend Optimization

- **Redux caching**: Efficient state management
- **Optimistic updates**: Immediate UI feedback
- **Error boundaries**: Graceful error handling

### 3. API Optimization

- **Pagination**: For large datasets
- **Selective loading**: Load only necessary data
- **Caching**: Redis caching for frequently accessed data

## Monitoring and Logging

### 1. Database Monitoring

- **Query performance**: Monitor slow queries
- **Connection pooling**: Efficient database connections
- **Backup strategies**: Regular database backups

### 2. API Monitoring

- **Response times**: Monitor API performance
- **Error rates**: Track error frequencies
- **Usage analytics**: Monitor endpoint usage

### 3. Frontend Monitoring

- **User interactions**: Track user behavior
- **Error tracking**: Monitor frontend errors
- **Performance metrics**: Track page load times

## Future Enhancements

### 1. Advanced Features

- **Bulk operations**: Import/export knowledge bases
- **Version control**: Track configuration changes
- **Templates**: Pre-built configuration templates

### 2. Integration Enhancements

- **Real-time sync**: WebSocket updates
- **Offline support**: Local storage caching
- **Advanced search**: Full-text search capabilities

### 3. Security Enhancements

- **Audit logging**: Track all changes
- **Encryption**: Encrypt sensitive configuration data
- **Access logs**: Detailed access tracking

## Conclusion

The database integration implementation provides a robust, scalable solution for managing agent configurations and knowledge bases. The system ensures data persistence, security, and performance while maintaining a user-friendly interface.

Key benefits:
- **Complete CRUD operations** for knowledge bases
- **Real-time configuration saving** for agents
- **Secure access control** with company isolation
- **Comprehensive error handling** and user feedback
- **Scalable architecture** for future enhancements
