import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { ServiceJwtGuard } from '@guards/service-jwt.guard';
import { AuthClientService } from '@services/auth-client.service';
import { Agent } from './entities/agent.entity';
import { Company } from '@modules/companies/entities/company.entity';
import { User } from '@modules/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agent, Company, User])],
  controllers: [AgentsController],
  providers: [AgentsService, ServiceJwtGuard, AuthClientService],
  exports: [AgentsService],
})
export class AgentsModule {}
