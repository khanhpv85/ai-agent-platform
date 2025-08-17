import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Workflow } from './entities/workflow.entity';
import { WorkflowExecution } from './entities/workflow-execution.entity';
import { Agent } from '@modules/agents/entities/agent.entity';
import { User } from '@modules/users/entities/user.entity';
import { CreateWorkflowDto, UpdateWorkflowDto, ExecuteWorkflowDto } from './dto/workflows.dto';
import { WorkflowStatus, ExecutionStatus } from '@types';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowExecution)
    private workflowExecutionRepository: Repository<WorkflowExecution>,
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getAgentWorkflows(agentId: string, userId: string) {
    // Check if user has access to this agent
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
      relations: ['company', 'company.userCompanies'],
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const hasAccess = agent.company.userCompanies.some(uc => uc.user_id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this agent');
    }

    const workflows = await this.workflowRepository.find({
      where: { agent_id: agentId },
      relations: ['creator'],
    });

    return workflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      status: workflow.status,
      steps: workflow.steps,
      triggers: workflow.triggers,
      created_by: workflow.creator.fullName,
      created_at: workflow.created_at,
      updated_at: workflow.updated_at,
    }));
  }

  async getWorkflow(workflowId: string, userId: string) {
    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId },
      relations: ['agent', 'agent.company', 'agent.company.userCompanies', 'creator'],
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const hasAccess = workflow.agent.company.userCompanies.some(uc => uc.user_id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this workflow');
    }

    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      status: workflow.status,
      steps: workflow.steps,
      triggers: workflow.triggers,
      agent_id: workflow.agent_id,
      created_by: workflow.creator.fullName,
      created_at: workflow.created_at,
      updated_at: workflow.updated_at,
    };
  }

  async createWorkflow(createWorkflowDto: CreateWorkflowDto, userId: string) {
    // Check if user has access to this agent
    const agent = await this.agentRepository.findOne({
      where: { id: createWorkflowDto.agent_id },
      relations: ['company', 'company.userCompanies'],
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const hasAccess = agent.company.userCompanies.some(uc => uc.user_id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this agent');
    }

    // Validate steps
    if (!createWorkflowDto.steps || !Array.isArray(createWorkflowDto.steps)) {
      throw new Error('Workflow steps are required and must be an array');
    }
    
    const workflow = this.workflowRepository.create({
      id: uuidv4(),
      name: createWorkflowDto.name,
      description: createWorkflowDto.description,
      agent_id: createWorkflowDto.agent_id,
      created_by: userId,
      status: createWorkflowDto.status || WorkflowStatus.DRAFT,
      steps: createWorkflowDto.steps,
      triggers: createWorkflowDto.triggers,
    });

    await this.workflowRepository.save(workflow);

    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      status: workflow.status,
      steps: workflow.steps,
      triggers: workflow.triggers,
      agent_id: workflow.agent_id,
      created_at: workflow.created_at,
      updated_at: workflow.updated_at,
    };
  }

  async updateWorkflow(workflowId: string, updateWorkflowDto: UpdateWorkflowDto, userId: string) {
    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId },
      relations: ['agent', 'agent.company', 'agent.company.userCompanies'],
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const hasAccess = workflow.agent.company.userCompanies.some(uc => uc.user_id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this workflow');
    }

    // Validate steps if they are being updated
    if (updateWorkflowDto.steps !== undefined) {
      if (!Array.isArray(updateWorkflowDto.steps)) {
        throw new Error('Workflow steps must be an array');
      }
    }

    Object.assign(workflow, updateWorkflowDto);
    await this.workflowRepository.save(workflow);

    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      status: workflow.status,
      steps: workflow.steps,
      triggers: workflow.triggers,
      agent_id: workflow.agent_id,
      created_at: workflow.created_at,
      updated_at: workflow.updated_at,
    };
  }

  async deleteWorkflow(workflowId: string, userId: string) {
    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId },
      relations: ['agent', 'agent.company', 'agent.company.userCompanies'],
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const hasAccess = workflow.agent.company.userCompanies.some(uc => uc.user_id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this workflow');
    }

    await this.workflowRepository.remove(workflow);

    return { message: 'Workflow deleted successfully' };
  }

  async executeWorkflow(workflowId: string, executeWorkflowDto: ExecuteWorkflowDto, userId: string) {
    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId },
      relations: ['agent', 'agent.company', 'agent.company.userCompanies'],
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const hasAccess = workflow.agent.company.userCompanies.some(uc => uc.user_id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this workflow');
    }

    if (workflow.status !== WorkflowStatus.ACTIVE) {
      throw new ForbiddenException('Workflow must be active to execute');
    }

    // Create execution record
    const execution = this.workflowExecutionRepository.create({
      id: uuidv4(),
      workflow_id: workflowId,
      status: ExecutionStatus.PENDING,
      input_data: executeWorkflowDto.input_data,
      started_at: new Date(),
    });

    await this.workflowExecutionRepository.save(execution);

    // Start async execution
    this.executeWorkflowAsync(execution.id, workflow, executeWorkflowDto.input_data);

    return {
      execution_id: execution.id,
      status: execution.status,
      message: 'Workflow execution started',
    };
  }

  async getWorkflowExecutions(workflowId: string, userId: string) {
    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId },
      relations: ['agent', 'agent.company', 'agent.company.userCompanies'],
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const hasAccess = workflow.agent.company.userCompanies.some(uc => uc.user_id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this workflow');
    }

    const executions = await this.workflowExecutionRepository.find({
      where: { workflow_id: workflowId },
      order: { created_at: 'DESC' },
    });

    return executions.map(execution => ({
      id: execution.id,
      status: execution.status,
      input_data: execution.input_data,
      output_data: execution.output_data,
      error_message: execution.error_message,
      started_at: execution.started_at,
      completed_at: execution.completed_at,
      created_at: execution.created_at,
    }));
  }

  private async executeWorkflowAsync(executionId: string, workflow: Workflow, inputData: any) {
    try {
      // Update status to running
      await this.workflowExecutionRepository.update(executionId, {
        status: ExecutionStatus.RUNNING,
      });

      let result = inputData;

      // Execute each step in the workflow
      if (!workflow.steps || !Array.isArray(workflow.steps)) {
        throw new Error('Workflow steps are missing or invalid');
      }
      
      for (const step of workflow.steps) {
        result = await this.executeStep(step, result);
      }

      // Update execution as completed
      await this.workflowExecutionRepository.update(executionId, {
        status: ExecutionStatus.COMPLETED,
        output_data: result,
        completed_at: new Date(),
      });

    } catch (error) {
      // Update execution as failed
      await this.workflowExecutionRepository.update(executionId, {
        status: ExecutionStatus.FAILED,
        error_message: error.message,
        completed_at: new Date(),
      });
    }
  }

  private async executeStep(step: any, inputData: any) {
    if (!step) {
      throw new Error('Step is null or undefined');
    }
    
    if (!step.type) {
      throw new Error('Step type is missing');
    }
    
    switch (step.type) {
      case 'ai_reasoning':
        return await this.executeAIStep(step, inputData);
      case 'api_call':
        return await this.executeAPIStep(step, inputData);
      case 'condition':
        return await this.executeConditionStep(step, inputData);
      case 'transform':
        return await this.executeTransformStep(step, inputData);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  private async executeAIStep(step: any, inputData: any) {
    if (!step.config) {
      throw new Error('AI step is missing configuration');
    }
    
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://ai-service:8000';
      
      const response = await axios.post(`${aiServiceUrl}/summarize`, {
        text: inputData.text || JSON.stringify(inputData),
        model: step.config.model || 'gpt-3.5-turbo',
      });

      return {
        ...inputData,
        ai_result: response.data.data.summary,
      };
    } catch (error) {
      throw new Error(`AI step failed: ${error.message}`);
    }
  }

  private async executeAPIStep(step: any, inputData: any) {
    if (!step.config) {
      throw new Error('API step is missing configuration');
    }
    
    if (!step.config.url) {
      throw new Error('API step is missing URL configuration');
    }
    
    try {
      const response = await axios({
        method: step.config.method || 'GET',
        url: step.config.url,
        headers: step.config.headers || {},
        data: step.config.body || inputData,
      });

      return {
        ...inputData,
        api_result: response.data,
      };
    } catch (error) {
      throw new Error(`API step failed: ${error.message}`);
    }
  }

  private async executeConditionStep(step: any, inputData: any) {
    if (!step.config || !step.config.condition) {
      throw new Error('Condition step is missing configuration or condition');
    }
    
    const condition = step.config.condition;
    const conditionResult = eval(condition); // In production, use a safer expression evaluator

    if (conditionResult) {
      if (!step.config.true_step) {
        throw new Error('Condition step is missing true_step configuration');
      }
      return await this.executeStep(step.config.true_step, inputData);
    } else if (step.config.false_step) {
      return await this.executeStep(step.config.false_step, inputData);
    }

    return inputData;
  }

  private async executeTransformStep(step: any, inputData: any) {
    if (!step.config || !step.config.transform) {
      throw new Error('Transform step is missing configuration or transform function');
    }
    
    const transform = step.config.transform;
    // In production, use a safer transformation engine
    return eval(transform);
  }
}
