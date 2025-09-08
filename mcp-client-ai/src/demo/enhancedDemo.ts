/**
 * Enhanced Agentic PM Demo
 * Showcases the complete unified agent system with orchestration, metrics, and optimized evaluation
 */

import { AgenticPM, createAgenticPM, runSystemTests, AgenticPMPresets } from '../index';
import { Logger } from '../utils/errorHandling';

// ============================================================================
// DEMO CONFIGURATION
// ============================================================================

const logger = Logger.getInstance();

const DEMO_PRODUCTS = [
  {
    title: "AI-Powered Code Review Assistant",
    description: "An intelligent code review system that automatically detects bugs, security vulnerabilities, and suggests improvements using advanced AI models.",
    targetMarket: "Software development teams in tech companies",
    keyFeatures: [
      "Automated bug detection",
      "Security vulnerability scanning", 
      "Code quality suggestions",
      "Integration with Git workflows",
      "Real-time feedback"
    ],
    goals: [
      "Reduce code review time by 50%",
      "Improve code quality scores by 30%",
      "Decrease production bugs by 40%"
    ],
    constraints: [
      "Must integrate with GitHub/GitLab",
      "Sub-second response time for inline suggestions",
      "SOC2 compliance required"
    ]
  },
  {
    title: "Smart Home Energy Optimizer",
    description: "IoT-based system that learns household patterns and automatically optimizes energy consumption while maintaining comfort.",
    targetMarket: "Environmentally conscious homeowners",
    keyFeatures: [
      "Smart device integration",
      "Machine learning optimization",
      "Energy usage analytics",
      "Mobile app control",
      "Cost savings tracking"
    ],
    goals: [
      "Reduce energy costs by 25%",
      "Achieve carbon footprint reduction",
      "Maintain user comfort levels"
    ]
  },
  {
    title: "Healthcare Appointment Scheduler",
    description: "AI-driven appointment scheduling system that optimizes doctor schedules while considering patient preferences and urgency.",
    targetMarket: "Healthcare providers and medical practices",
    keyFeatures: [
      "Intelligent scheduling algorithms",
      "Patient preference matching",
      "Emergency prioritization",
      "Multi-provider coordination",
      "Automated reminders"
    ]
  }
];

// ============================================================================
// MAIN DEMO FUNCTION
// ============================================================================

async function runEnhancedDemo(): Promise<void> {
  console.log('\n🚀 Enhanced Agentic PM Demo - Unified Agent System\n');
  console.log('='.repeat(60));

  try {
    // Step 1: System Health Check and Tests
    await demonstrateSystemTesting();
    
    // Step 2: Quick Analysis Demo
    await demonstrateQuickAnalysis();
    
    // Step 3: Comprehensive Analysis Demo
    await demonstrateComprehensiveAnalysis();
    
    // Step 4: Configuration Presets Demo
    await demonstrateConfigurationPresets();
    
    // Step 5: Advanced Features Demo
    await demonstrateAdvancedFeatures();
    
    // Step 6: Performance and Optimization Demo
    await demonstratePerformanceOptimization();
    
    // Step 7: System Monitoring Demo
    await demonstrateSystemMonitoring();

    console.log('\n✅ Enhanced Demo completed successfully!');
    console.log('\nThe unified agent system demonstrates:');
    console.log('• Intelligent workflow orchestration');
    console.log('• Real-time metrics collection and analysis');
    console.log('• Cost and latency optimized evaluations');
    console.log('• Comprehensive system integration');
    console.log('• Advanced performance monitoring');

  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    throw error;
  }
}

// ============================================================================
// DEMO SECTIONS
// ============================================================================

async function demonstrateSystemTesting(): Promise<void> {
  console.log('\n📋 1. System Testing and Health Checks');
  console.log('-'.repeat(40));

  try {
    console.log('Running quick system tests...');
    const testResults = await runSystemTests('quick');
    
    console.log(`\n✅ Tests completed: ${testResults.passedTests}/${testResults.totalTests} passed`);
    console.log(`⏱️  Total duration: ${testResults.totalDuration}ms`);
    console.log(`📊 System performance: ${testResults.systemPerformance.avgQuality}% quality`);
    
    if (testResults.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      testResults.recommendations.forEach((rec: any) => console.log(`   • ${rec}`));
    }

  } catch (error) {
    console.warn('⚠️  System tests encountered issues:', (error as Error).message);
  }
}

async function demonstrateQuickAnalysis(): Promise<void> {
  console.log('\n⚡ 2. Quick Analysis Demo');
  console.log('-'.repeat(40));

  const agentic = createAgenticPM('speed');
  
  try {
    console.log('Analyzing:', DEMO_PRODUCTS[0].title);
    console.log('Configuration: Speed-optimized (< 15s, < $0.10)');
    
    const startTime = Date.now();
    const result = await agentic.quickAnalysis(DEMO_PRODUCTS[0]);
    const duration = Date.now() - startTime;
    
    console.log('\n📊 Quick Analysis Results:');
    console.log(`   Overall Score: ${result.summary.overallScore}/100`);
    console.log(`   Confidence: ${result.summary.confidence}%`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Cost: $${result.summary.totalCost.toFixed(4)}`);
    console.log(`   Efficiency: ${result.summary.efficiencyScore}/100`);
    
    if (result.evaluationResult?.cacheHit) {
      console.log('   🎯 Cache Hit - Optimized performance!');
    }
    
    console.log('\n🎯 Top Recommendations:');
    result.recommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
      console.log(`      ${rec.description}`);
    });

  } finally {
    await agentic.shutdown();
  }
}

async function demonstrateComprehensiveAnalysis(): Promise<void> {
  console.log('\n🔍 3. Comprehensive Analysis Demo');
  console.log('-'.repeat(40));

  const agentic = createAgenticPM('quality');
  
  try {
    console.log('Analyzing:', DEMO_PRODUCTS[0].title);
    console.log('Configuration: Quality-optimized (comprehensive evaluation)');
    
    const startTime = Date.now();
    const result = await agentic.comprehensiveAnalysis(DEMO_PRODUCTS[0]);
    const duration = Date.now() - startTime;
    
    console.log('\n📊 Comprehensive Analysis Results:');
    console.log(`   Overall Score: ${result.summary.overallScore}/100`);
    console.log(`   Confidence: ${result.summary.confidence}%`);
    console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);
    console.log(`   Cost: $${result.summary.totalCost.toFixed(4)}`);
    console.log(`   Systems Used: ${result.metadata.systemsUsed.join(', ')}`);
    
    console.log('\n🏗️  System Performance:');
    console.log(`   Orchestration Efficiency: ${result.systemPerformance.orchestrationEfficiency}%`);
    console.log(`   Evaluation Efficiency: ${result.systemPerformance.evaluationEfficiency}%`);
    console.log(`   Metrics Health: ${result.systemPerformance.metricsHealth}%`);
    console.log(`   Resource Utilization: ${result.systemPerformance.resourceUtilization}%`);
    
    if (result.orchestrationResult) {
      console.log('\n⚙️  Orchestration Results:');
      console.log(`   Success: ${result.orchestrationResult.success}`);
      console.log(`   Quality Achieved: ${result.orchestrationResult.qualityAchieved}/100`);
      console.log(`   Insights: ${result.orchestrationResult.insights.length} generated`);
    }
    
    if (result.evaluationResult) {
      console.log('\n🎯 Evaluation Results:');
      console.log(`   Models Used: ${result.evaluationResult.modelsUsed.join(', ')}`);
      console.log(`   Strategy: ${result.evaluationResult.optimizationStrategy}`);
      console.log(`   Budget Utilization: ${result.evaluationResult.metadata.budgetUtilization.toFixed(1)}%`);
    }
    
    console.log('\n💡 Strategic Recommendations:');
    result.recommendations.slice(0, 5).forEach((rec, i) => {
      console.log(`   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.category}: ${rec.title}`);
      console.log(`      Impact: ${rec.expectedBenefit} | Effort: ${rec.effort}`);
    });

  } finally {
    await agentic.shutdown();
  }
}

async function demonstrateConfigurationPresets(): Promise<void> {
  console.log('\n⚙️  4. Configuration Presets Demo');
  console.log('-'.repeat(40));

  const presets = ['speed', 'cost', 'quality'] as const;
  const testProduct = DEMO_PRODUCTS[1];
  
  console.log('Comparing different optimization strategies...');
  console.log(`Product: ${testProduct.title}\n`);

  for (const preset of presets) {
    const agentic = createAgenticPM(preset);
    
    try {
      console.log(`🔧 Testing ${preset.toUpperCase()} preset:`);
      
      const startTime = Date.now();
      const result = await agentic.standardAnalysis(testProduct);
      const duration = Date.now() - startTime;
      
      console.log(`   Score: ${result.summary.overallScore}/100`);
      console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);
      console.log(`   Cost: $${result.summary.totalCost.toFixed(4)}`);
      console.log(`   Efficiency: ${result.summary.efficiencyScore}/100`);
      
      if (result.evaluationResult) {
        console.log(`   Strategy: ${result.evaluationResult.optimizationStrategy}`);
        console.log(`   Cache Hit: ${result.evaluationResult.cacheHit ? 'Yes' : 'No'}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Failed: ${(error as Error).message}`);
    } finally {
      await agentic.shutdown();
    }
    
    console.log('');
  }
}

async function demonstrateAdvancedFeatures(): Promise<void> {
  console.log('\n🚀 5. Advanced Features Demo');
  console.log('-'.repeat(40));

  const agentic = new AgenticPM({
    enableOrchestration: true,
    enableMetrics: true,
    enableEvaluation: true,
    costBudget: 0.40,
    latencyTarget: 60000
  });
  
  try {
    // Batch processing
    console.log('🔄 Batch Processing:');
    const batchProducts = DEMO_PRODUCTS.slice(0, 2);
    
    const batchStartTime = Date.now();
    const batchResults = await Promise.all(
      batchProducts.map(product => agentic.quickAnalysis(product))
    );
    const batchDuration = Date.now() - batchStartTime;
    
    console.log(`   Processed ${batchResults.length} products in ${(batchDuration / 1000).toFixed(1)}s`);
    console.log(`   Average score: ${(batchResults.reduce((sum, r) => sum + r.summary.overallScore, 0) / batchResults.length).toFixed(1)}`);
    console.log(`   Total cost: $${batchResults.reduce((sum, r) => sum + r.summary.totalCost, 0).toFixed(4)}`);
    
    // Active analyses tracking
    console.log('\n📊 Active Analyses:');
    const activeAnalyses = agentic.getActiveAnalyses();
    console.log(`   Currently tracking: ${activeAnalyses.length} analyses`);
    
    if (activeAnalyses.length > 0) {
      const latest = activeAnalyses[activeAnalyses.length - 1];
      console.log(`   Latest: ${latest.analysisId} (Score: ${latest.summary.overallScore})`);
    }
    
    // System health monitoring
    console.log('\n🏥 System Health:');
    const health = await agentic.getSystemHealth();
    console.log(`   Overall Status: ${health.overall.toUpperCase()}`);
    console.log(`   Orchestration: ${health.components.orchestration.status}`);
    console.log(`   Metrics: ${health.components.metrics.status}`);
    console.log(`   Evaluation: ${health.components.evaluation.status}`);
    
    if (health.recommendations.length > 0) {
      console.log('   Recommendations:');
      health.recommendations.forEach(rec => console.log(`     • ${rec}`));
    }

  } finally {
    await agentic.shutdown();
  }
}

async function demonstratePerformanceOptimization(): Promise<void> {
  console.log('\n⚡ 6. Performance Optimization Demo');
  console.log('-'.repeat(40));

  const agentic = new AgenticPM({
    enableEvaluation: true,
    costBudget: 0.20,
    latencyTarget: 30000
  });
  
  try {
    const testProduct = DEMO_PRODUCTS[2];
    
    // First run (cold start)
    console.log('🥶 Cold start analysis:');
    const coldStart = Date.now();
    const firstResult = await agentic.quickAnalysis(testProduct);
    const coldDuration = Date.now() - coldStart;
    
    console.log(`   Duration: ${coldDuration}ms`);
    console.log(`   Cost: $${firstResult.summary.totalCost.toFixed(4)}`);
    console.log(`   Cache Hit: ${firstResult.evaluationResult?.cacheHit ? 'Yes' : 'No'}`);
    
    // Second run (should hit cache)
    console.log('\n🔥 Warm start analysis (same product):');
    const warmStart = Date.now();
    const secondResult = await agentic.quickAnalysis(testProduct);
    const warmDuration = Date.now() - warmStart;
    
    console.log(`   Duration: ${warmDuration}ms`);
    console.log(`   Cost: $${secondResult.summary.totalCost.toFixed(4)}`);
    console.log(`   Cache Hit: ${secondResult.evaluationResult?.cacheHit ? 'Yes' : 'No'}`);
    console.log(`   Speed Improvement: ${((coldDuration - warmDuration) / coldDuration * 100).toFixed(1)}%`);
    console.log(`   Cost Savings: ${((firstResult.summary.totalCost - secondResult.summary.totalCost) / firstResult.summary.totalCost * 100).toFixed(1)}%`);
    
    // Performance metrics
    console.log('\n📈 Performance Metrics:');
    const report = await agentic.generateReport();
    console.log(`   System Uptime: ${(report.performanceMetrics.uptime / 1000 / 60).toFixed(1)} minutes`);
    console.log(`   Total Analyses: ${report.performanceMetrics.totalAnalyses}`);
    console.log(`   Avg Cost: $${report.performanceMetrics.avgAnalysisCost.toFixed(4)}`);
    console.log(`   Avg Quality: ${report.performanceMetrics.avgAnalysisQuality.toFixed(1)}/100`);

  } finally {
    await agentic.shutdown();
  }
}

async function demonstrateSystemMonitoring(): Promise<void> {
  console.log('\n📊 7. System Monitoring Demo');
  console.log('-'.repeat(40));

  const agentic = new AgenticPM();
  
  try {
    // Generate some activity for monitoring
    console.log('Generating system activity for monitoring...');
    
    await Promise.all([
      agentic.quickAnalysis({ title: 'Monitor Test 1', description: 'Testing monitoring' }),
      agentic.quickAnalysis({ title: 'Monitor Test 2', description: 'Testing monitoring' })
    ]);
    
    // Get comprehensive system report
    const report = await agentic.generateReport();
    
    console.log('\n🏥 System Health Report:');
    console.log(`   Overall Status: ${report.systemHealth.overall.toUpperCase()}`);
    
    console.log('\n📊 Component Status:');
    Object.entries(report.systemHealth.components).forEach(([component, status]) => {
      console.log(`   ${component}:`);
      console.log(`     Status: ${status.status}`);
      
      if ('activeExecutions' in status) {
        console.log(`     Active Executions: ${status.activeExecutions}`);
        console.log(`     Success Rate: ${status.successRate}%`);
      }
      
      if ('cacheHitRate' in status) {
        console.log(`     Cache Hit Rate: ${status.cacheHitRate.toFixed(1)}%`);
        console.log(`     Avg Cost: $${status.avgCost.toFixed(4)}`);
      }
      
      if ('collectionRate' in status) {
        console.log(`     Collection Rate: ${status.collectionRate}%`);
        console.log(`     Active Alerts: ${status.alertsActive}`);
      }
    });
    
    console.log('\n📈 Performance Metrics:');
    console.log(`   Uptime: ${(report.performanceMetrics.uptime / 1000 / 60).toFixed(1)} minutes`);
    console.log(`   Total Analyses: ${report.performanceMetrics.totalAnalyses}`);
    console.log(`   Average Cost: $${report.performanceMetrics.avgAnalysisCost.toFixed(4)}`);
    console.log(`   Average Quality: ${report.performanceMetrics.avgAnalysisQuality.toFixed(1)}/100`);
    
    console.log('\n📋 Recent Analyses:');
    report.recentAnalyses.slice(0, 3).forEach((analysis, i) => {
      console.log(`   ${i + 1}. ${analysis.analysisId}:`);
      console.log(`      Score: ${analysis.summary.overallScore}/100`);
      console.log(`      Cost: $${analysis.summary.totalCost.toFixed(4)}`);
      console.log(`      Type: ${analysis.metadata.analysisType}`);
    });
    
    if (report.systemHealth.recommendations.length > 0) {
      console.log('\n💡 System Recommendations:');
      report.systemHealth.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }
    
    // Cleanup demonstration
    console.log('\n🧹 Cleanup Operations:');
    const cleanedCount = agentic.cleanup(0); // Clean all for demo
    console.log(`   Cleaned up ${cleanedCount} old analyses`);

  } finally {
    await agentic.shutdown();
  }
}

// ============================================================================
// DEMO EXECUTION
// ============================================================================

// Run the demo if this file is executed directly
if (require.main === module) {
  runEnhancedDemo().catch(error => {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  });
}

export { runEnhancedDemo };
export default runEnhancedDemo;