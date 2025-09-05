import { OpenAI } from 'openai';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

interface ProductAnalysisPackage {
  executiveSummary: string;
  productRequirementsDocument: any;
  marketResearchReport: any;
  competitiveLandscapeAnalysis: any;
  prototypeSpecifications: any;
  businessCase: any;
  implementationRoadmap: any;
  riskAssessment: any;
  successMetrics: any;
}

interface DocumentTemplate {
  name: string;
  description: string;
  sections: Array<{
    title: string;
    content: string;
    order: number;
    required: boolean;
  }>;
  formatting: {
    headerStyle: any;
    bodyStyle: any;
    colorScheme: any;
  };
}

interface ExportOptions {
  format: 'pdf' | 'markdown' | 'notion' | 'confluence' | 'powerpoint';
  template: 'executive' | 'technical' | 'investor' | 'team';
  branding?: {
    logo?: string;
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
  };
  sections?: string[]; // Optional section filtering
}

interface SharingOptions {
  visibility: 'private' | 'team' | 'organization' | 'public';
  permissions: {
    canView: boolean;
    canComment: boolean;
    canEdit: boolean;
    canShare: boolean;
  };
  expirationDate?: Date;
  accessCode?: string;
}

export class DocumentPackageAgent {
  private openai: OpenAI;
  private outputDir: string;

  constructor(openai: OpenAI, outputDir: string = './documents') {
    this.openai = openai;
    this.outputDir = outputDir;
  }

  async createComprehensivePackage(
    productTitle: string,
    analysisData: {
      prd: any;
      marketResearch: any;
      competitiveLandscape: any;
      prototype: any;
    },
    exportOptions: ExportOptions
  ): Promise<ProductAnalysisPackage> {
    
    console.log(`[DocumentPackageAgent] Creating comprehensive package for: ${productTitle}`);

    // Generate all package components in parallel
    const [
      executiveSummary,
      businessCase,
      implementationRoadmap,
      riskAssessment,
      successMetrics
    ] = await Promise.all([
      this.generateExecutiveSummary(productTitle, analysisData),
      this.generateBusinessCase(productTitle, analysisData),
      this.generateImplementationRoadmap(productTitle, analysisData),
      this.generateRiskAssessment(productTitle, analysisData),
      this.generateSuccessMetrics(productTitle, analysisData)
    ]);

    const packageData: ProductAnalysisPackage = {
      executiveSummary,
      productRequirementsDocument: analysisData.prd,
      marketResearchReport: analysisData.marketResearch,
      competitiveLandscapeAnalysis: analysisData.competitiveLandscape,
      prototypeSpecifications: analysisData.prototype,
      businessCase,
      implementationRoadmap,
      riskAssessment,
      successMetrics
    };

    // Export in requested format
    const exportedDocument = await this.exportPackage(packageData, productTitle, exportOptions);

    return packageData;
  }

  private async generateExecutiveSummary(
    productTitle: string,
    analysisData: any
  ): Promise<string> {
    const prompt = `
As a senior executive consultant, create a compelling executive summary for:

Product: ${productTitle}
PRD: ${JSON.stringify(analysisData.prd).substring(0, 1000)}
Market Research: ${JSON.stringify(analysisData.marketResearch).substring(0, 1000)}
Competitive Analysis: ${JSON.stringify(analysisData.competitiveLandscape).substring(0, 1000)}

Create a 2-page executive summary that includes:

1. **Product Vision & Opportunity** (3-4 sentences)
   - Clear value proposition
   - Market opportunity size
   - Unique differentiation

2. **Strategic Rationale** (1 paragraph)
   - Why this product, why now
   - Market trends and timing
   - Competitive advantage

3. **Business Impact** (bullet points)
   - Revenue potential
   - Market share opportunity
   - Strategic value

4. **Implementation Overview** (1 paragraph)
   - High-level approach
   - Timeline and milestones
   - Resource requirements

5. **Success Metrics** (3-5 key metrics)
   - Leading indicators
   - Business outcomes
   - Market validation

6. **Recommendation** (2-3 sentences)
   - Clear go/no-go recommendation
   - Next steps
   - Decision timeline

Write for C-level executives who need to make investment decisions quickly.
Use data-driven insights and avoid jargon.

Format as polished executive summary text.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    });

    return response.choices[0].message.content || '';
  }

  private async generateBusinessCase(
    productTitle: string,
    analysisData: any
  ): Promise<any> {
    const prompt = `
As a business strategy consultant, create a comprehensive business case for:

Product: ${productTitle}
Market Data: ${JSON.stringify(analysisData.marketResearch).substring(0, 800)}
Competitive Data: ${JSON.stringify(analysisData.competitiveLandscape).substring(0, 800)}

Generate a detailed business case including:

1. **Market Opportunity**
   - TAM, SAM, SOM analysis
   - Market growth projections
   - Customer segments and sizing

2. **Financial Projections** (3-year)
   - Revenue projections by year
   - Cost structure and margins
   - Break-even analysis
   - ROI and payback period

3. **Competitive Positioning**
   - Market positioning strategy
   - Differentiation factors
   - Competitive response scenarios

4. **Go-to-Market Strategy**
   - Customer acquisition strategy
   - Pricing strategy
   - Distribution channels
   - Launch timeline

5. **Resource Requirements**
   - Team structure and hiring plan
   - Technology and infrastructure needs
   - Marketing and sales investment
   - Total investment required

6. **Risk Analysis**
   - Key risks and mitigation strategies
   - Scenario planning (best/base/worst case)
   - Success factors and dependencies

Format as comprehensive JSON business case structure.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 3000
    });

    return this.parseJsonResponse(response.choices[0].message.content || '{}');
  }

  private async generateImplementationRoadmap(
    productTitle: string,
    analysisData: any
  ): Promise<any> {
    const prompt = `
As a program manager, create a detailed implementation roadmap for:

Product: ${productTitle}
PRD Requirements: ${JSON.stringify(analysisData.prd).substring(0, 1000)}
Prototype Specs: ${JSON.stringify(analysisData.prototype).substring(0, 500)}

Create a comprehensive 12-month roadmap including:

1. **Phase Breakdown** (3-4 phases)
   - Phase objectives and deliverables
   - Duration and dependencies
   - Success criteria

2. **Sprint Planning** (2-week sprints)
   - Feature development priorities
   - User story mapping
   - Technical milestones

3. **Resource Allocation**
   - Team composition by phase
   - Skill requirements
   - External dependencies

4. **Risk Mitigation Timeline**
   - Critical path identification
   - Risk monitoring checkpoints
   - Contingency planning

5. **Launch Strategy**
   - Beta testing phases
   - Go-to-market timeline
   - Success metrics tracking

6. **Post-Launch Evolution**
   - Feature enhancement roadmap
   - Market expansion plans
   - Platform evolution

Format as detailed JSON roadmap with timeline, milestones, and dependencies.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2500
    });

    return this.parseJsonResponse(response.choices[0].message.content || '{}');
  }

  private async generateRiskAssessment(
    productTitle: string,
    analysisData: any
  ): Promise<any> {
    const prompt = `
As a risk management consultant, create a comprehensive risk assessment for:

Product: ${productTitle}
Market Analysis: ${JSON.stringify(analysisData.marketResearch).substring(0, 800)}
Competitive Analysis: ${JSON.stringify(analysisData.competitiveLandscape).substring(0, 800)}

Analyze risks across all dimensions:

1. **Market Risks**
   - Demand validation risks
   - Market timing risks
   - Customer adoption risks
   - Market saturation risks

2. **Competitive Risks**
   - New entrant threats
   - Competitive response risks
   - Technology disruption risks
   - Patent/IP risks

3. **Execution Risks**
   - Technical development risks
   - Team and talent risks
   - Resource allocation risks
   - Timeline and scope risks

4. **Business Model Risks**
   - Revenue model validation
   - Pricing strategy risks
   - Unit economics risks
   - Scalability risks

5. **External Risks**
   - Regulatory and compliance risks
   - Economic and market risks
   - Technology platform risks
   - Partnership dependency risks

For each risk, provide:
- Risk description and impact
- Probability (High/Medium/Low)
- Impact severity (High/Medium/Low)
- Mitigation strategies
- Early warning indicators
- Contingency plans

Format as comprehensive JSON risk register.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2500
    });

    return this.parseJsonResponse(response.choices[0].message.content || '{}');
  }

  private async generateSuccessMetrics(
    productTitle: string,
    analysisData: any
  ): Promise<any> {
    const prompt = `
As a metrics and analytics expert, define comprehensive success metrics for:

Product: ${productTitle}
Business Context: ${JSON.stringify(analysisData.prd).substring(0, 1000)}

Create a metrics framework including:

1. **North Star Metric**
   - Primary success indicator
   - Measurement methodology
   - Target values and timeline

2. **Leading Indicators** (Early signals)
   - User engagement metrics
   - Product adoption metrics
   - Market traction metrics
   - Quality metrics

3. **Lagging Indicators** (Business outcomes)
   - Revenue and growth metrics
   - Market share metrics
   - Customer satisfaction metrics
   - Profitability metrics

4. **Operational Metrics**
   - Development velocity
   - Quality and reliability
   - Team performance
   - Cost efficiency

5. **Metric Targets by Phase**
   - Launch phase targets (0-3 months)
   - Growth phase targets (3-12 months)
   - Scale phase targets (12+ months)

6. **Measurement Framework**
   - Data collection methods
   - Reporting frequency
   - Dashboard requirements
   - Review and optimization process

Include specific target values, measurement methods, and success thresholds.

Format as comprehensive JSON metrics framework.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    });

    return this.parseJsonResponse(response.choices[0].message.content || '{}');
  }

  async exportPackage(
    packageData: ProductAnalysisPackage,
    productTitle: string,
    options: ExportOptions
  ): Promise<string> {
    
    switch (options.format) {
      case 'pdf':
        return await this.exportToPDF(packageData, productTitle, options);
      case 'markdown':
        return await this.exportToMarkdown(packageData, productTitle, options);
      case 'notion':
        return await this.exportToNotion(packageData, productTitle, options);
      case 'powerpoint':
        return await this.exportToPowerPoint(packageData, productTitle, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private async exportToPDF(
    packageData: ProductAnalysisPackage,
    productTitle: string,
    options: ExportOptions
  ): Promise<string> {
    
    const fileName = `${productTitle.replace(/\s+/g, '_')}_Analysis_Package.pdf`;
    const filePath = path.join(this.outputDir, fileName);

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Title page
    doc.fontSize(24).font('Helvetica-Bold');
    doc.text(`${productTitle}`, 50, 100);
    doc.fontSize(18).font('Helvetica');
    doc.text('Product Analysis Package', 50, 140);
    doc.fontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 180);

    // Add branding if provided
    if (options.branding?.logo) {
      // doc.image(options.branding.logo, 450, 50, { width: 100 });
    }

    doc.addPage();

    // Table of Contents
    doc.fontSize(18).font('Helvetica-Bold');
    doc.text('Table of Contents', 50, 50);
    doc.fontSize(12).font('Helvetica');
    
    const sections = [
      'Executive Summary',
      'Product Requirements Document',
      'Market Research Report',
      'Competitive Landscape Analysis',
      'Business Case',
      'Implementation Roadmap',
      'Risk Assessment',
      'Success Metrics',
      'Prototype Specifications'
    ];

    let yPosition = 90;
    sections.forEach((section, index) => {
      doc.text(`${index + 1}. ${section}`, 50, yPosition);
      yPosition += 20;
    });

    // Executive Summary
    doc.addPage();
    doc.fontSize(18).font('Helvetica-Bold');
    doc.text('Executive Summary', 50, 50);
    doc.fontSize(12).font('Helvetica');
    doc.text(packageData.executiveSummary, 50, 90, {
      width: 500,
      align: 'justify'
    });

    // Add other sections
    this.addSectionToPDF(doc, 'Product Requirements Document', packageData.productRequirementsDocument);
    this.addSectionToPDF(doc, 'Market Research Report', packageData.marketResearchReport);
    this.addSectionToPDF(doc, 'Competitive Landscape Analysis', packageData.competitiveLandscapeAnalysis);
    this.addSectionToPDF(doc, 'Business Case', packageData.businessCase);
    this.addSectionToPDF(doc, 'Implementation Roadmap', packageData.implementationRoadmap);
    this.addSectionToPDF(doc, 'Risk Assessment', packageData.riskAssessment);
    this.addSectionToPDF(doc, 'Success Metrics', packageData.successMetrics);
    this.addSectionToPDF(doc, 'Prototype Specifications', packageData.prototypeSpecifications);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  private addSectionToPDF(doc: any, title: string, content: any): void {
    doc.addPage();
    doc.fontSize(18).font('Helvetica-Bold');
    doc.text(title, 50, 50);
    doc.fontSize(12).font('Helvetica');

    const textContent = typeof content === 'string' 
      ? content 
      : JSON.stringify(content, null, 2);

    doc.text(textContent, 50, 90, {
      width: 500,
      align: 'justify'
    });
  }

  private async exportToMarkdown(
    packageData: ProductAnalysisPackage,
    productTitle: string,
    options: ExportOptions
  ): Promise<string> {
    
    const fileName = `${productTitle.replace(/\s+/g, '_')}_Analysis_Package.md`;
    const filePath = path.join(this.outputDir, fileName);

    let markdown = `# ${productTitle} - Product Analysis Package\n\n`;
    markdown += `*Generated on: ${new Date().toLocaleDateString()}*\n\n`;
    
    markdown += `## Table of Contents\n\n`;
    markdown += `1. [Executive Summary](#executive-summary)\n`;
    markdown += `2. [Product Requirements Document](#product-requirements-document)\n`;
    markdown += `3. [Market Research Report](#market-research-report)\n`;
    markdown += `4. [Competitive Landscape Analysis](#competitive-landscape-analysis)\n`;
    markdown += `5. [Business Case](#business-case)\n`;
    markdown += `6. [Implementation Roadmap](#implementation-roadmap)\n`;
    markdown += `7. [Risk Assessment](#risk-assessment)\n`;
    markdown += `8. [Success Metrics](#success-metrics)\n`;
    markdown += `9. [Prototype Specifications](#prototype-specifications)\n\n`;

    // Add sections
    markdown += `## Executive Summary\n\n${packageData.executiveSummary}\n\n`;
    markdown += `## Product Requirements Document\n\n\`\`\`json\n${JSON.stringify(packageData.productRequirementsDocument, null, 2)}\n\`\`\`\n\n`;
    markdown += `## Market Research Report\n\n\`\`\`json\n${JSON.stringify(packageData.marketResearchReport, null, 2)}\n\`\`\`\n\n`;
    markdown += `## Competitive Landscape Analysis\n\n\`\`\`json\n${JSON.stringify(packageData.competitiveLandscapeAnalysis, null, 2)}\n\`\`\`\n\n`;
    markdown += `## Business Case\n\n\`\`\`json\n${JSON.stringify(packageData.businessCase, null, 2)}\n\`\`\`\n\n`;
    markdown += `## Implementation Roadmap\n\n\`\`\`json\n${JSON.stringify(packageData.implementationRoadmap, null, 2)}\n\`\`\`\n\n`;
    markdown += `## Risk Assessment\n\n\`\`\`json\n${JSON.stringify(packageData.riskAssessment, null, 2)}\n\`\`\`\n\n`;
    markdown += `## Success Metrics\n\n\`\`\`json\n${JSON.stringify(packageData.successMetrics, null, 2)}\n\`\`\`\n\n`;
    markdown += `## Prototype Specifications\n\n\`\`\`json\n${JSON.stringify(packageData.prototypeSpecifications, null, 2)}\n\`\`\`\n\n`;

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    fs.writeFileSync(filePath, markdown, 'utf8');
    return filePath;
  }

  private async exportToNotion(
    packageData: ProductAnalysisPackage,
    productTitle: string,
    options: ExportOptions
  ): Promise<string> {
    // This would integrate with Notion API to create a structured page
    // For now, return a Notion-formatted markdown structure
    
    const fileName = `${productTitle.replace(/\s+/g, '_')}_Notion_Import.md`;
    const filePath = path.join(this.outputDir, fileName);

    let notionMarkdown = `# ${productTitle} Product Analysis\n\n`;
    notionMarkdown += `> **Generated**: ${new Date().toLocaleDateString()}\n`;
    notionMarkdown += `> **Template**: ${options.template}\n\n`;

    // Add callout boxes for key sections
    notionMarkdown += `> 💡 **Executive Summary**\n> ${packageData.executiveSummary.replace(/\n/g, '\n> ')}\n\n`;

    // Add toggle sections for detailed content
    notionMarkdown += `## 📋 Product Requirements Document\n\n`;
    notionMarkdown += `<details>\n<summary>View PRD Details</summary>\n\n\`\`\`json\n${JSON.stringify(packageData.productRequirementsDocument, null, 2)}\n\`\`\`\n</details>\n\n`;

    // Continue with other sections...
    
    fs.writeFileSync(filePath, notionMarkdown, 'utf8');
    return filePath;
  }

  private async exportToPowerPoint(
    packageData: ProductAnalysisPackage,
    productTitle: string,
    options: ExportOptions
  ): Promise<string> {
    // This would generate a PowerPoint presentation
    // For now, create a structured outline for presentation
    
    const fileName = `${productTitle.replace(/\s+/g, '_')}_Presentation_Outline.txt`;
    const filePath = path.join(this.outputDir, fileName);

    let outline = `PowerPoint Presentation Outline: ${productTitle}\n\n`;
    outline += `Slide 1: Title Slide\n`;
    outline += `- ${productTitle}\n`;
    outline += `- Product Analysis & Business Case\n`;
    outline += `- ${new Date().toLocaleDateString()}\n\n`;

    outline += `Slide 2: Executive Summary\n`;
    outline += `- Key opportunity highlights\n`;
    outline += `- Strategic rationale\n`;
    outline += `- Recommendation\n\n`;

    outline += `Slide 3: Market Opportunity\n`;
    outline += `- TAM/SAM/SOM\n`;
    outline += `- Growth projections\n`;
    outline += `- Customer segments\n\n`;

    // Add more slide outlines...

    fs.writeFileSync(filePath, outline, 'utf8');
    return filePath;
  }

  async sharePackage(
    packagePath: string,
    sharingOptions: SharingOptions
  ): Promise<{shareUrl: string; accessCode?: string}> {
    
    // This would integrate with a sharing service
    // For now, return a mock sharing response
    
    const shareId = Math.random().toString(36).substring(2, 15);
    const shareUrl = `https://agentic-pm.com/shared/${shareId}`;
    
    console.log(`[DocumentPackageAgent] Package shared with options:`, sharingOptions);
    
    return {
      shareUrl,
      accessCode: sharingOptions.accessCode || shareId.substring(0, 6).toUpperCase()
    };
  }

  private parseJsonResponse(content: string): any {
    try {
      const jsonMatch = content.match(/```json\s*({[\s\S]*?})\s*```/) ||
                       content.match(/```\s*({[\s\S]*?})\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('[DocumentPackageAgent] Failed to parse JSON response:', error);
      return {
        error: 'Failed to parse document package data',
        rawContent: content.substring(0, 1000)
      };
    }
  }
}