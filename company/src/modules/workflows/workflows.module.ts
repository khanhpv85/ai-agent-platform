import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { Workflow } from './entities/workflow.entity';
import { WorkflowExecution } from './entities/workflow-execution.entity';
import { Agent } from '@modules/agents/entities/agent.entity';
import { User } from '@modules/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workflow, WorkflowExecution, Agent, User])],
  controllers: [WorkflowsController],
  providers: [WorkflowsService],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
