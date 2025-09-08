/**
 * Test script for Virtual Assistant product analysis
 * Following README examples but adapted for actual system
 */

import { AgenticPM } from './src/index';

async function testVirtualAssistant() {
  console.log('🚀 Testing Agentic PM with Virtual Assistant Product Concept');
  console.log('='.repeat(60));

  try {
    // Initialize the AgenticPM system
    const agentic = new AgenticPM({
      enableOrchestration: true,
      enableMetrics: true,
      enableEvaluation: true,
      costBudget: 0.50,
      latencyTarget: 30000
    });

    console.log('✅ AgenticPM system initialized successfully');

    // Your product concept
    const productConcept = {
      title: "Virtual Assistant for Business Management",
      description: "I want to build a virtual assistant for managing my scheduling, reaching out to prospects and manage my emails and ensure this assistant can send emails, search and build prospects list, turn prospects into leads.",
      targetMarket: "Small business owners, entrepreneurs, sales professionals, and consultants",
      keyFeatures: [
        "Automated scheduling and calendar management",
        "Prospect research and list building",
        "Email management and automation",
        "Lead nurturing and conversion tracking",
        "CRM integration and data synchronization",
        "AI-powered prospect outreach",
        "Email template optimization",
        "Meeting scheduling and follow-up automation"
      ]
    };

    console.log('\n📋 Product Concept:');
    console.log(`Title: ${productConcept.title}`);
    console.log(`Description: ${productConcept.description}`);
    console.log(`Target Market: ${productConcept.targetMarket}`);
    console.log(`Key Features: ${productConcept.keyFeatures.length} features identified`);

    console.log('\n🔄 Running quick analysis...');
    
    // Run the analysis
    const result = await agentic.quickAnalysis(productConcept);
    
    console.log('\n✅ Analysis Complete!');
    console.log('\n📊 Results:');
    console.log(JSON.stringify(result, null, 2));

    // Cleanup
    await agentic.shutdown();
    console.log('\n🎯 Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

// Run the test
testVirtualAssistant().catch(console.error);