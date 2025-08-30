import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { Workflow } from './entities/workflow.entity';
import { WorkflowExecution } from './entities/workflow-execution.entity';
import { Company } from '@modules/companies/entities/company.entity';
import { User } from '@modules/users/entities/user.entity';
import { AuthClientService } from '@services/auth-client.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workflow, WorkflowExecution, Company, User])],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, AuthClientService],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
