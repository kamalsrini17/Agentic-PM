/**
 * Analyze Product Concept from Natural Language Prompt
 * Command line tool for running comprehensive analysis with user prompts
 */

import { AgenticPM } from './index';
import { Logger } from './utils/errorHandling';
import 'dotenv/config';

// ============================================================================
// COMMAND LINE ARGUMENT PARSING
// ============================================================================

interface CliArgs {
  prompt?: string;
  file?: string;
  type?: 'quick' | 'standard' | 'comprehensive';
  help?: boolean;
}

function parseArgs(): CliArgs {
  const args: CliArgs = {};
  const argv = process.argv.slice(2);
  
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    
    switch (arg) {
      case '--prompt':
      case '-p':
        args.prompt = argv[++i];
        break;
      case '--file':
      case '-f':
        args.file = argv[++i];
        break;
      case '--type':
      case '-t':
        args.type = argv[++i] as 'quick' | 'standard' | 'comprehensive';
        break;
      case '--help':
      case '-h':
        args.help = true;
        break;
      default:
        // If no flag, treat as prompt continuation
        if (!arg.startsWith('-') && !args.prompt) {
          args.prompt = argv.slice(i).join(' ');
          break;
        }
    }
  }
  
  return args;
}

function showHelp() {
  console.log(`
🚀 Agentic PM - Product Concept Analyzer

Usage:
  npm run analyze -- --prompt "Your product concept here"
  npm run analyze -- --file concept.txt
  npm run analyze -- "Your product concept here"

Options:
  --prompt, -p    Product concept prompt (required if no file)
  --file, -f      Read prompt from file
  --type, -t      Analysis type: quick|standard|comprehensive (default: comprehensive)
  --help, -h      Show this help

Examples:
  npm run analyze -- --prompt "I want to build a messaging platform for AI agents"
  npm run analyze -- --file my-concept.txt --type quick
  npm run analyze -- "Build a CRM for small businesses"

Environment Variables:
  OPENAI_API_KEY     Required - OpenAI API key
  ANTHROPIC_API_KEY  Optional - Anthropic API key for Claude models
`);
}

// ============================================================================
// FILE READING
// ============================================================================

async function readPromptFromFile(filePath: string): Promise<string> {
  try {
    const fs = await import('fs').then(m => m.promises);
    const content = await fs.readFile(filePath, 'utf-8');
    return content.trim();
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${(error as Error).message}`);
  }
}

// ============================================================================
// ANALYSIS EXECUTION
// ============================================================================

async function runAnalysis(prompt: string, analysisType: 'quick' | 'standard' | 'comprehensive' = 'comprehensive') {
  const logger = Logger.getInstance();
  
  console.log('🚀 Agentic PM - Product Concept Analysis');
  console.log('='.repeat(60));
  console.log(`📝 Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);
  console.log(`🎯 Analysis Type: ${analysisType.toUpperCase()}`);
  console.log('⏳ Starting analysis...\n');

  const agentic = new AgenticPM({
    enableOrchestration: true,
    enableMetrics: true,
    enableEvaluation: true,
    costBudget: analysisType === 'quick' ? 0.20 : analysisType === 'standard' ? 0.50 : 1.00,
    latencyTarget: analysisType === 'quick' ? 30000 : analysisType === 'standard' ? 60000 : 120000
  });

  try {
    const startTime = Date.now();
    let result;

    // Run appropriate analysis type
    switch (analysisType) {
      case 'quick':
        result = await agentic.quickAnalysisWithPrompt(prompt);
        break;
      case 'standard':
        // Use comprehensive method but with standard config
        result = await agentic.comprehensiveAnalysisWithPrompt(prompt);
        break;
      case 'comprehensive':
      default:
        result = await agentic.comprehensiveAnalysisWithPrompt(prompt);
        break;
    }

    const duration = Date.now() - startTime;

    // Display Results
    console.log('✅ ANALYSIS COMPLETE!');
    console.log('='.repeat(60));
    
    // Core Metrics
    console.log('📊 ANALYSIS SUMMARY:');
    console.log('-'.repeat(30));
    console.log(`   Overall Score: ${result.summary.overallScore}/100`);
    console.log(`   Confidence: ${result.summary.confidence}%`);
    console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);
    console.log(`   Cost: $${result.summary.totalCost.toFixed(4)}`);
    console.log(`   Efficiency: ${result.summary.efficiencyScore}/100`);

    // System Performance
    if (result.systemPerformance) {
      console.log('\n🏥 SYSTEM PERFORMANCE:');
      console.log('-'.repeat(30));
      console.log(`   Orchestration Efficiency: ${result.systemPerformance.orchestrationEfficiency || 'N/A'}%`);
      console.log(`   Evaluation Efficiency: ${result.systemPerformance.evaluationEfficiency || 'N/A'}%`);
      console.log(`   Resource Utilization: ${result.systemPerformance.resourceUtilization || 'N/A'}%`);
    }

    // Orchestration Results
    if (result.orchestrationResult) {
      console.log('\n🏗️  ORCHESTRATION INSIGHTS:');
      console.log('-'.repeat(30));
      console.log(`   Success: ${result.orchestrationResult.success ? '✅' : '❌'}`);
      console.log(`   Quality Achieved: ${result.orchestrationResult.qualityAchieved || 'N/A'}/100`);
      console.log(`   Actual Cost: $${result.orchestrationResult.actualCost?.toFixed(4) || 'N/A'}`);
      
      if (result.orchestrationResult.insights && result.orchestrationResult.insights.length > 0) {
        console.log('   Key Insights:');
        result.orchestrationResult.insights.slice(0, 5).forEach(insight => {
          console.log(`     • ${insight}`);
        });
      }
    }

    // Evaluation Details
    if (result.evaluationResult) {
      console.log('\n🎯 EVALUATION DETAILS:');
      console.log('-'.repeat(30));
      console.log(`   Models Used: ${result.evaluationResult.modelsUsed?.join(', ') || 'N/A'}`);
      console.log(`   Optimization Strategy: ${result.evaluationResult.optimizationStrategy || 'N/A'}`);
      console.log(`   Cache Hit: ${result.evaluationResult.cacheHit ? '✅' : '❌'}`);
      
      if (result.evaluationResult.metadata) {
        console.log(`   Budget Utilization: ${(result.evaluationResult.metadata.budgetUtilization * 100).toFixed(1)}%`);
      }
    }

    // Strategic Recommendations
    if (result.recommendations && result.recommendations.length > 0) {
      console.log('\n💡 TOP STRATEGIC RECOMMENDATIONS:');
      console.log('-'.repeat(30));
      result.recommendations.slice(0, 8).forEach((rec, i) => {
        const priority = rec.priority?.toUpperCase() || 'MEDIUM';
        const title = rec.title || rec.description || rec;
        console.log(`   ${i + 1}. [${priority}] ${title}`);
        
        if (rec.description && rec.title !== rec.description) {
          console.log(`      ${rec.description}`);
        }
        
        if (rec.expectedBenefit) {
          console.log(`      💰 Expected Benefit: ${rec.expectedBenefit}`);
        }
        
        if (rec.effort) {
          console.log(`      ⚡ Effort Level: ${rec.effort}`);
        }
        
        if (rec.category) {
          console.log(`      📂 Category: ${rec.category}`);
        }
      });
    }

    // Analysis Metadata
    if (result.metadata) {
      console.log('\n🔍 ANALYSIS METADATA:');
      console.log('-'.repeat(30));
      console.log(`   Systems Used: ${result.metadata.systemsUsed?.join(', ') || 'Multiple AI agents'}`);
      console.log(`   Analysis Type: ${result.metadata.analysisType || analysisType}`);
    }

    // System Health Check
    try {
      const health = await agentic.getSystemHealth();
      console.log('\n🏥 SYSTEM HEALTH:');
      console.log('-'.repeat(30));
      console.log(`   Overall Status: ${health.overall.toUpperCase()}`);
      const componentStatuses = Object.entries(health.components).map(([k, v]) => `${k}:${(v as any).status}`);
      console.log(`   Components: ${componentStatuses.join(', ')}`);
      
      if (health.recommendations.length > 0) {
        console.log('   Recommendations:');
        health.recommendations.slice(0, 3).forEach(rec => console.log(`     • ${rec}`));
      }
    } catch (error) {
      logger.warn('Could not retrieve system health', { message: (error as Error).message });
    }

    console.log('\n🎉 ANALYSIS SUMMARY:');
    console.log('-'.repeat(30));
    console.log('Your product concept has been analyzed using the full Agentic PM framework:');
    console.log('✓ Natural language prompt processing');
    console.log('✓ Multi-agent orchestration and evaluation');
    console.log('✓ Market research and competitive analysis');
    console.log('✓ Technical feasibility assessment');
    console.log('✓ Strategic recommendations generation');

  } catch (error) {
    console.error('\n❌ ANALYSIS FAILED:');
    console.error('-'.repeat(30));
    console.error(`Error: ${(error as Error).message}`);
    
    if (error instanceof Error && error.stack) {
      logger.error('Full error details', error);
    }
    
    process.exit(1);
  } finally {
    await agentic.shutdown();
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = parseArgs();
  
  // Show help if requested
  if (args.help) {
    showHelp();
    return;
  }
  
  // Get prompt from args or file
  let prompt: string;
  
  if (args.prompt) {
    prompt = args.prompt;
  } else if (args.file) {
    try {
      prompt = await readPromptFromFile(args.file);
    } catch (error) {
      console.error(`❌ Error reading file: ${(error as Error).message}`);
      process.exit(1);
    }
  } else {
    console.error('❌ Error: No prompt provided. Use --prompt or --file option.');
    console.log('Run with --help for usage information.');
    process.exit(1);
  }
  
  // Validate prompt
  if (!prompt.trim()) {
    console.error('❌ Error: Prompt cannot be empty.');
    process.exit(1);
  }
  
  // Validate analysis type
  const analysisType = args.type || 'comprehensive';
  if (!['quick', 'standard', 'comprehensive'].includes(analysisType)) {
    console.error('❌ Error: Analysis type must be quick, standard, or comprehensive.');
    process.exit(1);
  }
  
  // Run the analysis
  await runAnalysis(prompt.trim(), analysisType);
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

export { runAnalysis, parseArgs };