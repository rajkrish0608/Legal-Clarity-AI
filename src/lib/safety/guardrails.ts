import { z } from 'zod';
import { LegalResponse } from '@/types/legal-response';

// --- Prohibited Terms ---
export const PROHIBITED_TERMS_REGEX = /(guarantee|illegal|sue|court case|must do|jail|you must|pay immediately|arrest|warrant)/i;

// --- Zod Schema ---
export const SeveritySchema = z.object({
    level: z.enum(['Low', 'Medium', 'High']),
    reason: z.string().min(5),
});

export const HiddenRiskSchema = z.object({
    risk: z.string(),
    explanation: z.string(),
    impact: z.string(),
});

export const LegalResponseSchema = z.object({
    summary: z.string().min(10),
    why_received: z.string().min(10),
    severity: SeveritySchema,
    hidden_risks: z.array(HiddenRiskSchema),
    what_to_do_next: z.array(z.string()).min(1),
    important_dates: z.array(z.string()),
    disclaimer: z.string().min(20).refine(val => val.includes('not constitute legal advice'), {
        message: "Disclaimer must state it does not constitute legal advice"
    })
});

// --- Validation Functions ---

export interface SafetyResult {
    valid: boolean;
    errors: string[];
}

export function performSafetyCheck(response: LegalResponse): SafetyResult {
    const errors: string[] = [];

    // 1. Schema Validation
    try {
        LegalResponseSchema.parse(response);
    } catch (e) {
        if (e instanceof z.ZodError) {
            e.issues.forEach(err => errors.push(`Schema Error: ${err.path.join('.')} - ${err.message}`));
        } else {
            // Fallback for non-Zod errors or if instanceof fails
            errors.push(`Validation Error: ${(e as Error).message}`);
        }
    }

    // 2. Prohibited Terms Check (Recursive scan of string values)
    function scanForProhibited(obj: any, path: string = '') {
        if (typeof obj === 'string') {
            if (PROHIBITED_TERMS_REGEX.test(obj)) {
                const match = obj.match(PROHIBITED_TERMS_REGEX);
                errors.push(`Safety Violation at ${path}: Contains prohibited term "${match?.[0]}"`);
            }
        } else if (Array.isArray(obj)) {
            obj.forEach((item, index) => scanForProhibited(item, `${path}[${index}]`));
        } else if (typeof obj === 'object' && obj !== null) {
            Object.keys(obj).forEach(key => scanForProhibited(obj[key], `${path}.${key}`));
        }
    }

    scanForProhibited(response);

    return {
        valid: errors.length === 0,
        errors
    };
}

export function ensureDisclaimer(response: LegalResponse): LegalResponse {
    const REQUIRED_DISCLAIMER = "This explanation is for informational purposes only and does not constitute legal advice. For specific guidance on your situation, please consult with a qualified legal professional or tax advisor.";

    if (!response.disclaimer || response.disclaimer.length < 20 || !response.disclaimer.includes("informational purposes only")) {
        return {
            ...response,
            disclaimer: REQUIRED_DISCLAIMER
        };
    }
    return response;
}
