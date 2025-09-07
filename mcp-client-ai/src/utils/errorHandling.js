"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ErrorRecoveryManager = exports.Logger = exports.LogLevel = exports.DEFAULT_RETRY_CONFIG = exports.AgenticError = exports.ErrorCode = void 0;
exports.withRetry = withRetry;
exports.handleZodError = handleZodError;
exports.handleOpenAIError = handleOpenAIError;
exports.withFallback = withFallback;
// ============================================================================
// ERROR TYPES AND CLASSES
// ============================================================================
var ErrorCode;
(function (ErrorCode) {
    // Validation Errors
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["INVALID_INPUT"] = "INVALID_INPUT";
    ErrorCode["MISSING_REQUIRED_FIELD"] = "MISSING_REQUIRED_FIELD";
    // API Errors
    ErrorCode["API_ERROR"] = "API_ERROR";
    ErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    ErrorCode["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
    ErrorCode["AUTHORIZATION_ERROR"] = "AUTHORIZATION_ERROR";
    // External Service Errors
    ErrorCode["OPENAI_ERROR"] = "OPENAI_ERROR";
    ErrorCode["OPENAI_RATE_LIMIT"] = "OPENAI_RATE_LIMIT";
    ErrorCode["OPENAI_QUOTA_EXCEEDED"] = "OPENAI_QUOTA_EXCEEDED";
    // Agent Specific Errors
    ErrorCode["MARKET_RESEARCH_ERROR"] = "MARKET_RESEARCH_ERROR";
    ErrorCode["COMPETITIVE_ANALYSIS_ERROR"] = "COMPETITIVE_ANALYSIS_ERROR";
    ErrorCode["PROTOTYPE_GENERATION_ERROR"] = "PROTOTYPE_GENERATION_ERROR";
    ErrorCode["DOCUMENT_PACKAGE_ERROR"] = "DOCUMENT_PACKAGE_ERROR";
    // System Errors
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCode["TIMEOUT_ERROR"] = "TIMEOUT_ERROR";
    ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCode["FILE_SYSTEM_ERROR"] = "FILE_SYSTEM_ERROR";
    // Business Logic Errors
    ErrorCode["INSUFFICIENT_DATA"] = "INSUFFICIENT_DATA";
    ErrorCode["PROCESSING_ERROR"] = "PROCESSING_ERROR";
    ErrorCode["GENERATION_FAILED"] = "GENERATION_FAILED";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
class AgenticError extends Error {
    constructor(code, message, userMessage, context, retryable = false) {
        super(message);
        this.name = 'AgenticError';
        this.code = code;
        this.context = context;
        this.timestamp = new Date();
        this.retryable = retryable;
        this.userMessage = userMessage || this.getDefaultUserMessage(code);
    }
    getDefaultUserMessage(code) {
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
exports.AgenticError = AgenticError;
exports.DEFAULT_RETRY_CONFIG = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    exponentialBackoff: true,
    retryCondition: (error) => {
        if (error instanceof AgenticError) {
            return error.retryable;
        }
        // Retry on network errors, timeouts, and rate limits
        return error.message.includes('timeout') ||
            error.message.includes('network') ||
            error.message.includes('rate limit');
    }
};
function withRetry(operation_1) {
    return __awaiter(this, arguments, void 0, function* (operation, config = {}) {
        const finalConfig = Object.assign(Object.assign({}, exports.DEFAULT_RETRY_CONFIG), config);
        let lastError;
        for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
            try {
                return yield operation();
            }
            catch (error) {
                lastError = error;
                // Don't retry if this is the last attempt or error is not retryable
                if (attempt === finalConfig.maxAttempts ||
                    (finalConfig.retryCondition && !finalConfig.retryCondition(lastError))) {
                    break;
                }
                // Calculate delay
                let delay = finalConfig.baseDelay;
                if (finalConfig.exponentialBackoff) {
                    delay = Math.min(finalConfig.baseDelay * Math.pow(2, attempt - 1), finalConfig.maxDelay);
                }
                // Add jitter to prevent thundering herd
                delay += Math.random() * 1000;
                yield new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    });
}
function handleZodError(error, context) {
    var _a;
    const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    return new AgenticError(ErrorCode.VALIDATION_ERROR, `Validation failed: ${errorMessages}`, `Please check your input: ${errorMessages}`, {
        context,
        zodError: error.errors,
        inputPath: (_a = error.errors[0]) === null || _a === void 0 ? void 0 : _a.path
    }, false);
}
function handleOpenAIError(error, context) {
    // Handle different types of OpenAI errors
    if ((error === null || error === void 0 ? void 0 : error.status) === 429) {
        return new AgenticError(ErrorCode.OPENAI_RATE_LIMIT, `OpenAI rate limit exceeded: ${error.message}`, 'AI service is temporarily busy. Please wait a moment and try again.', { context, openaiError: error }, true);
    }
    if ((error === null || error === void 0 ? void 0 : error.status) === 401) {
        return new AgenticError(ErrorCode.AUTHENTICATION_ERROR, `OpenAI authentication failed: ${error.message}`, 'Authentication error. Please contact support.', { context, openaiError: error }, false);
    }
    if ((error === null || error === void 0 ? void 0 : error.status) === 402) {
        return new AgenticError(ErrorCode.OPENAI_QUOTA_EXCEEDED, `OpenAI quota exceeded: ${error.message}`, 'AI service quota exceeded. Please contact support.', { context, openaiError: error }, false);
    }
    if ((error === null || error === void 0 ? void 0 : error.status) >= 500) {
        return new AgenticError(ErrorCode.OPENAI_ERROR, `OpenAI server error: ${error.message}`, 'AI service is temporarily unavailable. Please try again.', { context, openaiError: error }, true);
    }
    return new AgenticError(ErrorCode.OPENAI_ERROR, `OpenAI error: ${error.message || 'Unknown OpenAI error'}`, 'AI service error. Please try again.', { context, openaiError: error }, true);
}
// ============================================================================
// STRUCTURED LOGGING
// ============================================================================
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor() { }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    setContext(requestId, userId) {
        this.requestId = requestId;
        this.userId = userId;
    }
    error(message, error, context, agentName) {
        this.log(LogLevel.ERROR, message, context, error, agentName);
    }
    warn(message, context, agentName) {
        this.log(LogLevel.WARN, message, context, undefined, agentName);
    }
    info(message, context, agentName) {
        this.log(LogLevel.INFO, message, context, undefined, agentName);
    }
    debug(message, context, agentName) {
        this.log(LogLevel.DEBUG, message, context, undefined, agentName);
    }
    log(level, message, context, error, agentName) {
        const logEntry = {
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
    sendToLoggingService(logEntry) {
        // Placeholder for production logging service integration
        // This would integrate with your preferred logging solution
    }
}
exports.Logger = Logger;
function withFallback(operation, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = Logger.getInstance();
        try {
            return yield operation();
        }
        catch (error) {
            const shouldUseFallback = config.shouldUseFallback
                ? config.shouldUseFallback(error)
                : true;
            if (!shouldUseFallback) {
                throw error;
            }
            if (config.logFallback) {
                logger.warn('Using fallback due to error', {
                    error: error.message,
                    hasFallbackValue: !!config.fallbackValue,
                    hasFallbackFunction: !!config.fallbackFunction
                });
            }
            if (config.fallbackFunction) {
                return yield config.fallbackFunction();
            }
            if (config.fallbackValue !== undefined) {
                return config.fallbackValue;
            }
            throw error;
        }
    });
}
// ============================================================================
// ERROR RECOVERY STRATEGIES
// ============================================================================
class ErrorRecoveryManager {
    static registerRecoveryStrategy(errorCode, strategy) {
        this.strategies.set(errorCode, strategy);
    }
    static attemptRecovery(error) {
        return __awaiter(this, void 0, void 0, function* () {
            const strategy = this.strategies.get(error.code);
            if (strategy) {
                return yield strategy(error);
            }
            throw error;
        });
    }
}
exports.ErrorRecoveryManager = ErrorRecoveryManager;
ErrorRecoveryManager.strategies = new Map();
// Register default recovery strategies
ErrorRecoveryManager.registerRecoveryStrategy(ErrorCode.OPENAI_RATE_LIMIT, (error) => __awaiter(void 0, void 0, void 0, function* () {
    const logger = Logger.getInstance();
    logger.info('Attempting recovery from OpenAI rate limit', { error: error.message });
    // Wait and retry with exponential backoff
    yield new Promise(resolve => setTimeout(resolve, 5000));
    throw new AgenticError(ErrorCode.OPENAI_RATE_LIMIT, 'Rate limit recovery attempted, please retry', 'Please try your request again.', error.context, true);
}));
ErrorRecoveryManager.registerRecoveryStrategy(ErrorCode.INSUFFICIENT_DATA, (error) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
// ============================================================================
// EXPORTS
// ============================================================================
exports.errorHandler = {
    AgenticError,
    ErrorCode,
    handleZodError,
    handleOpenAIError,
    withRetry,
    withFallback,
    Logger: Logger.getInstance(),
    ErrorRecoveryManager
};
