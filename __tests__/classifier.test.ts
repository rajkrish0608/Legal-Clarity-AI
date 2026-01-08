import { describe, test, expect } from 'vitest';
import { classifyDocument } from '../src/lib/analysis/classifiers';
import { Metadata } from '../src/types/legal-response';

// Helper to create mock metadata
const mockMeta = (overrides?: Partial<Metadata>): Metadata => ({
    dates: [],
    amounts: [],
    sections: [],
    keywords: [],
    hasDemand: false,
    ...overrides
});

describe('Advanced Classifier Tests', () => {

    test('Should prioritize Employment Offer over NDA if both keywords present', () => {
        const text = "This EMPLOYMENT AGREEMENT is an OFFER LETTER for the position. It includes a NON-DISCLOSURE AGREEMENT clause.";
        const result = classifyDocument(text, mockMeta());

        expect(result.documentType).toBe('employment_offer');
        expect(result.confidence).toBeGreaterThan(50);
    });

    test('Should identify Tax Notice ONLY if section numbers are present', () => {
        // Case 1: Keywords + Section -> Valid
        const validText = "This is a NOTICE OF DEMAND from INCOME TAX DEPARTMENT under SECTION 156.";
        const validMeta = mockMeta({ sections: ['156'] });
        const validResult = classifyDocument(validText, validMeta);
        expect(validResult.documentType).toBe('tax_notice');

        // Case 2: Keywords but NO Section -> Invalid (likely legal payment or unknown)
        const invalidText = "This is a generic NOTICE regarding INCOME TAX general info.";
        const invalidMeta = mockMeta({ sections: [] });
        const invalidResult = classifyDocument(invalidText, invalidMeta);

        // Should NOT be tax_notice because score is penalized (-100)
        expect(invalidResult.documentType).not.toBe('tax_notice');
    });

    test('Should identify Legal Payment Notice accurately', () => {
        const text = "This is a FINAL NOTICE for RECOVERY OF DUES amounting to $5000. Failure to pay will lead to legal action.";
        const result = classifyDocument(text, mockMeta());
        expect(result.documentType).toBe('legal_payment_notice');
    });

    test('Should identify Rent Agreement', () => {
        const text = "This LEASE AGREEMENT is made between LESSOR and LESSEE for the PREMISES.";
        const result = classifyDocument(text, mockMeta());
        expect(result.documentType).toBe('rent_agreement');
    });

    test('Should fallback to Unknown for gibberish', () => {
        const text = "foobar baz qux hello world";
        const result = classifyDocument(text, mockMeta());
        expect(result.documentType).toBe('unknown');
    });

    test('Should detect Mixed Document (Employment + Rent)', () => {
        // Construct text to have closer scores
        // Employment: OFFER LETTER (10) + REMUNERATION (5) = 15
        // Rent: RENT AGREEMENT (15) = 15
        const text = `
            OFFER LETTER REMUNERATION
            ... also ...
            RENT AGREEMENT
        `;
        const result = classifyDocument(text, mockMeta());

        // Should trigger mixed flag because both have significant keywords
        expect(result.mixed).toBe(true);
        // Scores should be close
        const empScore = result.scores['employment_offer'];
        const rentScore = result.scores['rent_agreement'];
        expect(Math.abs(empScore - rentScore)).toBeLessThan(10); // Check if close enough to trigger logic
    });

});
