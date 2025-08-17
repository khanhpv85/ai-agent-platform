import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { Integration } from './entities/integration.entity';
import { Company } from '@modules/companies/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Integration, Company])],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
