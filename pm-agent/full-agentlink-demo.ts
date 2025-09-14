/**
 * Full AgentLink Demo with Real API Calls
 * Tests complete PRD generation + Pricing Agent flow
 */

import { AgenticPM } from './src/index';

async function runFullAgentLinkDemo() {
  console.log('🚀 AgentLink - Complete PRD + Pricing Analysis Demo\n');
  console.log('='.repeat(70));

  const agentic = new AgenticPM({
    enableOrchestration: true,
    enableMetrics: true,
    enableEvaluation: true,
    costBudget: 1.00, // Higher budget for comprehensive analysis
    latencyTarget: 180000 // 3 minutes for thorough analysis
  });

  try {
    // AgentLink - Enterprise Agent Communication Platform
    const agentLinkConcept = {
      title: "AgentLink - Enterprise Agent Communication Platform",
      description: "Next-generation enterprise messaging platform designed for seamless communication between AI agents, human operators, and automated systems. Provides async messaging, notification routing, and intelligent message prioritization for complex multi-agent workflows.",
      targetMarket: "Enterprise organizations with AI agent deployments, DevOps teams, and automated workflow systems",
      keyFeatures: [
        "Agent-to-agent messaging with protocol standardization",
        "Human-to-agent communication interface",
        "Intelligent message routing and prioritization", 
        "Async notification system with delivery guarantees",
        "Message threading and conversation context",
        "Integration APIs for existing enterprise systems",
        "Real-time status monitoring and agent health checks",
        "Message encryption and enterprise security compliance",
        "Workflow orchestration triggers via messaging",
        "Analytics dashboard for communication patterns"
      ],
      goals: [
        "Enable seamless communication in multi-agent enterprise environments",
        "Reduce latency in agent coordination by 60%",
        "Provide enterprise-grade reliability and security",
        "Support scaling to 10,000+ concurrent agent conversations"
      ],
      constraints: [
        "Must integrate with existing enterprise identity systems (SAML, LDAP)",
        "SOC2 Type II compliance required",
        "Sub-100ms message delivery latency",
        "99.9% uptime SLA requirement",
        "Multi-region deployment capability"
      ],
      timeline: "Q2 2025"
    };

    console.log('\n📦 Product Concept: AgentLink');
    console.log(`Description: ${agentLinkConcept.description.substring(0, 100)}...`);
    console.log(`Target Market: ${agentLinkConcept.targetMarket}`);
    console.log(`Key Features: ${agentLinkConcept.keyFeatures.length} enterprise features`);
    console.log(`Goals: ${agentLinkConcept.goals.length} strategic objectives`);
    console.log(`Constraints: ${agentLinkConcept.constraints.length} enterprise requirements`);

    console.log('\n🔄 Running Comprehensive Analysis with Real API Calls...');
    console.log('This will generate:');
    console.log('• Complete PRD with all sections');
    console.log('• Market research and competitive analysis');
    console.log('• Multi-model evaluation');
    console.log('• Pricing recommendations (Kyle Poyar methodology)');
    console.log('• Strategic recommendations');
    console.log('\nEstimated time: 2-3 minutes...\n');

    const startTime = Date.now();
    
    const result = await agentic.comprehensiveAnalysis(agentLinkConcept);
    
    const duration = Date.now() - startTime;

    console.log('\n✅ COMPREHENSIVE ANALYSIS COMPLETE!');
    console.log('='.repeat(50));
    console.log(`Duration: ${(duration / 1000).toFixed(1)}s`);
    console.log(`Overall Score: ${result.summary.overallScore}/100`);
    console.log(`Confidence: ${result.summary.confidence}%`);
    console.log(`Total Cost: $${result.summary.totalCost.toFixed(4)}`);
    console.log(`Efficiency Score: ${result.summary.efficiencyScore}/100`);
    console.log(`Systems Used: ${result.metadata.systemsUsed.join(', ')}`);

    // Show orchestration results (PRD)
    if (result.orchestrationResult) {
      console.log('\n📋 PRD GENERATION RESULTS');
      console.log('-'.repeat(30));
      console.log(`Success: ${result.orchestrationResult.success}`);
      console.log(`Quality Achieved: ${result.orchestrationResult.qualityAchieved}/100`);
      console.log(`Duration: ${result.orchestrationResult.actualDuration}ms`);
      console.log(`Cost: $${result.orchestrationResult.actualCost.toFixed(4)}`);
      
      if (result.orchestrationResult.results) {
        const prdContent = JSON.stringify(result.orchestrationResult.results, null, 2);
        console.log(`\n📄 PRD Content Preview (first 500 chars):`);
        console.log(prdContent.substring(0, 500) + '...');
      }
    }

    // Show pricing recommendations
    if (result.pricingRecommendation) {
      console.log('\n💰 PRICING RECOMMENDATIONS');
      console.log('-'.repeat(30));
      console.log(`Generated: ${result.pricingRecommendation.generatedDate}`);
      console.log(`Proposed Model: ${result.pricingRecommendation.valueMetric.proposedModel}`);
      console.log(`Primary Meter: ${result.pricingRecommendation.valueMetric.primaryMeter}`);
      console.log(`Secondary Meter: ${result.pricingRecommendation.valueMetric.secondaryMeter}`);
      console.log(`Recommended Tier: ${result.pricingRecommendation.packaging.recommendedTier}`);
      
      console.log('\n📊 FULL PRICING RECOMMENDATION:');
      console.log('='.repeat(70));
      console.log(result.pricingRecommendation.formattedRecommendation);
    } else {
      console.log('\n❌ No pricing recommendations generated');
    }

    // Show evaluation results
    if (result.evaluationResult) {
      console.log('\n🎯 EVALUATION RESULTS');
      console.log('-'.repeat(30));
      console.log(`Overall Score: ${result.evaluationResult.overallScore}/100`);
      console.log(`Confidence: ${result.evaluationResult.confidence}%`);
      console.log(`Models Used: ${result.evaluationResult.modelsUsed.join(', ')}`);
      console.log(`Strategy: ${result.evaluationResult.optimizationStrategy}`);
      console.log(`Cache Hit: ${result.evaluationResult.cacheHit ? 'Yes' : 'No'}`);
    }

    // Show top recommendations
    console.log('\n🎯 TOP STRATEGIC RECOMMENDATIONS');
    console.log('-'.repeat(30));
    result.recommendations.slice(0, 5).forEach((rec, i) => {
      console.log(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.category}: ${rec.title}`);
      console.log(`   ${rec.description}`);
      console.log(`   Expected Benefit: ${rec.expectedBenefit} | Effort: ${rec.effort}`);
      console.log('');
    });

    // Show system performance
    console.log('\n⚡ SYSTEM PERFORMANCE');
    console.log('-'.repeat(30));
    console.log(`Orchestration Efficiency: ${result.systemPerformance.orchestrationEfficiency}%`);
    console.log(`Evaluation Efficiency: ${result.systemPerformance.evaluationEfficiency}%`);
    console.log(`Metrics Health: ${result.systemPerformance.metricsHealth}%`);
    console.log(`Resource Utilization: ${result.systemPerformance.resourceUtilization}%`);

    console.log('\n🎉 AGENTLINK ANALYSIS COMPLETE!');
    console.log('\n✅ Successfully Demonstrated:');
    console.log('• Complete PRD generation with enterprise requirements');
    console.log('• Sequential Pricing Agent execution after PRD');
    console.log('• Kyle Poyar methodology pricing recommendations');
    console.log('• Multi-system integration (orchestration + evaluation + pricing)');
    console.log('• Enterprise messaging tool specific analysis');

  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    throw error;
  } finally {
    await agentic.shutdown();
  }
}

// Run the demo
if (require.main === module) {
  runFullAgentLinkDemo().catch(error => {
    console.error('Demo execution failed:', error);
    process.exit(1);
  });
}

export { runFullAgentLinkDemo };