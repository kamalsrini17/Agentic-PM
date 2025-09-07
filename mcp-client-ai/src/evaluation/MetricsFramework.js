"use strict";
/**
 * Comprehensive Evaluation Framework for Agentic PM System
 * Designed by Principal PM with PLG and AI PM experience
 */
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
exports.AgenticPMEvaluationFramework = void 0;
// ============================================================================
// EVALUATION FRAMEWORK CLASS
// ============================================================================
class AgenticPMEvaluationFramework {
    constructor() {
        this.metrics = this.initializeMetrics();
    }
    // ============================================================================
    // DOCUMENT QUALITY EVALUATION
    // ============================================================================
    evaluateDocumentQuality(document) {
        return __awaiter(this, void 0, void 0, function* () {
            const completeness = this.calculateCompleteness(document);
            const clarity = yield this.assessClarity(document);
            const actionability = this.assessActionability(document);
            const specificity = this.assessSpecificity(document);
            return {
                completenessScore: completeness,
                clarityScore: clarity,
                actionabilityScore: actionability,
                specificityScore: specificity,
                organizationScore: this.assessOrganization(document),
                consistencyScore: this.assessConsistency(document),
                researchDepth: this.assessResearchDepth(document),
                insightNovelty: this.assessInsightNovelty(document),
                competitiveAccuracy: this.assessCompetitiveAccuracy(document),
                overallQuality: this.calculateOverallQuality({
                    completeness, clarity, actionability, specificity
                }),
                qualityTrend: this.calculateQualityTrend(document.userId)
            };
        });
    }
    calculateCompleteness(document) {
        const requiredSections = [
            'problemStatement', 'solutionOverview', 'userStories',
            'requirements', 'successMetrics', 'timeline'
        ];
        const presentSections = requiredSections.filter(section => document.content[section] && document.content[section].length > 0);
        return (presentSections.length / requiredSections.length) * 100;
    }
    assessClarity(document) {
        return __awaiter(this, void 0, void 0, function* () {
            // AI-powered clarity assessment
            const textContent = this.extractTextContent(document);
            // Metrics for clarity assessment
            const avgSentenceLength = this.calculateAverageSentenceLength(textContent);
            const readabilityScore = this.calculateReadabilityScore(textContent);
            const jargonDensity = this.calculateJargonDensity(textContent);
            // Weighted scoring
            const clarityScore = ((readabilityScore * 0.5) +
                (this.scoreSentenceLength(avgSentenceLength) * 0.3) +
                (this.scoreJargonDensity(jargonDensity) * 0.2));
            return Math.min(100, Math.max(0, clarityScore));
        });
    }
    // ============================================================================
    // PLG METRICS CALCULATION
    // ============================================================================
    calculateViralCoefficient(invitesSent, invitesAccepted, totalUsers) {
        const inviteRate = invitesSent / totalUsers;
        const conversionRate = invitesAccepted / invitesSent;
        return inviteRate * conversionRate;
    }
    calculateNetworkEffects(userData) {
        const collaborativeUsers = userData.filter(user => user.collaborativeDocuments > 0).length;
        const totalConnections = userData.reduce((sum, user) => sum + user.connections, 0);
        const networkDensity = totalConnections / (userData.length * (userData.length - 1));
        const collaborationRate = collaborativeUsers / userData.length;
        return (networkDensity * 0.6) + (collaborationRate * 0.4);
    }
    // ============================================================================
    // SUCCESS METRIC BENCHMARKS
    // ============================================================================
    getSuccessMetricBenchmarks() {
        return {
            // Activation Benchmarks
            activationRate: {
                poor: 10,
                good: 25,
                excellent: 40,
                worldClass: 60
            },
            // Retention Benchmarks
            retention30Day: {
                poor: 15,
                good: 30,
                excellent: 50,
                worldClass: 70
            },
            // Quality Benchmarks
            documentQuality: {
                poor: 60,
                good: 75,
                excellent: 85,
                worldClass: 95
            },
            // Growth Benchmarks
            monthlyGrowthRate: {
                poor: 5,
                good: 15,
                excellent: 25,
                worldClass: 40
            },
            // Efficiency Benchmarks
            timeToValue: {
                worldClass: 15, // minutes
                excellent: 30,
                good: 60,
                poor: 120
            }
        };
    }
    // ============================================================================
    // COMPREHENSIVE HEALTH SCORE
    // ============================================================================
    calculateHealthScore(metrics) {
        const weights = {
            userEngagement: 0.3,
            documentQuality: 0.25,
            plgGrowth: 0.25,
            aiPerformance: 0.15,
            businessImpact: 0.05
        };
        const categoryScores = {
            userEngagement: this.scoreUserEngagement(metrics.userEngagement),
            documentQuality: this.scoreDocumentQuality(metrics.documentQuality),
            plgGrowth: this.scorePLGGrowth(metrics.plgGrowth),
            aiPerformance: this.scoreAIPerformance(metrics.aiPerformance),
            businessImpact: this.scoreBusinessImpact(metrics.businessImpact)
        };
        const overall = Object.entries(categoryScores).reduce((sum, [category, score]) => sum + (score * weights[category]), 0);
        const recommendations = this.generateRecommendations(categoryScores);
        return {
            overall: Math.round(overall),
            category_scores: categoryScores,
            recommendations
        };
    }
    // ============================================================================
    // PRIVATE HELPER METHODS
    // ============================================================================
    initializeMetrics() {
        // Initialize all metric structures with default values
        return {
            documentQuality: {},
            userEngagement: {},
            plgGrowth: {},
            aiPerformance: {},
            businessImpact: {}
        };
    }
    extractTextContent(document) {
        // Extract all text content from document for analysis
        return JSON.stringify(document.content).replace(/[{}",:]/g, ' ');
    }
    calculateAverageSentenceLength(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const totalWords = text.split(/\s+/).length;
        return totalWords / sentences.length;
    }
    calculateReadabilityScore(text) {
        // Simplified Flesch Reading Ease calculation
        const avgSentenceLength = this.calculateAverageSentenceLength(text);
        const avgSyllablesPerWord = this.estimateAverageSyllables(text);
        return 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    }
    estimateAverageSyllables(text) {
        const words = text.toLowerCase().split(/\s+/);
        const totalSyllables = words.reduce((sum, word) => {
            return sum + Math.max(1, word.replace(/[^aeiou]/g, '').length);
        }, 0);
        return totalSyllables / words.length;
    }
    generateRecommendations(scores) {
        const recommendations = [];
        if (scores.userEngagement < 70) {
            recommendations.push("Focus on improving user onboarding and activation flow");
        }
        if (scores.documentQuality < 80) {
            recommendations.push("Enhance AI prompts and add more quality validation checks");
        }
        if (scores.plgGrowth < 60) {
            recommendations.push("Implement viral features and referral programs");
        }
        return recommendations;
    }
    // Scoring methods for different categories
    scoreUserEngagement(metrics) {
        // Implementation of user engagement scoring logic
        return 75; // Placeholder
    }
    scoreDocumentQuality(metrics) {
        // Implementation of document quality scoring logic  
        return 80; // Placeholder
    }
    scorePLGGrowth(metrics) {
        // Implementation of PLG growth scoring logic
        return 65; // Placeholder
    }
    scoreAIPerformance(metrics) {
        // Implementation of AI performance scoring logic
        return 85; // Placeholder
    }
    scoreBusinessImpact(metrics) {
        // Implementation of business impact scoring logic
        return 70; // Placeholder
    }
    // Additional helper methods for specific assessments
    assessActionability(document) { return 75; }
    assessSpecificity(document) { return 80; }
    assessOrganization(document) { return 85; }
    assessConsistency(document) { return 90; }
    assessResearchDepth(document) { return 70; }
    assessInsightNovelty(document) { return 65; }
    assessCompetitiveAccuracy(document) { return 75; }
    calculateOverallQuality(scores) {
        return Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
    }
    calculateQualityTrend(userId) {
        return 'improving';
    }
    calculateJargonDensity(text) { return 0.1; }
    scoreSentenceLength(length) { return 80; }
    scoreJargonDensity(density) { return 90; }
}
exports.AgenticPMEvaluationFramework = AgenticPMEvaluationFramework;
