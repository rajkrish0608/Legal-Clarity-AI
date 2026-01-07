import { performSafetyCheck, LegalResponseSchema } from '@/lib/safety/guardrails';
import { MOCK_FIXTURES } from '@/lib/mock-data/fixtures';
import { describe, it, expect } from 'vitest';

describe('Safety Guardrails', () => {
    it('should PASS for valid mock fixtures', () => {
        const safeResponse = MOCK_FIXTURES.NOTICE_LOW_SEVERITY;
        const result = performSafetyCheck(safeResponse);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should FAIL if prohibited terms are present', () => {
        const unsafeResponse = {
            ...MOCK_FIXTURES.NOTICE_LOW_SEVERITY,
            summary: "You must pay immediately or we will sue you."
        };
        const result = performSafetyCheck(unsafeResponse);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('prohibited term'))).toBe(true);
    });

    it('should FAIL if disclaimer is missing', () => {
        const unsafeResponse = {
            ...MOCK_FIXTURES.NOTICE_LOW_SEVERITY,
            disclaimer: "Too short"
        };
        const result = performSafetyCheck(unsafeResponse);
        expect(result.valid).toBe(false);
    });

    it('should FAIL if pasted text triggers unsafe mock', () => {
        // "ILLEGAL FINE" triggers UNSAFE_TEST fixture which has illegal words
        const unsafeResponse = MOCK_FIXTURES.UNSAFE_TEST;
        const result = performSafetyCheck(unsafeResponse);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('prohibited term'))).toBe(true);
    });

    it('should FAIL if schema is invalid (missing fields)', () => {
        const invalidResponse = {
            summary: "Missing fields"
        } as any;
        const result = performSafetyCheck(invalidResponse);
        expect(result.valid).toBe(false);
    });
});
