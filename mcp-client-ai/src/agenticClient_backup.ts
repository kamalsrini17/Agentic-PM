import axios from 'axios';
import 'dotenv/config';
import { OpenAI } from 'openai';

console.log('[ENV] Loaded OPENAI_API_KEY:', process.env.OPENAI_API_KEY?.slice(0, 6) + '...');

const openai = new OpenAI({
 // apiKey: process.env.OPENAI_API_KEY
apiKey: ''  // Only for local dev!
});


interface ProductConcept {
  title: string;
  description: string;
  goals: string[];
  targetMarket: string;
  timeline: string;
}

interface DetailedProductDefinition {
  product: string;
  platforms: string[];
  overview: string;
  problem: string;
  goals: string[];
  features: Record<string, any>;
  aiRequirements: Record<string, any>;
  nonFunctionalRequirements: Record<string, any>;
  roadmap: Record<string, any>;
  successMetrics: Record<string, any>;
  targetAudience: string[];
  competitiveEdge: string;
}

function enrichConcept(input: ProductConcept): DetailedProductDefinition {
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


export class MCPClientAgent {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async runWorkflow(input: ProductConcept) {
    console.log('[Discovery] Starting agentic workflow for product:', input.title);

const enriched = enrichConcept(input);
    const marketResearch = await this.createMarketResearch(input);
    const prd = await this.createPRD(enriched);
    const prototype = await this.createPrototype(input);
    const prfaq = await this.createPRFAQ(input);
    const validation = await this.validatePRD(prd.id);

    return {
      executiveSummary: `PM automation run for: ${input.title}`,
      prd,
      prototype,
      marketResearch,
      prfaq,
      validation
    };
  }

  private async createMarketResearch(input: ProductConcept) {
    const response = await axios.post(`${this.baseUrl}/market_research`, {
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
  }

  private async createPRD(input: DetailedProductDefinition) {

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
    const response = await openai.chat.completions.create({
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

    const saved = await axios.post(`${this.baseUrl}/prd`, prd);
    return saved.data;
  }

async regeneratePrdWithFeedback(input: ProductConcept, feedback: string) {
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

  const response = await openai.chat.completions.create({
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

  const saved = await axios.post(`${this.baseUrl}/prd`, prd);
  return saved.data;
}


  private async createPrototype(input: ProductConcept) {
    const response = await axios.post(`${this.baseUrl}/prototype`, {
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
  }

  private async createPRFAQ(input: ProductConcept) {
    const response = await axios.post(`${this.baseUrl}/pr_faq`, {
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
  }

  private async validatePRD(prdId: string) {
    const prd = await axios.get(`${this.baseUrl}/prd/${prdId}`);
    const response = await axios.post(`${this.baseUrl}/tools/validate_requirements`, prd.data);
    return response.data;
  }
}