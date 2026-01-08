export type DetailedDocumentType =
    | 'EMPLOYMENT_OFFER'
    | 'NDA'
    | 'LEGAL_PAYMENT_NOTICE'
    | 'TAX_NOTICE'
    | 'GENERAL_CONTRACT'
    | 'RENT_AGREEMENT'
    | 'TERMINATION_NOTICE'
    | 'UNKNOWN';

interface KeywordRule {
    text: string;
    weight: number;
}

interface ClassificationRule {
    type: DetailedDocumentType;
    keywords: KeywordRule[];
    requiredSections?: string[]; // For Tax Notice
    disqualifiers?: string[]; // If these exist, reduce score or disqualify
}

export const CLASSIFIER_KNOWLEDGE: ClassificationRule[] = [
    {
        type: 'EMPLOYMENT_OFFER',
        keywords: [
            { text: 'OFFER LETTER', weight: 10 },
            { text: 'REMUNERATION', weight: 5 },
            { text: 'JOINING DATE', weight: 5 },
            { text: 'CTC', weight: 5 },
            { text: 'ANNUAL SALARY', weight: 5 },
            { text: 'PROBATION PERIOD', weight: 3 },
            { text: 'APPOINTMENT LETTER', weight: 8 },
            { text: 'EMPLOYMENT AGREEMENT', weight: 8 } // Can overlap with contract, but higher weight here if it's an offer
        ]
    },
    {
        type: 'NDA',
        keywords: [
            { text: 'NON-DISCLOSURE AGREEMENT', weight: 15 },
            { text: 'CONFIDENTIALITY AGREEMENT', weight: 15 },
            { text: 'CONFIDENTIAL INFORMATION', weight: 5 },
            { text: 'RECEIVING PARTY', weight: 3 },
            { text: 'DISCLOSING PARTY', weight: 3 }
        ]
    },
    {
        type: 'LEGAL_PAYMENT_NOTICE',
        keywords: [
            { text: 'LEGAL NOTICE', weight: 10 },
            { text: 'OUTSTANDING PAYMENT', weight: 8 },
            { text: 'RECOVERY OF DUES', weight: 8 },
            { text: 'DEMAND NOTICE', weight: 7 }, // Can overlap with tax, but context matters
            { text: 'FINAL NOTICE', weight: 6 },
            { text: 'DISHONOUR OF CHEQUE', weight: 8 },
            { text: 'SECTION 138', weight: 8 }
        ],
        disqualifiers: ['INCOME TAX', 'GST']
    },
    {
        type: 'TAX_NOTICE',
        keywords: [
            { text: 'INCOME TAX', weight: 10 },
            { text: 'DEPARTMENT OF REVENUE', weight: 5 },
            { text: 'ASSESSMENT YEAR', weight: 5 },
            { text: 'NOTICE OF DEMAND', weight: 5 }, // Specific phrase
            { text: 'INTIMATION', weight: 5 },
            { text: 'DEFECTIVE RETURN', weight: 5 }
        ],
        requiredSections: ['143', '156', '142(1)', '148', '245']
    },
    {
        type: 'RENT_AGREEMENT',
        keywords: [
            { text: 'RENT AGREEMENT', weight: 15 },
            { text: 'LEASE AGREEMENT', weight: 10 },
            { text: 'LICENSOR', weight: 5 },
            { text: 'LICENSEE', weight: 5 },
            { text: 'LESSOR', weight: 5 },
            { text: 'LESSEE', weight: 5 },
            { text: 'PREMISES', weight: 3 },
            { text: 'SECURITY DEPOSIT', weight: 3 }
        ]
    },
    {
        type: 'TERMINATION_NOTICE',
        keywords: [
            { text: 'TERMINATION OF EMPLOYMENT', weight: 15 },
            { text: 'RELIEVING LETTER', weight: 10 },
            { text: 'NOTICE PERIOD', weight: 5 },
            { text: 'RESIGNATION ACCEPTANCE', weight: 8 },
            { text: 'FULL AND FINAL', weight: 5 }
        ]
    },
    {
        type: 'GENERAL_CONTRACT',
        keywords: [
            { text: 'AGREEMENT', weight: 3 }, // Low weight as generic
            { text: 'BY AND BETWEEN', weight: 5 },
            { text: 'WHEREAS', weight: 2 },
            { text: 'IN WITNESS WHEREOF', weight: 3 },
            { text: 'GOVERNING LAW', weight: 2 },
            { text: 'JURISDICTION', weight: 2 }
        ]
    }
];
