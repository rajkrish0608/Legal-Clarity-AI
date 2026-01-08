import { LegalResponse } from '@/types/legal-response';

export const MOCK_FIXTURES: Record<string, LegalResponse> = {
    NOTICE_LOW_SEVERITY: {
        summary: "This is a routine intimation from the Income Tax Department regarding your tax return processing.",
        why_received: "You may have received this because the department has finished processing your tax return for the year.",
        severity: {
            level: "Low",
            reason: "This is typically an informational notice (Section 143(1)) confirming your return was processed."
        },
        hidden_risks: [],
        what_to_do_next: [
            "You may want to verify the details match your records.",
            "Consider keeping this document for your files."
        ],
        important_dates: ["2023-11-15"],
        disclaimer: "This explanation is for informational purposes only and does not constitute legal advice. For specific guidance on your situation, please consult with a qualified legal professional or tax advisor."
    },
    NOTICE_HIGH_SEVERITY: {
        summary: "This appears to be a Notice of Demand under Section 156, indicating an outstanding tax amount.",
        why_received: "You typically receive this when the tax department calculates a discrepancy resulting in tax due.",
        severity: {
            level: "High",
            reason: "This suggests a demand for payment has been raised."
        },
        hidden_risks: [
            {
                risk: "Interest Accumulation",
                explanation: "Delaying payment often leads to additional interest charges.",
                impact: "The amount due could increase over time."
            }
        ],
        what_to_do_next: [
            "You should consider reviewing the calculation details carefully.",
            "You may want to consult a tax professional immediately."
        ],
        important_dates: ["2024-01-30"],
        disclaimer: "This explanation is for informational purposes only and does not constitute legal advice. For specific guidance on your situation, please consult with a qualified legal professional or tax advisor."
    },
    CONTRACT_RISKY: {
        summary: "This is an employment contract offering a position.",
        why_received: "You received this as a formal job offer.",
        severity: {
            level: "Medium",
            reason: "The contract contains lock-in clauses."
        },
        hidden_risks: [
            {
                risk: "Lock-in Period",
                explanation: "There is a clause binding you for 2 years.",
                impact: "Leaving early might result in financial penalties."
            },
            {
                risk: "Long Notice Period",
                explanation: "The notice period is 3 months.",
                impact: "This could make switching jobs in the future harder."
            }
        ],
        what_to_do_next: [
            "You might want to ask if the lock-in period is negotiable.",
            "Consider understanding the exit penalties clearly."
        ],
        important_dates: [],
        disclaimer: "This explanation is for informational purposes only and does not constitute legal advice. For specific guidance on your situation, please consult with a qualified legal professional or tax advisor."
    },
    CONTRACT_SAFE: {
        summary: "This is a standard Non-Disclosure Agreement (NDA).",
        why_received: "You are being asked to keep certain information confidential.",
        severity: {
            level: "Low",
            reason: "The terms appear standard for an NDA."
        },
        hidden_risks: [],
        what_to_do_next: [
            "Read the definition of 'Confidential Information' carefully.",
            "Understand the duration of the obligation."
        ],
        important_dates: [],
        disclaimer: "This explanation is for informational purposes only and does not constitute legal advice. For specific guidance on your situation, please consult with a qualified legal professional or tax advisor."
    },
    LEGAL_PAYMENT_NOTICE_FIXTURE: {
        summary: "This appears to be a legal notice regarding outstanding payments or dues.",
        why_received: "You likely received this because a service provider or entity claims payment is pending.",
        severity: {
            level: "Medium",
            reason: "Non-payment of legitimate dues can lead to legal complications."
        },
        hidden_risks: [
            {
                risk: "Legal Action",
                explanation: "If ignored, this could escalate to court proceedings.",
                impact: "Potential legal fees and credit score impact."
            }
        ],
        what_to_do_next: [
            "Verify if the claim and amount are correct.",
            "Contact the sender to discuss a resolution."
        ],
        important_dates: [], // Will be filled from text extraction
        disclaimer: "This explanation is for informational purposes only and does not constitute legal advice. For specific guidance on your situation, please consult with a qualified legal professional."
    },
    GENERIC_UNKNOWN: {
        summary: "We could not automatically identify the type of this document.",
        why_received: "The document structure didn't match our standard government notice or contract templates.",
        severity: {
            level: "Low",
            reason: "No specific high-severity keywords (like 'Demand' or 'Termination') were found."
        },
        hidden_risks: [],
        what_to_do_next: [
            "Review the document manually to understand its purpose.",
            "If it is a legal notice, consult a professional."
        ],
        important_dates: [],
        disclaimer: "This explanation is for informational purposes only and does not constitute legal advice."
    },
    UNSAFE_TEST: {
        summary: "You MUST pay this illegal fine immediately or you will go to jail.",
        why_received: "Because you are guilty.",
        severity: {
            level: "High",
            reason: "You are in trouble."
        },
        hidden_risks: [],
        what_to_do_next: ["Pay now!"],
        important_dates: [],
        disclaimer: "" // Intentionally empty for safety test
    }
};
