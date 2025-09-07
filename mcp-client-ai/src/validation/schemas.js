"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitConfigSchema = exports.APIResponseSchema = exports.SharingOptionsSchema = exports.ExportOptionsSchema = exports.ComponentSpecSchema = exports.PrototypeRequirementsSchema = exports.MarketGapSchema = exports.CompetitiveLandscapeInputSchema = exports.CompetitorProfileSchema = exports.MarketOpportunitySchema = exports.MarketResearchInputSchema = exports.ExtendedProductConceptSchema = exports.ProductConceptSchema = void 0;
exports.validateInput = validateInput;
exports.sanitizeString = sanitizeString;
exports.sanitizeObject = sanitizeObject;
const zod_1 = require("zod");
// ============================================================================
// CORE VALIDATION SCHEMAS
// ============================================================================
exports.ProductConceptSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(1, "Product title is required")
        .max(100, "Product title must be less than 100 characters")
        .regex(/^[a-zA-Z0-9\s\-_\.]+$/, "Product title contains invalid characters"),
    description: zod_1.z.string()
        .min(10, "Product description must be at least 10 characters")
        .max(2000, "Product description must be less than 2000 characters"),
    goals: zod_1.z.array(zod_1.z.string().min(1, "Goal cannot be empty"))
        .min(1, "At least one goal is required")
        .max(10, "Maximum 10 goals allowed"),
    targetMarket: zod_1.z.string()
        .min(1, "Target market is required")
        .max(200, "Target market description too long"),
    timeline: zod_1.z.string()
        .regex(/^Q[1-4]\s\d{4}$|^\d{1,2}\s(months?|years?)$/, "Invalid timeline format")
        .optional(),
    keyFeatures: zod_1.z.array(zod_1.z.string().min(1))
        .max(20, "Maximum 20 key features allowed")
        .optional(),
    targetUsers: zod_1.z.array(zod_1.z.string().min(1))
        .max(10, "Maximum 10 target user types allowed")
        .optional()
});
// Generic extended product concept for specialized products
exports.ExtendedProductConceptSchema = exports.ProductConceptSchema.extend({
    // Industry-specific fields (optional, dynamically added based on product type)
    industrySpecific: zod_1.z.record(zod_1.z.any()).optional(),
    // Technical specifications
    technicalRequirements: zod_1.z.array(zod_1.z.string()).optional(),
    // Platform preferences
    platform: zod_1.z.enum(['web', 'mobile', 'desktop', 'api', 'embedded'], {
        errorMap: () => ({ message: "Invalid platform selected" })
    }).optional(),
    // Design preferences
    designStyle: zod_1.z.enum(['minimal', 'modern', 'professional', 'playful', 'enterprise'], {
        errorMap: () => ({ message: "Invalid design style selected" })
    }).optional(),
    // Business model hints
    monetizationModel: zod_1.z.enum(['subscription', 'freemium', 'one-time', 'usage-based', 'marketplace'], {
        errorMap: () => ({ message: "Invalid monetization model" })
    }).optional(),
    // Scale expectations
    expectedScale: zod_1.z.enum(['startup', 'growth', 'enterprise', 'global'], {
        errorMap: () => ({ message: "Invalid scale expectation" })
    }).optional()
});
// ============================================================================
// MARKET RESEARCH VALIDATION
// ============================================================================
exports.MarketResearchInputSchema = zod_1.z.object({
    productTitle: zod_1.z.string().min(1, "Product title is required"),
    productDescription: zod_1.z.string().min(10, "Product description too short"),
    targetMarket: zod_1.z.string().min(1, "Target market is required"),
    geography: zod_1.z.string().default("Global").optional()
});
exports.MarketOpportunitySchema = zod_1.z.object({
    tam: zod_1.z.number().min(0, "TAM must be positive"),
    sam: zod_1.z.number().min(0, "SAM must be positive"),
    som: zod_1.z.number().min(0, "SOM must be positive"),
    growthRate: zod_1.z.number().min(-100, "Growth rate cannot be less than -100%").max(1000, "Growth rate seems unrealistic"),
    marketMaturity: zod_1.z.enum(['emerging', 'growing', 'mature', 'declining']),
    keyDrivers: zod_1.z.array(zod_1.z.string().min(1)).min(1, "At least one key driver required"),
    barriers: zod_1.z.array(zod_1.z.string().min(1))
});
exports.CompetitorProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Competitor name is required"),
    description: zod_1.z.string().min(10, "Competitor description too short"),
    marketShare: zod_1.z.number().min(0).max(100, "Market share must be between 0-100%").optional(),
    strengths: zod_1.z.array(zod_1.z.string().min(1)).min(1, "At least one strength required"),
    weaknesses: zod_1.z.array(zod_1.z.string().min(1)).min(1, "At least one weakness required"),
    pricing: zod_1.z.string().min(1, "Pricing information required"),
    fundingStage: zod_1.z.string().min(1, "Funding stage required")
});
// ============================================================================
// COMPETITIVE LANDSCAPE VALIDATION
// ============================================================================
exports.CompetitiveLandscapeInputSchema = zod_1.z.object({
    productTitle: zod_1.z.string().min(1, "Product title is required"),
    productDescription: zod_1.z.string().min(10, "Product description too short"),
    targetMarket: zod_1.z.string().min(1, "Target market is required"),
    geography: zod_1.z.string().default("Global")
});
exports.MarketGapSchema = zod_1.z.object({
    gapType: zod_1.z.enum(['feature', 'segment', 'price', 'geography', 'channel']),
    description: zod_1.z.string().min(10, "Gap description too short"),
    opportunity: zod_1.z.string().min(10, "Opportunity description too short"),
    difficulty: zod_1.z.enum(['low', 'medium', 'high']),
    timeToMarket: zod_1.z.string().min(1, "Time to market estimate required"),
    potentialRevenue: zod_1.z.number().min(0).optional()
});
// ============================================================================
// PROTOTYPE GENERATION VALIDATION
// ============================================================================
exports.PrototypeRequirementsSchema = zod_1.z.object({
    productTitle: zod_1.z.string().min(1, "Product title is required"),
    productDescription: zod_1.z.string().min(10, "Product description too short"),
    targetUsers: zod_1.z.array(zod_1.z.string().min(1)).min(1, "At least one target user required"),
    keyFeatures: zod_1.z.array(zod_1.z.string().min(1)).min(1, "At least one key feature required"),
    platform: zod_1.z.enum(['web', 'mobile', 'desktop']),
    designStyle: zod_1.z.enum(['minimal', 'modern', 'professional', 'playful']),
    colorScheme: zod_1.z.string().optional(),
    brandGuidelines: zod_1.z.string().optional()
});
exports.ComponentSpecSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Component name is required"),
    type: zod_1.z.enum(['page', 'component', 'layout']),
    description: zod_1.z.string().min(10, "Component description too short"),
    props: zod_1.z.record(zod_1.z.any()).optional(),
    children: zod_1.z.array(zod_1.z.string()).optional(),
    interactions: zod_1.z.array(zod_1.z.string()).min(1, "At least one interaction required"),
    responsiveBreakpoints: zod_1.z.array(zod_1.z.string()).optional()
});
// ============================================================================
// DOCUMENT PACKAGE VALIDATION
// ============================================================================
exports.ExportOptionsSchema = zod_1.z.object({
    format: zod_1.z.enum(['pdf', 'markdown', 'notion', 'confluence', 'powerpoint']),
    template: zod_1.z.enum(['executive', 'technical', 'investor', 'team']),
    branding: zod_1.z.object({
        logo: zod_1.z.string().url("Invalid logo URL").optional(),
        colors: zod_1.z.record(zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")).optional(),
        fonts: zod_1.z.record(zod_1.z.string()).optional()
    }).optional(),
    sections: zod_1.z.array(zod_1.z.string()).optional()
});
exports.SharingOptionsSchema = zod_1.z.object({
    visibility: zod_1.z.enum(['private', 'team', 'organization', 'public']),
    permissions: zod_1.z.object({
        canView: zod_1.z.boolean(),
        canComment: zod_1.z.boolean(),
        canEdit: zod_1.z.boolean(),
        canShare: zod_1.z.boolean()
    }),
    expirationDate: zod_1.z.date().optional(),
    accessCode: zod_1.z.string().min(6, "Access code must be at least 6 characters").optional()
});
// ============================================================================
// API RESPONSE VALIDATION
// ============================================================================
exports.APIResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        details: zod_1.z.any().optional()
    }).optional(),
    timestamp: zod_1.z.string().datetime(),
    requestId: zod_1.z.string().uuid().optional()
});
function validateInput(schema, input, context) {
    try {
        const validatedData = schema.parse(input);
        return {
            success: true,
            data: validatedData
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
function sanitizeString(input) {
    // Remove potentially harmful characters and scripts
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
}
function sanitizeObject(obj) {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        }
        else if (Array.isArray(value)) {
            sanitized[key] = value.map(item => typeof item === 'string' ? sanitizeString(item) : item);
        }
        else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value);
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
// ============================================================================
// RATE LIMITING SCHEMAS
// ============================================================================
exports.RateLimitConfigSchema = zod_1.z.object({
    windowMs: zod_1.z.number().min(1000, "Rate limit window must be at least 1 second"),
    maxRequests: zod_1.z.number().min(1, "Maximum requests must be at least 1"),
    skipSuccessfulRequests: zod_1.z.boolean().default(false),
    skipFailedRequests: zod_1.z.boolean().default(false)
});
