import { describe, it, expect, vi } from 'vitest';
import { generateExplanation } from '../lib/analysis/explanation-generator';
import { selectExplanationTemplate } from '../lib/analysis/explanation-templates';
import { MOCK_FIXTURES } from '../lib/mock-data/fixtures';

// Mock dependencies
vi.mock('openai', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            chat: {
                completions: {
                    create: vi.fn().mockResolvedValue({
                        choices: [{
                            message: {
                                content: JSON.stringify({
                                    summary: "Mock AI Response",
                                    why_received: "Testing",
                                    severity: { level: "Low", reason: "None" },
                                    hidden_risks: [],
                                    what_to_do_next: ["Relax"],
                                    disclaimer: "Legal advice.",
                                    important_dates: []
                                })
                            }
                        }]
                    })
                }
            }
        }))
    };
});

describe('Explanation Routing Strictness', () => {

    it('should strictly use Employment Offer template for "employment_offer" even if text contains "NDA"', () => {
        const template = selectExplanationTemplate('employment_offer');
        expect(template).toContain('analyzing an EMPLOYMENT OFFER');
        expect(template).toContain('NOT as a standalone NDA');
    });

    it('should strictly use NDA template for "nda"', () => {
        const template = selectExplanationTemplate('nda');
        expect(template).toContain('analyzing a NON-DISCLOSURE AGREEMENT');
        expect(template).toContain('DO NOT treat this as an employment offer');
    });

    it('MOCK PATH: should strictly return Safe Contract for employment_offer even with risky keywords', async () => {
        // Force mock mode via environmental assumption or just testing the mock logic directly if exported
        // Since generateExplanation checks process.env.NEXT_PUBLIC_USE_MOCK_LLM, we can rely on it being 'true' by default or mock it

        // This test assumes typical behavior where we might fall back to mock or force it.
        // Let's rely on the fact that if we use specific keywords in text, the OLD logic would trigger "Risky".

        process.env.NEXT_PUBLIC_USE_MOCK_LLM = 'true'; // Force into mock path

        const result = await generateExplanation(
            "This is a job offer but it mentions NDA and LOCK-IN and BOND which are scary.",
            { dates: [], amounts: [], sections: [], keywords: [], hasDemand: false },
            'employment_offer',
            { level: 'High', reason: 'Panic' }, // Input severity
            [],
            { detailed_type: 'employment_offer', confidence: 90, is_mixed: false }
        );

        // Under strict routing, Employment Offer -> CONTRACT_SAFE (with maybe specific summary)
        // It should NOT be CONTRACT_RISKY (which has "High Risk Contract" summary usually)

        expect(result.summary).toContain("Employment Offer");
        // Verify it didn't switch to Risky despite "LOCK-IN"
        expect(result.hidden_risks.some(r => r.risk === "Unfair Lock-in Period")).toBe(false);
        // Note: The fixture MOCK_FIXTURES.CONTRACT_RISKY usually has lock-in risks. 
        // If the new logic is strict, it ignores the text "LOCK-IN" for determining the BASE fixture.
    });

    it('MOCK PATH: should strictly return Risky Contract for NDA', async () => {
        process.env.NEXT_PUBLIC_USE_MOCK_LLM = 'true';

        const result = await generateExplanation(
            "This is a standard NDA.",
            { dates: [], amounts: [], sections: [], keywords: [], hasDemand: false },
            'nda',
            { level: 'Low', reason: 'Safe' },
            [],
            { detailed_type: 'nda', confidence: 95, is_mixed: false }
        );

        expect(result.summary).toContain("Non-Disclosure Agreement");
        // NDA should map to Risky base
        // We check if it pulled the risky base. 
        // Assuming MOCK_FIXTURES.CONTRACT_RISKY has some standard risks or we can check other properties.
        // In the code, NDA -> CONTRACT_RISKY.

        // Let's assert on something specific to the risky fixture if possible, or just the summary overrides we added.
        expect(result.summary).toBe("This is a Non-Disclosure Agreement (NDA).");
    });
});
