/**
 * Time Trace Analysis - Track which agents take how long
 */

require('dotenv/config');

async function timeTraceAnalysis() {
  console.log('🕐 TIME TRACE ANALYSIS');
  console.log('='.repeat(50));
  
  const overallStart = Date.now();
  
  try {
    // Test 1: PromptProcessorAgent (first step)
    console.log('\n📝 Step 1: PromptProcessorAgent');
    const step1Start = Date.now();
    
    const { PromptProcessorAgent } = require('./dist/agents/PromptProcessorAgent');
    const processor = new PromptProcessorAgent();
    
    const promptResult = await processor.processPrompt({
      rawPrompt: "Messaging 2.0 for enterprise where agent to agent and human to agent communication can happen. Think of this as Teams 2.0"
    });
    
    const step1Duration = Date.now() - step1Start;
    console.log(`✅ PromptProcessorAgent: ${step1Duration}ms (${(step1Duration/1000).toFixed(1)}s)`);
    
    // Test 2: MarketResearchAgent
    console.log('\n📊 Step 2: MarketResearchAgent');
    const step2Start = Date.now();
    
    const { MarketResearchAgent } = require('./dist/agents/MarketResearchAgent');
    const { OpenAI } = require('openai');
    const marketAgent = new MarketResearchAgent(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));
    
    const marketResult = await marketAgent.conductMarketResearch({
      productTitle: promptResult.title,
      productDescription: promptResult.description,
      targetMarket: promptResult.targetMarket,
      keyFeatures: promptResult.keyFeatures,
      goals: promptResult.goals
    });
    
    const step2Duration = Date.now() - step2Start;
    console.log(`✅ MarketResearchAgent: ${step2Duration}ms (${(step2Duration/1000).toFixed(1)}s)`);
    
    // Test 3: CompetitiveLandscapeAgent
    console.log('\n🏢 Step 3: CompetitiveLandscapeAgent');
    const step3Start = Date.now();
    
    const { CompetitiveLandscapeAgent } = require('./dist/agents/CompetitiveLandscapeAgent');
    const competitiveAgent = new CompetitiveLandscapeAgent(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));
    
    const competitiveResult = await competitiveAgent.analyzeCompetitiveLandscape({
      productTitle: promptResult.title,
      productDescription: promptResult.description,
      targetMarket: promptResult.targetMarket,
      keyFeatures: promptResult.keyFeatures
    });
    
    const step3Duration = Date.now() - step3Start;
    console.log(`✅ CompetitiveLandscapeAgent: ${step3Duration}ms (${(step3Duration/1000).toFixed(1)}s)`);
    
    // Test 4: OptimizedEvalsAgent (evaluation step)
    console.log('\n🎯 Step 4: OptimizedEvalsAgent');
    const step4Start = Date.now();
    
    const { OptimizedEvalsAgent } = require('./dist/evaluation/OptimizedEvalsAgent');
    const evalAgent = new OptimizedEvalsAgent();
    
    // Simulate evaluation input
    const evalResult = await evalAgent.evaluateWithOptimization({
      productConcept: {
        title: promptResult.title,
        description: promptResult.description,
        targetMarket: promptResult.targetMarket,
        keyFeatures: promptResult.keyFeatures
      },
      analysisResults: {
        marketResearch: marketResult,
        competitiveAnalysis: competitiveResult
      },
      evaluationModels: ['gpt-4'],
      costBudget: 0.50,
      latencyTarget: 30000
    });
    
    const step4Duration = Date.now() - step4Start;
    console.log(`✅ OptimizedEvalsAgent: ${step4Duration}ms (${(step4Duration/1000).toFixed(1)}s)`);
    
    const totalDuration = Date.now() - overallStart;
    
    console.log('\n📊 TIME BREAKDOWN SUMMARY');
    console.log('='.repeat(50));
    console.log(`Step 1 - PromptProcessor:     ${step1Duration.toString().padStart(6)}ms (${((step1Duration/totalDuration)*100).toFixed(1)}%)`);
    console.log(`Step 2 - MarketResearch:      ${step2Duration.toString().padStart(6)}ms (${((step2Duration/totalDuration)*100).toFixed(1)}%)`);
    console.log(`Step 3 - CompetitiveLandscape: ${step3Duration.toString().padStart(6)}ms (${((step3Duration/totalDuration)*100).toFixed(1)}%)`);
    console.log(`Step 4 - OptimizedEvals:      ${step4Duration.toString().padStart(6)}ms (${((step4Duration/totalDuration)*100).toFixed(1)}%)`);
    console.log(`${''.padStart(50, '-')}`);
    console.log(`TOTAL DURATION:               ${totalDuration.toString().padStart(6)}ms (${(totalDuration/1000).toFixed(1)}s)`);
    
    console.log('\n🔍 ANALYSIS:');
    const slowestStep = Math.max(step1Duration, step2Duration, step3Duration, step4Duration);
    let slowestAgent = '';
    if (slowestStep === step1Duration) slowestAgent = 'PromptProcessorAgent';
    else if (slowestStep === step2Duration) slowestAgent = 'MarketResearchAgent';
    else if (slowestStep === step3Duration) slowestAgent = 'CompetitiveLandscapeAgent';
    else if (slowestStep === step4Duration) slowestAgent = 'OptimizedEvalsAgent';
    
    console.log(`Slowest Agent: ${slowestAgent} (${slowestStep}ms)`);
    console.log(`OpenAI calls per agent: 1-3 calls each`);
    console.log(`Average OpenAI response time: ${(totalDuration/8).toFixed(0)}ms per call (estimated)`);
    
  } catch (error) {
    console.error(`❌ Time trace failed: ${error.message}`);
    if (error.stack) {
      console.error(`Stack: ${error.stack}`);
    }
  }
}

timeTraceAnalysis().catch(console.error);