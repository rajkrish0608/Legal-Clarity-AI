import { determineSeverity, detectContractRisks } from '@/lib/analysis/rule-engine';
import { Metadata } from '@/types/legal-response';
import { describe, it, expect } from 'vitest';

describe('Rule Engine', () => {
    describe('Government Notices', () => {
        it('should classify Section 156 as HIGH severity', () => {
            const metadata: Metadata = {
                dates: [], amounts: [], keywords: [],
                sections: ['156'], hasDemand: true
            };
            const severity = determineSeverity(metadata);
            expect(severity.level).toBe('High');
        });

        it('should classify Section 143(1) without demand as LOW severity', () => {
            const metadata: Metadata = {
                dates: [], amounts: [], keywords: [],
                sections: ['143(1)'], hasDemand: false
            };
            const severity = determineSeverity(metadata);
            expect(severity.level).toBe('Low');
        });
    });

    describe('Contracts', () => {
        it('should detect Lock-in Period', () => {
            const text = "The employee agrees to a lock-in period of 2 years.";
            const risks = detectContractRisks(text);
            expect(risks.some(r => r.risk.includes('Lock-in'))).toBe(true);
        });

        it('should detect One-sided Termination', () => {
            const text = "The Company may terminate this agreement at any time. The Employee cannot terminate.";
            const risks = detectContractRisks(text);
            expect(risks.some(r => r.risk.includes('One-sided'))).toBe(true);
        });
    });
});
