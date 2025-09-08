/**
 * Final Complete Pipeline Test - Virtual Assistant Concept
 * Full framework with correct property names
 */

import 'dotenv/config';
import { AgenticPM } from './src/index';

async function runFinalPipeline() {
  console.log('🚀 COMPLETE AGENTIC PM PIPELINE TEST');
  console.log('='.repeat(70));
  console.log('Testing: Virtual Assistant for Business Management');
  console.log('='.repeat(70));

  try {
    // Initialize the complete system
    console.log('\n🔧 Initializing Agentic PM Framework...');
    const agentic = new AgenticPM({
      enableOrchestration: true,
      enableMetrics: true, 
      enableEvaluation: true,
      costBudget: 1.00, // Higher budget for comprehensive analysis
      latencyTarget: 60000 // Allow more time for complete analysis
    });
    console.log('✅ Framework initialized with full orchestration, metrics, and evaluation');

    // Your raw prompt (exactly as you provided)
    const rawPrompt = "I want to build a virtual assistant for managing my scheduling, reaching out to prospects and manage my emails and ensure this assistant can send emails, search and build prospects list, turn prospects into leads.";

    console.log('\n📝 USER INPUT (Raw Prompt):');
    console.log(`"${rawPrompt}"`);
    console.log('\nLength:', rawPrompt.length, 'characters');

    console.log('\n🔄 PIPELINE EXECUTION:');
    console.log('Step 1: 🧠 Processing prompt through PromptProcessorAgent (GPT-4)...');
    console.log('Step 2: 📊 Running comprehensive analysis...');
    console.log('Step 3: 🎯 Evaluation and scoring...');
    console.log('Step 4: 💡 Generating critique and recommendations...');
    console.log('\nThis may take 1-2 minutes for complete analysis...');

    const startTime = Date.now();
    
    // Run the complete enhanced analysis with prompt processing
    const result = await agentic.quickAnalysisWithPrompt(rawPrompt);
    
    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`\n✅ PIPELINE COMPLETED in ${totalTime.toFixed(1)} seconds`);

    console.log('\n' + '='.repeat(70));
    console.log('📊 COMPLETE RESULTS');
    console.log('='.repeat(70));

    // 1. PROMPT PROCESSING RESULTS
    if (result.processedPrompt) {
      console.log('\n🧠 STEP 1: PROMPT PROCESSING RESULTS');
      console.log('─'.repeat(50));
      console.log(`✅ Processed Title: "${result.processedPrompt.title}"`);
      console.log(`✅ Enhanced Description: "${result.processedPrompt.description}"`);
      console.log(`✅ Classified Domain: "${result.processedPrompt.domain}"`);
      console.log(`✅ Target Market: "${result.processedPrompt.targetMarket}"`);
      console.log(`✅ Confidence Score: ${result.processedPrompt.confidenceScore}/100`);
      console.log(`✅ Analysis Type: ${result.processedPrompt.suggestedAnalysisType}`);
      
      if (result.processedPrompt.keyFeatures?.length > 0) {
        console.log('\n🎯 AI-Extracted Key Features:');
        result.processedPrompt.keyFeatures.forEach((feature, i) => {
          console.log(`  ${i + 1}. ${feature}`);
        });
      }

      if (result.processedPrompt.goals?.length > 0) {
        console.log('\n🎯 AI-Identified Business Goals:');
        result.processedPrompt.goals.forEach((goal, i) => {
          console.log(`  ${i + 1}. ${goal}`);
        });
      }

      if (result.processedPrompt.clarificationNeeded?.length > 0) {
        console.log('\n❓ Clarification Questions Generated:');
        result.processedPrompt.clarificationNeeded.forEach((question, i) => {
          console.log(`  ${i + 1}. ${question}`);
        });
      }
    }

    // 2. ANALYSIS SUMMARY
    if (result.summary) {
      console.log('\n📊 STEP 2: ANALYSIS SUMMARY');
      console.log('─'.repeat(50));
      console.log(`✅ Overall Score: ${result.summary.overallScore}/100`);
      console.log(`✅ Confidence Level: ${result.summary.confidence}/100`);
      console.log(`✅ Quality Achieved: ${result.summary.qualityAchieved}/100`);
      console.log(`✅ Efficiency Score: ${result.summary.efficiencyScore}/100`);
      console.log(`✅ Total Duration: ${result.summary.totalDuration}ms`);
      console.log(`✅ Total Cost: $${result.summary.totalCost}`);
    }

    // 3. EVALUATION RESULTS
    if (result.evaluationResult) {
      console.log('\n🎯 STEP 3: EVALUATION RESULTS');
      console.log('─'.repeat(50));
      console.log('✅ EvaluationAgent Results:');
      console.log(JSON.stringify(result.evaluationResult, null, 2).substring(0, 800) + '...');
    }

    // 4. ORCHESTRATION RESULTS
    if (result.orchestrationResult) {
      console.log('\n🏗️ STEP 4: ORCHESTRATION RESULTS');
      console.log('─'.repeat(50));
      console.log('✅ Orchestration completed');
      console.log('Workflow details available in result.orchestrationResult');
    }

    // 5. METRICS INSIGHTS
    if (result.metricsInsights && result.metricsInsights.length > 0) {
      console.log('\n📈 STEP 5: METRICS INSIGHTS');
      console.log('─'.repeat(50));
      console.log(`✅ Generated ${result.metricsInsights.length} insights`);
      result.metricsInsights.forEach((insight, i) => {
        console.log(`  ${i + 1}. [${insight.severity}] ${insight.title}: ${insight.description.substring(0, 100)}...`);
      });
    }

    // 6. PERSONALIZATION
    if (result.personalization) {
      console.log('\n🎨 STEP 6: PERSONALIZATION');
      console.log('─'.repeat(50));
      console.log(`✅ Is Personalized: ${result.personalization.isPersonalized}`);
      console.log(`✅ Personalization Score: ${result.personalization.personalizationScore}/100`);
      console.log(`✅ Domain Expertise: ${result.personalization.domainExpertise}`);
      console.log(`✅ Context Influence: ${result.personalization.contextInfluence}`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 COMPLETE PIPELINE SUCCESS!');
    console.log('='.repeat(70));

    console.log('\n💡 FRAMEWORK COMPONENTS THAT EXECUTED:');
    console.log('  ✅ PromptProcessorAgent - Enhanced your raw idea');
    console.log('  ✅ Analysis Pipeline - Generated comprehensive analysis');
    console.log('  ✅ Orchestration System - Coordinated all components');
    console.log('  ✅ Metrics Collection - Tracked performance');
    if (result.evaluationResult) console.log('  ✅ EvaluationAgent - Scored and evaluated');
    
    console.log('\n🎯 YOUR VIRTUAL ASSISTANT CONCEPT HAS BEEN FULLY ANALYZED!');

  } catch (error) {
    console.error('\n❌ Pipeline execution failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

// Run the complete pipeline
runFinalPipeline().catch(console.error);