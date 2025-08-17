import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';

// Import modules
import { UsersModule } from '@modules/users/users.module';
import { WorkflowsModule } from '@modules/workflows/workflows.module';
import { IntegrationsModule } from '@modules/integrations/integrations.module';
import { CompaniesModule } from '@modules/companies/companies.module';
import { AgentsModule } from '@modules/agents/agents.module';

// Import entities (company database only)
import { User } from '@modules/users/entities/user.entity';
import { Company } from '@modules/companies/entities/company.entity';
import { UserCompany } from '@modules/users/entities/user-company.entity';
import { Agent } from '@modules/agents/entities/agent.entity';
import { Workflow } from '@modules/workflows/entities/workflow.entity';
import { WorkflowExecution } from '@modules/workflows/entities/workflow-execution.entity';
import { KnowledgeBase } from '@modules/integrations/entities/knowledge-base.entity';
import { Integration } from '@modules/integrations/entities/integration.entity';

// Import strategies and services
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthClientService } from '@services/auth-client.service';
import { QueueOAuthClientService } from '@services/queue-oauth-client.service';
import { QueueWorkerService } from '@services/queue-worker.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'ai_user',
      password: process.env.DB_PASSWORD || 'ai_password123',
      database: process.env.DB_NAME || 'company_service',
      entities: [
        User, 
        Company, 
        UserCompany, 
        Agent, 
        Workflow, 
        WorkflowExecution, 
        KnowledgeBase, 
        Integration
      ],
      synchronize: false, // Set to false in production
      logging: process.env.NODE_ENV === 'development',
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      signOptions: { expiresIn: '24h' },
    }),
    TypeOrmModule.forFeature([User]),
    // Feature modules
    UsersModule,
    WorkflowsModule,
    IntegrationsModule,
    CompaniesModule,
    AgentsModule,
  ],
  providers: [JwtStrategy, AuthClientService, QueueOAuthClientService, QueueWorkerService],
  exports: [AuthClientService, QueueOAuthClientService],
})
export class AppModule {}
