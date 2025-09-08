# Agentic PM - AI-Powered Product Management Framework

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## Overview

Agentic PM is an innovative AI-powered framework that revolutionizes product management by leveraging multiple specialized AI agents to automate and enhance the product development lifecycle. From market research to prototype generation, this framework provides a comprehensive suite of tools for modern product managers.

## 🚀 Features

### Core Capabilities
- **AI-Driven Market Research**: Automated competitive analysis and market insights
- **Intelligent PRD Generation**: Create comprehensive Product Requirements Documents
- **Automated PRFAQ Creation**: Generate Amazon-style PR/FAQ documents
- **Prototype Generation**: Quick MVP and prototype creation
- **Multi-Model AI Support**: Seamless integration with OpenAI and Claude APIs
- **Extensible Agent Architecture**: Easy to add new specialized agents

### Key Agents
1. **MarketResearchAgent**: Analyzes market trends and competitive landscape
2. **CompetitiveLandscapeAgent**: Deep-dive competitive analysis
3. **DocumentPackageAgent**: Generates comprehensive product documentation
4. **PrototypeGeneratorAgent**: Creates working prototypes and MVPs
5. **EvaluationAgent**: Assesses product viability and success metrics
6. **AgenticPMOrchestrator**: Coordinates all agents for optimal results

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- OpenAI API key
- Anthropic (Claude) API key

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kamalsrini17/Agentic-PM.git
   cd Agentic-PM
   ```

2. **Install dependencies**
   ```bash
   cd mcp-client-ai
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `mcp-client-ai` directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

## 🚀 Quick Start

### Basic Usage

```typescript
import { AgenticPMClient } from './src/agenticClient';

// Initialize the client
const client = new AgenticPMClient({
  openAIApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY
});

// Generate a comprehensive product package
const productPackage = await client.generateFullProductPackage({
  productName: "AI-Powered Task Manager",
  targetAudience: "Remote teams and freelancers",
  problemStatement: "Managing tasks across distributed teams is challenging",
  proposedSolution: "An intelligent task management system with AI prioritization"
});

console.log(productPackage);
```

### Running the Demo

```bash
cd mcp-client-ai
npm run demo
```

Or try other available demos:
```bash
npm run demo:enhanced  # Enhanced demo with prompt processing
npm run demo:simple    # Simple demo
npm run example        # Generic product example
npm run test-api       # Test API connectivity
```


## 📁 Project Structure

```
Agentic-PM/
├── mcp-client-ai/              # Main client application
│   ├── src/
│   │   ├── agents/            # AI agent implementations
│   │   ├── services/          # Core services (AI, API)
│   │   ├── utils/             # Utility functions
│   │   ├── validation/        # Input validation schemas
│   │   ├── orchestration/     # Workflow orchestration
│   │   ├── metrics/           # Performance monitoring
│   │   ├── evaluation/        # AI model evaluation
│   │   ├── integration/       # System integration
│   │   └── demo/              # Demo applications
│   ├── package.json
│   └── tsconfig.json
├── LICENSE                     # MIT License
└── README.md                   # This file
```

## 🔧 Configuration

### AI Model Configuration

The framework supports multiple AI models. Configure them in your client initialization:

```typescript
const client = new AgenticPMClient({
  openAIApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  defaultModel: 'gpt-4', // or 'claude-3-opus'
  temperature: 0.7,
  maxTokens: 4000
});
```

### Agent Configuration

Each agent can be configured individually:

```typescript
const marketResearchAgent = new MarketResearchAgent({
  depth: 'comprehensive', // 'basic' | 'comprehensive' | 'exhaustive'
  sources: ['web', 'academic', 'industry-reports'],
  aiModel: 'gpt-4'
});
```

## 📚 API Documentation

### Core Methods

#### `generateFullProductPackage(input: ProductInput): Promise<ProductPackage>`
Generates a complete product package including PRD, PRFAQ, and market analysis.

#### `generatePRD(input: PRDInput): Promise<PRDocument>`
Creates a detailed Product Requirements Document.

#### `generatePRFAQ(input: PRFAQInput): Promise<PRFAQDocument>`
Generates an Amazon-style PR/FAQ document.

#### `analyzeMarket(input: MarketInput): Promise<MarketAnalysis>`
Performs comprehensive market research and competitive analysis.

#### `generatePrototype(input: PrototypeInput): Promise<Prototype>`
Creates a working prototype or MVP specification.

## 🧪 Testing

Run the test suite:

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=kamalsrini17/Agentic-PM&type=Date)](https://star-history.com/#kamalsrini17/Agentic-PM&Date)

---

Built with ❤️ by the Agentic PM Team
