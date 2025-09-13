/**
 * Simple Document Parser
 * Basic parsing for PDF, text, and markdown files
 */

import { Logger, AgenticError, ErrorCode } from '../utils/errorHandling';
import { DocumentSection, UserDocument } from '../storage/SessionDocumentStore';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ParsedContent {
  title?: string;
  sections: DocumentSection[];
  features?: string[];
  keywords?: string[];
  entities?: string[];
  summary?: string;
  metadata: {
    wordCount: number;
    sectionCount: number;
    hasStructure: boolean;
    confidence: number;
    parsingTime: number;
  };
}

export interface ParsingOptions {
  extractFeatures?: boolean;
  extractKeywords?: boolean;
  extractEntities?: boolean;
  generateSummary?: boolean;
  maxSummaryLength?: number;
  sectionMinLength?: number;
}

// ============================================================================
// SIMPLE DOCUMENT PARSER
// ============================================================================

export class SimpleDocumentParser {
  private logger: Logger;

  // Common feature keywords to identify feature lists
  private readonly FEATURE_KEYWORDS = [
    'feature', 'capability', 'function', 'functionality', 'ability', 'support',
    'include', 'provide', 'enable', 'allow', 'offer', 'deliver'
  ];

  // Section header patterns
  private readonly SECTION_PATTERNS = [
    /^#{1,6}\s+(.+)$/gm,           // Markdown headers
    /^(.+)\n[=-]{3,}$/gm,         // Underlined headers
    /^\d+\.\s+(.+)$/gm,           // Numbered sections
    /^[A-Z\s]{3,}:?\s*$/gm,       // ALL CAPS headers
    /^(.+):\s*$/gm                // Colon-terminated headers
  ];

  // Entity patterns (simplified)
  private readonly ENTITY_PATTERNS = {
    companies: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Inc|Corp|LLC|Ltd|Company)\b/g,
    products: /\b[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*\s+(?:App|Platform|System|Tool|Software|Service)\b/g,
    technologies: /\b(?:React|Angular|Vue|Node|Python|Java|JavaScript|TypeScript|API|REST|GraphQL|SQL|NoSQL|AWS|Azure|GCP)\b/g
  };

  constructor() {
    this.logger = Logger.getInstance();
  }

  // ============================================================================
  // MAIN PARSING METHODS
  // ============================================================================

  async parseDocument(
    content: string,
    filename: string,
    documentType: UserDocument['type'],
    options: ParsingOptions = {}
  ): Promise<ParsedContent> {
    const startTime = Date.now();
    const requestId = `parse_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    this.logger.setContext(requestId);
    this.logger.info('Starting document parsing', {
      filename,
      type: documentType,
      contentLength: content.length,
      options
    }, 'SimpleDocumentParser');

    try {
      // Set default options
      const parseOptions: Required<ParsingOptions> = {
        extractFeatures: options.extractFeatures ?? true,
        extractKeywords: options.extractKeywords ?? true,
        extractEntities: options.extractEntities ?? false,
        generateSummary: options.generateSummary ?? true,
        maxSummaryLength: options.maxSummaryLength ?? 200,
        sectionMinLength: options.sectionMinLength ?? 50
      };

      let parsedContent: ParsedContent;

      // Parse based on document type
      switch (documentType) {
        case 'pdf':
          parsedContent = await this.parsePDFContent(content, parseOptions);
          break;
        case 'markdown':
          parsedContent = await this.parseMarkdownContent(content, parseOptions);
          break;
        case 'json':
          parsedContent = await this.parseJSONContent(content, parseOptions);
          break;
        case 'text':
        default:
          parsedContent = await this.parseTextContent(content, parseOptions);
          break;
      }

      // Extract title from filename if not found
      if (!parsedContent.title) {
        parsedContent.title = this.extractTitleFromFilename(filename);
      }

      const parsingTime = Date.now() - startTime;
      parsedContent.metadata.parsingTime = parsingTime;

      this.logger.info('Document parsing completed', {
        requestId,
        filename,
        sectionsFound: parsedContent.sections.length,
        featuresFound: parsedContent.features?.length || 0,
        parsingTime
      }, 'SimpleDocumentParser');

      return parsedContent;

    } catch (error) {
      const parsingTime = Date.now() - startTime;
      
      this.logger.error('Document parsing failed', error as Error, {
        requestId,
        filename,
        type: documentType,
        parsingTime
      }, 'SimpleDocumentParser');

      throw new AgenticError(
        ErrorCode.PROCESSING_ERROR,
        `Document parsing failed: ${(error as Error).message}`,
        'Unable to parse the document. Please check the file format.',
        { filename, type: documentType },
        true
      );
    }
  }

  // ============================================================================
  // TYPE-SPECIFIC PARSING
  // ============================================================================

  private async parseTextContent(content: string, options: Required<ParsingOptions>): Promise<ParsedContent> {
    const sections = this.extractSections(content, options.sectionMinLength);
    const wordCount = this.countWords(content);

    const result: ParsedContent = {
      sections,
      metadata: {
        wordCount,
        sectionCount: sections.length,
        hasStructure: sections.length > 1,
        confidence: this.calculateConfidence(content, sections),
        parsingTime: 0 // Will be set by caller
      }
    };

    // Optional extractions
    if (options.extractFeatures) {
      result.features = this.extractFeatures(content);
    }

    if (options.extractKeywords) {
      result.keywords = this.extractKeywords(content);
    }

    if (options.extractEntities) {
      result.entities = this.extractEntities(content);
    }

    if (options.generateSummary) {
      result.summary = this.generateSummary(content, options.maxSummaryLength);
    }

    return result;
  }

  private async parseMarkdownContent(content: string, options: Required<ParsingOptions>): Promise<ParsedContent> {
    // Extract title from first H1 header
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    // Parse markdown sections
    const sections = this.parseMarkdownSections(content);
    const wordCount = this.countWords(content);

    const result: ParsedContent = {
      title,
      sections,
      metadata: {
        wordCount,
        sectionCount: sections.length,
        hasStructure: true, // Markdown always has structure
        confidence: 0.9, // High confidence for structured markdown
        parsingTime: 0
      }
    };

    // Optional extractions
    if (options.extractFeatures) {
      result.features = this.extractFeaturesFromMarkdown(content);
    }

    if (options.extractKeywords) {
      result.keywords = this.extractKeywords(content);
    }

    if (options.extractEntities) {
      result.entities = this.extractEntities(content);
    }

    if (options.generateSummary) {
      result.summary = this.generateSummary(content, options.maxSummaryLength);
    }

    return result;
  }

  private async parseJSONContent(content: string, options: Required<ParsingOptions>): Promise<ParsedContent> {
    try {
      const jsonData = JSON.parse(content);
      const sections = this.parseJSONStructure(jsonData);
      
      const result: ParsedContent = {
        title: jsonData.title || jsonData.name || jsonData.productName,
        sections,
        metadata: {
          wordCount: this.countWords(JSON.stringify(jsonData, null, 2)),
          sectionCount: sections.length,
          hasStructure: true,
          confidence: 0.95, // High confidence for valid JSON
          parsingTime: 0
        }
      };

      // Extract features from JSON structure
      if (options.extractFeatures) {
        result.features = this.extractFeaturesFromJSON(jsonData);
      }

      if (options.extractKeywords) {
        result.keywords = this.extractKeywordsFromJSON(jsonData);
      }

      if (options.generateSummary) {
        result.summary = this.generateJSONSummary(jsonData, options.maxSummaryLength);
      }

      return result;

    } catch (error) {
      // Fallback to text parsing if JSON is invalid
      this.logger.warn('Invalid JSON, falling back to text parsing', {
        error: (error as Error).message
      }, 'SimpleDocumentParser');
      
      return this.parseTextContent(content, options);
    }
  }

  private async parsePDFContent(content: string, options: Required<ParsingOptions>): Promise<ParsedContent> {
    // Note: This is a simplified PDF parser that assumes content is already extracted text
    // In a real implementation, you'd use a library like pdf-parse or pdf2pic
    
    this.logger.warn('PDF parsing is simplified - assuming pre-extracted text', {}, 'SimpleDocumentParser');
    
    // Parse as text content
    const result = await this.parseTextContent(content, options);
    
    // Adjust confidence for PDF
    result.metadata.confidence *= 0.8; // Lower confidence for PDF text extraction
    
    return result;
  }

  // ============================================================================
  // SECTION EXTRACTION
  // ============================================================================

  private extractSections(content: string, minLength: number): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const lines = content.split('\n');
    let currentSection: DocumentSection | null = null;
    let currentContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line is a section header
      const headerInfo = this.detectSectionHeader(line, lines[i + 1]);
      
      if (headerInfo) {
        // Save previous section if it exists and meets minimum length
        if (currentSection && currentContent.join('\n').trim().length >= minLength) {
          currentSection.content = currentContent.join('\n').trim();
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          title: headerInfo.title,
          content: '',
          type: 'header',
          level: headerInfo.level
        };
        currentContent = [];

        // Skip underline if present
        if (headerInfo.hasUnderline && i + 1 < lines.length) {
          i++; // Skip the underline
        }
      } else if (line.length > 0) {
        currentContent.push(line);
      }
    }

    // Add final section
    if (currentSection && currentContent.join('\n').trim().length >= minLength) {
      currentSection.content = currentContent.join('\n').trim();
      sections.push(currentSection);
    }

    // If no sections found, create one big section
    if (sections.length === 0) {
      sections.push({
        title: 'Document Content',
        content: content.trim(),
        type: 'paragraph'
      });
    }

    return sections;
  }

  private parseMarkdownSections(content: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const lines = content.split('\n');
    let currentSection: DocumentSection | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          currentSection.content = currentContent.join('\n').trim();
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          title: headerMatch[2].trim(),
          content: '',
          type: 'header',
          level: headerMatch[1].length
        };
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      } else {
        // Content before first header
        currentContent.push(line);
      }
    }

    // Add final section
    if (currentSection) {
      currentSection.content = currentContent.join('\n').trim();
      sections.push(currentSection);
    } else if (currentContent.length > 0) {
      // Document without headers
      sections.push({
        title: 'Content',
        content: currentContent.join('\n').trim(),
        type: 'paragraph'
      });
    }

    return sections;
  }

  private parseJSONStructure(jsonData: any, prefix: string = ''): DocumentSection[] {
    const sections: DocumentSection[] = [];

    if (typeof jsonData === 'object' && jsonData !== null) {
      for (const [key, value] of Object.entries(jsonData)) {
        const title = prefix ? `${prefix}.${key}` : key;
        
        if (Array.isArray(value)) {
          sections.push({
            title: title,
            content: value.map(item => typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)).join('\n'),
            type: 'list'
          });
        } else if (typeof value === 'object' && value !== null) {
          // Recursively parse nested objects
          const nestedSections = this.parseJSONStructure(value, title);
          sections.push(...nestedSections);
        } else {
          sections.push({
            title: title,
            content: String(value),
            type: 'paragraph'
          });
        }
      }
    }

    return sections;
  }

  // ============================================================================
  // FEATURE EXTRACTION
  // ============================================================================

  private extractFeatures(content: string): string[] {
    const features: Set<string> = new Set();
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for bullet points or numbered lists
      if (this.isFeatureLine(trimmedLine)) {
        const feature = this.cleanFeatureText(trimmedLine);
        if (feature.length > 5 && feature.length < 100) {
          features.add(feature);
        }
      }

      // Look for sentences containing feature keywords
      for (const keyword of this.FEATURE_KEYWORDS) {
        if (trimmedLine.toLowerCase().includes(keyword) && trimmedLine.length < 150) {
          const feature = this.extractFeatureFromSentence(trimmedLine, keyword);
          if (feature) {
            features.add(feature);
          }
        }
      }
    }

    return Array.from(features).slice(0, 20); // Limit to 20 features
  }

  private extractFeaturesFromMarkdown(content: string): string[] {
    const features: Set<string> = new Set();
    
    // Extract from unordered lists
    const listMatches = content.matchAll(/^\s*[-*+]\s+(.+)$/gm);
    for (const match of listMatches) {
      const feature = this.cleanFeatureText(match[1]);
      if (feature.length > 5 && feature.length < 100) {
        features.add(feature);
      }
    }

    // Extract from ordered lists
    const orderedListMatches = content.matchAll(/^\s*\d+\.\s+(.+)$/gm);
    for (const match of orderedListMatches) {
      const feature = this.cleanFeatureText(match[1]);
      if (feature.length > 5 && feature.length < 100) {
        features.add(feature);
      }
    }

    // Also extract from regular text
    const textFeatures = this.extractFeatures(content);
    textFeatures.forEach(feature => features.add(feature));

    return Array.from(features).slice(0, 20);
  }

  private extractFeaturesFromJSON(jsonData: any): string[] {
    const features: Set<string> = new Set();

    // Common JSON keys that might contain features
    const featureKeys = ['features', 'capabilities', 'functions', 'requirements', 'specifications'];

    function extractFromObject(obj: any, path: string = '') {
      if (Array.isArray(obj)) {
        obj.forEach(item => {
          if (typeof item === 'string') {
            features.add(item);
          } else if (typeof item === 'object') {
            extractFromObject(item, path);
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          if (featureKeys.includes(key.toLowerCase())) {
            if (Array.isArray(value)) {
              value.forEach(item => {
                if (typeof item === 'string') {
                  features.add(item);
                }
              });
            } else if (typeof value === 'string') {
              features.add(value);
            }
          } else {
            extractFromObject(value, path ? `${path}.${key}` : key);
          }
        }
      }
    }

    extractFromObject(jsonData);
    return Array.from(features).slice(0, 20);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private detectSectionHeader(line: string, nextLine?: string): { title: string; level: number; hasUnderline: boolean } | null {
    // Markdown headers
    const mdHeaderMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (mdHeaderMatch) {
      return {
        title: mdHeaderMatch[2].trim(),
        level: mdHeaderMatch[1].length,
        hasUnderline: false
      };
    }

    // Underlined headers
    if (nextLine && /^[=-]{3,}$/.test(nextLine.trim())) {
      return {
        title: line,
        level: nextLine.includes('=') ? 1 : 2,
        hasUnderline: true
      };
    }

    // Numbered sections
    const numberedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      return {
        title: numberedMatch[1],
        level: 3,
        hasUnderline: false
      };
    }

    // ALL CAPS headers
    if (/^[A-Z\s]{3,}:?\s*$/.test(line) && line.length < 50) {
      return {
        title: line.replace(':', '').trim(),
        level: 2,
        hasUnderline: false
      };
    }

    return null;
  }

  private isFeatureLine(line: string): boolean {
    // Check for bullet points or numbered lists
    return /^\s*[-*+•]\s+/.test(line) || /^\s*\d+\.\s+/.test(line);
  }

  private cleanFeatureText(text: string): string {
    return text.replace(/^\s*[-*+•]\s*/, '').replace(/^\s*\d+\.\s*/, '').trim();
  }

  private extractFeatureFromSentence(sentence: string, keyword: string): string | null {
    // Simple extraction - this could be enhanced with NLP
    const words = sentence.split(/\s+/);
    const keywordIndex = words.findIndex(word => word.toLowerCase().includes(keyword));
    
    if (keywordIndex !== -1) {
      // Try to extract a meaningful phrase around the keyword
      const start = Math.max(0, keywordIndex - 2);
      const end = Math.min(words.length, keywordIndex + 5);
      const phrase = words.slice(start, end).join(' ');
      
      if (phrase.length > 10 && phrase.length < 80) {
        return phrase;
      }
    }

    return null;
  }

  private extractKeywords(content: string): string[] {
    const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const stopWords = new Set([
      'this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said',
      'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'more'
    ]);

    const wordFreq: Record<string, number> = {};
    
    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    return Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word);
  }

  private extractKeywordsFromJSON(jsonData: any): string[] {
    const text = JSON.stringify(jsonData, null, 2);
    return this.extractKeywords(text);
  }

  private extractEntities(content: string): string[] {
    const entities: Set<string> = new Set();

    for (const [type, pattern] of Object.entries(this.ENTITY_PATTERNS)) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        entities.add(match[0]);
      }
    }

    return Array.from(entities).slice(0, 10);
  }

  private generateSummary(content: string, maxLength: number): string {
    // Simple extractive summary - take first few sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    let summary = '';
    for (const sentence of sentences.slice(0, 3)) {
      if (summary.length + sentence.length < maxLength) {
        summary += sentence.trim() + '. ';
      } else {
        break;
      }
    }

    return summary.trim() || content.substring(0, maxLength) + '...';
  }

  private generateJSONSummary(jsonData: any, maxLength: number): string {
    const title = jsonData.title || jsonData.name || 'Document';
    const description = jsonData.description || jsonData.summary || '';
    
    let summary = `${title}`;
    if (description && summary.length + description.length < maxLength) {
      summary += `: ${description}`;
    }

    return summary.substring(0, maxLength);
  }

  private countWords(text: string): number {
    return (text.match(/\b\w+\b/g) || []).length;
  }

  private calculateConfidence(content: string, sections: DocumentSection[]): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence for structured content
    if (sections.length > 1) confidence += 0.2;
    if (sections.length > 3) confidence += 0.1;

    // Boost for reasonable length
    const wordCount = this.countWords(content);
    if (wordCount > 100) confidence += 0.1;
    if (wordCount > 500) confidence += 0.1;

    // Boost for clear headers
    const hasHeaders = sections.some(s => s.type === 'header');
    if (hasHeaders) confidence += 0.1;

    return Math.min(1.0, confidence);
  }

  private extractTitleFromFilename(filename: string): string {
    return filename
      .replace(/\.[^.]+$/, '') // Remove extension
      .replace(/[_-]/g, ' ')   // Replace underscores and hyphens with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Title case
  }
}