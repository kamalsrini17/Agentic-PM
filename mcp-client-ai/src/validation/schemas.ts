import { z } from 'zod';

// ============================================================================
// CORE VALIDATION SCHEMAS
// ============================================================================

export const ProductConceptSchema = z.object({
  title: z.string()
    .min(1, "Product title is required")
    .max(100, "Product title must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_\.]+$/, "Product title contains invalid characters"),
  
  description: z.string()
    .min(10, "Product description must be at least 10 characters")
    .max(2000, "Product description must be less than 2000 characters"),
  
  goals: z.array(z.string().min(1, "Goal cannot be empty"))
    .min(1, "At least one goal is required")
    .max(10, "Maximum 10 goals allowed"),
  
  targetMarket: z.string()
    .min(1, "Target market is required")
    .max(200, "Target market description too long"),
  
  timeline: z.string()
    .regex(/^Q[1-4]\s\d{4}$|^\d{1,2}\s(months?|years?)$/, "Invalid timeline format")
    .optional(),
  
  keyFeatures: z.array(z.string().min(1))
    .max(20, "Maximum 20 key features allowed")
    .optional(),
  
  targetUsers: z.array(z.string().min(1))
    .max(10, "Maximum 10 target user types allowed")
    .optional()
});

export const TradingBotConceptSchema = ProductConceptSchema.extend({
  capital: z.number()
    .min(10000, "Minimum capital is $10,000")
    .max(10000000, "Maximum capital is $10,000,000")
    .int("Capital must be a whole number"),
  
  riskTolerance: z.number()
    .min(1, "Risk tolerance must be between 1 and 10")
    .max(10, "Risk tolerance must be between 1 and 10")
    .int("Risk tolerance must be a whole number"),
  
  timeHorizon: z.enum(['1week', '2weeks', '1month', '3months', '6months', '12months'], {
    errorMap: () => ({ message: "Invalid time horizon selected" })
  }),
  
  platform: z.enum(['web', 'mobile', 'desktop'], {
    errorMap: () => ({ message: "Invalid platform selected" })
  }).optional(),
  
  designStyle: z.enum(['minimal', 'modern', 'professional', 'playful'], {
    errorMap: () => ({ message: "Invalid design style selected" })
  }).optional()
});

// ============================================================================
// MARKET RESEARCH VALIDATION
// ============================================================================

export const MarketResearchInputSchema = z.object({
  productTitle: z.string().min(1, "Product title is required"),
  productDescription: z.string().min(10, "Product description too short"),
  targetMarket: z.string().min(1, "Target market is required"),
  geography: z.string().default("Global").optional()
});

export const MarketOpportunitySchema = z.object({
  tam: z.number().min(0, "TAM must be positive"),
  sam: z.number().min(0, "SAM must be positive"),
  som: z.number().min(0, "SOM must be positive"),
  growthRate: z.number().min(-100, "Growth rate cannot be less than -100%").max(1000, "Growth rate seems unrealistic"),
  marketMaturity: z.enum(['emerging', 'growing', 'mature', 'declining']),
  keyDrivers: z.array(z.string().min(1)).min(1, "At least one key driver required"),
  barriers: z.array(z.string().min(1))
});

export const CompetitorProfileSchema = z.object({
  name: z.string().min(1, "Competitor name is required"),
  description: z.string().min(10, "Competitor description too short"),
  marketShare: z.number().min(0).max(100, "Market share must be between 0-100%").optional(),
  strengths: z.array(z.string().min(1)).min(1, "At least one strength required"),
  weaknesses: z.array(z.string().min(1)).min(1, "At least one weakness required"),
  pricing: z.string().min(1, "Pricing information required"),
  fundingStage: z.string().min(1, "Funding stage required")
});

// ============================================================================
// COMPETITIVE LANDSCAPE VALIDATION
// ============================================================================

export const CompetitiveLandscapeInputSchema = z.object({
  productTitle: z.string().min(1, "Product title is required"),
  productDescription: z.string().min(10, "Product description too short"),
  targetMarket: z.string().min(1, "Target market is required"),
  geography: z.string().default("Global")
});

export const MarketGapSchema = z.object({
  gapType: z.enum(['feature', 'segment', 'price', 'geography', 'channel']),
  description: z.string().min(10, "Gap description too short"),
  opportunity: z.string().min(10, "Opportunity description too short"),
  difficulty: z.enum(['low', 'medium', 'high']),
  timeToMarket: z.string().min(1, "Time to market estimate required"),
  potentialRevenue: z.number().min(0).optional()
});

// ============================================================================
// PROTOTYPE GENERATION VALIDATION
// ============================================================================

export const PrototypeRequirementsSchema = z.object({
  productTitle: z.string().min(1, "Product title is required"),
  productDescription: z.string().min(10, "Product description too short"),
  targetUsers: z.array(z.string().min(1)).min(1, "At least one target user required"),
  keyFeatures: z.array(z.string().min(1)).min(1, "At least one key feature required"),
  platform: z.enum(['web', 'mobile', 'desktop']),
  designStyle: z.enum(['minimal', 'modern', 'professional', 'playful']),
  colorScheme: z.string().optional(),
  brandGuidelines: z.string().optional()
});

export const ComponentSpecSchema = z.object({
  name: z.string().min(1, "Component name is required"),
  type: z.enum(['page', 'component', 'layout']),
  description: z.string().min(10, "Component description too short"),
  props: z.record(z.any()).optional(),
  children: z.array(z.string()).optional(),
  interactions: z.array(z.string()).min(1, "At least one interaction required"),
  responsiveBreakpoints: z.array(z.string()).optional()
});

// ============================================================================
// DOCUMENT PACKAGE VALIDATION
// ============================================================================

export const ExportOptionsSchema = z.object({
  format: z.enum(['pdf', 'markdown', 'notion', 'confluence', 'powerpoint']),
  template: z.enum(['executive', 'technical', 'investor', 'team']),
  branding: z.object({
    logo: z.string().url("Invalid logo URL").optional(),
    colors: z.record(z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")).optional(),
    fonts: z.record(z.string()).optional()
  }).optional(),
  sections: z.array(z.string()).optional()
});

export const SharingOptionsSchema = z.object({
  visibility: z.enum(['private', 'team', 'organization', 'public']),
  permissions: z.object({
    canView: z.boolean(),
    canComment: z.boolean(),
    canEdit: z.boolean(),
    canShare: z.boolean()
  }),
  expirationDate: z.date().optional(),
  accessCode: z.string().min(6, "Access code must be at least 6 characters").optional()
});

// ============================================================================
// API RESPONSE VALIDATION
// ============================================================================

export const APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  }).optional(),
  timestamp: z.string().datetime(),
  requestId: z.string().uuid().optional()
});

// ============================================================================
// VALIDATION UTILITY FUNCTIONS
// ============================================================================

export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: z.ZodError;
  };
};

export function validateInput<T>(
  schema: z.ZodSchema<T>, 
  input: unknown, 
  context?: string
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(input);
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: context 
            ? `${context} validation failed: ${errorMessage}`
            : `Validation failed: ${errorMessage}`,
          details: error
        }
      };
    }
    
    return {
      success: false,
      error: {
        code: 'UNKNOWN_VALIDATION_ERROR',
        message: 'An unexpected validation error occurred'
      }
    };
  }
}

export function sanitizeString(input: string): string {
  // Remove potentially harmful characters and scripts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// ============================================================================
// RATE LIMITING SCHEMAS
// ============================================================================

export const RateLimitConfigSchema = z.object({
  windowMs: z.number().min(1000, "Rate limit window must be at least 1 second"),
  maxRequests: z.number().min(1, "Maximum requests must be at least 1"),
  skipSuccessfulRequests: z.boolean().default(false),
  skipFailedRequests: z.boolean().default(false)
});

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type ProductConcept = z.infer<typeof ProductConceptSchema>;
export type TradingBotConcept = z.infer<typeof TradingBotConceptSchema>;
export type MarketResearchInput = z.infer<typeof MarketResearchInputSchema>;
export type CompetitiveLandscapeInput = z.infer<typeof CompetitiveLandscapeInputSchema>;
export type PrototypeRequirements = z.infer<typeof PrototypeRequirementsSchema>;
export type ExportOptions = z.infer<typeof ExportOptionsSchema>;
export type SharingOptions = z.infer<typeof SharingOptionsSchema>;
export type APIResponse = z.infer<typeof APIResponseSchema>;
export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;