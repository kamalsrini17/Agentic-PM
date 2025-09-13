/**
 * Advanced Agent Orchestration Framework
 * Provides sophisticated workflow management, state tracking, and agent coordination
 */

import { EventEmitter } from 'events';
import { Logger, AgenticError, ErrorCode } from '../utils/errorHandling';

// ============================================================================
// WORKFLOW INTERFACES
// ============================================================================

export interface WorkflowStep {
  id: string;
  name: string;
  agentType: string;
  dependencies: string[];
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
    exponential: boolean;
  };
  required: boolean;
  parallelizable: boolean;
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  steps: WorkflowStep[];
  defaultTimeout: number;
  maxConcurrentSteps: number;
  failureStrategy: 'fail-fast' | 'continue-on-error' | 'retry-all';
  metadata: Record<string, any>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  currentStep?: string;
  completedSteps: string[];
  failedSteps: string[];
  skippedSteps: string[];
  stepResults: Record<string, any>;
  errors: Array<{ stepId: string; error: string; timestamp: Date }>;
  context: Record<string, any>;
  metrics: {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    totalDuration: number;
    avgStepDuration: number;
    costIncurred: number;
  };
}

export interface AgentCapability {
  agentType: string;
  capabilities: string[];
  costPerOperation: number;
  avgLatencyMs: number;
  successRate: number;
  maxConcurrency: number;
  isAvailable: boolean;
}

// ============================================================================
// WORKFLOW ENGINE
// ============================================================================

export class WorkflowEngine extends EventEmitter {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private agentRegistry: Map<string, AgentCapability> = new Map();
  private runningExecutions: Set<string> = new Set();
  private logger: Logger;

  constructor() {
    super();
    this.logger = Logger.getInstance();
    this.setupEventHandlers();
  }

  // ============================================================================
  // WORKFLOW MANAGEMENT
  // ============================================================================

  registerWorkflow(workflow: WorkflowDefinition): void {
    this.validateWorkflow(workflow);
    this.workflows.set(workflow.id, workflow);
    this.logger.info(`Workflow registered: ${workflow.name} (${workflow.id})`, {
      version: workflow.version,
      steps: workflow.steps.length
    }, 'WorkflowEngine');
  }

  async executeWorkflow(
    workflowId: string, 
    inputs: Record<string, any> = {},
    options: {
      priority?: 'low' | 'normal' | 'high';
      maxCost?: number;
      maxDuration?: number;
      skipOptionalSteps?: boolean;
    } = {}
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new AgenticError(
        ErrorCode.VALIDATION_ERROR,
        `Workflow not found: ${workflowId}`,
        'The requested workflow is not registered.'
      );
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'pending',
      startTime: new Date(),
      completedSteps: [],
      failedSteps: [],
      skippedSteps: [],
      stepResults: {},
      errors: [],
      context: { ...inputs, ...options },
      metrics: {
        totalSteps: workflow.steps.length,
        completedSteps: 0,
        failedSteps: 0,
        totalDuration: 0,
        avgStepDuration: 0,
        costIncurred: 0
      }
    };

    this.executions.set(executionId, execution);
    this.runningExecutions.add(executionId);

    this.logger.info(`Starting workflow execution: ${workflow.name}`, {
      executionId,
      workflowId,
      inputKeys: Object.keys(inputs)
    }, 'WorkflowEngine');

    this.emit('workflow:started', { executionId, workflowId });

    try {
      await this.runWorkflow(execution, workflow);
      execution.status = 'completed';
      execution.endTime = new Date();
      execution.metrics.totalDuration = execution.endTime.getTime() - execution.startTime.getTime();
      execution.metrics.avgStepDuration = execution.metrics.totalDuration / execution.metrics.completedSteps;

      this.logger.info(`Workflow completed successfully: ${workflow.name}`, {
        executionId,
        duration: execution.metrics.totalDuration,
        completedSteps: execution.metrics.completedSteps,
        cost: execution.metrics.costIncurred
      }, 'WorkflowEngine');

      this.emit('workflow:completed', { executionId, execution });

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.errors.push({
        stepId: 'workflow',
        error: (error as Error).message,
        timestamp: new Date()
      });

      this.logger.error(`Workflow execution failed: ${workflow.name}`, error as Error, {
        executionId,
        completedSteps: execution.completedSteps.length,
        failedSteps: execution.failedSteps.length
      }, 'WorkflowEngine');

      this.emit('workflow:failed', { executionId, execution, error });
      throw error;

    } finally {
      this.runningExecutions.delete(executionId);
    }

    return execution;
  }

  // ============================================================================
  // AGENT REGISTRY
  // ============================================================================

  registerAgent(capability: AgentCapability): void {
    this.agentRegistry.set(capability.agentType, capability);
    this.logger.info(`Agent registered: ${capability.agentType}`, {
      capabilities: capability.capabilities,
      costPerOperation: capability.costPerOperation,
      avgLatencyMs: capability.avgLatencyMs
    }, 'WorkflowEngine');
  }

  getAvailableAgents(): AgentCapability[] {
    return Array.from(this.agentRegistry.values()).filter(agent => agent.isAvailable);
  }

  findAgentForCapability(capability: string): AgentCapability | null {
    return Array.from(this.agentRegistry.values())
      .find(agent => agent.isAvailable && agent.capabilities.includes(capability)) || null;
  }

  // ============================================================================
  // WORKFLOW EXECUTION ENGINE
  // ============================================================================

  private async runWorkflow(execution: WorkflowExecution, workflow: WorkflowDefinition): Promise<void> {
    execution.status = 'running';
    this.emit('workflow:running', { executionId: execution.id });

    const dependencyGraph = this.buildDependencyGraph(workflow.steps);
    const executionPlan = this.createExecutionPlan(dependencyGraph, workflow);

    for (const phase of executionPlan) {
      await this.executePhase(phase, execution, workflow);
      
      // Check for early termination conditions
      if (execution.context.maxCost && execution.metrics.costIncurred > execution.context.maxCost) {
        throw new AgenticError(
          ErrorCode.PROCESSING_ERROR,
          `Cost limit exceeded: ${execution.metrics.costIncurred} > ${execution.context.maxCost}`,
          'Workflow terminated due to cost limits.'
        );
      }

      if (execution.context.maxDuration) {
        const currentDuration = Date.now() - execution.startTime.getTime();
        if (currentDuration > execution.context.maxDuration) {
          throw new AgenticError(
            ErrorCode.PROCESSING_ERROR,
            `Duration limit exceeded: ${currentDuration}ms > ${execution.context.maxDuration}ms`,
            'Workflow terminated due to time limits.'
          );
        }
      }
    }
  }

  private async executePhase(
    steps: WorkflowStep[], 
    execution: WorkflowExecution, 
    workflow: WorkflowDefinition
  ): Promise<void> {
    const parallelSteps = steps.filter(step => step.parallelizable);
    const sequentialSteps = steps.filter(step => !step.parallelizable);

    // Execute parallel steps concurrently
    if (parallelSteps.length > 0) {
      const maxConcurrent = Math.min(parallelSteps.length, workflow.maxConcurrentSteps);
      const chunks = this.chunkArray(parallelSteps, maxConcurrent);

      for (const chunk of chunks) {
        await Promise.allSettled(
          chunk.map(step => this.executeStep(step, execution, workflow))
        );
      }
    }

    // Execute sequential steps one by one
    for (const step of sequentialSteps) {
      await this.executeStep(step, execution, workflow);
    }
  }

  private async executeStep(
    step: WorkflowStep, 
    execution: WorkflowExecution, 
    workflow: WorkflowDefinition
  ): Promise<void> {
    const stepStartTime = Date.now();
    execution.currentStep = step.id;

    this.logger.info(`Executing step: ${step.name}`, {
      executionId: execution.id,
      stepId: step.id,
      agentType: step.agentType
    }, 'WorkflowEngine');

    this.emit('step:started', { executionId: execution.id, stepId: step.id });

    try {
      // Check dependencies
      const unmetDependencies = step.dependencies.filter(dep => 
        !execution.completedSteps.includes(dep) && !execution.skippedSteps.includes(dep)
      );

      if (unmetDependencies.length > 0) {
        throw new AgenticError(
          ErrorCode.PROCESSING_ERROR,
          `Unmet dependencies for step ${step.id}: ${unmetDependencies.join(', ')}`,
          'Step dependencies not satisfied.'
        );
      }

      // Find and validate agent
      const agent = this.agentRegistry.get(step.agentType);
      if (!agent || !agent.isAvailable) {
        if (step.required) {
          throw new AgenticError(
            ErrorCode.PROCESSING_ERROR,
            `Required agent not available: ${step.agentType}`,
            'Required agent is not available for execution.'
          );
        } else {
          // Skip optional step if agent not available
          execution.skippedSteps.push(step.id);
          this.logger.warn(`Skipping optional step due to unavailable agent: ${step.name}`, {
            stepId: step.id,
            agentType: step.agentType
          }, 'WorkflowEngine');
          return;
        }
      }

      // Prepare step inputs
      const stepInputs = this.prepareStepInputs(step, execution);

      // Execute step with timeout and retries
      const result = await this.executeStepWithRetries(step, stepInputs, agent);

      // Store results
      execution.stepResults[step.id] = result;
      execution.completedSteps.push(step.id);
      execution.metrics.completedSteps++;
      execution.metrics.costIncurred += agent.costPerOperation;

      const stepDuration = Date.now() - stepStartTime;
      this.logger.info(`Step completed: ${step.name}`, {
        executionId: execution.id,
        stepId: step.id,
        duration: stepDuration,
        cost: agent.costPerOperation
      }, 'WorkflowEngine');

      this.emit('step:completed', { 
        executionId: execution.id, 
        stepId: step.id, 
        result, 
        duration: stepDuration 
      });

    } catch (error) {
      const stepDuration = Date.now() - stepStartTime;
      execution.failedSteps.push(step.id);
      execution.metrics.failedSteps++;
      execution.errors.push({
        stepId: step.id,
        error: (error as Error).message,
        timestamp: new Date()
      });

      this.logger.error(`Step failed: ${step.name}`, error as Error, {
        executionId: execution.id,
        stepId: step.id,
        duration: stepDuration
      }, 'WorkflowEngine');

      this.emit('step:failed', { 
        executionId: execution.id, 
        stepId: step.id, 
        error, 
        duration: stepDuration 
      });

      // Handle failure based on strategy
      if (workflow.failureStrategy === 'fail-fast' || step.required) {
        throw error;
      }
      // Continue with other steps for 'continue-on-error' strategy
    } finally {
      execution.currentStep = undefined;
    }
  }

  private async executeStepWithRetries(
    step: WorkflowStep, 
    inputs: Record<string, any>, 
    agent: AgentCapability
  ): Promise<any> {
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= step.retryPolicy.maxRetries) {
      try {
        // This is where you'd call the actual agent
        // For now, we'll simulate the execution
        const result = await this.simulateAgentExecution(step, inputs, agent);
        return result;

      } catch (error) {
        lastError = error as Error;
        attempt++;

        if (attempt <= step.retryPolicy.maxRetries) {
          const backoffTime = step.retryPolicy.exponential 
            ? step.retryPolicy.backoffMs * Math.pow(2, attempt - 1)
            : step.retryPolicy.backoffMs;

          this.logger.warn(`Step attempt ${attempt} failed, retrying in ${backoffTime}ms`, {
            stepId: step.id,
            error: lastError.message
          }, 'WorkflowEngine');

          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
    }

    throw lastError || new Error('Unknown execution error');
  }

  private async simulateAgentExecution(
    step: WorkflowStep, 
    inputs: Record<string, any>, 
    agent: AgentCapability
  ): Promise<any> {
    // Simulate processing time based on agent latency
    await new Promise(resolve => setTimeout(resolve, agent.avgLatencyMs + Math.random() * 100));

    // Simulate occasional failures based on success rate
    if (Math.random() > agent.successRate) {
      throw new Error(`Simulated failure for ${step.agentType}`);
    }

    return {
      stepId: step.id,
      agentType: step.agentType,
      inputs,
      outputs: { result: `Processed by ${step.agentType}`, timestamp: new Date() },
      metadata: { 
        latency: agent.avgLatencyMs,
        cost: agent.costPerOperation 
      }
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private validateWorkflow(workflow: WorkflowDefinition): void {
    if (!workflow.id || !workflow.name || !workflow.steps) {
      throw new AgenticError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid workflow definition: missing required fields',
        'Workflow must have id, name, and steps.'
      );
    }

    // Validate step dependencies
    const stepIds = new Set(workflow.steps.map(s => s.id));
    for (const step of workflow.steps) {
      for (const dep of step.dependencies) {
        if (!stepIds.has(dep)) {
          throw new AgenticError(
            ErrorCode.VALIDATION_ERROR,
            `Invalid dependency: ${dep} not found in workflow steps`,
            'All step dependencies must reference existing steps.'
          );
        }
      }
    }

    // Check for circular dependencies
    if (this.hasCircularDependencies(workflow.steps)) {
      throw new AgenticError(
        ErrorCode.VALIDATION_ERROR,
        'Circular dependencies detected in workflow',
        'Workflow steps cannot have circular dependencies.'
      );
    }
  }

  private buildDependencyGraph(steps: WorkflowStep[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    for (const step of steps) {
      graph.set(step.id, step.dependencies);
    }
    return graph;
  }

  private createExecutionPlan(
    dependencyGraph: Map<string, string[]>, 
    workflow: WorkflowDefinition
  ): WorkflowStep[][] {
    const plan: WorkflowStep[][] = [];
    const completed = new Set<string>();
    const stepMap = new Map(workflow.steps.map(s => [s.id, s]));

    while (completed.size < workflow.steps.length) {
      const readySteps = workflow.steps.filter(step => 
        !completed.has(step.id) && 
        step.dependencies.every(dep => completed.has(dep))
      );

      if (readySteps.length === 0) {
        throw new AgenticError(
          ErrorCode.PROCESSING_ERROR,
          'Unable to create execution plan: deadlock detected',
          'Workflow has unresolvable dependencies.'
        );
      }

      plan.push(readySteps);
      readySteps.forEach(step => completed.add(step.id));
    }

    return plan;
  }

  private prepareStepInputs(step: WorkflowStep, execution: WorkflowExecution): Record<string, any> {
    const inputs = { ...step.inputs };

    // Add outputs from completed dependencies
    for (const depId of step.dependencies) {
      if (execution.stepResults[depId]) {
        inputs[`${depId}_output`] = execution.stepResults[depId];
      }
    }

    // Add execution context
    inputs._context = execution.context;
    inputs._executionId = execution.id;

    return inputs;
  }

  private hasCircularDependencies(steps: WorkflowStep[]): boolean {
    const graph = new Map<string, string[]>();
    steps.forEach(step => graph.set(step.id, step.dependencies));

    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const dependencies = graph.get(nodeId) || [];
      for (const dep of dependencies) {
        if (!visited.has(dep)) {
          if (hasCycle(dep)) return true;
        } else if (recursionStack.has(dep)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const step of steps) {
      if (!visited.has(step.id)) {
        if (hasCycle(step.id)) return true;
      }
    }

    return false;
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private setupEventHandlers(): void {
    this.on('workflow:started', ({ executionId, workflowId }) => {
      this.logger.debug(`Workflow started event: ${workflowId}`, { executionId }, 'WorkflowEngine');
    });

    this.on('workflow:completed', ({ executionId, execution }) => {
      this.logger.debug(`Workflow completed event: ${execution.workflowId}`, { 
        executionId, 
        duration: execution.metrics.totalDuration 
      }, 'WorkflowEngine');
    });

    this.on('workflow:failed', ({ executionId, execution, error }) => {
      this.logger.debug(`Workflow failed event: ${execution.workflowId}`, { 
        executionId, 
        error: error.message 
      }, 'WorkflowEngine');
    });
  }

  // ============================================================================
  // PUBLIC QUERY METHODS
  // ============================================================================

  getWorkflowStatus(executionId: string): WorkflowExecution | null {
    return this.executions.get(executionId) || null;
  }

  getRunningExecutions(): WorkflowExecution[] {
    return Array.from(this.runningExecutions)
      .map(id => this.executions.get(id))
      .filter(Boolean) as WorkflowExecution[];
  }

  async cancelExecution(executionId: string): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'running') {
      return false;
    }

    execution.status = 'cancelled';
    execution.endTime = new Date();
    this.runningExecutions.delete(executionId);

    this.logger.info(`Workflow execution cancelled: ${executionId}`, {
      workflowId: execution.workflowId,
      completedSteps: execution.completedSteps.length
    }, 'WorkflowEngine');

    this.emit('workflow:cancelled', { executionId, execution });
    return true;
  }

  getExecutionMetrics(executionId: string): WorkflowExecution['metrics'] | null {
    const execution = this.executions.get(executionId);
    return execution ? execution.metrics : null;
  }

  // Clean up old executions (for memory management)
  cleanupOldExecutions(olderThanHours: number = 24): number {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    let cleaned = 0;

    for (const [id, execution] of this.executions.entries()) {
      if (execution.status !== 'running' && execution.startTime.getTime() < cutoffTime) {
        this.executions.delete(id);
        cleaned++;
      }
    }

    this.logger.info(`Cleaned up ${cleaned} old workflow executions`, {
      olderThanHours,
      totalExecutions: this.executions.size
    }, 'WorkflowEngine');

    return cleaned;
  }
}