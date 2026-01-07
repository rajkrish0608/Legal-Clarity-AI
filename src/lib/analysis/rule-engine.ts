import { Metadata, Severity, HiddenRisk } from '@/types/legal-response';

// --- Government Notice Rules ---

export function determineSeverity(metadata: Metadata): Severity {
    // HIGH Severity Rules
    if (metadata.hasDemand) {
        return {
            level: 'High',
            reason: 'The document mentions a demand or outstanding payment, which typically requires immediate attention.'
        };
    }

    if (metadata.sections.some(s => s === '156' || s.includes('148'))) {
        return {
            level: 'High',
            reason: 'Section 156 (Notice of Demand) or Section 148 (Income Escaping Assessment) are serious notices.'
        };
    }

    // LOW Severity Rules
    if (metadata.sections.some(s => s.includes('143(1)')) && !metadata.hasDemand) {
        return {
            level: 'Low',
            reason: 'Section 143(1) is typically an intimation of processing the return and is routine unless there is a demand.'
        };
    }

    // DEFAULT Medium
    return {
        level: 'Medium',
        reason: 'The severity is not immediately clear from standard rules, so it is treated as Medium precautionarily.'
    };
}

// --- Contract Risk Rules ---

export function detectContractRisks(text: string): HiddenRisk[] {
    const risks: HiddenRisk[] = [];
    const lowerText = text.toLowerCase();

    // Lock-in Period
    if (lowerText.includes('lock-in') || lowerText.includes('lock in')) {
        risks.push({
            risk: 'Lock-in Period Detected',
            explanation: 'The contract mentions a lock-in period.',
            impact: 'You may be unable to leave this agreement for a fixed time without paying a penalty.'
        });
    }

    // One-sided Termination
    if (lowerText.includes('company may terminate') && !lowerText.includes('employee may terminate') && !lowerText.includes('you may terminate')) {
        risks.push({
            risk: 'One-sided Termination',
            explanation: 'It appears the company can terminate the agreement more easily than you can.',
            impact: 'This creates an imbalance in job security.'
        });
    }

    // Notice Period > 2 months
    if (/notice period.*(?:3|three|90|ninety)\s*(?:months?|days)/i.test(text)) {
        risks.push({
            risk: 'Long Notice Period',
            explanation: 'The notice period appears to be 3 months (90 days).',
            impact: 'A long notice period can make it difficult to switch jobs quickly.'
        });
    }

    // Non-Compete
    if (lowerText.includes('non-compete') || lowerText.includes('restraint of trade')) {
        risks.push({
            risk: 'Non-Compete Clause',
            explanation: 'There are restrictions on working for competitors after leaving.',
            impact: 'This may limit your future job opportunities in the same industry.'
        });
    }

    return risks;
}
