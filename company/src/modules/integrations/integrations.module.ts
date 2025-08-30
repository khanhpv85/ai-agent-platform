import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseService } from './knowledge-base.service';
import { ServiceJwtGuard } from '@guards/service-jwt.guard';
import { AuthClientService } from '@services/auth-client.service';
import { Integration } from './entities/integration.entity';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { Company } from '@modules/companies/entities/company.entity';
import { UserCompany } from '@modules/users/entities/user-company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Integration, KnowledgeBase, Company, UserCompany])],
  controllers: [IntegrationsController, KnowledgeBaseController],
  providers: [IntegrationsService, KnowledgeBaseService, ServiceJwtGuard, AuthClientService],
  exports: [IntegrationsService, KnowledgeBaseService],
})
export class IntegrationsModule {}
