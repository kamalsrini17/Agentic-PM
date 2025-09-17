import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { Logger, AgenticError, ErrorCode, withRetry, handleOpenAIError } from '../utils/errorHandling';

// ============================================================================
// MODEL CONFIGURATION
// ============================================================================

export interface ModelConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export const AVAILABLE_MODELS: Record<string, ModelConfig> = {
  'gpt-4': {
    provider: 'openai',
    model: 'gpt-4-turbo-preview',
    maxTokens: 4000,
    temperature: 0.3,
    timeout: 60000
  },
  'gpt-5': {
    provider: 'openai', 
    model: 'gpt-5', // Will be updated when GPT-5 is released
    maxTokens: 4000,
    temperature: 0.3,
    timeout: 60000
  },
  'claude-3-opus': {
    provider: 'anthropic',
    model: 'claude-3-opus-20240229',
    maxTokens: 4000,
    temperature: 0.3,
    timeout: 60000
  },
  'claude-3-sonnet': {
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    maxTokens: 4000,
    temperature: 0.3,
    timeout: 60000
  },
  'claude-3-haiku': {
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    maxTokens: 4000,
    temperature: 0.3,
    timeout: 60000
  }
};

// ============================================================================
// MULTI-MODEL AI SERVICE
// ============================================================================

export interface AIResponse {
  content: string;
  model: string;
  provider: string;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
  latency: number;
  cost?: number;
}

export interface MultiModelRequest {
  prompt: string;
  models: string[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface MultiModelResponse {
  responses: Record<string, AIResponse>;
  fastest: string;
  mostTokens: string;
  errors: Record<string, Error>;
  totalLatency: number;
}

export class MultiModelAI {
  private openai: OpenAI;
  private anthropic: Anthropic | null = null;
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
    
    // Initialize OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new AgenticError(
        ErrorCode.AUTHENTICATION_ERROR,
        'OPENAI_API_KEY environment variable is required',
        'OpenAI API key is not configured. Please contact support.'
      );
    }
    this.openai = new OpenAI({ apiKey: openaiApiKey });

    // Initialize Anthropic
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      this.logger.warn('ANTHROPIC_API_KEY not found, Claude models will be unavailable');
    } else {
      this.anthropic = new Anthropic({ apiKey: anthropicApiKey });
    }
  }

  // REMOVED: queryMultipleModels function - replaced with direct OpenAI calls
  // This method was causing hanging issues and has been deprecated
  async queryMultipleModels(request: MultiModelRequest): Promise<MultiModelResponse> {
    throw new AgenticError(
      ErrorCode.PROCESSING_ERROR,
      'queryMultipleModels has been deprecated',
      'This method has been replaced with direct OpenAI API calls for better performance.'
    );
  }

  private async querySingleModel(
    modelName: string, 
    request: MultiModelRequest
  ): Promise<AIResponse> {
    const config = AVAILABLE_MODELS[modelName];
    if (!config) {
      throw new AgenticError(
        ErrorCode.INVALID_INPUT,
        `Unknown model: ${modelName}`,
        `Model ${modelName} is not supported.`
      );
    }

    return await withRetry(async () => {
      const startTime = Date.now();

      if (config.provider === 'openai') {
        return await this.queryOpenAI(modelName, config, request, startTime);
      } else if (config.provider === 'anthropic') {
        return await this.queryAnthropic(modelName, config, request, startTime);
      } else {
        throw new AgenticError(
          ErrorCode.INVALID_INPUT,
          `Unsupported provider: ${config.provider}`,
          `Provider ${config.provider} is not supported.`
        );
      }
    }, {
      maxAttempts: 3,
      baseDelay: 1000,
      retryCondition: (error: Error) => {
        return error instanceof AgenticError && error.retryable;
      }
    });
  }

  private async queryOpenAI(
    modelName: string,
    config: ModelConfig,
    request: MultiModelRequest,
    startTime: number
  ): Promise<AIResponse> {
    try {
      const messages: any[] = [];
      
      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }
      
      messages.push({ role: 'user', content: request.prompt });

      const response = await this.openai.chat.completions.create({
        model: config.model,
        messages,
        temperature: request.temperature ?? config.temperature,
        max_tokens: request.maxTokens ?? config.maxTokens
        // Note: timeout is handled by OpenAI client configuration
      });

      const latency = Date.now() - startTime;
      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new AgenticError(
          ErrorCode.GENERATION_FAILED,
          `${modelName} returned empty response`,
          'AI model failed to generate content.',
          { modelName },
          true
        );
      }

      return {
        content,
        model: modelName,
        provider: 'openai',
        tokens: {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0
        },
        latency,
        cost: this.calculateOpenAICost(config.model, response.usage?.total_tokens || 0)
      };

    } catch (error) {
      throw handleOpenAIError(error, `OpenAI ${modelName} query`);
    }
  }

  private async queryAnthropic(
    modelName: string,
    config: ModelConfig,
    request: MultiModelRequest,
    startTime: number
  ): Promise<AIResponse> {
    if (!this.anthropic) {
      throw new AgenticError(
        ErrorCode.AUTHENTICATION_ERROR,
        'Anthropic API key not configured',
        'Claude models are not available. Please contact support.'
      );
    }

    try {
      const response = await this.anthropic.messages.create({
        model: config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 4000,
        temperature: request.temperature ?? config.temperature,
        system: request.systemPrompt || undefined,
        messages: [
          { role: 'user', content: request.prompt }
        ]
      });

      const latency = Date.now() - startTime;
      const content = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : '';

      if (!content) {
        throw new AgenticError(
          ErrorCode.GENERATION_FAILED,
          `${modelName} returned empty response`,
          'AI model failed to generate content.',
          { modelName },
          true
        );
      }

      return {
        content,
        model: modelName,
        provider: 'anthropic',
        tokens: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
          total: response.usage.input_tokens + response.usage.output_tokens
        },
        latency,
        cost: this.calculateAnthropicCost(config.model, response.usage.input_tokens, response.usage.output_tokens)
      };

    } catch (error) {
      throw new AgenticError(
        ErrorCode.API_ERROR,
        `Anthropic ${modelName} error: ${(error as Error).message}`,
        'Claude model is temporarily unavailable. Please try again.',
        { modelName, error: (error as Error).message },
        true
      );
    }
  }

  private findFastestResponse(responses: Record<string, AIResponse>): string {
    let fastest = '';
    let minLatency = Infinity;

    for (const [modelName, response] of Object.entries(responses)) {
      if (response.latency < minLatency) {
        minLatency = response.latency;
        fastest = modelName;
      }
    }

    return fastest;
  }

  private findMostComprehensiveResponse(responses: Record<string, AIResponse>): string {
    let mostComprehensive = '';
    let maxTokens = 0;

    for (const [modelName, response] of Object.entries(responses)) {
      const tokens = response.tokens?.output || response.content.length;
      if (tokens > maxTokens) {
        maxTokens = tokens;
        mostComprehensive = modelName;
      }
    }

    return mostComprehensive;
  }

  private calculateOpenAICost(model: string, totalTokens: number): number {
    // Approximate costs per 1K tokens (as of 2024)
    const costs: Record<string, { input: number; output: number }> = {
      'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
      'gpt-5': { input: 0.015, output: 0.045 }, // Estimated
      'gpt-4': { input: 0.03, output: 0.06 }
    };

    const cost = costs[model] || costs['gpt-4'];
    return (totalTokens / 1000) * ((cost.input + cost.output) / 2);
  }

  private calculateAnthropicCost(model: string, inputTokens: number, outputTokens: number): number {
    // Approximate costs per 1K tokens (as of 2024)
    const costs: Record<string, { input: number; output: number }> = {
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
    };

    const cost = costs[model] || costs['claude-3-sonnet-20240229'];
    return (inputTokens / 1000) * cost.input + (outputTokens / 1000) * cost.output;
  }

  // Utility method to get available models
  getAvailableModels(): string[] {
    const available = [];
    
    // Always include OpenAI models if API key is available
    if (process.env.OPENAI_API_KEY) {
      available.push('gpt-4');
      if (process.env.GPT5_ENABLED === 'true') {
        available.push('gpt-5');
      }
    }

    // Include Claude models if API key is available
    if (process.env.ANTHROPIC_API_KEY) {
      available.push('claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku');
    }

    return available;
  }

  // Test connectivity to all models
  async testConnectivity(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    const testPrompt = "Respond with exactly: 'Connection test successful'";

    const availableModels = this.getAvailableModels();
    
    for (const model of availableModels) {
      try {
        const response = await this.querySingleModel(model, {
          prompt: testPrompt,
          models: [model],
          maxTokens: 50
        });
        results[model] = response.content.includes('Connection test successful');
      } catch (error) {
        results[model] = false;
      }
    }

    return results;
  }
}