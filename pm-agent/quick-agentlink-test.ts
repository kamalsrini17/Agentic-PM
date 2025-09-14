/**
 * Quick AgentLink Test - Standard Analysis with Pricing
 */

import { AgenticPM } from './src/index';

async function runQuickAgentLinkTest() {
  console.log('🚀 AgentLink - Quick PRD + Pricing Analysis\n');

  const agentic = new AgenticPM({
    enableOrchestration: true,
    enableMetrics: true, 
    enableEvaluation: true,
    costBudget: 0.50,
    latencyTarget: 90000 // 1.5 minutes
  });

  try {
    const agentLinkConcept = {
      title: "AgentLink - Enterprise Agent Communication Platform",
      description: "Enterprise messaging platform for AI agents, human operators, and automated systems with async messaging and intelligent routing.",
      targetMarket: "Enterprise organizations with AI agent deployments",
      keyFeatures: [
        "Agent-to-agent messaging",
        "Human-to-agent communication interface",
        "Intelligent message routing", 
        "Async notification system",
        "Real-time monitoring",
        "Enterprise security compliance"
      ],
      goals: [
        "Enable seamless agent communication",
        "Reduce coordination latency by 60%",
        "Provide enterprise-grade reliability"
      ]
    };

    console.log('📦 AgentLink Concept:');
    console.log(`• ${agentLinkConcept.title}`);
    console.log(`• Target: ${agentLinkConcept.targetMarket}`);
    console.log(`• Features: ${agentLinkConcept.keyFeatures.length} key features`);

    console.log('\n🔄 Running Standard Analysis...');
    const startTime = Date.now();
    
    const result = await agentic.standardAnalysis(agentLinkConcept);
    
    const duration = Date.now() - startTime;

    console.log('\n✅ ANALYSIS COMPLETE!');
    console.log(`Duration: ${(duration / 1000).toFixed(1)}s`);
    console.log(`Score: ${result.summary.overallScore}/100`);
    console.log(`Cost: $${result.summary.totalCost.toFixed(4)}`);
    console.log(`Systems: ${result.metadata.systemsUsed.join(', ')}`);

    // Show pricing recommendations
    if (result.pricingRecommendation) {
      console.log('\n💰 PRICING RECOMMENDATIONS');
      console.log('='.repeat(50));
      console.log(result.pricingRecommendation.formattedRecommendation);
    } else {
      console.log('\n❌ No pricing recommendations generated');
    }

    console.log('\n🎯 Top Recommendations:');
    result.recommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`${i + 1}. [${rec.priority}] ${rec.title}`);
    });

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await agentic.shutdown();
  }
}

runQuickAgentLinkTest();