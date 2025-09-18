import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';

interface PrototypeRequirements {
  productTitle: string;
  productDescription: string;
  targetUsers: string[];
  keyFeatures: string[];
  platform: 'web' | 'mobile' | 'desktop';
  designStyle: 'minimal' | 'modern' | 'professional' | 'playful';
  colorScheme?: string;
  brandGuidelines?: string;
}

interface UserFlow {
  name: string;
  description: string;
  steps: Array<{
    stepNumber: number;
    action: string;
    screen: string;
    userIntent: string;
    successCriteria: string;
  }>;
  entryPoints: string[];
  exitPoints: string[];
}

interface ComponentSpec {
  name: string;
  type: 'page' | 'component' | 'layout';
  description: string;
  props?: Record<string, any>;
  children?: string[];
  interactions: string[];
  responsiveBreakpoints?: string[];
}

interface PrototypeOutput {
  projectStructure: Record<string, any>;
  components: ComponentSpec[];
  userFlows: UserFlow[];
  designSystem: {
    colors: Record<string, string>;
    typography: Record<string, any>;
    spacing: Record<string, string>;
    components: Record<string, any>;
  };
  codeFiles: Record<string, string>;
  deploymentInstructions: string;
  testingScenarios: Array<{
    scenario: string;
    steps: string[];
    expectedOutcome: string;
  }>;
}

export class PrototypeGeneratorAgent {
  private openai: OpenAI;
  private outputDir: string;

  constructor(openai: OpenAI, outputDir: string = './prototypes') {
    this.openai = openai;
    this.outputDir = outputDir;
  }

  async generatePrototype(requirements: PrototypeRequirements): Promise<PrototypeOutput> {
    console.log(`[PrototypeGeneratorAgent] Generating ${requirements.platform} prototype for: ${requirements.productTitle}`);

    // Generate prototype components in parallel
    const [
      userFlows,
      componentSpecs,
      designSystem,
      codeGeneration
    ] = await Promise.all([
      this.generateUserFlows(requirements),
      this.generateComponentSpecs(requirements),
      this.generateDesignSystem(requirements),
      this.generateCodeFiles(requirements)
    ]);

    // Create project structure
    const projectStructure = this.createProjectStructure(requirements.platform);
    
    // Generate testing scenarios
    const testingScenarios = await this.generateTestingScenarios(requirements, userFlows);

    // Create deployment instructions
    const deploymentInstructions = this.generateDeploymentInstructions(requirements.platform);

    const prototype: PrototypeOutput = {
      projectStructure,
      components: componentSpecs,
      userFlows,
      designSystem,
      codeFiles: codeGeneration,
      deploymentInstructions,
      testingScenarios
    };

    // Write prototype files to disk
    await this.writePrototypeFiles(prototype, requirements);

    return prototype;
  }

  private async generateUserFlows(requirements: PrototypeRequirements): Promise<UserFlow[]> {
    const prompt = `
As a UX designer, create comprehensive user flows for:

Product: ${requirements.productTitle}
Description: ${requirements.productDescription}
Target Users: ${requirements.targetUsers.join(', ')}
Key Features: ${requirements.keyFeatures.join(', ')}
Platform: ${requirements.platform}

Generate 3-5 critical user flows that cover:
1. User onboarding and first-time experience
2. Core feature usage flows
3. Advanced feature discovery
4. User engagement and retention flows

For each flow, define:
- Flow name and description
- Step-by-step user actions
- Screen/page for each step
- User intent and motivation
- Success criteria
- Entry and exit points

Focus on flows that demonstrate product value quickly and drive user engagement.

Format as JSON array of user flow objects.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 3000
    });

    return this.parseJsonResponse(response.choices[0].message.content || '[]');
  }

  private async generateComponentSpecs(requirements: PrototypeRequirements): Promise<ComponentSpec[]> {
    const prompt = `
As a frontend architect, design component specifications for:

Product: ${requirements.productTitle}
Description: ${requirements.productDescription}
Key Features: ${requirements.keyFeatures.join(', ')}
Platform: ${requirements.platform}
Design Style: ${requirements.designStyle}

Create comprehensive component specifications including:

1. Layout Components (Header, Navigation, Footer, Sidebar)
2. Page Components (Landing, Dashboard, Profile, Settings)
3. Feature Components (specific to key features)
4. UI Components (Buttons, Forms, Cards, Modals)
5. Data Components (Charts, Tables, Lists)

For each component, specify:
- Component name and type
- Description and purpose
- Props and configuration options
- Child components
- User interactions
- Responsive behavior

Design for ${requirements.platform} platform with ${requirements.designStyle} aesthetic.

Format as JSON array of component specifications.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 3500
    });

    return this.parseJsonResponse(response.choices[0].message.content || '[]');
  }

  private async generateDesignSystem(requirements: PrototypeRequirements): Promise<any> {
    const prompt = `
As a design systems expert, create a comprehensive design system for:

Product: ${requirements.productTitle}
Design Style: ${requirements.designStyle}
Color Scheme: ${requirements.colorScheme || 'modern and accessible'}
Brand Guidelines: ${requirements.brandGuidelines || 'professional and trustworthy'}

Create a design system including:

1. Color Palette
   - Primary, secondary, and accent colors
   - Neutral colors (grays, whites, blacks)
   - Semantic colors (success, warning, error, info)
   - Color accessibility compliance

2. Typography
   - Font families for headings and body text
   - Font sizes and line heights
   - Font weights and styles
   - Responsive typography scales

3. Spacing System
   - Base spacing unit
   - Spacing scale (margin, padding)
   - Layout grid system

4. Component Styles
   - Button variants and states
   - Form input styles
   - Card and container styles
   - Navigation elements

Ensure the design system is modern, accessible, and aligns with ${requirements.designStyle} aesthetic.

Format as comprehensive JSON design system object.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2500
    });

    return this.parseJsonResponse(response.choices[0].message.content || '{}');
  }

  private async generateCodeFiles(requirements: PrototypeRequirements): Promise<Record<string, string>> {
    const codeFiles: Record<string, string> = {};

    if (requirements.platform === 'web') {
      // Generate React/Next.js components
      codeFiles['package.json'] = await this.generatePackageJson(requirements);
      codeFiles['pages/index.tsx'] = await this.generateLandingPage(requirements);
      codeFiles['pages/dashboard.tsx'] = await this.generateDashboardPage(requirements);
      codeFiles['components/Layout.tsx'] = await this.generateLayoutComponent(requirements);
      codeFiles['components/Navigation.tsx'] = await this.generateNavigationComponent(requirements);
      codeFiles['styles/globals.css'] = await this.generateGlobalStyles(requirements);
      codeFiles['tailwind.config.js'] = await this.generateTailwindConfig(requirements);
      codeFiles['next.config.js'] = await this.generateNextConfig(requirements);
      codeFiles['README.md'] = await this.generateReadme(requirements);

      // Generate feature-specific components
      for (const feature of requirements.keyFeatures.slice(0, 3)) {
        const componentName = this.featureToComponentName(feature);
        codeFiles[`components/${componentName}.tsx`] = await this.generateFeatureComponent(feature, requirements);
      }
    }

    return codeFiles;
  }

  private async generatePackageJson(requirements: PrototypeRequirements): Promise<string> {
    const packageJson = {
      name: requirements.productTitle.toLowerCase().replace(/\s+/g, '-'),
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: {
        'next': '^14.0.0',
        'react': '^18.0.0',
        'react-dom': '^18.0.0',
        '@types/node': '^20.0.0',
        '@types/react': '^18.0.0',
        '@types/react-dom': '^18.0.0',
        'typescript': '^5.0.0',
        'tailwindcss': '^3.3.0',
        'autoprefixer': '^10.4.16',
        'postcss': '^8.4.31',
        'lucide-react': '^0.292.0',
        'framer-motion': '^10.16.5'
      },
      devDependencies: {
        'eslint': '^8.0.0',
        'eslint-config-next': '^14.0.0'
      }
    };

    return JSON.stringify(packageJson, null, 2);
  }

  private async generateLandingPage(requirements: PrototypeRequirements): Promise<string> {
    const prompt = `
Generate a modern, responsive React/Next.js landing page component for:

Product: ${requirements.productTitle}
Description: ${requirements.productDescription}
Key Features: ${requirements.keyFeatures.join(', ')}
Design Style: ${requirements.designStyle}

Create a landing page with:
1. Hero section with compelling headline and CTA
2. Key features showcase
3. Social proof or testimonials section
4. Clear call-to-action sections
5. Modern, responsive design using Tailwind CSS
6. Proper TypeScript typing

Use modern React patterns, Tailwind CSS for styling, and include proper accessibility features.
The page should be conversion-optimized and visually appealing.

Return only the complete TypeScript React component code.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 3000
    });

    return response.choices[0].message.content || '';
  }

  private async generateDashboardPage(requirements: PrototypeRequirements): Promise<string> {
    const prompt = `
Generate a comprehensive dashboard page component for:

Product: ${requirements.productTitle}
Key Features: ${requirements.keyFeatures.join(', ')}
Target Users: ${requirements.targetUsers.join(', ')}

Create a dashboard that includes:
1. Navigation sidebar or header
2. Key metrics and KPI cards
3. Data visualization components (charts, graphs)
4. Recent activity feed
5. Quick action buttons
6. User profile section
7. Responsive design for mobile and desktop

Use React/Next.js with TypeScript, Tailwind CSS, and include:
- Proper component structure
- State management for dashboard data
- Loading states and error handling
- Accessibility features

Return only the complete TypeScript React component code.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 3500
    });

    return response.choices[0].message.content || '';
  }

  private async generateFeatureComponent(feature: string, requirements: PrototypeRequirements): Promise<string> {
    const prompt = `
Generate a React component for the feature: "${feature}"

Product Context: ${requirements.productTitle}
Target Users: ${requirements.targetUsers.join(', ')}
Design Style: ${requirements.designStyle}

Create a fully functional component that:
1. Implements the core functionality of this feature
2. Has an intuitive, user-friendly interface
3. Includes proper form handling and validation
4. Has loading states and error handling
5. Uses Tailwind CSS for styling
6. Includes TypeScript types
7. Has proper accessibility features

The component should be production-ready and demonstrate the feature's value clearly.

Return only the complete TypeScript React component code.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 2500
    });

    return response.choices[0].message.content || '';
  }

  private async generateTestingScenarios(
    requirements: PrototypeRequirements, 
    userFlows: UserFlow[]
  ): Promise<Array<{scenario: string; steps: string[]; expectedOutcome: string}>> {
    const prompt = `
As a QA engineer, create comprehensive testing scenarios for:

Product: ${requirements.productTitle}
User Flows: ${JSON.stringify(userFlows, null, 2)}
Key Features: ${requirements.keyFeatures.join(', ')}

Generate testing scenarios covering:
1. Happy path user journeys
2. Edge cases and error conditions
3. Responsive design testing
4. Accessibility testing
5. Performance testing scenarios
6. Cross-browser compatibility

For each scenario, provide:
- Scenario description
- Step-by-step testing instructions
- Expected outcomes and success criteria

Format as JSON array of testing scenario objects.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    });

    return this.parseJsonResponse(response.choices[0].message.content || '[]');
  }

  private createProjectStructure(platform: string): Record<string, any> {
    if (platform === 'web') {
      return {
        'pages/': {
          'index.tsx': 'Landing page',
          'dashboard.tsx': 'Main dashboard',
          '_app.tsx': 'App wrapper',
          '_document.tsx': 'Document structure'
        },
        'components/': {
          'Layout.tsx': 'Main layout component',
          'Navigation.tsx': 'Navigation component',
          'ui/': 'Reusable UI components'
        },
        'styles/': {
          'globals.css': 'Global styles',
          'components.css': 'Component-specific styles'
        },
        'lib/': {
          'utils.ts': 'Utility functions',
          'api.ts': 'API functions'
        },
        'public/': {
          'images/': 'Static images',
          'icons/': 'Icon assets'
        },
        'types/': {
          'index.ts': 'TypeScript type definitions'
        }
      };
    }

    return {};
  }

  private generateDeploymentInstructions(platform: string): string {
    if (platform === 'web') {
      return `
# Deployment Instructions

## Development Setup
1. Install dependencies: \`npm install\`
2. Run development server: \`npm run dev\`
3. Open http://localhost:3000

## Production Deployment

### Vercel (Recommended)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Deploy automatically on push

### Manual Build
1. Build the application: \`npm run build\`
2. Start production server: \`npm run start\`

### Environment Variables
- Set up any required API keys
- Configure database connections
- Set production URLs

## Testing
1. Run linting: \`npm run lint\`
2. Test responsive design on multiple devices
3. Verify accessibility compliance
4. Test all user flows manually

## Performance Optimization
- Enable image optimization
- Configure CDN for static assets
- Set up monitoring and analytics
- Implement error tracking
      `;
    }

    return 'Platform-specific deployment instructions would go here.';
  }

  private async writePrototypeFiles(prototype: PrototypeOutput, requirements: PrototypeRequirements): Promise<void> {
    const projectDir = path.join(this.outputDir, requirements.productTitle.toLowerCase().replace(/\s+/g, '-'));
    
    // Create project directory
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    // Write all code files
    for (const [filePath, content] of Object.entries(prototype.codeFiles)) {
      const fullPath = path.join(projectDir, filePath);
      const dir = path.dirname(fullPath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(fullPath, content, 'utf8');
    }

    // Write prototype metadata
    const metadataPath = path.join(projectDir, 'prototype-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify({
      requirements,
      userFlows: prototype.userFlows,
      components: prototype.components,
      designSystem: prototype.designSystem,
      testingScenarios: prototype.testingScenarios
    }, null, 2), 'utf8');

    console.log(`[PrototypeGeneratorAgent] Prototype files written to: ${projectDir}`);
  }

  // Helper methods
  private parseJsonResponse(content: string): any {
    try {
      const jsonMatch = content.match(/```json\s*({[\s\S]*?}|\[[\s\S]*?\])\s*```/) ||
                       content.match(/```\s*({[\s\S]*?}|\[[\s\S]*?\])\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('[PrototypeGeneratorAgent] Failed to parse JSON response:', error);
      return content.includes('[') ? [] : {};
    }
  }

  private featureToComponentName(feature: string): string {
    return feature
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  private async generateLayoutComponent(requirements: PrototypeRequirements): Promise<string> {
    return `// Layout component would be generated here based on requirements`;
  }

  private async generateNavigationComponent(requirements: PrototypeRequirements): Promise<string> {
    return `// Navigation component would be generated here based on requirements`;
  }

  private async generateGlobalStyles(requirements: PrototypeRequirements): Promise<string> {
    return `/* Global styles would be generated here based on design system */`;
  }

  private async generateTailwindConfig(requirements: PrototypeRequirements): Promise<string> {
    return `// Tailwind config would be generated here based on design system`;
  }

  private async generateNextConfig(requirements: PrototypeRequirements): Promise<string> {
    return `// Next.js config would be generated here`;
  }

  private async generateReadme(requirements: PrototypeRequirements): Promise<string> {
    return `# ${requirements.productTitle} Prototype\n\nGenerated prototype for ${requirements.productDescription}`;
  }
}