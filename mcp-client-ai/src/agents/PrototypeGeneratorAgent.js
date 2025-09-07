"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrototypeGeneratorAgent = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class PrototypeGeneratorAgent {
    constructor(openai, outputDir = './prototypes') {
        this.openai = openai;
        this.outputDir = outputDir;
    }
    generatePrototype(requirements) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[PrototypeGeneratorAgent] Generating ${requirements.platform} prototype for: ${requirements.productTitle}`);
            // Generate prototype components in parallel
            const [userFlows, componentSpecs, designSystem, codeGeneration] = yield Promise.all([
                this.generateUserFlows(requirements),
                this.generateComponentSpecs(requirements),
                this.generateDesignSystem(requirements),
                this.generateCodeFiles(requirements)
            ]);
            // Create project structure
            const projectStructure = this.createProjectStructure(requirements.platform);
            // Generate testing scenarios
            const testingScenarios = yield this.generateTestingScenarios(requirements, userFlows);
            // Create deployment instructions
            const deploymentInstructions = this.generateDeploymentInstructions(requirements.platform);
            const prototype = {
                projectStructure,
                components: componentSpecs,
                userFlows,
                designSystem,
                codeFiles: codeGeneration,
                deploymentInstructions,
                testingScenarios
            };
            // Write prototype files to disk
            yield this.writePrototypeFiles(prototype, requirements);
            return prototype;
        });
    }
    generateUserFlows(requirements) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.4,
                max_tokens: 3000
            });
            return this.parseJsonResponse(response.choices[0].message.content || '[]');
        });
    }
    generateComponentSpecs(requirements) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 3500
            });
            return this.parseJsonResponse(response.choices[0].message.content || '[]');
        });
    }
    generateDesignSystem(requirements) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 2500
            });
            return this.parseJsonResponse(response.choices[0].message.content || '{}');
        });
    }
    generateCodeFiles(requirements) {
        return __awaiter(this, void 0, void 0, function* () {
            const codeFiles = {};
            if (requirements.platform === 'web') {
                // Generate React/Next.js components
                codeFiles['package.json'] = yield this.generatePackageJson(requirements);
                codeFiles['pages/index.tsx'] = yield this.generateLandingPage(requirements);
                codeFiles['pages/dashboard.tsx'] = yield this.generateDashboardPage(requirements);
                codeFiles['components/Layout.tsx'] = yield this.generateLayoutComponent(requirements);
                codeFiles['components/Navigation.tsx'] = yield this.generateNavigationComponent(requirements);
                codeFiles['styles/globals.css'] = yield this.generateGlobalStyles(requirements);
                codeFiles['tailwind.config.js'] = yield this.generateTailwindConfig(requirements);
                codeFiles['next.config.js'] = yield this.generateNextConfig(requirements);
                codeFiles['README.md'] = yield this.generateReadme(requirements);
                // Generate feature-specific components
                for (const feature of requirements.keyFeatures.slice(0, 3)) {
                    const componentName = this.featureToComponentName(feature);
                    codeFiles[`components/${componentName}.tsx`] = yield this.generateFeatureComponent(feature, requirements);
                }
            }
            return codeFiles;
        });
    }
    generatePackageJson(requirements) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    generateLandingPage(requirements) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 3000
            });
            return response.choices[0].message.content || '';
        });
    }
    generateDashboardPage(requirements) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 3500
            });
            return response.choices[0].message.content || '';
        });
    }
    generateFeatureComponent(feature, requirements) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.4,
                max_tokens: 2500
            });
            return response.choices[0].message.content || '';
        });
    }
    generateTestingScenarios(requirements, userFlows) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 2000
            });
            return this.parseJsonResponse(response.choices[0].message.content || '[]');
        });
    }
    createProjectStructure(platform) {
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
    generateDeploymentInstructions(platform) {
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
    writePrototypeFiles(prototype, requirements) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    // Helper methods
    parseJsonResponse(content) {
        try {
            const jsonMatch = content.match(/```json\s*({[\s\S]*?}|\[[\s\S]*?\])\s*```/) ||
                content.match(/```\s*({[\s\S]*?}|\[[\s\S]*?\])\s*```/);
            const jsonString = jsonMatch ? jsonMatch[1] : content;
            return JSON.parse(jsonString);
        }
        catch (error) {
            console.error('[PrototypeGeneratorAgent] Failed to parse JSON response:', error);
            return content.includes('[') ? [] : {};
        }
    }
    featureToComponentName(feature) {
        return feature
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }
    generateLayoutComponent(requirements) {
        return __awaiter(this, void 0, void 0, function* () {
            return `// Layout component would be generated here based on requirements`;
        });
    }
    generateNavigationComponent(requirements) {
        return __awaiter(this, void 0, void 0, function* () {
            return `// Navigation component would be generated here based on requirements`;
        });
    }
    generateGlobalStyles(requirements) {
        return __awaiter(this, void 0, void 0, function* () {
            return `/* Global styles would be generated here based on design system */`;
        });
    }
    generateTailwindConfig(requirements) {
        return __awaiter(this, void 0, void 0, function* () {
            return `// Tailwind config would be generated here based on design system`;
        });
    }
    generateNextConfig(requirements) {
        return __awaiter(this, void 0, void 0, function* () {
            return `// Next.js config would be generated here`;
        });
    }
    generateReadme(requirements) {
        return __awaiter(this, void 0, void 0, function* () {
            return `# ${requirements.productTitle} Prototype\n\nGenerated prototype for ${requirements.productDescription}`;
        });
    }
}
exports.PrototypeGeneratorAgent = PrototypeGeneratorAgent;
