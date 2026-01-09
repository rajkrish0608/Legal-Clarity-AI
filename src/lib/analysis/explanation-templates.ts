import { DocumentType } from '@/types/legal-response';

export const EXPLANATION_TEMPLATES: Record<DocumentType, string> = {
    employment_offer: `
    You are analyzing an EMPLOYMENT OFFER / JOB CONTRACT.
    Focus on: Salary, Benefits, Start Date, Termination notices, and Non-Compete clauses.
    If the document mentions "NDA" or "Confidentiality", treat it as a clause WITHIN the employment offer, NOT as a standalone NDA.
    Your output must reflect that this is a detailed job offer.
    `,
    nda: `
    You are analyzing a NON-DISCLOSURE AGREEMENT (NDA).
    Focus on: What is confidential, Duration of confidentiality, Exclusions, and Penalties for breach.
    DO NOT treat this as an employment offer even if it mentions "employment". It is primarily a confidentiality agreement.
    `,
    legal_payment_notice: `
    You are analyzing a LEGAL PAYMENT NOTICE / IMPENDING LAWSUIT NOTICE.
    Focus on: Amount demanded, Deadline to pay, Consequences of non-payment, and Statutes cited (e.g., Section 138).
    This is URGENT. Mark severity appropriately.
    `,
    tax_notice: `
    You are analyzing a TAX NOTICE (Income Tax / GST).
    Focus on: Assessment Year, Demand Amount (if any), Section Code (e.g., 143(1), 142(1), 156), and Appeal deadlines.
    Explain the specific tax section clearly.
    `,
    rent_agreement: `
    You are analyzing a RENT / LEASE AGREEMENT.
    Focus on: Monthly Rent, Security Deposit, Notice Period, Lock-in Period, and Maintenance responsibilities.
    `,
    general_contract: `
    You are analyzing a GENERAL BUSINESS OR SERVICE CONTRACT.
    Focus on: Deliverables, Payment Terms, Termination clauses, and Liability caps.
    `,
    termination_notice: `
    You are analyzing a TERMINATION / RESIGNATION ACCEPTANCE NOTICE.
    Focus on: Last working day, Settlement details, Reason for termination (if stated), and Post-exit obligations.
    `,
    government_notice: `
    You are analyzing a GENERAL GOVERNMENT NOTICE.
    Focus on: Issuing Authority, Date of Issue, Compliance requirements, and Deadlines.
    `,
    contract: `
    You are analyzing a GENERAL LEGAL CONTRACT.
    Focus on: Obligations, Rights, Termination clauses, and Liability.
    `,
    unknown: `
    You are analyzing a LEGAL DOCUMENT of UNCERTAIN TYPE.
    Provide a general summary of the obligations, rights, and any deadlines mentioned.
    Advise the user to consult a professional if the document seems critical.
    `
};

export function selectExplanationTemplate(docType: DocumentType): string {
    const template = EXPLANATION_TEMPLATES[docType];
    if (!template) {
        console.warn(`No template found for docType: ${docType}, calling generic fallback.`);
        return EXPLANATION_TEMPLATES['unknown'];
    }
    return template;
}
