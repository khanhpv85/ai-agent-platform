import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Workflow } from './entities/workflow.entity';
import { WorkflowExecution } from './entities/workflow-execution.entity';
import { Company } from '@modules/companies/entities/company.entity';
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
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getCompanyWorkflows(companyId: string, userId: string) {
    // Check if user has access to this company
    const userCompany = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.userCompanies', 'uc')
      .leftJoin('uc.company', 'company')
      .where('user.id = :userId', { userId })
      .andWhere('company.id = :companyId', { companyId })
      .getOne();

    if (!userCompany) {
      throw new ForbiddenException('Access denied to this company');
    }

    const workflows = await this.workflowRepository
      .createQueryBuilder('workflow')
      .leftJoin('workflow.company', 'company')
      .leftJoin('workflow.creator', 'creator')
      .where('company.id = :companyId', { companyId })
      .select([
        'workflow.id',
        'workflow.name',
        'workflow.description',
        'workflow.status',
        'workflow.steps',
        'workflow.triggers',
        'workflow.company_id',
        'workflow.created_at',
        'workflow.updated_at',
        'creator.first_name',
        'creator.last_name'
      ])
      .getMany();

    return workflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      status: workflow.status,
      steps: workflow.steps,
      triggers: workflow.triggers,
      company_id: workflow.company_id,
      created_by: `${workflow.creator.first_name} ${workflow.creator.last_name}`,
      created_at: workflow.created_at,
      updated_at: workflow.updated_at,
    }));
  }

  async getWorkflow(workflowId: string, userId: string) {
    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId },
      relations: ['company', 'company.userCompanies', 'creator'],
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const hasAccess = workflow.company.userCompanies.some(uc => uc.user_id === userId);
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
      company_id: workflow.company_id,
      created_by: `${workflow.creator.first_name} ${workflow.creator.last_name}`,
      created_at: workflow.created_at,
      updated_at: workflow.updated_at,
    };
  }

  async createWorkflow(createWorkflowDto: CreateWorkflowDto, userId: string) {
    // Check if user has access to this company
    const company = await this.companyRepository.findOne({
      where: { id: createWorkflowDto.company_id },
      relations: ['userCompanies'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const hasAccess = company.userCompanies.some(uc => uc.user_id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this company');
    }

    // Validate steps
    if (!createWorkflowDto.steps || !Array.isArray(createWorkflowDto.steps)) {
      throw new Error('Workflow steps are required and must be an array');
    }
    
    const workflow = this.workflowRepository.create({
      id: uuidv4(),
      name: createWorkflowDto.name,
      description: createWorkflowDto.description,
      company_id: createWorkflowDto.company_id,
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
      company_id: workflow.company_id,
      created_at: workflow.created_at,
      updated_at: workflow.updated_at,
    };
  }

  async updateWorkflow(workflowId: string, updateWorkflowDto: UpdateWorkflowDto, userId: string) {
    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId },
      relations: ['company', 'company.userCompanies'],
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const hasAccess = workflow.company.userCompanies.some(uc => uc.user_id === userId);
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
      company_id: workflow.company_id,
      created_at: workflow.created_at,
      updated_at: workflow.updated_at,
    };
  }

  async deleteWorkflow(workflowId: string, userId: string) {
    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId },
      relations: ['company', 'company.userCompanies'],
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const hasAccess = workflow.company.userCompanies.some(uc => uc.user_id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this workflow');
    }

    await this.workflowRepository.remove(workflow);

    return { message: 'Workflow deleted successfully' };
  }

  async executeWorkflow(workflowId: string, executeWorkflowDto: ExecuteWorkflowDto, userId: string) {
    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId },
      relations: ['company', 'company.userCompanies'],
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const hasAccess = workflow.company.userCompanies.some(uc => uc.user_id === userId);
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
      relations: ['company', 'company.userCompanies'],
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const hasAccess = workflow.company.userCompanies.some(uc => uc.user_id === userId);
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
    
    try {
      const { method, url, headers, body } = step.config;
      
      const response = await axios({
        method: method || 'GET',
        url,
        headers: headers || {},
        data: body || inputData,
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
    if (!step.config) {
      throw new Error('Condition step is missing configuration');
    }
    
    const { condition, true_branch, false_branch } = step.config;
    
    // Simple condition evaluation (can be enhanced)
    const isTrue = this.evaluateCondition(condition, inputData);
    
    return {
      ...inputData,
      condition_result: isTrue,
      next_step: isTrue ? true_branch : false_branch,
    };
  }

  private async executeTransformStep(step: any, inputData: any) {
    if (!step.config) {
      throw new Error('Transform step is missing configuration');
    }
    
    const { transform_type, config } = step.config;
    
    switch (transform_type) {
      case 'map':
        return this.transformMap(inputData, config);
      case 'filter':
        return this.transformFilter(inputData, config);
      case 'aggregate':
        return this.transformAggregate(inputData, config);
      default:
        throw new Error(`Unknown transform type: ${transform_type}`);
    }
  }

  private evaluateCondition(condition: string, inputData: any): boolean {
    // Simple condition evaluation - can be enhanced with a proper expression parser
    try {
      // Replace variables with actual values
      let evaluatedCondition = condition;
      
      // Replace common patterns
      evaluatedCondition = evaluatedCondition.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return inputData[key] !== undefined ? JSON.stringify(inputData[key]) : 'undefined';
      });
      
      // Simple evaluation (be careful with this in production)
      return eval(evaluatedCondition);
    } catch (error) {
      throw new Error(`Condition evaluation failed: ${error.message}`);
    }
  }

  private transformMap(inputData: any, config: any) {
    const { field, operation } = config;
    
    if (Array.isArray(inputData)) {
      return inputData.map(item => ({
        ...item,
        [field]: operation(item[field]),
      }));
    }
    
    return {
      ...inputData,
      [field]: operation(inputData[field]),
    };
  }

  private transformFilter(inputData: any, config: any) {
    const { field, condition } = config;
    
    if (Array.isArray(inputData)) {
      return inputData.filter(item => this.evaluateCondition(condition, { [field]: item[field] }));
    }
    
    return inputData;
  }

  private transformAggregate(inputData: any, config: any) {
    const { field, operation } = config;
    
    if (Array.isArray(inputData)) {
      const values = inputData.map(item => item[field]).filter(v => v !== undefined);
      
      switch (operation) {
        case 'sum':
          return values.reduce((sum, val) => sum + val, 0);
        case 'average':
          return values.reduce((sum, val) => sum + val, 0) / values.length;
        case 'count':
          return values.length;
        case 'min':
          return Math.min(...values);
        case 'max':
          return Math.max(...values);
        default:
          throw new Error(`Unknown aggregate operation: ${operation}`);
      }
    }
    
    return inputData;
  }
}
