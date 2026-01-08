import { DocumentType, Metadata, ClassificationResult } from '@/types/legal-response';
import { CLASSIFIER_KNOWLEDGE, DetailedDocumentType } from './classifier-knowledge';

export function classifyDocument(text: string, metadata: Metadata): ClassificationResult {
    const upperText = text.toUpperCase();
    const scores: Record<string, number> = {};

    // 1. Calculate Scores for each known type
    CLASSIFIER_KNOWLEDGE.forEach(rule => {
        let score = 0;
        let disqualifierFound = false;

        // Check Disqualifiers
        if (rule.disqualifiers) {
            if (rule.disqualifiers.some(d => upperText.includes(d.toUpperCase()))) {
                disqualifierFound = true;
            }
        }

        if (!disqualifierFound) {
            // Check Required Sections (Specific for Tax)
            if (rule.requiredSections) {
                const hasRequired = rule.requiredSections.some(sec =>
                    upperText.includes(sec.toUpperCase()) ||
                    metadata.sections.some(ms => ms.toUpperCase().includes(sec.toUpperCase()))
                );
                if (!hasRequired && rule.type === 'TAX_NOTICE') {
                    // Tax notice MUST have sections. If not, score is penalized heavily.
                    score = -100;
                }
            }

            // Sum Weights
            if (score !== -100) {
                rule.keywords.forEach(kw => {
                    if (upperText.includes(kw.text.toUpperCase())) {
                        score += kw.weight;
                    }
                });
            }
        }

        scores[rule.type] = Math.max(0, score);
    });

    // 2. Sort Scoring
    const sortedScores = Object.entries(scores)
        .sort(([, a], [, b]) => b - a);

    const topMatch = sortedScores[0];
    const secondMatch = sortedScores[1];

    const topScore = topMatch ? topMatch[1] : 0;
    const secondScore = secondMatch ? secondMatch[1] : 0;
    let detectedType = (topMatch ? topMatch[0] : 'UNKNOWN') as DocumentType;

    // 3. Threshold Check
    if (topScore === 0) {
        detectedType = 'unknown';
    }

    // 4. Calculate Confidence (Relative)
    // Formula: Top / (Top + Second) * 100. If Second is 0, Top is 100%.
    let confidence = 0;
    if (topScore > 0) {
        if (secondScore === 0) {
            confidence = 100;
        } else {
            confidence = Math.round((topScore / (topScore + secondScore)) * 100);
        }
    }

    // 5. Mixed Document Detection
    // Conditions: Confidence < 65 OR Score Diff < 3 (if both substantial)
    let isMixed = false;
    if (topScore > 5 && secondScore > 5) { // Only check if we have two competitors
        if (confidence < 65 || (topScore - secondScore < 3)) {
            isMixed = true;
        }
    }

    // Fallback Legacy Mappings (if needed, but our Types match mostly now)
    // ensure detectedType matches DocumentType union

    return {
        documentType: detectedType,
        confidence,
        mixed: isMixed,
        scores
    };
}
