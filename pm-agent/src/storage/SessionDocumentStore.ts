/**
 * Session Document Store
 * In-memory storage for user documents during analysis sessions
 */

import { Logger } from '../utils/errorHandling';

// ============================================================================
// INTERFACES
// ============================================================================

export interface UserDocument {
  id: string;
  filename: string;
  type: 'pdf' | 'text' | 'markdown' | 'json' | 'unknown';
  content: string;
  metadata: {
    uploadedAt: Date;
    fileSize: number;
    lastAccessed: Date;
    accessCount: number;
    processingTime: number;
    contentType: string;
  };
  parsedData?: {
    title?: string;
    sections?: DocumentSection[];
    features?: string[];
    keywords?: string[];
    entities?: string[];
    summary?: string;
  };
}

export interface DocumentSection {
  title: string;
  content: string;
  type: 'header' | 'paragraph' | 'list' | 'table' | 'code';
  level?: number; // For headers
}

export interface DocumentContext {
  documentId: string;
  relevantSections: DocumentSection[];
  relevanceScore: number;
  contextType: 'features' | 'requirements' | 'constraints' | 'domain_knowledge' | 'style_guide';
  extractedInfo: {
    features?: string[];
    constraints?: string[];
    terminology?: Record<string, string>;
    styleGuidelines?: string[];
    technicalSpecs?: string[];
  };
}

export interface SessionInfo {
  sessionId: string;
  createdAt: Date;
  lastActivity: Date;
  documentCount: number;
  totalSize: number;
  expiresAt: Date;
}

// ============================================================================
// SESSION DOCUMENT STORE
// ============================================================================

export class SessionDocumentStore {
  private documents: Map<string, UserDocument> = new Map();
  private sessions: Map<string, SessionInfo> = new Map();
  private logger: Logger;
  
  // Configuration
  private readonly SESSION_TIMEOUT_MS = 3600000; // 1 hour
  private readonly MAX_DOCUMENTS_PER_SESSION = 20;
  private readonly MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_TOTAL_SIZE_PER_SESSION = 50 * 1024 * 1024; // 50MB

  // Cleanup interval
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.logger = Logger.getInstance();
    
    // Start cleanup interval (every 15 minutes)
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 15 * 60 * 1000);

    this.logger.info('SessionDocumentStore initialized', {
      sessionTimeout: this.SESSION_TIMEOUT_MS,
      maxDocuments: this.MAX_DOCUMENTS_PER_SESSION,
      maxSize: this.MAX_DOCUMENT_SIZE
    }, 'SessionDocumentStore');
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  createSession(): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const now = new Date();
    
    const sessionInfo: SessionInfo = {
      sessionId,
      createdAt: now,
      lastActivity: now,
      documentCount: 0,
      totalSize: 0,
      expiresAt: new Date(now.getTime() + this.SESSION_TIMEOUT_MS)
    };

    this.sessions.set(sessionId, sessionInfo);
    
    this.logger.info('New session created', {
      sessionId,
      expiresAt: sessionInfo.expiresAt
    }, 'SessionDocumentStore');

    return sessionId;
  }

  getSessionInfo(sessionId: string): SessionInfo | null {
    return this.sessions.get(sessionId) || null;
  }

  isSessionValid(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const now = new Date();
    if (now > session.expiresAt) {
      this.clearSession(sessionId);
      return false;
    }

    return true;
  }

  extendSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const now = new Date();
    session.lastActivity = now;
    session.expiresAt = new Date(now.getTime() + this.SESSION_TIMEOUT_MS);
    
    this.sessions.set(sessionId, session);
    return true;
  }

  // ============================================================================
  // DOCUMENT MANAGEMENT
  // ============================================================================

  async addDocument(
    sessionId: string,
    filename: string,
    content: string,
    contentType: string = 'text/plain'
  ): Promise<string> {
    if (!this.isSessionValid(sessionId)) {
      throw new Error(`Invalid or expired session: ${sessionId}`);
    }

    const session = this.sessions.get(sessionId)!;
    
    // Check limits
    if (session.documentCount >= this.MAX_DOCUMENTS_PER_SESSION) {
      throw new Error(`Maximum documents per session exceeded (${this.MAX_DOCUMENTS_PER_SESSION})`);
    }

    const contentSize = Buffer.byteLength(content, 'utf8');
    if (contentSize > this.MAX_DOCUMENT_SIZE) {
      throw new Error(`Document size exceeds limit (${this.MAX_DOCUMENT_SIZE} bytes)`);
    }

    if (session.totalSize + contentSize > this.MAX_TOTAL_SIZE_PER_SESSION) {
      throw new Error(`Session storage limit exceeded (${this.MAX_TOTAL_SIZE_PER_SESSION} bytes)`);
    }

    const documentId = `${sessionId}_doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date();
    
    const document: UserDocument = {
      id: documentId,
      filename,
      type: this.detectDocumentType(filename, contentType),
      content,
      metadata: {
        uploadedAt: now,
        fileSize: contentSize,
        lastAccessed: now,
        accessCount: 0,
        processingTime: 0,
        contentType
      }
    };

    this.documents.set(documentId, document);

    // Update session info
    session.documentCount++;
    session.totalSize += contentSize;
    session.lastActivity = now;
    this.sessions.set(sessionId, session);

    this.logger.info('Document added to session', {
      sessionId,
      documentId,
      filename,
      size: contentSize,
      type: document.type
    }, 'SessionDocumentStore');

    return documentId;
  }

  getDocument(documentId: string): UserDocument | null {
    const document = this.documents.get(documentId);
    if (!document) return null;

    // Update access tracking
    document.metadata.lastAccessed = new Date();
    document.metadata.accessCount++;
    this.documents.set(documentId, document);

    return document;
  }

  getSessionDocuments(sessionId: string): UserDocument[] {
    if (!this.isSessionValid(sessionId)) {
      return [];
    }

    const sessionDocuments: UserDocument[] = [];
    
    for (const document of this.documents.values()) {
      if (document.id.startsWith(sessionId)) {
        sessionDocuments.push(document);
      }
    }

    return sessionDocuments.sort((a, b) => 
      b.metadata.uploadedAt.getTime() - a.metadata.uploadedAt.getTime()
    );
  }

  updateDocumentParsedData(documentId: string, parsedData: UserDocument['parsedData']): boolean {
    const document = this.documents.get(documentId);
    if (!document) return false;

    document.parsedData = parsedData;
    this.documents.set(documentId, document);

    this.logger.debug('Document parsed data updated', {
      documentId,
      hasSections: !!parsedData?.sections?.length,
      hasFeatures: !!parsedData?.features?.length
    }, 'SessionDocumentStore');

    return true;
  }

  removeDocument(documentId: string): boolean {
    const document = this.documents.get(documentId);
    if (!document) return false;

    // Find session and update counts
    for (const [sessionId, session] of this.sessions.entries()) {
      if (documentId.startsWith(sessionId)) {
        session.documentCount--;
        session.totalSize -= document.metadata.fileSize;
        session.lastActivity = new Date();
        this.sessions.set(sessionId, session);
        break;
      }
    }

    this.documents.delete(documentId);
    
    this.logger.info('Document removed', { documentId }, 'SessionDocumentStore');
    return true;
  }

  // ============================================================================
  // CONTEXT RETRIEVAL
  // ============================================================================

  async getRelevantContext(
    sessionId: string,
    query: string,
    contextTypes: DocumentContext['contextType'][] = ['features', 'requirements', 'domain_knowledge']
  ): Promise<DocumentContext[]> {
    if (!this.isSessionValid(sessionId)) {
      return [];
    }

    const sessionDocuments = this.getSessionDocuments(sessionId);
    const contexts: DocumentContext[] = [];

    for (const document of sessionDocuments) {
      if (!document.parsedData) continue;

      const relevanceScore = this.calculateRelevanceScore(document, query);
      if (relevanceScore < 0.3) continue; // Skip low-relevance documents

      const context = this.extractDocumentContext(document, query, contextTypes, relevanceScore);
      if (context) {
        contexts.push(context);
      }
    }

    // Sort by relevance score
    contexts.sort((a, b) => b.relevanceScore - a.relevanceScore);

    this.logger.debug('Retrieved relevant context', {
      sessionId,
      query: query.substring(0, 50),
      contextsFound: contexts.length
    }, 'SessionDocumentStore');

    return contexts.slice(0, 5); // Return top 5 most relevant contexts
  }

  // ============================================================================
  // CLEANUP AND MAINTENANCE
  // ============================================================================

  clearSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // Remove all documents for this session
    const documentsToRemove: string[] = [];
    for (const [docId, document] of this.documents.entries()) {
      if (document.id.startsWith(sessionId)) {
        documentsToRemove.push(docId);
      }
    }

    for (const docId of documentsToRemove) {
      this.documents.delete(docId);
    }

    this.sessions.delete(sessionId);

    this.logger.info('Session cleared', {
      sessionId,
      documentsRemoved: documentsToRemove.length
    }, 'SessionDocumentStore');

    return true;
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.clearSession(sessionId);
    }

    if (expiredSessions.length > 0) {
      this.logger.info('Cleaned up expired sessions', {
        expiredCount: expiredSessions.length,
        totalSessions: this.sessions.size
      }, 'SessionDocumentStore');
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private detectDocumentType(filename: string, contentType: string): UserDocument['type'] {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'md':
      case 'markdown':
        return 'markdown';
      case 'json':
        return 'json';
      case 'txt':
      case 'text':
        return 'text';
      default:
        if (contentType.includes('pdf')) return 'pdf';
        if (contentType.includes('json')) return 'json';
        if (contentType.includes('text')) return 'text';
        return 'unknown';
    }
  }

  private calculateRelevanceScore(document: UserDocument, query: string): number {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const documentText = (document.content + ' ' + (document.parsedData?.summary || '')).toLowerCase();
    
    let score = 0;
    let totalTerms = queryTerms.length;

    for (const term of queryTerms) {
      if (documentText.includes(term)) {
        score++;
      }
    }

    // Boost score if document has parsed features or keywords
    if (document.parsedData?.features) {
      const featureText = document.parsedData.features.join(' ').toLowerCase();
      for (const term of queryTerms) {
        if (featureText.includes(term)) {
          score += 0.5;
        }
      }
    }

    if (document.parsedData?.keywords) {
      const keywordText = document.parsedData.keywords.join(' ').toLowerCase();
      for (const term of queryTerms) {
        if (keywordText.includes(term)) {
          score += 0.3;
        }
      }
    }

    return Math.min(1.0, score / totalTerms);
  }

  private extractDocumentContext(
    document: UserDocument,
    query: string,
    contextTypes: DocumentContext['contextType'][],
    relevanceScore: number
  ): DocumentContext | null {
    if (!document.parsedData) return null;

    const relevantSections = document.parsedData.sections?.filter(section => {
      const sectionText = section.content.toLowerCase();
      const queryTerms = query.toLowerCase().split(/\s+/);
      return queryTerms.some(term => sectionText.includes(term));
    }) || [];

    // Determine context type based on document content
    let contextType: DocumentContext['contextType'] = 'domain_knowledge';
    
    if (document.parsedData.features && document.parsedData.features.length > 0) {
      contextType = 'features';
    } else if (document.content.toLowerCase().includes('requirement')) {
      contextType = 'requirements';
    } else if (document.content.toLowerCase().includes('constraint')) {
      contextType = 'constraints';
    } else if (document.content.toLowerCase().includes('style') || document.content.toLowerCase().includes('brand')) {
      contextType = 'style_guide';
    }

    // Only include if the context type is requested
    if (!contextTypes.includes(contextType)) {
      return null;
    }

    const extractedInfo: DocumentContext['extractedInfo'] = {};

    if (document.parsedData.features) {
      extractedInfo.features = document.parsedData.features;
    }

    // Extract constraints from content
    const constraintKeywords = ['must', 'should', 'cannot', 'limit', 'requirement', 'constraint'];
    const constraints = document.parsedData.sections?.filter(section =>
      constraintKeywords.some(keyword => section.content.toLowerCase().includes(keyword))
    ).map(section => section.content) || [];

    if (constraints.length > 0) {
      extractedInfo.constraints = constraints;
    }

    return {
      documentId: document.id,
      relevantSections: relevantSections.slice(0, 3), // Limit to 3 most relevant sections
      relevanceScore,
      contextType,
      extractedInfo
    };
  }

  // ============================================================================
  // PUBLIC UTILITY METHODS
  // ============================================================================

  getStorageStats(): {
    totalSessions: number;
    totalDocuments: number;
    totalSize: number;
    averageDocumentsPerSession: number;
    oldestSession: Date | null;
  } {
    let totalDocuments = 0;
    let totalSize = 0;
    let oldestSession: Date | null = null;

    for (const session of this.sessions.values()) {
      totalDocuments += session.documentCount;
      totalSize += session.totalSize;
      
      if (!oldestSession || session.createdAt < oldestSession) {
        oldestSession = session.createdAt;
      }
    }

    return {
      totalSessions: this.sessions.size,
      totalDocuments,
      totalSize,
      averageDocumentsPerSession: this.sessions.size > 0 ? totalDocuments / this.sessions.size : 0,
      oldestSession
    };
  }

  // Graceful shutdown
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.logger.info('SessionDocumentStore shutdown', {
      sessionsCleared: this.sessions.size,
      documentsCleared: this.documents.size
    }, 'SessionDocumentStore');

    this.sessions.clear();
    this.documents.clear();
  }
}