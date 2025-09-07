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
exports.MultiModelAI = exports.AVAILABLE_MODELS = void 0;
const openai_1 = require("openai");
const sdk_1 = require("@anthropic-ai/sdk");
const errorHandling_1 = require("../utils/errorHandling");
exports.AVAILABLE_MODELS = {
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
class MultiModelAI {
    constructor() {
        this.logger = errorHandling_1.Logger.getInstance();
        // Initialize OpenAI
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.AUTHENTICATION_ERROR, 'OPENAI_API_KEY environment variable is required', 'OpenAI API key is not configured. Please contact support.');
        }
        this.openai = new openai_1.OpenAI({ apiKey: openaiApiKey });
        // Initialize Anthropic
        const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicApiKey) {
            this.logger.warn('ANTHROPIC_API_KEY not found, Claude models will be unavailable');
        }
        else {
            this.anthropic = new sdk_1.Anthropic({ apiKey: anthropicApiKey });
        }
    }
    queryMultipleModels(request) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info('Starting multi-model query', {
                models: request.models,
                promptLength: request.prompt.length
            }, 'MultiModelAI');
            const startTime = Date.now();
            const responses = {};
            const errors = {};
            // Execute all model queries in parallel
            const promises = request.models.map((modelName) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield this.querySingleModel(modelName, request);
                    responses[modelName] = response;
                    return { modelName, success: true, response };
                }
                catch (error) {
                    this.logger.error(`Model ${modelName} failed`, error, {
                        modelName,
                        promptLength: request.prompt.length
                    }, 'MultiModelAI');
                    errors[modelName] = error;
                    return { modelName, success: false, error: error };
                }
            }));
            yield Promise.allSettled(promises);
            const totalLatency = Date.now() - startTime;
            // Determine fastest and most comprehensive response
            const fastest = this.findFastestResponse(responses);
            const mostTokens = this.findMostComprehensiveResponse(responses);
            const result = {
                responses,
                fastest,
                mostTokens,
                errors,
                totalLatency
            };
            this.logger.info('Multi-model query completed', {
                successfulModels: Object.keys(responses).length,
                failedModels: Object.keys(errors).length,
                totalLatency,
                fastest,
                mostTokens
            }, 'MultiModelAI');
            return result;
        });
    }
    querySingleModel(modelName, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = exports.AVAILABLE_MODELS[modelName];
            if (!config) {
                throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.INVALID_INPUT, `Unknown model: ${modelName}`, `Model ${modelName} is not supported.`);
            }
            return yield (0, errorHandling_1.withRetry)(() => __awaiter(this, void 0, void 0, function* () {
                const startTime = Date.now();
                if (config.provider === 'openai') {
                    return yield this.queryOpenAI(modelName, config, request, startTime);
                }
                else if (config.provider === 'anthropic') {
                    return yield this.queryAnthropic(modelName, config, request, startTime);
                }
                else {
                    throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.INVALID_INPUT, `Unsupported provider: ${config.provider}`, `Provider ${config.provider} is not supported.`);
                }
            }), {
                maxAttempts: 3,
                baseDelay: 1000,
                retryCondition: (error) => {
                    return error instanceof errorHandling_1.AgenticError && error.retryable;
                }
            });
        });
    }
    queryOpenAI(modelName, config, request, startTime) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            try {
                const messages = [];
                if (request.systemPrompt) {
                    messages.push({ role: 'system', content: request.systemPrompt });
                }
                messages.push({ role: 'user', content: request.prompt });
                const response = yield this.openai.chat.completions.create({
                    model: config.model,
                    messages,
                    temperature: (_a = request.temperature) !== null && _a !== void 0 ? _a : config.temperature,
                    max_tokens: (_b = request.maxTokens) !== null && _b !== void 0 ? _b : config.maxTokens,
                    timeout: config.timeout
                });
                const latency = Date.now() - startTime;
                const content = (_d = (_c = response.choices[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content;
                if (!content) {
                    throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.GENERATION_FAILED, `${modelName} returned empty response`, 'AI model failed to generate content.', { modelName }, true);
                }
                return {
                    content,
                    model: modelName,
                    provider: 'openai',
                    tokens: {
                        input: ((_e = response.usage) === null || _e === void 0 ? void 0 : _e.prompt_tokens) || 0,
                        output: ((_f = response.usage) === null || _f === void 0 ? void 0 : _f.completion_tokens) || 0,
                        total: ((_g = response.usage) === null || _g === void 0 ? void 0 : _g.total_tokens) || 0
                    },
                    latency,
                    cost: this.calculateOpenAICost(config.model, ((_h = response.usage) === null || _h === void 0 ? void 0 : _h.total_tokens) || 0)
                };
            }
            catch (error) {
                throw (0, errorHandling_1.handleOpenAIError)(error, `OpenAI ${modelName} query`);
            }
        });
    }
    queryAnthropic(modelName, config, request, startTime) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if (!this.anthropic) {
                throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.AUTHENTICATION_ERROR, 'Anthropic API key not configured', 'Claude models are not available. Please contact support.');
            }
            try {
                const response = yield this.anthropic.messages.create({
                    model: config.model,
                    max_tokens: (_b = (_a = request.maxTokens) !== null && _a !== void 0 ? _a : config.maxTokens) !== null && _b !== void 0 ? _b : 4000,
                    temperature: (_c = request.temperature) !== null && _c !== void 0 ? _c : config.temperature,
                    system: request.systemPrompt || undefined,
                    messages: [
                        { role: 'user', content: request.prompt }
                    ]
                });
                const latency = Date.now() - startTime;
                const content = ((_d = response.content[0]) === null || _d === void 0 ? void 0 : _d.type) === 'text'
                    ? response.content[0].text
                    : '';
                if (!content) {
                    throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.GENERATION_FAILED, `${modelName} returned empty response`, 'AI model failed to generate content.', { modelName }, true);
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
            }
            catch (error) {
                throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.API_ERROR, `Anthropic ${modelName} error: ${error.message}`, 'Claude model is temporarily unavailable. Please try again.', { modelName, error: error.message }, true);
            }
        });
    }
    findFastestResponse(responses) {
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
    findMostComprehensiveResponse(responses) {
        var _a;
        let mostComprehensive = '';
        let maxTokens = 0;
        for (const [modelName, response] of Object.entries(responses)) {
            const tokens = ((_a = response.tokens) === null || _a === void 0 ? void 0 : _a.output) || response.content.length;
            if (tokens > maxTokens) {
                maxTokens = tokens;
                mostComprehensive = modelName;
            }
        }
        return mostComprehensive;
    }
    calculateOpenAICost(model, totalTokens) {
        // Approximate costs per 1K tokens (as of 2024)
        const costs = {
            'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
            'gpt-5': { input: 0.015, output: 0.045 }, // Estimated
            'gpt-4': { input: 0.03, output: 0.06 }
        };
        const cost = costs[model] || costs['gpt-4'];
        return (totalTokens / 1000) * ((cost.input + cost.output) / 2);
    }
    calculateAnthropicCost(model, inputTokens, outputTokens) {
        // Approximate costs per 1K tokens (as of 2024)
        const costs = {
            'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
            'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
            'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
        };
        const cost = costs[model] || costs['claude-3-sonnet-20240229'];
        return (inputTokens / 1000) * cost.input + (outputTokens / 1000) * cost.output;
    }
    // Utility method to get available models
    getAvailableModels() {
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
    testConnectivity() {
        return __awaiter(this, void 0, void 0, function* () {
            const results = {};
            const testPrompt = "Respond with exactly: 'Connection test successful'";
            const availableModels = this.getAvailableModels();
            for (const model of availableModels) {
                try {
                    const response = yield this.querySingleModel(model, {
                        prompt: testPrompt,
                        models: [model],
                        maxTokens: 50
                    });
                    results[model] = response.content.includes('Connection test successful');
                }
                catch (error) {
                    results[model] = false;
                }
            }
            return results;
        });
    }
}
exports.MultiModelAI = MultiModelAI;
