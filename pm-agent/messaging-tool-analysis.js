/**
 * Custom analysis for the messaging tool idea using the full Agentic PM system
 */

const { analyzeCustomProduct } = require('./src/examples/genericProductExample');

// Your messaging tool product concept
const messagingToolConcept = {
  title: "NextGen Enterprise Messaging Platform",
  description: "Next generation of messaging tool for agent to human or vice versa. This is like Teams 2.0 for enterprise",
  goals: [
    "Enable seamless agent-to-human communication in enterprise environments",
    "Provide intelligent conversation routing and escalation",
    "Integrate AI agents naturally into existing team workflows", 
    "Offer enterprise-grade security, compliance, and governance",
    "Reduce communication overhead through intelligent automation"
  ],
  targetMarket: "Enterprise teams and organizations adopting AI agents",
  timeline: "Q2 2025",
  keyFeatures: [
    "Native AI agent integration and management",
    "Real-time conversation analysis and sentiment tracking",
    "Intelligent message routing and escalation",
    "Context-aware response suggestions",
    "Enterprise security and compliance (SOC2, GDPR)",
    "Multi-modal communication (text, voice, files, code)",
    "Workflow automation triggers and integrations",
    "Advanced analytics and reporting dashboard"
  ],
  targetUsers: [
    "Team leads and engineering managers",
    "Software developers working with AI agents", 
    "Customer support and success teams",
    "Enterprise IT administrators",
    "Business analysts and product managers",
    "C-level executives overseeing AI adoption"
  ],
  platform: "web",
  designStyle: "modern",
  monetizationModel: "subscription",
  expectedScale: "enterprise",
  technicalRequirements: [
    "Real-time messaging infrastructure",
    "AI model integration (OpenAI, Anthropic, etc.)",
    "Enterprise SSO and authentication",
    "API-first architecture for agent connectivity",
    "Advanced security and audit logging"
  ]
};

async function runMessagingToolAnalysis() {
  console.log('🚀 Running Full Agentic PM Analysis for Messaging Tool');
  console.log('='.repeat(60));
  console.log('Product:', messagingToolConcept.title);
  console.log('Description:', messagingToolConcept.description);
  console.log('Target Market:', messagingToolConcept.targetMarket);
  console.log('');

  try {
    const result = await analyzeCustomProduct(messagingToolConcept);
    
    console.log('\n✅ ANALYSIS COMPLETE!');
    console.log('='.repeat(60));
    
    // Display comprehensive results
    console.log(`📊 Overall Score: ${result.summary.overallScore}/100`);
    console.log(`🎯 Confidence: ${result.summary.confidence}%`);
    console.log(`💰 Total Cost: $${result.summary.totalCost.toFixed(4)}`);
    console.log(`⚡ Efficiency Score: ${result.summary.efficiencyScore}/100`);
    console.log(`⏱️  Duration: ${result.summary.totalDuration}ms`);
    
    if (result.recommendations && result.recommendations.length > 0) {
      console.log('\n💡 TOP STRATEGIC RECOMMENDATIONS:');
      console.log('-'.repeat(50));
      result.recommendations.slice(0, 8).forEach((rec, i) => {
        console.log(`   ${i + 1}. [${rec.priority?.toUpperCase() || 'MEDIUM'}] ${rec.title || rec.description || rec}`);
        if (rec.description && rec.title !== rec.description) {
          console.log(`      ${rec.description}`);
        }
        if (rec.expectedBenefit) {
          console.log(`      Expected Benefit: ${rec.expectedBenefit}`);
        }
      });
    }
    
    if (result.orchestrationResult) {
      console.log('\n🏗️  ORCHESTRATION INSIGHTS:');
      console.log('-'.repeat(50));
      console.log(`   Success: ${result.orchestrationResult.success ? '✅' : '❌'}`);
      console.log(`   Actual Cost: $${result.orchestrationResult.actualCost?.toFixed(4) || 'N/A'}`);
      console.log(`   Quality Achieved: ${result.orchestrationResult.qualityAchieved || 'N/A'}/100`);
      
      if (result.orchestrationResult.insights && result.orchestrationResult.insights.length > 0) {
        console.log('   Key Insights:');
        result.orchestrationResult.insights.forEach(insight => {
          console.log(`     • ${insight}`);
        });
      }
    }
    
    if (result.evaluationResult) {
      console.log('\n🎯 EVALUATION DETAILS:');
      console.log('-'.repeat(50));
      console.log(`   Models Used: ${result.evaluationResult.modelsUsed?.join(', ') || 'N/A'}`);
      console.log(`   Optimization Strategy: ${result.evaluationResult.optimizationStrategy || 'N/A'}`);
      console.log(`   Cache Hit: ${result.evaluationResult.cacheHit ? '✅' : '❌'}`);
    }
    
    if (result.systemPerformance) {
      console.log('\n🏥 SYSTEM PERFORMANCE:');
      console.log('-'.repeat(50));
      console.log(`   Orchestration Efficiency: ${result.systemPerformance.orchestrationEfficiency || 'N/A'}%`);
      console.log(`   Evaluation Efficiency: ${result.systemPerformance.evaluationEfficiency || 'N/A'}%`);
      console.log(`   Resource Utilization: ${result.systemPerformance.resourceUtilization || 'N/A'}%`);
    }
    
    console.log(`\n🏗️  Systems Used: ${result.metadata?.systemsUsed?.join(', ') || 'Multiple AI agents'}`);
    
    console.log('\n🎉 MESSAGING TOOL ANALYSIS SUMMARY:');
    console.log('-'.repeat(50));
    console.log('Your "Teams 2.0 for enterprise" messaging tool concept has been');
    console.log('analyzed using the full Agentic PM framework with:');
    console.log('✓ Market research and competitive analysis');
    console.log('✓ Technical feasibility assessment');  
    console.log('✓ Strategic recommendations');
    console.log('✓ Multi-agent orchestration and evaluation');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the analysis
runMessagingToolAnalysis().catch(console.error);