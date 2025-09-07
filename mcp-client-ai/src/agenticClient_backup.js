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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPClientAgent = void 0;
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
const openai_1 = require("openai");
console.log('[ENV] Loaded OPENAI_API_KEY:', ((_a = process.env.OPENAI_API_KEY) === null || _a === void 0 ? void 0 : _a.slice(0, 6)) + '...');
const openai = new openai_1.OpenAI({
    // apiKey: process.env.OPENAI_API_KEY
    apiKey: '' // Only for local dev!
});
function enrichConcept(input) {
    return {
        product: input.title,
        platforms: ['iOS', 'Android'],
        overview: input.description,
        problem: 'Current fitness and training solutions are fragmented and do not personalize based on wearable data or sport-specific needs.',
        goals: input.goals,
        features: {
            deviceIntegration: {
                description: 'Sync with Apple HealthKit, Fitbit, Garmin Connect',
                dataPoints: ['heart rate', 'HRV', 'sleep', 'steps', 'VO2 Max']
            },
            dailyCheckIn: {
                questions: [
                    'How do you feel today? (1-5)',
                    'Muscle soreness? (1-5)',
                    'Stress level? (1-5)',
                    'Did you sleep well? (Yes/No)'
                ],
                output: 'Daily Readiness Score'
            },
            workoutRecommendations: {
                inputs: ['fitness level', 'readiness score', 'activity history', 'current vitals'],
                output: 'AI-generated training plan with video guidance',
                categories: ['Recovery', 'High intensity', 'Technical']
            },
            nutritionGuidance: {
                inputs: ['training plan', 'readiness', 'dietary preferences'],
                output: 'Meal/snack suggestions with macronutrient breakdown',
                features: ['meal logging', 'hydration alerts']
            },
            dashboard: {
                visualizations: [
                    'Heart rate trends',
                    'Readiness over time',
                    'Training volume',
                    'Sleep-performance correlation',
                    'Nutrition adherence'
                ],
                gamification: ['badges', 'streaks', 'monthly challenges']
            },
            notifications: {
                types: [
                    'Daily readiness alerts',
                    'Workout & meal reminders',
                    'Weekly performance digests'
                ]
            }
        },
        aiRequirements: {
            models: ['GPT-style language model'],
            inputs: ['biometric data', 'check-in responses', 'activity logs'],
            outputs: [
                'Personalized messages',
                'Training suggestions',
                'Meal plans',
                'User Q&A responses'
            ]
        },
        nonFunctionalRequirements: {
            uiFramework: ['React Native', 'Flutter'],
            dataSecurity: ['HIPAA', 'GDPR'],
            offlineSupport: true,
            cloudBackend: ['Firebase', 'AWS']
        },
        roadmap: {
            phase1: {
                timeframe: 'Month 0–3',
                features: ['Apple Watch sync', 'Basic check-ins', 'Workout recommendations', 'Vitals dashboard']
            },
            phase2: {
                timeframe: 'Month 3–6',
                features: ['Nutrition module', 'Garmin/Fitbit support', 'Video workouts', 'AI messaging']
            },
            phase3: {
                timeframe: 'Month 6–9',
                features: ['Readiness Score engine', 'Adaptive plans', 'Social and gamification']
            }
        },
        successMetrics: {
            activeUsers: '10,000 in 6 months',
            csatScore: '≥ 4.5/5',
            retentionRate: '≥ 70% at 3 months',
            workoutCompletion: '≥ 60%',
            avgSessionDuration: '≥ 5 minutes'
        },
        targetAudience: [
            'Amateur and semi-pro fencers',
            'Fitness-conscious wearable users',
            'Coaches or training centers (future)'
        ],
        competitiveEdge: 'Unified AI coaching with fencing-specific training, unlike Oura, WHOOP, or MyFitnessPal'
    };
}
class MCPClientAgent {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    runWorkflow(input) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[Discovery] Starting agentic workflow for product:', input.title);
            const enriched = enrichConcept(input);
            const marketResearch = yield this.createMarketResearch(input);
            const prd = yield this.createPRD(enriched);
            const prototype = yield this.createPrototype(input);
            const prfaq = yield this.createPRFAQ(input);
            const validation = yield this.validatePRD(prd.id);
            return {
                executiveSummary: `PM automation run for: ${input.title}`,
                prd,
                prototype,
                marketResearch,
                prfaq,
                validation
            };
        });
    }
    createMarketResearch(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.post(`${this.baseUrl}/market_research`, {
                title: `Market Research for ${input.title}`,
                version: '1.0',
                metadata: { region: 'Global', industry: input.targetMarket },
                content: {
                    competitive_analysis: `Competitor review for ${input.description}`,
                    market_sizing: 'Est. $1B TAM',
                    user_personas: ['Persona A', 'Persona B'],
                    user_journeys: ['User signs up', 'User explores feature']
                }
            });
            return response.data;
        });
    }
    createPRD(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
You are a senior product manager. Based on the following structured product definition in JSON format, generate a comprehensive Product Requirements Document (PRD) suitable for a cross-functional product team (engineering, design, AI/ML, and marketing). Include sections such as Overview, Problem Statement, Goals, Key Features, User Stories, AI Requirements, Technical Requirements, Roadmap, and Success Metrics. Make sure each section is well-detailed and actionable.

JSON input:
${JSON.stringify(input, null, 2)}
    `;
            /*
            ## Product Concept
            Title: ${input.title}
            Description: ${input.description}
            Goals: ${input.goals.join(', ')}
            Target Market: ${input.targetMarket}
            Timeline: ${input.timeline}
            
            ## Instructions:
            Generate a complete PRD in detailed JSON format with the following structure:
            
            {
              "overview": {
                "product_title": string,
                "description": string,
                "launch_timeline": string,
                "target_market": string,
                "differentiators": [string]
              },
              "problem_statement": {
                "description": string,
                "current_alternatives": [string],
                "why_now": string
              },
              "goals": [
                { "id": string, "description": string, "impact": string }
              ],
              "requirements": {
                "functional": [
                  { "id": string, "description": string, "priority": "high" | "medium" | "low" }
                ],
                "non_functional": [
                  { "id": string, "description": string, "priority": "high" | "medium" | "low" }
                ]
              },
              "success_metrics": [
                { "metric": string, "target": string, "measurement": string }
              ],
              "assumptions": [string],
              "out_of_scope": [string],
              "risks": [
                { "risk": string, "mitigation": string }
              ]
            }
            
            Format the result as a JSON object with keys: overview, problem_statement, goals, requirements, success_metrics.
                `.trim();
            
            */
            const response = yield openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            });
            const parsed = JSON.parse(response.choices[0].message.content || '{}');
            const prd = {
                title: `${input.title} PRD`,
                version: '1.0',
                metadata: { owner: 'pm@agent', status: 'draft', tags: ['auto'] },
                content: parsed
            };
            const saved = yield axios_1.default.post(`${this.baseUrl}/prd`, prd);
            return saved.data;
        });
    }
    regeneratePrdWithFeedback(input, feedback) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
You previously wrote a PRD for the following concept. Now the user has the following feedback:

"${feedback}"

Please regenerate a more complete and detailed PRD JSON based on this input and feedback.

Concept:
Title: ${input.title}
Description: ${input.description}
Goals: ${input.goals.join(', ')}
Target Market: ${input.targetMarket}
Timeline: ${input.timeline}
`;
            const response = yield openai.chat.completions.create({
                model: 'gpt-4', // or gpt-4 if available
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            });
            const parsed = JSON.parse(response.choices[0].message.content || '{}');
            const prd = {
                title: `${input.title} PRD (v2)`,
                version: '2.0',
                metadata: { owner: 'pm@agent', status: 'draft', tags: ['auto', 'v2'] },
                content: parsed
            };
            const saved = yield axios_1.default.post(`${this.baseUrl}/prd`, prd);
            return saved.data;
        });
    }
    createPrototype(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.post(`${this.baseUrl}/prototype`, {
                title: `Prototype for ${input.title}`,
                version: '1.0',
                metadata: { design_tool_url: '', status: 'in_progress' },
                content: {
                    wireframes: ['Home screen', 'Workflow designer'],
                    user_flows: ['Create > Generate > Validate > Export'],
                    design_specs: 'Responsive UI with workflow stages'
                }
            });
            return response.data;
        });
    }
    createPRFAQ(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.post(`${this.baseUrl}/pr_faq`, {
                title: `PRFAQ for ${input.title}`,
                version: '1.0',
                metadata: { author: 'pm@agent' },
                content: {
                    press_release: `Introducing ${input.title} – Your next-gen PM assistant.`,
                    faqs: [
                        { question: 'Who is this for?', answer: 'Product managers and strategy leads.' },
                        { question: 'What does it do?', answer: 'Automates PRD, design, research, and docs.' }
                    ]
                }
            });
            return response.data;
        });
    }
    validatePRD(prdId) {
        return __awaiter(this, void 0, void 0, function* () {
            const prd = yield axios_1.default.get(`${this.baseUrl}/prd/${prdId}`);
            const response = yield axios_1.default.post(`${this.baseUrl}/tools/validate_requirements`, prd.data);
            return response.data;
        });
    }
}
exports.MCPClientAgent = MCPClientAgent;
