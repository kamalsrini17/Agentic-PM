/**
 * Complete Pipeline Test - Virtual Assistant Concept
 * Full framework: Prompt Processing → Analysis → Evaluation → Critique
 */

import 'dotenv/config';
import { AgenticPM } from './src/index';

async function runCompletePipeline() {
  console.log('🚀 Complete Agentic PM Pipeline Test');
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

    console.log('\n📝 Raw User Prompt:');
    console.log(`"${rawPrompt}"`);

    console.log('\n🔄 Step 1: Processing prompt through PromptProcessorAgent...');
    console.log('This will use GPT-4 to structure your raw idea...');

    // Use the enhanced prompt processing method
    const result = await agentic.quickAnalysisWithPrompt(rawPrompt);

    console.log('\n✅ Complete Pipeline Executed Successfully!');
    console.log('\n📊 FULL RESULTS:');
    console.log('='.repeat(60));

    // Display processed prompt information
    if (result.processedPrompt) {
      console.log('\n🧠 PROMPT PROCESSING RESULTS:');
      console.log(`✅ Title: ${result.processedPrompt.title}`);
      console.log(`✅ Domain: ${result.processedPrompt.domain}`);
      console.log(`✅ Target Market: ${result.processedPrompt.targetMarket}`);
      console.log(`✅ Confidence Score: ${result.processedPrompt.confidenceScore}/100`);
      console.log(`✅ Suggested Analysis: ${result.processedPrompt.suggestedAnalysisType}`);
      
      if (result.processedPrompt.keyFeatures?.length > 0) {
        console.log('\n🎯 AI-Extracted Features:');
        result.processedPrompt.keyFeatures.forEach((feature, i) => {
          console.log(`  ${i + 1}. ${feature}`);
        });
      }

      if (result.processedPrompt.goals?.length > 0) {
        console.log('\n🎯 AI-Identified Goals:');
        result.processedPrompt.goals.forEach((goal, i) => {
          console.log(`  ${i + 1}. ${goal}`);
        });
      }
    }

    // Display analysis results
    if (result.summary) {
      console.log('\n📊 ANALYSIS SUMMARY:');
      console.log(`✅ Overall Score: ${result.summary.overallScore}/100`);
      console.log(`✅ Total Duration: ${result.summary.totalDuration}ms`);
      console.log(`✅ Total Cost: $${result.summary.totalCost}`);
    }

    // Display evaluation results
    if (result.evaluation) {
      console.log('\n🎯 EVALUATION RESULTS:');
      console.log(JSON.stringify(result.evaluation, null, 2));
    }

    // Display recommendations/critique
    if (result.recommendations) {
      console.log('\n💡 AI RECOMMENDATIONS & CRITIQUE:');
      result.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }

    // Display personalization info
    if (result.personalization) {
      console.log('\n🎨 PERSONALIZATION:');
      console.log(`✅ Is Personalized: ${result.personalization.isPersonalized}`);
      console.log(`✅ Personalization Score: ${result.personalization.personalizationScore}/100`);
    }

    // Display document context if any
    if (result.documentContext) {
      console.log('\n📚 DOCUMENT CONTEXT:');
      console.log(`✅ Relevant Features: ${result.documentContext.relevantFeatures?.length || 0}`);
      console.log(`✅ Style Guidelines: ${result.documentContext.styleGuidelines?.length || 0}`);
    }

    console.log('\n🔍 COMPLETE RESULT STRUCTURE:');
    console.log('Available keys:', Object.keys(result));
    
    console.log('\n🎉 SUCCESS: Complete pipeline executed!');
    console.log('\n💡 FRAMEWORK COMPONENTS THAT RAN:');
    console.log('  ✅ PromptProcessorAgent - Converted raw prompt to structured concept');
    console.log('  ✅ Analysis Pipeline - Generated comprehensive analysis');
    if (result.evaluation) console.log('  ✅ EvaluationAgent - Scored and evaluated the concept');
    if (result.recommendations) console.log('  ✅ Critique System - Provided improvement suggestions');
    
    // Cleanup
    await agentic.shutdown();

  } catch (error) {
    console.error('\n❌ Pipeline execution failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

// Run the complete pipeline
runCompletePipeline().catch(console.error);