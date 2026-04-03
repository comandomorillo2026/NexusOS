// ============================================
// LEGAL PROMPT TEMPLATES FOR TRINIDAD & TOBAGO
// ============================================

export const LEGAL_SYSTEM_CONTEXT = `
You are a legal AI assistant specialized in Trinidad & Tobago law. You have knowledge of:

**Legal System:**
- Common Law system based on English law
- Supreme Court of Judicature (High Court and Court of Appeal)
- Magistrates' Courts for minor civil and criminal matters
- Privy Council as final appellate court

**Key Legislation:**
- Constitution of the Republic of Trinidad and Tobago
- Civil Procedure Rules 2016 (CPR)
- Companies Act Chapter 81:01
- Conveyancing and Law of Property Act
- Matrimonial Proceedings and Property Act
- Children Act
- Employment Act
- Occupational Safety and Health Act
- Data Protection Act

**Document Standards:**
- Formal legal language with archaic terminology accepted
- Clear structure with numbered clauses
- Proper citations and references
- Witness and attestation requirements
- Court filing requirements per CPR 2016

Always provide professional, accurate legal assistance while noting you are an AI assistant and recommending consultation with a qualified attorney for specific legal matters.
`;

// Contract Templates
export const CONTRACT_TEMPLATES = {
  employmentContract: {
    name: "Employment Contract",
    description: "Standard employment agreement for Trinidad & Tobago",
    template: `
EMPLOYMENT CONTRACT

This Employment Contract is made on [DATE] between:

EMPLOYER: [COMPANY NAME], a company incorporated under the laws of Trinidad and Tobago, having its registered office at [ADDRESS] (hereinafter referred to as "the Employer");

AND

EMPLOYEE: [EMPLOYEE NAME], of [ADDRESS], holder of National Identification Card No. [ID NUMBER] (hereinafter referred to as "the Employee");

WHEREAS the Employer desires to employ the Employee and the Employee desires to accept such employment;

NOW THEREFORE the parties agree as follows:

1. POSITION AND DUTIES
   1.1 The Employer hereby employs the Employee in the position of [POSITION] with duties as set out in Schedule A.
   1.2 The Employee shall report to [SUPERVISOR/DEPARTMENT].
   1.3 The Employee agrees to perform all duties faithfully and to the best of their ability.

2. TERM OF EMPLOYMENT
   2.1 This Contract shall commence on [START DATE].
   2.2 The initial probationary period shall be [3 MONTHS/6 MONTHS].
   2.3 Upon successful completion of probation, employment shall continue until terminated in accordance with this Contract.

3. REMUNERATION
   3.1 The Employee shall receive a monthly salary of TT$ [AMOUNT], payable [WEEKLY/MONTHLY].
   3.2 Salary shall be subject to statutory deductions including PAYE, NIS, and Health Surcharge.
   3.3 The Employee shall be entitled to annual salary reviews at the Employer's discretion.

4. HOURS OF WORK
   4.1 Normal working hours shall be [HOURS] per week, [DAYS].
   4.2 Overtime shall be compensated in accordance with the Minimum Wages Act.

5. LEAVE ENTITLEMENT
   5.1 Annual Leave: [14] working days per year after one year of service.
   5.2 Sick Leave: [14] working days per year with full pay.
   5.3 Maternity Leave: As per the Maternity Protection Act.

6. TERMINATION
   6.1 Either party may terminate this Contract by giving [NOTICE PERIOD] written notice.
   6.2 The Employer may terminate without notice for cause including gross misconduct.
   6.3 Upon termination, the Employee shall return all Company property.

7. CONFIDENTIALITY
   7.1 The Employee shall not disclose any confidential information during or after employment.
   7.2 This obligation shall survive termination of employment.

8. NON-COMPETITION
   8.1 For a period of [TIME] after termination, the Employee shall not engage in competing business within [GEOGRAPHIC AREA].

9. GOVERNING LAW
   This Contract shall be governed by the laws of Trinidad and Tobago.

IN WITNESS WHEREOF, the parties have executed this Contract on the date first written above.

_________________________
EMPLOYER

_________________________
EMPLOYEE

WITNESSED BY:

Name: ___________________
Address: ________________
_________________________
Signature

Date: ___________________
`,
  },

  leaseAgreement: {
    name: "Lease Agreement",
    description: "Residential/commercial property lease for T&T",
    template: `
LEASE AGREEMENT

This Lease Agreement is made on [DATE] between:

LANDLORD: [NAME], of [ADDRESS] (hereinafter referred to as "the Landlord");

AND

TENANT: [NAME], of [ADDRESS] (hereinafter referred to as "the Tenant");

PROPERTY: [FULL PROPERTY ADDRESS], Trinidad and Tobago (hereinafter referred to as "the Demised Premises");

NOW THEREFORE the parties agree as follows:

1. DEMISE
   1.1 The Landlord agrees to let and the Tenant agrees to rent the Demised Premises for the term and at the rent hereinafter specified.

2. TERM
   2.1 The term of this Lease shall be for [DURATION] commencing on [START DATE] and ending on [END DATE].
   2.2 The Tenant shall have the option to renew for a further term of [DURATION] upon giving [NOTICE PERIOD] written notice.

3. RENT
   3.1 The monthly rent shall be TT$ [AMOUNT], payable in advance on the [DAY] day of each month.
   3.2 Rent shall be paid to [BANK ACCOUNT DETAILS/CASH/OTHER].
   3.3 A security deposit of TT$ [AMOUNT] equivalent to [ONE/TWO] months' rent shall be paid upon signing.

4. SECURITY DEPOSIT
   4.1 The security deposit shall be held as security for performance of the Tenant's obligations.
   4.2 The deposit shall be returned within [14/30] days of termination, less any deductions for damages or arrears.

5. USE OF PREMISES
   5.1 The Demised Premises shall be used solely for [RESIDENTIAL/COMMERCIAL] purposes.
   5.2 The Tenant shall not make any alterations without the Landlord's prior written consent.

6. UTILITIES AND SERVICES
   6.1 The Tenant shall be responsible for payment of [ELECTRICITY, WATER, INTERNET, ETC.].
   6.2 The Landlord shall be responsible for [PROPERTY TAX, INSURANCE, ETC.].

7. REPAIRS AND MAINTENANCE
   7.1 The Landlord shall maintain the structural elements of the Demised Premises.
   7.2 The Tenant shall maintain the interior in good condition and repair.

8. QUIET ENJOYMENT
   The Tenant shall have quiet enjoyment of the Demised Premises during the term.

9. ASSIGNMENT AND SUBLETTING
   The Tenant shall not assign this Lease or sublet without the Landlord's prior written consent.

10. TERMINATION
    10.1 Either party may terminate by giving [NOTICE PERIOD] written notice.
    10.2 The Landlord may terminate for breach by the Tenant upon [NOTICE PERIOD] notice.

11. GOVERNING LAW
    This Lease shall be governed by the laws of Trinidad and Tobago.

IN WITNESS WHEREOF, the parties have executed this Lease on the date first written above.

_________________________
LANDLORD

_________________________
TENANT

WITNESSED BY:

Name: ___________________
Address: ________________
_________________________
Signature
`,
  },

  serviceAgreement: {
    name: "Service Agreement",
    description: "Professional services contract for T&T businesses",
    template: `
PROFESSIONAL SERVICES AGREEMENT

This Agreement is made on [DATE] between:

CLIENT: [NAME/COMPANY], of [ADDRESS] (hereinafter referred to as "the Client");

AND

PROVIDER: [NAME/COMPANY], of [ADDRESS] (hereinafter referred to as "the Service Provider");

WHEREAS the Client requires certain professional services and the Service Provider agrees to provide such services;

NOW THEREFORE the parties agree as follows:

1. SCOPE OF SERVICES
   1.1 The Service Provider shall provide the following services: [DETAILED DESCRIPTION].
   1.2 Any additional services shall require written agreement and additional compensation.

2. TERM
   2.1 This Agreement shall commence on [START DATE] and continue until [END DATE] or completion of services.
   2.2 Either party may terminate upon [NOTICE PERIOD] written notice.

3. COMPENSATION
   3.1 The Client shall pay the Service Provider [HOURLY RATE/FIXED FEE] of TT$ [AMOUNT].
   3.2 Payment shall be made [WEEKLY/MONTHLY/UPON COMPLETION].
   3.3 Invoices shall be submitted [WEEKLY/MONTHLY] and payment is due within [DAYS] days.

4. PERFORMANCE STANDARDS
   4.1 The Service Provider shall perform services in a professional and workmanlike manner.
   4.2 The Service Provider shall comply with all applicable laws and regulations.

5. INDEPENDENT CONTRACTOR
   5.1 The Service Provider is an independent contractor and not an employee.
   5.2 The Service Provider shall be responsible for all taxes and statutory contributions.

6. CONFIDENTIALITY
   6.1 Each party shall maintain the confidentiality of the other's proprietary information.
   6.2 This obligation shall survive termination for a period of [YEARS] years.

7. INTELLECTUAL PROPERTY
   7.1 Work product created under this Agreement shall belong to the Client.
   7.2 The Service Provider retains rights to pre-existing intellectual property.

8. LIMITATION OF LIABILITY
   The Service Provider's liability shall be limited to [AMOUNT] or the fees paid under this Agreement.

9. GOVERNING LAW
   This Agreement shall be governed by the laws of Trinidad and Tobago.

IN WITNESS WHEREOF, the parties have executed this Agreement.

_________________________
CLIENT

_________________________
SERVICE PROVIDER
`,
  },

  nda: {
    name: "Non-Disclosure Agreement",
    description: "Confidentiality agreement for T&T",
    template: `
NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement is made on [DATE] between:

DISCLOSING PARTY: [NAME/COMPANY], of [ADDRESS] (hereinafter referred to as "the Disclosing Party");

AND

RECEIVING PARTY: [NAME/COMPANY], of [ADDRESS] (hereinafter referred to as "the Receiving Party");

WHEREAS the Disclosing Party possesses certain confidential information and the Receiving Party desires to receive such information for [PURPOSE];

NOW THEREFORE the parties agree as follows:

1. DEFINITION OF CONFIDENTIAL INFORMATION
   "Confidential Information" means all information disclosed by the Disclosing Party, including but not limited to:
   - Trade secrets, business plans, and strategies
   - Financial information, pricing, and costs
   - Technical data, processes, and procedures
   - Customer and supplier information
   - Any information marked "Confidential"

2. OBLIGATIONS OF RECEIVING PARTY
   2.1 The Receiving Party shall:
       (a) Maintain strict confidentiality of the Confidential Information
       (b) Use the Confidential Information solely for the Purpose
       (c) Not disclose the Confidential Information to third parties
       (d) Protect the Confidential Information with the same degree of care as its own

3. EXCLUSIONS
   Confidential Information does not include information that:
   (a) Is or becomes publicly available through no fault of the Receiving Party
   (b) Was in the Receiving Party's possession prior to disclosure
   (c) Is independently developed by the Receiving Party
   (d) Is disclosed with the Disclosing Party's prior written consent

4. TERM
   4.1 This Agreement shall remain in effect for [DURATION] from the date of signing.
   4.2 The confidentiality obligations shall survive for [YEARS] years after termination.

5. RETURN OF INFORMATION
   Upon request, the Receiving Party shall return or destroy all Confidential Information.

6. REMEDIES
   The Disclosing Party shall be entitled to injunctive relief for any breach of this Agreement.

7. GOVERNING LAW
   This Agreement shall be governed by the laws of Trinidad and Tobago.

IN WITNESS WHEREOF, the parties have executed this Agreement.

_________________________
DISCLOSING PARTY

_________________________
RECEIVING PARTY
`,
  },
};

// Court Motion Templates
export const MOTION_TEMPLATES = {
  noticeOfMotion: {
    name: "Notice of Motion",
    description: "Standard notice of motion for civil proceedings",
    template: `
IN THE HIGH COURT OF JUSTICE
[DIVISION] DIVISION
Claim No. [NUMBER] of [YEAR]

BETWEEN:

[CLAIMANT NAME]
Claimant

and

[DEFENDANT NAME]
Defendant

_________________________________________

NOTICE OF MOTION

_________________________________________

TAKE NOTICE that on [DAY] the [DATE] at [TIME] or so soon thereafter as counsel may be heard, an application will be made on behalf of the [APPLICANT] for the following relief:

1. [RELIEF SOUGHT - e.g., An order that...]

2. [ADDITIONAL RELIEF]

3. Such further or other relief as the Court deems just.

AND TAKE NOTICE that the grounds upon which this application is made are as follows:

1. [GROUND 1]

2. [GROUND 2]

3. [ADDITIONAL GROUNDS]

AND TAKE NOTICE that this application is supported by the [AFFIDAVIT/EXHIBITS] of [NAME] filed herewith.

AND TAKE NOTICE that the Applicant will rely on the following:
- [DOCUMENT 1]
- [DOCUMENT 2]

Dated this [DAY] day of [MONTH], [YEAR].

_________________________
[ATTORNEY NAME]
Attorney for the [APPLICANT]
Address: [LAW FIRM ADDRESS]
Tel: [PHONE NUMBER]
Email: [EMAIL]

TO: [RESPONDENT/ATTORNEY]
Address: [ADDRESS]

_________________________________________
`,
  },

  affidavitInSupport: {
    name: "Affidavit in Support",
    description: "Supporting affidavit for court applications",
    template: `
IN THE HIGH COURT OF JUSTICE
[DIVISION] DIVISION
Claim No. [NUMBER] of [YEAR]

BETWEEN:

[CLAIMANT NAME]
Claimant

and

[DEFENDANT NAME]
Defendant

_________________________________________

AFFIDAVIT OF [DEPONENT NAME]

_________________________________________

I, [FULL NAME], of [ADDRESS], in the Island of Trinidad and Tobago, [OCCUPATION], make oath and say as follows:

1. I am the [POSITION/RELATIONSHIP TO CASE] and am authorized to make this affidavit on behalf of the [PARTY]. I have personal knowledge of the matters herein deposed to, except where stated otherwise.

2. The purpose of this affidavit is to support the Notice of Motion filed on [DATE] seeking [RELIEF].

3. On or about [DATE], [STATEMENT OF FACTS].

4. [ADDITIONAL FACTUAL STATEMENTS].

5. I verily believe that the [APPLICANT/RESPONDENT] has a good arguable case because [REASONS].

6. I am advised by Counsel and verily believe that [LEGAL BASIS].

7. The facts deposed to herein are true to the best of my knowledge, information, and belief.

SWORN to at Port of Spain )
this [DAY] day of        )
[MONTH], [YEAR]         )
                         )
_________________________ )
[DEPONENT NAME]

BEFORE ME:

_________________________
COMMISSIONER OF AFFIDAVITS
[NAME AND SEAL]

_________________________________________
`,
  },

  defense: {
    name: "Defense/Statement of Case",
    description: "Defense statement for civil claims",
    template: `
IN THE HIGH COURT OF JUSTICE
[DIVISION] DIVISION
Claim No. [NUMBER] of [YEAR]

BETWEEN:

[CLAIMANT NAME]
Claimant

and

[DEFENDANT NAME]
Defendant

_________________________________________

DEFENSE

_________________________________________

1.  The Defendant admits paragraph [NUMBER(S)] of the Statement of Case.

2.  The Defendant denies paragraph [NUMBER(S)] of the Statement of Case for the following reasons:
    (a) [REASON]
    (b) [REASON]

3.  The Defendant lacks knowledge or information to admit or deny paragraph [NUMBER(S)] and puts the Claimant to strict proof thereof.

4.  In further answer to the Claimant's case, the Defendant states:
    (a) [ADDITIONAL DEFENSE FACTS]
    (b) [ADDITIONAL DEFENSE FACTS]

5.  The Defendant contends that:
    (a) The Claimant's claim is statute-barred pursuant to [ACT/SECTION]
    (b) The Claimant failed to mitigate their loss
    (c) The Claimant contributed to their own loss

COUNTERCLAIM

6.  By way of Counterclaim, the Defendant claims against the Claimant:
    (a) [RELIEF]
    (b) [DAMAGES]

7.  The grounds for the Counterclaim are as follows:
    [FACTS SUPPORTING COUNTERCLAIM]

The Defendant therefore requests that:
(a) The Claimant's claim be dismissed with costs;
(b) Judgment be entered in favor of the Defendant on the Counterclaim;
(c) Such further or other relief as the Court deems just.

Dated this [DAY] day of [MONTH], [YEAR].

_________________________
[ATTORNEY NAME]
Attorney for the Defendant
Address: [LAW FIRM ADDRESS]
Tel: [PHONE NUMBER]
Email: [EMAIL]

TO: [CLAIMANT/ATTORNEY]
Address: [ADDRESS]

_________________________________________
`,
  },
};

// Legal Letter Templates
export const LETTER_TEMPLATES = {
  demandLetter: {
    name: "Demand Letter",
    description: "Pre-action demand letter for civil matters",
    template: `
[LETTERHEAD]

[DATE]

[RECIPIENT NAME]
[ADDRESS]
[TRINIDAD AND TOBAGO]

Dear Sir/Madam,

RE: DEMAND FOR [PAYMENT/PERFORMANCE/RELIEF]
OUR REF: [REFERENCE NUMBER]

We write on behalf of our client, [CLIENT NAME], in connection with the above-referenced matter.

1. BACKGROUND

Our client [DESCRIBE SITUATION AND BASIS FOR CLAIM].

2. THE CLAIM

Pursuant to [LEGAL BASIS], our client is entitled to:
(a) [RELIEF/AMOUNT]
(b) [INTEREST/ADDITIONAL RELIEF]

3. DEMAND

TAKE NOTICE that we hereby demand that you:
- [SPECIFIC DEMAND 1]
- [SPECIFIC DEMAND 2]

4. INTENDED ACTION

Unless we receive a satisfactory response within [14/21] days of the date of this letter, we have instructions to:
(a) Commence legal proceedings against you without further notice
(b) Seek costs and interest in addition to the amounts claimed
(c) [ADDITIONAL CONSEQUENCES]

This letter is sent in accordance with the Pre-Action Protocol under the Civil Procedure Rules 2016 and is intended to facilitate early settlement.

We await your prompt response.

Yours faithfully,

_________________________
[ATTORNEY NAME]
[POSITION]
[LAW FIRM NAME]

cc: [CLIENT]
`,
  },

  engagementLetter: {
    name: "Engagement Letter",
    description: "Client engagement letter for law firms",
    template: `
[LETTERHEAD]

[DATE]

[CLIENT NAME]
[ADDRESS]

Dear [CLIENT NAME],

RE: ENGAGEMENT OF LEGAL SERVICES

Thank you for instructing our firm to represent you in [MATTER DESCRIPTION]. We are pleased to confirm our engagement on the following terms:

1. SCOPE OF RETAINER

We shall provide legal services in connection with [DETAILED SCOPE]. This retainer does not include [EXCLUDED SERVICES].

2. ATTORNEY ASSIGNMENT

[MATTER] will be handled by [ATTORNEY NAME], [POSITION], who may be reached at [CONTACT].

3. FEES AND BILLING

Our fees are charged as follows:
- Hourly Rate: TT$ [RATE] per hour for [ATTORNEY]
- Estimated Total Fee: TT$ [AMOUNT] (estimate only)
- Retainer: TT$ [AMOUNT] to be paid upon signing

Billing will be [MONTHLY/QUARTERLY] and invoices are due within [DAYS] days.

4. DISBURSEMENTS

You will be responsible for court filing fees, process server fees, expert witness fees, and other out-of-pocket expenses.

5. COMMUNICATION

We will keep you informed of material developments and respond to your communications within [TIMEFRAME]. Please provide all relevant documents promptly.

6. CONFIDENTIALITY

All communications between us are protected by attorney-client privilege and will remain confidential.

7. TERMINATION

Either party may terminate this engagement upon [NOTICE] written notice. You will be responsible for fees incurred up to the date of termination.

Please sign and return the enclosed copy to confirm your acceptance of these terms.

Yours faithfully,

_________________________
[ATTORNEY NAME]
[LAW FIRM NAME]

AGREED AND ACCEPTED:

_________________________
[CLIENT NAME]
Date: ___________________

`,
  },

  opinionLetter: {
    name: "Legal Opinion",
    description: "Formal legal opinion letter",
    template: `
[LETTERHEAD]

[DATE]

[CLIENT NAME]
[ADDRESS]

Dear [CLIENT NAME],

RE: LEGAL OPINION - [SUBJECT]
OUR REF: [REFERENCE NUMBER]

We provide this legal opinion in connection with [MATTER]. Unless otherwise stated, this opinion is based on the laws of Trinidad and Tobago as of [DATE].

1. FACTS

Based on the documents and information provided, the relevant facts are as follows:
- [FACT 1]
- [FACT 2]
- [FACT 3]

2. ISSUE

The legal issue presented is [LEGAL QUESTION].

3. ANALYSIS

[DETAILED LEGAL ANALYSIS INCLUDING:]
- Relevant statutory provisions
- Case law
- Application to facts
- Risk assessment

4. CONCLUSION

Based on the foregoing, it is our opinion that [CONCLUSION].

5. QUALIFICATIONS

This opinion is subject to the following qualifications:
(a) We have relied on the accuracy of the documents provided
(b) [ADDITIONAL QUALIFICATIONS]

6. DISCLAIMER

This opinion is provided for your use only and may not be relied upon by any other party without our prior written consent.

Yours faithfully,

_________________________
[ATTORNEY NAME]
[POSITION]
[LAW FIRM NAME]

`,
  },
};

// Clause Types for Extraction
export const CLAUSE_TYPES = {
  termination: {
    name: "Termination Clause",
    description: "Conditions and procedures for ending the agreement",
    keywords: ["terminate", "termination", "end", "cancel", "expiry", "expiration"],
  },
  indemnity: {
    name: "Indemnity Clause",
    description: "Obligations to compensate for loss or damage",
    keywords: ["indemnify", "indemnification", "hold harmless", "compensate"],
  },
  confidentiality: {
    name: "Confidentiality Clause",
    description: "Protection of confidential information",
    keywords: ["confidential", "non-disclosure", "proprietary", "secret", "private"],
  },
  liability: {
    name: "Limitation of Liability",
    description: "Caps on financial liability",
    keywords: ["limitation", "liability", "limited to", "not exceed", "cap"],
  },
  governingLaw: {
    name: "Governing Law / Jurisdiction",
    description: "Which laws apply to the agreement",
    keywords: ["governing law", "jurisdiction", "laws of", "courts of"],
  },
  disputeResolution: {
    name: "Dispute Resolution",
    description: "How disputes will be resolved",
    keywords: ["arbitration", "mediation", "dispute", "resolution", "litigation"],
  },
  forceMajeure: {
    name: "Force Majeure",
    description: "Unforeseeable circumstances that excuse performance",
    keywords: ["force majeure", "act of god", "unforeseeable", "beyond reasonable control"],
  },
  assignment: {
    name: "Assignment Clause",
    description: "Rights to transfer obligations",
    keywords: ["assign", "assignment", "transfer", "delegate"],
  },
  intellectualProperty: {
    name: "Intellectual Property",
    description: "Rights to creations and inventions",
    keywords: ["intellectual property", "patent", "copyright", "trademark", "ownership"],
  },
  payment: {
    name: "Payment Terms",
    description: "Payment obligations and schedules",
    keywords: ["payment", "fee", "compensation", "invoice", "remuneration"],
  },
  warranty: {
    name: "Warranty / Representations",
    description: "Promises and guarantees",
    keywords: ["warrant", "warranty", "represent", "guarantee", "undertake"],
  },
  nonCompete: {
    name: "Non-Compete Clause",
    description: "Restrictions on competitive activities",
    keywords: ["non-compete", "compete", "competing", "competition", "restrict"],
  },
};

// Risk Analysis Categories
export const RISK_CATEGORIES = {
  highRisk: {
    name: "High Risk",
    color: "#EF4444",
    indicators: [
      "Unlimited liability",
      "Broad indemnification obligations",
      "Automatic renewal without notice",
      "Excessive penalty clauses",
      "One-sided termination rights",
      "No force majeure provision",
      "Broad non-compete clauses",
      "Waiver of legal rights",
    ],
  },
  mediumRisk: {
    name: "Medium Risk",
    color: "#F59E0B",
    indicators: [
      "Ambiguous terms",
      "Missing definitions",
      "Unclear payment terms",
      "No dispute resolution mechanism",
      "Short notice periods",
      "Missing termination for convenience",
      "Broad confidentiality scope",
    ],
  },
  lowRisk: {
    name: "Low Risk",
    color: "#22C55E",
    indicators: [
      "Clear and balanced terms",
      "Mutual obligations",
      "Reasonable notice periods",
      "Defined scope",
      "Standard boilerplate",
    ],
  },
};

// AI Prompts for different operations
export const AI_PROMPTS = {
  generateDocument: (type: string, context: string) => `
${LEGAL_SYSTEM_CONTEXT}

Generate a professional ${type} for Trinidad & Tobago based on the following context:

${context}

Requirements:
1. Use proper legal terminology and formatting
2. Include all necessary clauses for enforceability in T&T
3. Reference applicable T&T legislation where relevant
4. Use clear section numbering
5. Include signature blocks with witness requirements
6. Add any necessary schedules or appendices
7. Note any variables that need to be filled in with [BRACKETS]
`,

  summarizeDocument: (document: string) => `
${LEGAL_SYSTEM_CONTEXT}

Summarize the following legal document concisely. Include:
1. Document Type and Purpose
2. Key Parties
3. Main Obligations
4. Important Dates and Deadlines
5. Financial Terms
6. Key Risks or Concerns
7. Notable Clauses

Document:
${document}
`,

  extractClauses: (document: string) => `
${LEGAL_SYSTEM_CONTEXT}

Analyze the following legal document and extract ALL important clauses. For each clause found, provide:
1. Clause Type (from: Termination, Indemnity, Confidentiality, Liability, Governing Law, Dispute Resolution, Force Majeure, Assignment, IP, Payment, Warranty, Non-Compete)
2. Exact clause text
3. Analysis of the clause (is it standard, favorable, unfavorable)
4. Any concerns or recommendations

Document:
${document}
`,

  translateDocument: (document: string, sourceLang: string, targetLang: string) => `
You are a legal translator specializing in Spanish-English translation for Caribbean legal documents.

Translate the following legal document from ${sourceLang} to ${targetLang}. Maintain:
1. Legal terminology accuracy
2. Formal tone and structure
3. Proper formatting and numbering
4. Equivalent legal concepts (not literal translations)

Document:
${document}
`,

  analyzeRisk: (document: string) => `
${LEGAL_SYSTEM_CONTEXT}

Perform a comprehensive risk analysis of the following legal document. For each risk identified, provide:
1. Risk Level (High/Medium/Low)
2. Category (Liability, Financial, Operational, Legal, Compliance)
3. Description of the risk
4. Specific clause reference
5. Recommendation to mitigate

Also provide:
- Overall Risk Score (1-10)
- Summary of Key Risks
- Recommendations for Improvement

Document:
${document}
`,

  suggestImprovements: (document: string, context: string) => `
${LEGAL_SYSTEM_CONTEXT}

Review the following legal document and suggest improvements. Focus on:
1. Clarity and precision
2. Missing clauses that should be added
3. Ambiguous language that should be clarified
4. Unfavorable terms that should be negotiated
5. Compliance with T&T law
6. Industry best practices

Context: ${context}

Document:
${document}
`,

  chatAboutDocument: (document: string, question: string) => `
${LEGAL_SYSTEM_CONTEXT}

You are assisting with the following legal document:

${document}

Question: ${question}

Provide a thorough, professional response. If you need to reference specific clauses, quote them exactly.
`,
};

// Trinidad & Tobago Legal References
export const TT_LEGAL_REFERENCES = [
  {
    name: "Civil Procedure Rules 2016",
    type: "Court Rules",
    description: "Governs civil litigation procedure in the High Court",
    keyProvisions: ["Pre-Action Protocol", "Case Management", "Disclosure", "Costs"],
  },
  {
    name: "Companies Act, Chapter 81:01",
    type: "Statute",
    description: "Incorporation and regulation of companies in Trinidad & Tobago",
    keyProvisions: ["Incorporation", "Directors' Duties", "Shareholders' Rights", "Winding Up"],
  },
  {
    name: "Conveyancing and Law of Property Act",
    type: "Statute",
    description: "Real estate transactions and property rights",
    keyProvisions: ["Sale of Land", "Mortgages", "Leases", "Easements"],
  },
  {
    name: "Employment Act, Chapter 88:01",
    type: "Statute",
    description: "Employment rights and obligations",
    keyProvisions: ["Contracts of Employment", "Termination", "Redundancy", "Severance Pay"],
  },
  {
    name: "Matrimonial Proceedings and Property Act",
    type: "Statute",
    description: "Divorce and division of matrimonial property",
    keyProvisions: ["Grounds for Divorce", "Property Division", "Maintenance", "Custody"],
  },
  {
    name: "Data Protection Act, Chapter 22:04",
    type: "Statute",
    description: "Protection of personal data",
    keyProvisions: ["Data Subject Rights", "Processing Principles", "Security Requirements", "Cross-border Transfers"],
  },
  {
    name: "Occupational Safety and Health Act",
    type: "Statute",
    description: "Workplace safety requirements",
    keyProvisions: ["Duty of Care", "Risk Assessment", "Reporting", "Enforcement"],
  },
];

export default {
  LEGAL_SYSTEM_CONTEXT,
  CONTRACT_TEMPLATES,
  MOTION_TEMPLATES,
  LETTER_TEMPLATES,
  CLAUSE_TYPES,
  RISK_CATEGORIES,
  AI_PROMPTS,
  TT_LEGAL_REFERENCES,
};
