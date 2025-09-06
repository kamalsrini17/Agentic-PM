#!/usr/bin/env ts-node

import * as dotenv from 'dotenv';
import { MultiModelAI } from './src/services/MultiModelAI';

// Load environment variables
dotenv.config();

async function testAPIConnections() {
  console.log('🔧 Testing API Connections...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`  OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`  ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`  GPT5_ENABLED: ${process.env.GPT5_ENABLED || 'false'}\n`);
  
  try {
    const ai = new MultiModelAI();
    
    // Get available models
    const availableModels = ai.getAvailableModels();
    console.log('📊 Available Models:');
    if (availableModels.length === 0) {
      console.log('  ❌ No models available - check your API keys');
      return;
    }
    
    availableModels.forEach(model => {
      console.log(`  ✅ ${model}`);
    });
    console.log('');
    
    // Test connectivity
    console.log('🔍 Testing Model Connectivity...');
    const connectivityResults = await ai.testConnectivity();
    
    let successCount = 0;
    let totalCount = 0;
    
    for (const [model, success] of Object.entries(connectivityResults)) {
      totalCount++;
      if (success) {
        successCount++;
        console.log(`  ✅ ${model}: Connection successful`);
      } else {
        console.log(`  ❌ ${model}: Connection failed`);
      }
    }
    
    console.log(`\n📈 Summary: ${successCount}/${totalCount} models working correctly`);
    
    if (successCount > 0) {
      console.log('\n🎉 Your AI services are ready to use!');
      
      // Test a simple multi-model query if we have working models
      if (successCount > 1) {
        console.log('\n🚀 Testing Multi-Model Query...');
        const testResponse = await ai.queryMultipleModels({
          prompt: 'What is the capital of France? Respond with just the city name.',
          models: Object.keys(connectivityResults).filter(model => connectivityResults[model]).slice(0, 2),
          maxTokens: 50
        });
        
        console.log(`  ⚡ Fastest response: ${testResponse.fastest} (${testResponse.responses[testResponse.fastest]?.latency}ms)`);
        console.log(`  📝 Most comprehensive: ${testResponse.mostTokens}`);
        console.log(`  🎯 Total latency: ${testResponse.totalLatency}ms`);
      }
    } else {
      console.log('\n❌ No working models found. Please check your API keys.');
    }
    
  } catch (error) {
    console.error('\n💥 Error during testing:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('OPENAI_API_KEY')) {
        console.log('\n💡 Fix: Add your OpenAI API key to the .env file');
      }
      if (error.message.includes('ANTHROPIC_API_KEY')) {
        console.log('💡 Note: Anthropic API key is optional but recommended for multi-model evaluation');
      }
    }
  }
}

// Run the test
if (require.main === module) {
  testAPIConnections().catch(console.error);
}

export { testAPIConnections };