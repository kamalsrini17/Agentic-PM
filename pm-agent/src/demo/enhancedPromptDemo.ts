/**
 * Enhanced Prompt Demo
 * Demonstrates the new prompt processing and document context features
 */

import { AgenticPM } from '../index';

console.log('\n🚀 Enhanced Agentic PM - Prompt & Document Context Demo\n');
console.log('='.repeat(60));

async function runEnhancedPromptDemo(): Promise<void> {
  console.log('\n📋 Demo Overview:');
  console.log('• Natural language prompt processing');
  console.log('• Document context integration');
  console.log('• Personalized PRD generation');
  console.log('• Session-based document management');

  const agentic = new AgenticPM({
    enableOrchestration: true,
    enableMetrics: true,
    enableEvaluation: true,
    costBudget: 0.50,
    latencyTarget: 45000
  });

  try {
    // Demo 1: Basic prompt processing
    console.log('\n1️⃣  Basic Prompt Processing');
    console.log('-'.repeat(40));
    
    const basicPrompt = "I want to build a mobile app that helps restaurants manage their inventory better and reduce food waste";
    
    console.log('User Prompt:', basicPrompt);
    console.log('\nProcessing prompt...');
    
    const basicResult = await agentic.quickAnalysisWithPrompt(basicPrompt);
    
    console.log('\n📊 Results:');
    console.log(`   Title: ${basicResult.processedPrompt.title}`);
    console.log(`   Domain: ${basicResult.processedPrompt.domain}`);
    console.log(`   Target Market: ${basicResult.processedPrompt.targetMarket}`);
    console.log(`   Confidence: ${basicResult.processedPrompt.confidenceScore}%`);
    console.log(`   Key Features (${basicResult.processedPrompt.keyFeatures.length}):`);
    basicResult.processedPrompt.keyFeatures.slice(0, 3).forEach((feature, i) => {
      console.log(`     ${i + 1}. ${feature}`);
    });

    // Demo 2: Enhanced with document context
    console.log('\n2️⃣  Enhanced Analysis with Document Context');
    console.log('-'.repeat(40));

    // Create sample documents
    const sampleDocuments = [
      {
        filename: 'existing_restaurant_features.md',
        content: `# Restaurant Management Features

## Core Features
- Real-time inventory tracking
- Supplier management system  
- Cost analysis and reporting
- Menu optimization based on inventory
- Automated reorder alerts
- Food safety compliance tracking

## Technical Requirements
- Must integrate with existing POS systems
- Cloud-based with offline capability
- Mobile-first design for kitchen staff
- HACCP compliance required
- Multi-location support

## Brand Guidelines
- Clean, professional interface
- Focus on efficiency and speed
- Use green color scheme for sustainability theme
- Minimal text, maximum visual indicators
`,
        contentType: 'text/markdown'
      },
      {
        filename: 'restaurant_constraints.txt',
        content: `Project Constraints:

Budget: $75,000 maximum
Timeline: 6 months to MVP
Team: 2 developers, 1 designer
Technology: React Native preferred
Integration: Must work with Square POS
Compliance: Health department regulations
Target: 50+ restaurant locations for pilot

Key Success Metrics:
- 25% reduction in food waste
- 15% improvement in inventory accuracy
- 4.5+ app store rating
- 80% daily active usage rate
`,
        contentType: 'text/plain'
      }
    ];

    const enhancedPrompt = "Create a comprehensive restaurant inventory management system that helps reduce food waste and improves profitability";
    
    console.log('User Prompt:', enhancedPrompt);
    console.log('Document Context: 2 files (features + constraints)');
    console.log('\nProcessing with document context...');
    
    const enhancedResult = await agentic.comprehensiveAnalysisWithPrompt(enhancedPrompt, sampleDocuments);
    
    console.log('\n📊 Enhanced Results:');
    console.log(`   Title: ${enhancedResult.processedPrompt.title}`);
    console.log(`   Domain: ${enhancedResult.processedPrompt.domain}`);
    console.log(`   Confidence: ${enhancedResult.processedPrompt.confidenceScore}% (boosted by context)`);
    console.log(`   Overall Score: ${enhancedResult.summary.overallScore}/100`);
    
    console.log('\n🎯 Personalization Impact:');
    console.log(`   Is Personalized: ${enhancedResult.personalization.isPersonalized ? 'Yes' : 'No'}`);
    console.log(`   Context Influence: ${enhancedResult.personalization.contextInfluence}`);
    console.log(`   Domain Expertise: ${enhancedResult.personalization.domainExpertise}`);
    
    if (enhancedResult.documentContext) {
      console.log('\n📄 Document Context Used:');
      console.log(`   Documents: ${enhancedResult.documentContext.documentsUsed}`);
      console.log(`   Context Types: ${enhancedResult.documentContext.contextTypes.join(', ')}`);
      console.log(`   Relevant Features: ${enhancedResult.documentContext.relevantFeatures.slice(0, 3).join(', ')}`);
    }

    console.log('\n💡 Contextual Recommendations:');
    enhancedResult.contextualRecommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`   ${i + 1}. [${rec.category.toUpperCase()}] ${rec.title}`);
      console.log(`      ${rec.description}`);
      console.log(`      Confidence: ${(rec.confidence * 100).toFixed(0)}%`);
    });

    // Demo 3: Session management
    console.log('\n3️⃣  Document Session Management');
    console.log('-'.repeat(40));
    
    const sessionId = agentic.createDocumentSession();
    console.log(`Created session: ${sessionId}`);
    
    // Add documents to session
    for (const doc of sampleDocuments) {
      const docId = await agentic.addDocumentToSession(sessionId, doc.filename, doc.content, doc.contentType);
      console.log(`Added document: ${doc.filename} (${docId})`);
    }
    
    const sessionDocs = agentic.getSessionDocuments(sessionId);
    console.log(`Session contains ${sessionDocs.length} documents`);
    
    // Demo 4: Performance comparison
    console.log('\n4️⃣  Performance Comparison');
    console.log('-'.repeat(40));
    
    console.log('Comparing standard vs enhanced analysis...');
    
    const standardStart = Date.now();
    const standardResult = await agentic.quickAnalysis({
      title: 'Restaurant Inventory App',
      description: 'Mobile app for restaurant inventory management',
      targetMarket: 'Restaurant owners',
      keyFeatures: ['Inventory tracking', 'Waste reduction']
    });
    const standardTime = Date.now() - standardStart;
    
    const enhancedStart = Date.now();
    const quickEnhancedResult = await agentic.quickAnalysisWithPrompt(
      "Restaurant inventory management app to reduce waste",
      [sampleDocuments[0]] // Just one document for speed
    );
    const enhancedTime = Date.now() - enhancedStart;
    
    console.log('\n⚡ Performance Results:');
    console.log(`   Standard Analysis: ${standardTime}ms, Score: ${standardResult.summary.overallScore}`);
    console.log(`   Enhanced Analysis: ${enhancedTime}ms, Score: ${quickEnhancedResult.summary.overallScore}`);
    console.log(`   Quality Improvement: +${quickEnhancedResult.summary.overallScore - standardResult.summary.overallScore} points`);
    console.log(`   Time Overhead: +${enhancedTime - standardTime}ms for context processing`);

    // Demo 5: System health
    console.log('\n5️⃣  System Health Check');
    console.log('-'.repeat(40));
    
    const health = await agentic.getSystemHealth();
    console.log(`   Overall Status: ${health.overall.toUpperCase()}`);
    console.log(`   Components: ${Object.keys(health.components).join(', ')}`);
    
    // Cleanup
    console.log('\n🧹 Cleanup');
    console.log('-'.repeat(40));
    
    const cleared = agentic.clearDocumentSession(sessionId);
    console.log(`Session cleared: ${cleared}`);
    
    console.log('\n✅ Enhanced Demo completed successfully!');
    console.log('\n🌟 Key Improvements Demonstrated:');
    console.log('• Natural language prompt understanding');
    console.log('• Document context integration for personalization');
    console.log('• Session-based document management');
    console.log('• Enhanced recommendations based on existing docs');
    console.log('• Improved quality scores through context');

  } catch (error) {
    console.error('\n❌ Demo failed:', error);
  } finally {
    await agentic.shutdown();
  }
}

// Export for use in other demos
export { runEnhancedPromptDemo };

// Run if executed directly
if (require.main === module) {
  runEnhancedPromptDemo().catch(console.error);
}