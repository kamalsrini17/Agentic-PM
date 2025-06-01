import { MCPClientAgent } from './agenticClient';
import readline from 'readline';
import { savePrdAsPdf } from './utils/savePrdAsPdf';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function run() {
  const agent = new MCPClientAgent('http://localhost:3000');

  const concept = {
    title: 'Smart Fitness Tracker',
    description: 'An AI-powered fitness app that personalizes workouts and nutrition based on wearable data.',
    goals: [
      'Track vitals from smartwatches',
      'Generate daily workout suggestions',
      'Provide personalized nutrition tips',
      'Visualize progress via dashboard'
    ],
    targetMarket: 'Fitness enthusiasts and athletes',
    timeline: 'Q4 2025'
  };

  const pkg = await agent.runWorkflow(concept);
  const initialPrd = pkg.prd;
  savePrdAsPdf(initialPrd, 'prd-v1.pdf');
  console.log('✅ Saved PRD to prd-v1.pdf');

  rl.question('\n💬 Would you like to suggest enhancements for the PRD? (y/n): ', async (answer) => {
    if (answer.trim().toLowerCase() === 'y') {
      rl.question('📝 Describe the enhancement (e.g., add social features): ', async (feedback) => {
        const updatedPrd = await agent.regeneratePrdWithFeedback(concept, feedback);
        savePrdAsPdf(updatedPrd, 'prd-v2.pdf');
        console.log('✅ Updated PRD saved to prd-v2.pdf');
        rl.close();
      });
    } else {
      rl.close();
    }
  });
}

run();


//const agent = new MCPClientAgent('http://localhost:3000');

//agent.runWorkflow({
//  title: 'Smart Fitness Tracker',
//  description: 'An AI-powered fitness app that personalizes workouts and nutrition based on wearable data.',
//  goals: [
//    'Track vitals from smartwatches',
//    'Generate daily workout suggestions',
 //   'Provide personalized nutrition tips',
 //   'Visualize progress via dashboard'
//  ],
//  targetMarket: 'Fitness enthusiasts and athletes',
//  timeline: 'Q4 2025'
//}).then(pkg => {
//  console.log('✅ Executive Summary:\n', pkg.executiveSummary);
//  console.log('\n📄 PRD:\n', pkg.prd);
//});