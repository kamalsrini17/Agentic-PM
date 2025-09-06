import { z } from 'zod';

// ============================================================================
// ERROR TYPES AND CLASSES
// ============================================================================

export enum ErrorCode {
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // API Errors
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  
  // External Service Errors
  OPENAI_ERROR = 'OPENAI_ERROR',
  OPENAI_RATE_LIMIT = 'OPENAI_RATE_LIMIT',
  OPENAI_QUOTA_EXCEEDED = 'OPENAI_QUOTA_EXCEEDED',
  
  // Agent Specific Errors
  MARKET_RESEARCH_ERROR = 'MARKET_RESEARCH_ERROR',
  COMPETITIVE_ANALYSIS_ERROR = 'COMPETITIVE_ANALYSIS_ERROR',
  PROTOTYPE_GENERATION_ERROR = 'PROTOTYPE_GENERATION_ERROR',
  DOCUMENT_PACKAGE_ERROR = 'DOCUMENT_PACKAGE_ERROR',
  
  // System Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  FILE_SYSTEM_ERROR = 'FILE_SYSTEM_ERROR',
  
  // Business Logic Errors
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  GENERATION_FAILED = 'GENERATION_FAILED'
}

export class AgenticError extends Error {
  public readonly code: ErrorCode;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;
  public readonly retryable: boolean;
  public readonly userMessage: string;

  constructor(
    code: ErrorCode,
    message: string,
    userMessage?: string,
    context?: Record<string, any>,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'AgenticError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
    this.retryable = retryable;
    this.userMessage = userMessage || this.getDefaultUserMessage(code);
  }

  private getDefaultUserMessage(code: ErrorCode): string {
    const messages = {
      [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
      [ErrorCode.INVALID_INPUT]: 'The provided input is invalid. Please review and correct.',
      [ErrorCode.API_ERROR]: 'There was an issue with the service. Please try again.',
      [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment and try again.',
      [ErrorCode.OPENAI_ERROR]: 'AI service is temporarily unavailable. Please try again.',
      [ErrorCode.OPENAI_RATE_LIMIT]: 'AI service rate limit reached. Please wait and try again.',
      [ErrorCode.MARKET_RESEARCH_ERROR]: 'Market research analysis failed. Please try again.',
      [ErrorCode.COMPETITIVE_ANALYSIS_ERROR]: 'Competitive analysis failed. Please try again.',
      [ErrorCode.PROTOTYPE_GENERATION_ERROR]: 'Prototype generation failed. Please try again.',
      [ErrorCode.DOCUMENT_PACKAGE_ERROR]: 'Document generation failed. Please try again.',
      [ErrorCode.INTERNAL_ERROR]: 'An internal error occurred. Please contact support.',
      [ErrorCode.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
      [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
      [ErrorCode.INSUFFICIENT_DATA]: 'Insufficient data to complete the analysis.',
      [ErrorCode.PROCESSING_ERROR]: 'Processing failed. Please try again.',
      [ErrorCode.GENERATION_FAILED]: 'Content generation failed. Please try again.'
    };

    return messages[code] || 'An unexpected error occurred. Please try again.';
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      retryable: this.retryable,
      stack: this.stack
    };
  }
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
  retryCondition?: (error: Error) => boolean;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponentialBackoff: true,
  retryCondition: (error: Error) => {
    if (error instanceof AgenticError) {
      return error.retryable;
    }
    // Retry on network errors, timeouts, and rate limits
    return error.message.includes('timeout') || 
           error.message.includes('network') ||
           error.message.includes('rate limit');
  }
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if this is the last attempt or error is not retryable
      if (attempt === finalConfig.maxAttempts || 
          (finalConfig.retryCondition && !finalConfig.retryCondition(lastError))) {
        break;
      }

      // Calculate delay
      let delay = finalConfig.baseDelay;
      if (finalConfig.exponentialBackoff) {
        delay = Math.min(
          finalConfig.baseDelay * Math.pow(2, attempt - 1),
          finalConfig.maxDelay
        );
      }

      // Add jitter to prevent thundering herd
      delay += Math.random() * 1000;

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

export function handleZodError(error: z.ZodError, context?: string): AgenticError {
  const errorMessages = error.errors.map(err => 
    `${err.path.join('.')}: ${err.message}`
  ).join(', ');

  return new AgenticError(
    ErrorCode.VALIDATION_ERROR,
    `Validation failed: ${errorMessages}`,
    `Please check your input: ${errorMessages}`,
    { 
      context,
      zodError: error.errors,
      inputPath: error.errors[0]?.path 
    },
    false
  );
}

export function handleOpenAIError(error: any, context?: string): AgenticError {
  // Handle different types of OpenAI errors
  if (error?.status === 429) {
    return new AgenticError(
      ErrorCode.OPENAI_RATE_LIMIT,
      `OpenAI rate limit exceeded: ${error.message}`,
      'AI service is temporarily busy. Please wait a moment and try again.',
      { context, openaiError: error },
      true
    );
  }

  if (error?.status === 401) {
    return new AgenticError(
      ErrorCode.AUTHENTICATION_ERROR,
      `OpenAI authentication failed: ${error.message}`,
      'Authentication error. Please contact support.',
      { context, openaiError: error },
      false
    );
  }

  if (error?.status === 402) {
    return new AgenticError(
      ErrorCode.OPENAI_QUOTA_EXCEEDED,
      `OpenAI quota exceeded: ${error.message}`,
      'AI service quota exceeded. Please contact support.',
      { context, openaiError: error },
      false
    );
  }

  if (error?.status >= 500) {
    return new AgenticError(
      ErrorCode.OPENAI_ERROR,
      `OpenAI server error: ${error.message}`,
      'AI service is temporarily unavailable. Please try again.',
      { context, openaiError: error },
      true
    );
  }

  return new AgenticError(
    ErrorCode.OPENAI_ERROR,
    `OpenAI error: ${error.message || 'Unknown OpenAI error'}`,
    'AI service error. Please try again.',
    { context, openaiError: error },
    true
  );
}

// ============================================================================
// STRUCTURED LOGGING
// ============================================================================

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
  requestId?: string;
  userId?: string;
  agentName?: string;
}

export class Logger {
  private static instance: Logger;
  private requestId?: string;
  private userId?: string;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setContext(requestId?: string, userId?: string): void {
    this.requestId = requestId;
    this.userId = userId;
  }

  public error(message: string, error?: Error, context?: Record<string, any>, agentName?: string): void {
    this.log(LogLevel.ERROR, message, context, error, agentName);
  }

  public warn(message: string, context?: Record<string, any>, agentName?: string): void {
    this.log(LogLevel.WARN, message, context, undefined, agentName);
  }

  public info(message: string, context?: Record<string, any>, agentName?: string): void {
    this.log(LogLevel.INFO, message, context, undefined, agentName);
  }

  public debug(message: string, context?: Record<string, any>, agentName?: string): void {
    this.log(LogLevel.DEBUG, message, context, undefined, agentName);
  }

  private log(
    level: LogLevel, 
    message: string, 
    context?: Record<string, any>, 
    error?: Error,
    agentName?: string
  ): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      requestId: this.requestId,
      userId: this.userId,
      agentName
    };

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(logEntry, null, 2));
    }

    // In production, you would send to your logging service
    // e.g., Winston, DataDog, CloudWatch, etc.
    this.sendToLoggingService(logEntry);
  }

  private sendToLoggingService(logEntry: LogEntry): void {
    // Placeholder for production logging service integration
    // This would integrate with your preferred logging solution
  }
}

// ============================================================================
// GRACEFUL DEGRADATION UTILITIES
// ============================================================================

export interface FallbackConfig<T> {
  fallbackValue?: T;
  fallbackFunction?: () => T | Promise<T>;
  shouldUseFallback?: (error: Error) => boolean;
  logFallback?: boolean;
}

export async function withFallback<T>(
  operation: () => Promise<T>,
  config: FallbackConfig<T>
): Promise<T> {
  const logger = Logger.getInstance();

  try {
    return await operation();
  } catch (error) {
    const shouldUseFallback = config.shouldUseFallback 
      ? config.shouldUseFallback(error as Error)
      : true;

    if (!shouldUseFallback) {
      throw error;
    }

    if (config.logFallback) {
      logger.warn('Using fallback due to error', {
        error: (error as Error).message,
        hasFallbackValue: !!config.fallbackValue,
        hasFallbackFunction: !!config.fallbackFunction
      });
    }

    if (config.fallbackFunction) {
      return await config.fallbackFunction();
    }

    if (config.fallbackValue !== undefined) {
      return config.fallbackValue;
    }

    throw error;
  }
}

// ============================================================================
// ERROR RECOVERY STRATEGIES
// ============================================================================

export class ErrorRecoveryManager {
  private static strategies = new Map<ErrorCode, (error: AgenticError) => Promise<any>>();

  public static registerRecoveryStrategy(
    errorCode: ErrorCode,
    strategy: (error: AgenticError) => Promise<any>
  ): void {
    this.strategies.set(errorCode, strategy);
  }

  public static async attemptRecovery(error: AgenticError): Promise<any> {
    const strategy = this.strategies.get(error.code);
    if (strategy) {
      return await strategy(error);
    }
    throw error;
  }
}

// Register default recovery strategies
ErrorRecoveryManager.registerRecoveryStrategy(
  ErrorCode.OPENAI_RATE_LIMIT,
  async (error: AgenticError) => {
    const logger = Logger.getInstance();
    logger.info('Attempting recovery from OpenAI rate limit', { error: error.message });
    
    // Wait and retry with exponential backoff
    await new Promise(resolve => setTimeout(resolve, 5000));
    throw new AgenticError(
      ErrorCode.OPENAI_RATE_LIMIT,
      'Rate limit recovery attempted, please retry',
      'Please try your request again.',
      error.context,
      true
    );
  }
);

ErrorRecoveryManager.registerRecoveryStrategy(
  ErrorCode.INSUFFICIENT_DATA,
  async (error: AgenticError) => {
    const logger = Logger.getInstance();
    logger.info('Attempting recovery from insufficient data', { error: error.message });
    
    // Return a minimal viable response with clear indication of limitations
    return {
      success: false,
      partialData: true,
      message: 'Analysis completed with limited data. Results may be incomplete.',
      recommendations: [
        'Provide more detailed product description',
        'Add specific target market information',
        'Include additional business context'
      ]
    };
  }
);

// ============================================================================
// EXPORTS
// ============================================================================

export const errorHandler = {
  AgenticError,
  ErrorCode,
  handleZodError,
  handleOpenAIError,
  withRetry,
  withFallback,
  Logger: Logger.getInstance(),
  ErrorRecoveryManager
};