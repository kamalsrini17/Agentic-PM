"use strict";
/**
 * Enhanced Agentic PM - Main Entry Point
 * Unified Agent System with Orchestration, Metrics, and Optimized Evaluation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.examples = exports.AgenticPMPresets = exports.AgenticPM = exports.SystemTests = exports.MultiModelAI = exports.ErrorCode = exports.AgenticError = exports.Logger = exports.AgenticPMEvaluationFramework = exports.EvaluationAgent = exports.AgenticPMOrchestrator = exports.AgenticPMClient = exports.OptimizedEvalsAgent = exports.MetricsAgent = exports.BUSINESS_METRICS = exports.MetricsCollector = exports.OrchestrationAgent = exports.WorkflowEngine = exports.UnifiedAgentSystem = void 0;
exports.runSystemTests = runSystemTests;
exports.createAgenticPM = createAgenticPM;
// Core System
var UnifiedAgentSystem_1 = require("./integration/UnifiedAgentSystem");
Object.defineProperty(exports, "UnifiedAgentSystem", { enumerable: true, get: function () { return UnifiedAgentSystem_1.UnifiedAgentSystem; } });
// Orchestration Framework
var WorkflowEngine_1 = require("./orchestration/WorkflowEngine");
Object.defineProperty(exports, "WorkflowEngine", { enumerable: true, get: function () { return WorkflowEngine_1.WorkflowEngine; } });
var OrchestrationAgent_1 = require("./orchestration/OrchestrationAgent");
Object.defineProperty(exports, "OrchestrationAgent", { enumerable: true, get: function () { return OrchestrationAgent_1.OrchestrationAgent; } });
// Metrics Infrastructure
var MetricsCollector_1 = require("./metrics/MetricsCollector");
Object.defineProperty(exports, "MetricsCollector", { enumerable: true, get: function () { return MetricsCollector_1.MetricsCollector; } });
Object.defineProperty(exports, "BUSINESS_METRICS", { enumerable: true, get: function () { return MetricsCollector_1.BUSINESS_METRICS; } });
var MetricsAgent_1 = require("./metrics/MetricsAgent");
Object.defineProperty(exports, "MetricsAgent", { enumerable: true, get: function () { return MetricsAgent_1.MetricsAgent; } });
// Optimized Evaluation
var OptimizedEvalsAgent_1 = require("./evaluation/OptimizedEvalsAgent");
Object.defineProperty(exports, "OptimizedEvalsAgent", { enumerable: true, get: function () { return OptimizedEvalsAgent_1.OptimizedEvalsAgent; } });
// Legacy Exports (for backward compatibility)
var agenticClient_1 = require("./agenticClient");
Object.defineProperty(exports, "AgenticPMClient", { enumerable: true, get: function () { return agenticClient_1.AgenticPMClient; } });
var AgenticPMOrchestrator_1 = require("./agents/AgenticPMOrchestrator");
Object.defineProperty(exports, "AgenticPMOrchestrator", { enumerable: true, get: function () { return AgenticPMOrchestrator_1.AgenticPMOrchestrator; } });
var EvaluationAgent_1 = require("./agents/EvaluationAgent");
Object.defineProperty(exports, "EvaluationAgent", { enumerable: true, get: function () { return EvaluationAgent_1.EvaluationAgent; } });
var MetricsFramework_1 = require("./evaluation/MetricsFramework");
Object.defineProperty(exports, "AgenticPMEvaluationFramework", { enumerable: true, get: function () { return MetricsFramework_1.AgenticPMEvaluationFramework; } });
// Utilities
var errorHandling_1 = require("./utils/errorHandling");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return errorHandling_1.Logger; } });
Object.defineProperty(exports, "AgenticError", { enumerable: true, get: function () { return errorHandling_1.AgenticError; } });
Object.defineProperty(exports, "ErrorCode", { enumerable: true, get: function () { return errorHandling_1.ErrorCode; } });
var MultiModelAI_1 = require("./services/MultiModelAI");
Object.defineProperty(exports, "MultiModelAI", { enumerable: true, get: function () { return MultiModelAI_1.MultiModelAI; } });
// Testing
var SystemTests_1 = require("./integration/SystemTests");
Object.defineProperty(exports, "SystemTests", { enumerable: true, get: function () { return SystemTests_1.SystemTests; } });
// ============================================================================
// QUICK START INTERFACE
// ============================================================================
const UnifiedAgentSystem_2 = require("./integration/UnifiedAgentSystem");
/**
 * Quick Start - Create and configure a unified agent system
 */
class AgenticPM {
    constructor(config) {
        var _a, _b, _c, _d, _e;
        this.system = new UnifiedAgentSystem_2.UnifiedAgentSystem({
            orchestration: { enabled: (_a = config === null || config === void 0 ? void 0 : config.enableOrchestration) !== null && _a !== void 0 ? _a : true },
            metrics: {
                enabled: (_b = config === null || config === void 0 ? void 0 : config.enableMetrics) !== null && _b !== void 0 ? _b : true,
                collectionInterval: 60000,
                autoReporting: true
            },
            evaluation: {
                enabled: (_c = config === null || config === void 0 ? void 0 : config.enableEvaluation) !== null && _c !== void 0 ? _c : true,
                defaultCostBudget: (_d = config === null || config === void 0 ? void 0 : config.costBudget) !== null && _d !== void 0 ? _d : 0.50,
                defaultLatencyTarget: (_e = config === null || config === void 0 ? void 0 : config.latencyTarget) !== null && _e !== void 0 ? _e : 30000,
                cachingEnabled: true
            }
        });
    }
    /**
     * Quick analysis - Fast, cost-effective analysis
     */
    quickAnalysis(productConcept) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.system.quickAnalysis(productConcept);
        });
    }
    /**
     * Standard analysis - Balanced analysis with good depth
     */
    standardAnalysis(productConcept) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.system.standardAnalysis(productConcept);
        });
    }
    /**
     * Comprehensive analysis - Deep, high-quality analysis
     */
    comprehensiveAnalysis(productConcept) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.system.comprehensiveAnalysis(productConcept);
        });
    }
    /**
     * Get system health and performance metrics
     */
    getSystemHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.system.getSystemHealth();
        });
    }
    /**
     * Generate comprehensive system report
     */
    generateReport() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.system.generateSystemReport();
        });
    }
    /**
     * Get active analyses
     */
    getActiveAnalyses() {
        return this.system.getActiveAnalyses();
    }
    /**
     * Get specific analysis by ID
     */
    getAnalysis(analysisId) {
        return this.system.getAnalysis(analysisId);
    }
    /**
     * Cleanup old analyses and optimize performance
     */
    cleanup(olderThanHours = 24) {
        return this.system.cleanup(olderThanHours);
    }
    /**
     * Graceful shutdown
     */
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.system.shutdown();
        });
    }
}
exports.AgenticPM = AgenticPM;
// ============================================================================
// CONFIGURATION PRESETS
// ============================================================================
exports.AgenticPMPresets = {
    /**
     * Speed-optimized configuration
     */
    speed: {
        enableOrchestration: false, // Skip orchestration for speed
        enableMetrics: false, // Minimal metrics
        enableEvaluation: true,
        costBudget: 0.10,
        latencyTarget: 15000 // 15 seconds
    },
    /**
     * Cost-optimized configuration
     */
    cost: {
        enableOrchestration: true,
        enableMetrics: true,
        enableEvaluation: true,
        costBudget: 0.20, // Low cost budget
        latencyTarget: 60000 // Allow more time for cost optimization
    },
    /**
     * Quality-optimized configuration
     */
    quality: {
        enableOrchestration: true,
        enableMetrics: true,
        enableEvaluation: true,
        costBudget: 1.00, // Higher budget for quality
        latencyTarget: 120000 // Allow more time for thorough analysis
    },
    /**
     * Development/testing configuration
     */
    development: {
        enableOrchestration: true,
        enableMetrics: true,
        enableEvaluation: true,
        costBudget: 0.50,
        latencyTarget: 45000
    },
    /**
     * Production configuration
     */
    production: {
        enableOrchestration: true,
        enableMetrics: true,
        enableEvaluation: true,
        costBudget: 0.75,
        latencyTarget: 30000
    }
};
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Run system tests
 */
function runSystemTests() {
    return __awaiter(this, arguments, void 0, function* (testType = 'quick') {
        const { SystemTests } = yield Promise.resolve().then(() => __importStar(require('./integration/SystemTests')));
        switch (testType) {
            case 'quick':
                return yield SystemTests.runQuickTests();
            case 'performance':
                return yield SystemTests.runPerformanceTests();
            case 'full':
            default:
                const tests = new SystemTests();
                return yield tests.runAllTests();
        }
    });
}
/**
 * Create AgenticPM instance with preset configuration
 */
function createAgenticPM(preset = 'development') {
    return new AgenticPM(exports.AgenticPMPresets[preset]);
}
// ============================================================================
// EXAMPLES AND USAGE
// ============================================================================
exports.examples = {
    /**
     * Basic usage example
     */
    basicUsage() {
        return __awaiter(this, void 0, void 0, function* () {
            const agentic = new AgenticPM();
            const result = yield agentic.quickAnalysis({
                title: "AI-Powered Task Manager",
                description: "An intelligent task management system with AI prioritization",
                targetMarket: "Remote teams and freelancers",
                keyFeatures: ["AI Prioritization", "Team Collaboration", "Analytics Dashboard"]
            });
            console.log('Analysis Result:', result.summary);
            console.log('Recommendations:', result.recommendations);
            yield agentic.shutdown();
        });
    },
    /**
     * Advanced usage with custom configuration
     */
    advancedUsage() {
        return __awaiter(this, void 0, void 0, function* () {
            const agentic = new AgenticPM({
                enableOrchestration: true,
                enableMetrics: true,
                enableEvaluation: true,
                costBudget: 0.30,
                latencyTarget: 45000
            });
            const result = yield agentic.comprehensiveAnalysis({
                title: "Enterprise CRM Platform",
                description: "A comprehensive customer relationship management platform for large enterprises",
                targetMarket: "Enterprise companies with 1000+ employees",
                keyFeatures: [
                    "Advanced Analytics",
                    "AI-Powered Insights",
                    "Integration Hub",
                    "Mobile App",
                    "Custom Workflows"
                ],
                goals: [
                    "Increase sales efficiency by 30%",
                    "Improve customer satisfaction scores",
                    "Reduce data entry time by 50%"
                ],
                constraints: [
                    "Must integrate with existing systems",
                    "GDPR compliance required",
                    "Budget limit of $2M"
                ]
            });
            console.log('Comprehensive Analysis:', result);
            // Get system health
            const health = yield agentic.getSystemHealth();
            console.log('System Health:', health);
            yield agentic.shutdown();
        });
    },
    /**
     * Batch processing example
     */
    batchProcessing() {
        return __awaiter(this, void 0, void 0, function* () {
            const agentic = createAgenticPM('production');
            const products = [
                { title: "Product A", description: "Description A" },
                { title: "Product B", description: "Description B" },
                { title: "Product C", description: "Description C" }
            ];
            const results = yield Promise.all(products.map(product => agentic.quickAnalysis(product)));
            console.log('Batch Results:', results.map(r => ({
                title: r.analysisId,
                score: r.summary.overallScore,
                cost: r.summary.totalCost
            })));
            yield agentic.shutdown();
        });
    }
};
// Default export for convenience
exports.default = AgenticPM;
