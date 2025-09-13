import { AgenticPM } from '../index';
import { Logger } from '../utils/errorHandling';
import 'dotenv/config';

// ============================================================================
// EXAMPLE PRODUCT CONCEPTS (GENERIC - NOT HARDCODED)
// ============================================================================

const exampleProducts = {
  // SaaS Product Example
  projectManagementTool: {
    title: "TeamSync Pro",
    description: "An AI-powered project management platform that automatically tracks team productivity, predicts project delays, and optimizes resource allocation across multiple projects.",
    goals: [
      "Increase team productivity by 30%",
      "Reduce project delays through predictive analytics",
      "Automate routine project management tasks",
      "Provide real-time insights into team performance"
    ],
    targetMarket: "Small to medium-sized software development teams",
    timeline: "Q2 2025",
    keyFeatures: [
      "AI-powered task prioritization",
      "Automated time tracking",
      "Predictive project analytics",
      "Team performance insights",
      "Integration with popular dev tools"
    ],
    targetUsers: [
      "Project managers",
      "Engineering team leads",
      "Product managers",
      "C-level executives"
    ],
    platform: "web",
    designStyle: "professional",
    monetizationModel: "subscription",
    expectedScale: "growth"
  },

  // E-commerce Product Example
  sustainableMarketplace: {
    title: "EcoMarket",
    description: "A marketplace platform connecting eco-conscious consumers with verified sustainable brands, featuring carbon footprint tracking and environmental impact scoring for every purchase.",
    goals: [
      "Promote sustainable consumption",
      "Connect eco-friendly brands with conscious consumers",
      "Track and reduce carbon footprint of purchases",
      "Build the largest verified sustainable product database"
    ],
    targetMarket: "Environmentally conscious consumers aged 25-45",
    timeline: "Q3 2025",
    keyFeatures: [
      "Sustainability verification system",
      "Carbon footprint calculator",
      "Impact tracking dashboard",
      "Sustainable brand discovery",
      "Eco-rewards program"
    ],
    targetUsers: [
      "Eco-conscious consumers",
      "Sustainable brand owners",
      "Environmental advocates",
      "Corporate sustainability teams"
    ],
    platform: "web",
    designStyle: "modern",
    monetizationModel: "marketplace",
    expectedScale: "global"
  },

  // Healthcare Product Example
  mentalHealthApp: {
    title: "MindfulAI",
    description: "A personalized mental health companion app that uses AI to provide real-time emotional support, mood tracking, and connects users with licensed therapists when needed.",
    goals: [
      "Provide accessible mental health support",
      "Early detection of mental health issues",
      "Connect users with professional help",
      "Reduce stigma around mental health"
    ],
    targetMarket: "Adults seeking mental health support and wellness",
    timeline: "Q4 2025",
    keyFeatures: [
      "AI-powered mood analysis",
      "24/7 emotional support chatbot",
      "Therapist matching and booking",
      "Mood and wellness tracking",
      "Crisis intervention protocols"
    ],
    targetUsers: [
      "Individuals seeking mental health support",
      "Licensed therapists",
      "Healthcare providers",
      "Wellness coaches"
    ],
    platform: "mobile",
    designStyle: "minimal",
    monetizationModel: "freemium",
    expectedScale: "global",
    technicalRequirements: [
      "HIPAA compliance",
      "End-to-end encryption",
      "Real-time chat capabilities",
      "AI/ML model integration"
    ]
  },

  // FinTech Product Example
  investmentPlatform: {
    title: "WealthWise",
    description: "An AI-driven investment platform that democratizes wealth management by providing personalized investment strategies, automated portfolio rebalancing, and financial education for everyday investors.",
    goals: [
      "Democratize access to wealth management",
      "Provide personalized investment strategies",
      "Educate users about financial literacy",
      "Automate investment portfolio management"
    ],
    targetMarket: "Young professionals and first-time investors",
    timeline: "Q1 2026",
    keyFeatures: [
      "Robo-advisor with AI optimization",
      "Personalized investment recommendations",
      "Automated portfolio rebalancing",
      "Financial education content",
      "Goal-based investment planning"
    ],
    targetUsers: [
      "First-time investors",
      "Young professionals",
      "Financial advisors",
      "Investment enthusiasts"
    ],
    platform: "web",
    designStyle: "professional",
    monetizationModel: "usage-based",
    expectedScale: "enterprise"
  }
};

// ============================================================================
// DEMONSTRATION FUNCTION
// ============================================================================

async function demonstrateGenericAgenticPM() {
  const logger = Logger.getInstance();
  const agentic = new AgenticPM();

  console.log('🚀 Agentic PM Framework - Generic Product Analysis Demo');
  console.log('=' .repeat(60));

  try {
    // Test system health first
    console.log('\n🔧 Checking System Health...');
    const health = await agentic.getSystemHealth();
    console.log('System Status:', health.overall.toUpperCase());

    if (health.overall === 'critical') {
      console.log('❌ System is not healthy. Please check configuration');
      return;
    }

    // Demonstrate with different product types
    const productExamples = Object.entries(exampleProducts);
    
    for (const [productType, productConcept] of productExamples.slice(0, 2)) { // Test first 2 products
      console.log(`\n📦 Analyzing Product: ${productConcept.title} (${productType})`);
      console.log('-'.repeat(50));

      try {
        const startTime = Date.now();
        const result = await agentic.comprehensiveAnalysis(productConcept);
        const duration = Date.now() - startTime;

        console.log(`✅ Analysis completed in ${duration}ms`);
        console.log(`📊 Overall Score: ${result.summary.overallScore}/100`);
        console.log(`💰 Total Cost: $${result.summary.totalCost.toFixed(4)}`);
        console.log(`⚡ Efficiency Score: ${result.summary.efficiencyScore}/100`);
        
        if (result.recommendations.length > 0) {
          console.log(`💡 Top Recommendations:`);
          result.recommendations.slice(0, 3).forEach((rec, i) => {
            console.log(`   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
          });
        }

        console.log(`🏗️  Systems Used: ${result.metadata.systemsUsed.join(', ')}`);

      } catch (error) {
        console.error(`❌ Analysis failed for ${productConcept.title}:`, (error as Error).message);
      }
    }

    console.log('\n🎉 Generic Agentic PM Framework Demo Complete!');
    console.log('\n💡 Key Features Demonstrated:');
    console.log('   ✓ Generic product concept handling (any industry)');
    console.log('   ✓ Unified agent system with orchestration');
    console.log('   ✓ Cost and latency optimization');
    console.log('   ✓ Real-time system health monitoring');
    console.log('   ✓ Comprehensive analysis and recommendations');
    console.log('   ✓ Multi-system integration');

  } finally {
    await agentic.shutdown();
  }
}

// ============================================================================
// INDIVIDUAL PRODUCT ANALYSIS FUNCTION
// ============================================================================

export async function analyzeSpecificProduct(productKey: keyof typeof exampleProducts) {
  const agentic = new AgenticPM();
  const productConcept = exampleProducts[productKey];

  if (!productConcept) {
    throw new Error(`Product "${productKey}" not found in examples`);
  }

  console.log(`\n🔍 Detailed Analysis: ${productConcept.title}`);
  console.log('='.repeat(50));

  try {
    return await agentic.comprehensiveAnalysis(productConcept);
  } finally {
    await agentic.shutdown();
  }
}

// ============================================================================
// CUSTOM PRODUCT ANALYSIS FUNCTION
// ============================================================================

export async function analyzeCustomProduct(customProductConcept: any) {
  const agentic = new AgenticPM();

  console.log(`\n🎨 Custom Product Analysis: ${customProductConcept.title}`);
  console.log('='.repeat(50));

  try {
    return await agentic.standardAnalysis(customProductConcept);
  } finally {
    await agentic.shutdown();
  }
}

// Run the demonstration if this file is executed directly
if (require.main === module) {
  demonstrateGenericAgenticPM().catch(console.error);
}

export { exampleProducts, demonstrateGenericAgenticPM };