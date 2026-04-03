// ============================================
// TRINIDAD & TOBAGO LEGAL TEMPLATES
// Comprehensive template library for AI Document Assistant
// ============================================

export interface TTLegalTemplate {
  name: string;
  description: string;
  category: 'wills' | 'property' | 'employment' | 'corporate' | 'family' | 'commercial';
  jurisdiction: 'Trinidad and Tobago';
  variables: string[];
  template: string;
  notes?: string;
}

export const TT_LEGAL_TEMPLATES: Record<string, TTLegalTemplate> = {
  // ==================== WILLS & PROBATE ====================
  simpleWill: {
    name: 'Simple Will',
    description: 'Standard last will and testament for Trinidad & Tobago residents',
    category: 'wills',
    jurisdiction: 'Trinidad and Tobago',
    variables: ['Testator Name', 'Testator Address', 'Executor Name', 'Beneficiary Names', 'Specific Bequests', 'Residuary Estate'],
    template: `
LAST WILL AND TESTAMENT

I, [TESTATOR NAME], of [TESTATOR ADDRESS], in the Republic of Trinidad and Tobago, [OCCUPATION], being of sound mind, memory and understanding, do hereby make, publish and declare this to be my Last Will and Testament, hereby revoking all former Wills and Codicils made by me.

FIRST: I direct that all my just debts, funeral expenses, and expenses of last illness be paid as soon after my death as may be practicable.

SECOND: I give, devise and bequeath the following specific bequests:

[SPECIFIC BEQUESTS - List items and beneficiaries]

THIRD: All the rest, residue and remainder of my estate, both real and personal, of whatsoever nature and wheresoever found, I give, devise and bequeath unto [RESIDUARY BENEFICIARY], absolutely.

FOURTH: I nominate, constitute and appoint [EXECUTOR NAME], of [EXECUTOR ADDRESS], to be the Executor of this my Last Will and Testament. If said Executor shall fail to qualify or cease to act, I appoint [ALTERNATE EXECUTOR NAME] as Alternate Executor.

FIFTH: I direct that my Executor shall have full power to sell, lease, mortgage or otherwise dispose of any property of my estate at public or private sale, with or without notice, upon such terms as my Executor shall deem best.

SIXTH: If any beneficiary under this Will shall contest this Will or any of its provisions, such beneficiary shall receive no part of my estate.

IN WITNESS WHEREOF, I have hereunto set my hand and seal on this [DAY] day of [MONTH], [YEAR].

_____________________________
[TESTATOR NAME] (Testator)

SIGNED, SEALED, PUBLISHED AND DECLARED by the said [TESTATOR NAME] as and for [HIS/HER] Last Will and Testament, in the presence of us, who at [HIS/HER] request, in [HIS/HER] presence, and in the presence of each other, have hereunto subscribed our names as witnesses:

_____________________________
Witness 1 Name: ______________
Address: ____________________

_____________________________
Witness 2 Name: ______________
Address: ____________________

NOTES FOR TRINIDAD & TOBAGO:
1. Will must be signed by testator and two witnesses present at the same time
2. Witnesses should not be beneficiaries or spouses of beneficiaries
3. Consider obtaining an Attorney's Certificate for international recognition
4. Original will should be stored in a safe place or with an attorney
`,
    notes: 'Must be witnessed by two persons present at the same time. Witnesses should not be beneficiaries.',
  },

  probateApplication: {
    name: 'Probate Application',
    description: 'Application for grant of probate in Trinidad & Tobago High Court',
    category: 'wills',
    jurisdiction: 'Trinidad and Tobago',
    variables: ['Deceased Name', 'Date of Death', 'Executor Name', 'Estate Value', 'Court Registry'],
    template: `
IN THE HIGH COURT OF JUSTICE
CIVIL DIVISION
PROBATE SIDE

Claim No. ___________ of 20____

IN THE ESTATE OF [DECEASED NAME], deceased

_________________________________________

APPLICATION FOR GRANT OF PROBATE

_________________________________________

I/We, [EXECUTOR NAME(S)], of [ADDRESS], make oath and say as follows:

1. I/We believe that [DECEASED NAME], late of [LAST ADDRESS], in the Republic of Trinidad and Tobago, [OCCUPATION], died on the [DAY] day of [MONTH], [YEAR], at [PLACE OF DEATH].

2. The deceased was at the time of death domiciled in Trinidad and Tobago.

3. I/We am/are the executor(s) named in the Will dated [DATE OF WILL], a copy of which is attached hereto.

4. To the best of my/our knowledge and belief:
   (a) The deceased left a Will dated [DATE OF WILL]
   (b) No codicil has been made
   (c) The Will was duly executed and is valid

5. The gross value of the estate in Trinidad and Tobago is approximately TT$ [ESTATE VALUE].

6. The net value of the estate in Trinidad and Tobago is approximately TT$ [NET VALUE].

7. I/We know of no reason why this application should not be granted.

8. I/We undertake to:
   (a) Collect and administer the estate according to law
   (b) Produce an inventory and valuation within 6 months
   (c) File accounts as required by the Court

SWORN at [PLACE] )
this [DAY] day of      )
[MONTH], [YEAR]       )
                       )
_______________________ )
[EXECUTOR NAME]

BEFORE ME:

_______________________
COMMISSIONER OF AFFIDAVITS

DOCUMENTS TO BE FILED:
1. Original Will and any Codicils
2. Death Certificate (original or certified copy)
3. Oath for Grant of Probate
4. Inventory and Valuation (within 6 months)
5. Probate Fee (based on estate value)
`,
  },

  // ==================== PROPERTY & CONVEYANCING ====================
  propertyTransferAgreement: {
    name: 'Property Transfer Agreement',
    description: 'Agreement for sale and purchase of real property in Trinidad & Tobago',
    category: 'property',
    jurisdiction: 'Trinidad and Tobago',
    variables: ['Vendor Name', 'Purchaser Name', 'Property Description', 'Purchase Price', 'Deposit Amount', 'Completion Date'],
    template: `
AGREEMENT FOR SALE OF LAND

This Agreement is made on [DATE] between:

THE VENDOR: [VENDOR NAME], of [VENDOR ADDRESS], in the Republic of Trinidad and Tobago (hereinafter referred to as "the Vendor");

AND

THE PURCHASER: [PURCHASER NAME], of [PURCHASER ADDRESS], in the Republic of Trinidad and Tobago (hereinafter referred to as "the Purchaser");

WHEREAS the Vendor is the registered proprietor of the property described in the Schedule hereto;

AND WHEREAS the Vendor has agreed to sell and the Purchaser has agreed to purchase the said property upon the terms and conditions hereinafter appearing;

NOW THEREFORE IT IS HEREBY AGREED as follows:

1. AGREEMENT TO SELL
The Vendor agrees to sell and the Purchaser agrees to purchase the property described in the Schedule hereto (hereinafter referred to as "the Property") together with all fixtures and fittings, subject to the exceptions and reservations (if any) mentioned in the title documents.

2. PURCHASE PRICE
The purchase price shall be TT$ [PURCHASE PRICE] (hereinafter referred to as "the Purchase Price").

3. DEPOSIT
The Purchaser has paid the sum of TT$ [DEPOSIT AMOUNT] to the Vendor's Attorneys as stakeholder, being the deposit upon the signing of this Agreement.

4. BALANCE OF PURCHASE PRICE
The balance of the Purchase Price being TT$ [BALANCE] shall be paid to the Vendor's Attorneys on or before the Completion Date.

5. COMPLETION
Completion shall take place on or before [COMPLETION DATE] at the offices of the Vendor's Attorneys.

6. TITLE
The Vendor shall at [HIS/HER] own expense make and deduce good title to the Property and shall produce for inspection at [HIS/HER] own expense all title deeds and documents relating to the Property.

7. POSSESSION
Vacant possession of the Property shall be given to the Purchaser on Completion.

8. RISK
The Property shall be at the risk of the Vendor until completion, whereupon the risk shall pass to the Purchaser.

9. OUTGOINGS
All rates, taxes and other outgoings payable in respect of the Property shall be paid by the Vendor up to the date of completion and by the Purchaser as from the date of completion.

10. DEFAULT
If the Purchaser shall fail to complete this Agreement in accordance with its terms, the Vendor may rescind this Agreement and retain the deposit as liquidated damages. If the Vendor shall fail to complete, the Purchaser may rescind this Agreement and recover the deposit together with any costs incurred.

11. LEGAL COSTS
Each party shall bear their own legal costs in connection with this transaction.

SCHEDULE

ALL THAT piece and parcel of land comprising [LOT NUMBER] of [DEVELOPMENT NAME], [STREET ADDRESS], [TOWN/CITY], Trinidad and Tobago, being more particularly described in Certificate of Title No. [TITLE NUMBER] dated [DATE] and shown on Plan No. [PLAN NUMBER] and comprising an area of [AREA] square metres/hectares.

IN WITNESS WHEREOF the parties have hereunto set their hands on the day and year first above written.

SIGNED by the said )
[VENDOR NAME]      )
in the presence of: )
                   )
_____________________ )

_____________________
Witness Name: _______
Address: ___________

SIGNED by the said )
[PURCHASER NAME]   )
in the presence of: )
                   )
_____________________ )

_____________________
Witness Name: _______
Address: ___________

TRINIDAD & TOBAGO REQUIREMENTS:
1. Stamp Duty payable under the Stamp Duty Act
2. Property must be registered at Land Registry
3. Vendor must provide Certificate of Title
4. Searches required at Land Registry, Companies Registry (if applicable)
5. Consider Town and Country Planning approvals
`,
  },

  tenancyAgreement: {
    name: 'Tenancy Agreement',
    description: 'Residential tenancy agreement for Trinidad & Tobago properties',
    category: 'property',
    jurisdiction: 'Trinidad and Tobago',
    variables: ['Landlord Name', 'Tenant Name', 'Property Address', 'Monthly Rent', 'Security Deposit', 'Term Duration'],
    template: `
TENANCY AGREEMENT

This Tenancy Agreement is made on [DATE] between:

THE LANDLORD: [LANDLORD NAME], of [LANDLORD ADDRESS], in the Republic of Trinidad and Tobago (hereinafter referred to as "the Landlord");

AND

THE TENANT: [TENANT NAME], of [TENANT ADDRESS], in the Republic of Trinidad and Tobago, holder of National Identification Card No. [ID NUMBER] (hereinafter referred to as "the Tenant");

PROPERTY: [FULL PROPERTY ADDRESS], Trinidad and Tobago (hereinafter referred to as "the Demised Premises");

WHEREAS the Landlord is the owner of the Demised Premises and has agreed to let the same to the Tenant upon the terms hereinafter appearing;

NOW THEREFORE IT IS AGREED as follows:

1. DEMISE
The Landlord agrees to let and the Tenant agrees to rent the Demised Premises together with the fixtures, furniture and effects (if any) listed in the Inventory attached hereto for the term and at the rent hereinafter specified.

2. TERM
The term of this Tenancy shall be for a period of [DURATION] commencing on [START DATE] and ending on [END DATE].

3. RENT
The Tenant shall pay to the Landlord rent at the rate of TT$ [MONTHLY RENT] per month, payable in advance on the first day of each month.

4. SECURITY DEPOSIT
The Tenant shall pay to the Landlord a security deposit of TT$ [SECURITY DEPOSIT] upon signing this Agreement, which sum shall be held as security for the due performance of the Tenant's obligations. The deposit shall be returned within fourteen (14) days of the termination of this Tenancy, less any deductions for damages or arrears.

5. UTILITIES
The Tenant shall be responsible for and shall pay all charges for electricity, water, telephone, internet, and cable services supplied to the Demised Premises during the term.

6. USE OF PREMISES
The Demised Premises shall be used and occupied by the Tenant solely as a private residence for the Tenant and [NUMBER] other persons, namely: [NAMES].

7. TENANT'S COVENANTS
The Tenant covenants with the Landlord:
(a) To pay the rent on the days and in the manner aforesaid
(b) To pay all rates, taxes and charges in respect of the Demised Premises as are payable by the Tenant
(c) To keep the interior of the Demised Premises in good and tenantable repair and condition
(d) Not to make any alterations or additions without the Landlord's prior written consent
(e) Not to assign, underlet or part with possession of the Demised Premises
(f) Not to carry on any trade or business on the Demised Premises
(g) Not to keep any animals on the Demised Premises without the Landlord's consent
(h) Not to do anything which may be a nuisance or annoyance to neighbours
(i) To permit the Landlord to enter and view the Demised Premises at reasonable times with 24 hours notice

8. LANDLORD'S COVENANTS
The Landlord covenants with the Tenant:
(a) That the Tenant may quietly enjoy the Demised Premises
(b) To maintain the structural parts of the Demised Premises in good repair
(c) To maintain the services and installations serving the Demised Premises

9. TERMINATION
Either party may terminate this Tenancy by giving to the other not less than [NOTICE PERIOD] written notice to expire at any time.

10. FORFEITURE
If the rent shall be in arrears for fourteen (14) days after becoming payable, or if the Tenant shall breach any of the covenants herein, the Landlord may re-enter the Demised Premises and this Tenancy shall determine.

11. GOVERNING LAW
This Agreement shall be governed by the laws of Trinidad and Tobago.

SIGNED by the said )
[LANDLORD NAME]    )
in the presence of: )
                   )
_____________________ )

SIGNED by the said )
[TENANT NAME]      )
in the presence of: )
                   )
_____________________ )

INVENTORY OF CONTENTS
[LIST OF FURNITURE AND FIXTURES]
`,
  },

  // ==================== EMPLOYMENT ====================
  employmentContractTT: {
    name: 'Employment Contract (T&T)',
    description: 'Employment contract compliant with Trinidad & Tobago Employment Act',
    category: 'employment',
    jurisdiction: 'Trinidad and Tobago',
    variables: ['Employee Name', 'Employer Name', 'Position', 'Start Date', 'Salary', 'Work Hours', 'Leave Entitlement'],
    template: `
EMPLOYMENT CONTRACT

This Employment Contract is made on [DATE] between:

EMPLOYER: [EMPLOYER NAME], [a company incorporated under the laws of Trinidad and Tobago / an individual] having its/his/her [registered office/address] at [ADDRESS] (hereinafter referred to as "the Employer");

AND

EMPLOYEE: [EMPLOYEE NAME], of [ADDRESS], in the Republic of Trinidad and Tobago, holder of National Identification Card No. [ID NUMBER] (hereinafter referred to as "the Employee");

WHEREAS the Employer desires to employ the Employee and the Employee desires to accept such employment;

NOW THEREFORE the parties agree as follows:

1. POSITION AND DUTIES
1.1 The Employer hereby employs the Employee in the position of [POSITION] with duties as set out in Schedule A attached hereto.
1.2 The Employee shall report to [SUPERVISOR/DEPARTMENT].
1.3 The Employee agrees to perform all duties faithfully, diligently, and to the best of their ability.
1.4 The Employer may from time to time assign additional duties consistent with the Employee's position.

2. TERM OF EMPLOYMENT
2.1 This Contract shall commence on [START DATE].
2.2 The initial probationary period shall be [THREE (3)/SIX (6)] months from the commencement date.
2.3 During the probationary period, either party may terminate employment by giving one (1) week's notice.

3. REMUNERATION
3.1 The Employee shall receive a [WEEKLY/MONTHLY] salary of TT$ [SALARY], payable [WEEKLY/BI-WEEKLY/MONTHLY].
3.2 Salary shall be subject to statutory deductions including:
    - Pay As You Earn (PAYE) Tax
    - National Insurance System (NIS) Contributions
    - Health Surcharge
3.3 The Employee shall be entitled to annual salary reviews at the Employer's discretion.

4. HOURS OF WORK
4.1 Normal working hours shall be [NUMBER] hours per week, [DAYS], from [START TIME] to [END TIME].
4.2 The Employee may be required to work reasonable overtime as necessary.
4.3 Overtime shall be compensated in accordance with the Minimum Wages Act or as otherwise agreed.

5. PLACE OF WORK
5.1 The Employee's normal place of work shall be at [LOCATION].
5.2 The Employer may require the Employee to work at other locations as necessary.

6. LEAVE ENTITLEMENT
6.1 ANNUAL LEAVE: The Employee shall be entitled to [FOURTEEN (14)] working days annual leave after one year of service, increasing to [NUMBER] days after [YEARS] years of service.
6.2 SICK LEAVE: The Employee shall be entitled to [FOURTEEN (14)] working days sick leave with full pay per year.
6.3 MATERNITY LEAVE: Female employees shall be entitled to maternity leave in accordance with the Maternity Protection Act.
6.4 PATERNITY LEAVE: Male employees shall be entitled to paternity leave as per company policy.

7. STATUTORY BENEFITS
The Employee shall be entitled to all benefits under:
- National Insurance Act
- Workmen's Compensation Act
- Maternity Protection Act
- Occupational Safety and Health Act

8. CONFIDENTIALITY
8.1 During and after employment, the Employee shall not disclose any confidential information relating to the Employer's business.
8.2 This obligation shall survive termination of employment for a period of [YEARS] years.

9. TERMINATION
9.1 After probation, either party may terminate this Contract by giving:
    - One (1) week's notice during the first year of service
    - Two (2) weeks' notice after one year of service
    - [NUMBER] weeks' notice after [YEARS] years of service
9.2 The Employer may terminate without notice for:
    - Gross misconduct
    - Serious breach of contract
    - Incapacity to perform duties
9.3 Upon termination, the Employee shall return all Company property.

10. RETRENCHMENT
In the event of redundancy, the Employee shall be entitled to severance benefits in accordance with the Retrenchment and Severance Benefits Act.

11. NON-COMPETITION
For a period of [SIX (6)/TWELVE (12)] months after termination, the Employee shall not engage in any competing business within [GEOGRAPHIC AREA], provided that such restriction is reasonable.

12. DISCIPLINARY PROCEDURES
Disciplinary matters shall be handled in accordance with the Company's disciplinary code and procedures, a copy of which has been provided to the Employee.

13. GRIEVANCE PROCEDURE
Any grievance shall be raised in accordance with the Company's grievance procedure.

14. GOVERNING LAW
This Contract shall be governed by the laws of Trinidad and Tobago, including but not limited to:
- Employment Act, Chapter 88:01
- Minimum Wages Act
- Maternity Protection Act
- Occupational Safety and Health Act
- Retrenchment and Severance Benefits Act

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

SCHEDULE A - JOB DESCRIPTION
[DETAILED JOB DUTIES AND RESPONSIBILITIES]
`,
  },

  // ==================== CORPORATE ====================
  companyFormationDocuments: {
    name: 'Company Formation Documents',
    description: 'Articles of Incorporation for Trinidad & Tobago companies',
    category: 'corporate',
    jurisdiction: 'Trinidad and Tobago',
    variables: ['Company Name', 'Registered Office', 'Directors', 'Shareholders', 'Share Capital', 'Company Objects'],
    template: `
COMPANY LIMITED BY SHARES

ARTICLES OF INCORPORATION

Pursuant to the Companies Act, Chapter 81:01

1. NAME OF COMPANY
The name of the Company is [COMPANY NAME] LIMITED.

2. TYPE OF COMPANY
The Company is a company limited by shares.

3. REGISTERED OFFICE
The registered office of the Company shall be situated at [REGISTERED OFFICE ADDRESS], Trinidad and Tobago.

4. LIABILITY OF MEMBERS
The liability of the members is limited to the amount, if any, unpaid on the shares held by them.

5. SHARE CAPITAL
5.1 The authorized share capital of the Company is TT$ [AUTHORIZED CAPITAL] divided into [NUMBER] shares of TT$ [PAR VALUE] each.
5.2 The Company has the power to issue shares of different classes with such rights, privileges, restrictions and conditions as may be determined by special resolution.

6. SHARES
6.1 The shares initially issued are [NUMBER] shares of TT$ [PAR VALUE] each, fully paid, allotted to:
[List of initial shareholders and number of shares]

7. DIRECTORS
7.1 The number of directors shall be not less than [MINIMUM] and not more than [MAXIMUM].
7.2 The first directors of the Company are:
[List of directors with addresses]

8. objects
The objects for which the Company is established are:
(a) [PRIMARY OBJECT]
(b) [SECONDARY OBJECT]
(c) To do all such other things as are incidental or conducive to the attainment of the above objects.

9. POWERS
The Company shall have the capacity, rights, powers and privileges of an individual and without limitation may:
(a) Acquire and dispose of property
(b) Borrow money and grant security
(c) Invest funds
(d) Enter into contracts
(e) Employ staff
(f) Sue and be sued

10. ARTICLES OF ASSOCIATION
The regulations for the management of the Company shall be as set out in the Articles of Association attached hereto.

11. PRE-INCORPORATION CONTRACTS
The persons named as first directors are authorized to adopt any pre-incorporation contracts entered into on behalf of the Company.

WE, the subscribers, wish to be formed into a Company pursuant to this Articles of Incorporation and we agree to take the number of shares set opposite our respective names.

DATED this [DAY] day of [MONTH], [YEAR].

SUBSCRIBERS:
Name: _______________________
Address: ____________________
Shares: _______
_________________________
Signature

Name: _______________________
Address: ____________________
Shares: _______
_________________________
Signature

WITNESS TO SIGNATURES:
Name: _______________________
Address: ____________________
_________________________
Signature

FILING REQUIREMENTS:
1. Submit to Companies Registry
2. Filing Fee: TT$ [CURRENT FEE]
3. Name Reservation required prior to filing
4. Registered Agent required (if applicable)
5. Annual Return due annually
`,
  },

  shareholdersAgreement: {
    name: 'Shareholders Agreement',
    description: 'Shareholders agreement for Trinidad & Tobago companies',
    category: 'corporate',
    jurisdiction: 'Trinidad and Tobago',
    variables: ['Company Name', 'Shareholders', 'Share Percentages', 'Board Composition', 'Exit Provisions'],
    template: `
SHAREHOLDERS' AGREEMENT

This Agreement is made on [DATE] between:

[SHAREHOLDER 1 NAME], of [ADDRESS] (hereinafter referred to as "Shareholder 1");

[SHAREHOLDER 2 NAME], of [ADDRESS] (hereinafter referred to as "Shareholder 2");

[Additional shareholders as required]

(each a "Shareholder" and collectively the "Shareholders");

AND

[COMPANY NAME] LIMITED, a company incorporated under the laws of Trinidad and Tobago (hereinafter referred to as "the Company");

WHEREAS the Shareholders are the holders of all the issued shares in the Company and wish to regulate their relationship as shareholders and the management of the Company;

NOW THEREFORE IT IS AGREED as follows:

1. DEFINITIONS
[Define key terms]

2. SHAREHOLDINGS
2.1 The shareholdings in the Company are as follows:
    - Shareholder 1: [NUMBER] shares ([PERCENTAGE]%)
    - Shareholder 2: [NUMBER] shares ([PERCENTAGE]%)
    - [Additional shareholders]

3. MANAGEMENT
3.1 The business of the Company shall be managed by the Board of Directors.
3.2 The Board shall comprise [NUMBER] directors:
    - Shareholder 1 shall appoint [NUMBER] director(s)
    - Shareholder 2 shall appoint [NUMBER] director(s)
3.3 Board meetings shall be held at least [QUARTERLY/MONTHLY].

4. DECISIONS REQUIRING UNANIMOUS CONSENT
The following matters shall require the unanimous consent of all Shareholders:
(a) Amendment of Articles of Incorporation
(b) Increase or decrease of share capital
(c) Merger or acquisition
(d) Sale of substantially all assets
(e) Winding up or dissolution
(f) Incurring debt above TT$ [AMOUNT]
(g) Capital expenditure above TT$ [AMOUNT]
(h) Appointment or removal of auditors
(i) Declaration of dividends

5. TRANSFER OF SHARES
5.1 No Shareholder shall transfer shares without first offering them to the other Shareholders on a pro rata basis (Right of First Refusal).
5.2 The price for shares shall be [FAIR MARKET VALUE/AGREED VALUE/FORMULA].
5.3 Any transfer requires approval of [MAJORITY/ALL] Shareholders.

6. DRAG-ALONG RIGHTS
If Shareholders holding [PERCENTAGE]% or more of the shares receive a bona fide offer for all shares, they may require the remaining Shareholders to sell their shares on the same terms.

7. TAG-ALONG RIGHTS
If a Shareholder receives an offer for their shares, they may require the purchaser to also make an offer for the shares of the other Shareholders on a pro rata basis.

8. DEADLOCK
In the event of deadlock:
(a) The matter shall be referred to mediation
(b) If unresolved, either party may initiate a buy-out under Clause 9

9. BUY-OUT PROVISIONS
9.1 Either party may give notice to buy the other's shares at a price determined by [MECHANISM].
9.2 The recipient may either accept the offer or buy the initiator's shares at the same price.

10. CONFIDENTIALITY
Each Shareholder shall maintain the confidentiality of all Company information.

11. NON-COMPETITION
During the term of this Agreement and for [PERIOD] after ceasing to be a Shareholder, no Shareholder shall engage in a competing business within [GEOGRAPHIC AREA].

12. DISPUTE RESOLUTION
Any dispute shall be resolved by:
(a) Negotiation between Shareholders
(b) Mediation
(c) Binding arbitration under the Arbitration Act

13. GOVERNING LAW
This Agreement shall be governed by the laws of Trinidad and Tobago.

IN WITNESS WHEREOF the parties have executed this Agreement.

_________________________
SHAREHOLDER 1

_________________________
SHAREHOLDER 2

_________________________
for and on behalf of [COMPANY NAME] LIMITED
`,
  },

  directorResolution: {
    name: 'Director Resolution',
    description: 'Written resolution of directors for Trinidad & Tobago companies',
    category: 'corporate',
    jurisdiction: 'Trinidad and Tobago',
    variables: ['Company Name', 'Resolution Content', 'Directors Names'],
    template: `
WRITTEN RESOLUTION OF THE BOARD OF DIRECTORS
OF [COMPANY NAME] LIMITED

Pursuant to the Companies Act, Chapter 81:01 and the Articles of Association of the Company

DATED: [DATE]

WE, the undersigned, being all the Directors of [COMPANY NAME] LIMITED (hereinafter referred to as "the Company"), hereby pass the following resolution(s) in writing:

RESOLUTION NO. 1
[DESCRIPTION OF RESOLUTION]

IT WAS RESOLVED THAT:
[Full text of resolution]

RESOLUTION NO. 2
[DESCRIPTION OF RESOLUTION]

IT WAS RESOLVED THAT:
[Full text of resolution]

[Additional resolutions as required]

WE CONFIRM that:
1. We have signed this resolution on the date(s) indicated below
2. This resolution is passed by unanimous consent of all directors
3. This resolution is as valid and effective as if passed at a duly convened meeting of directors

DIRECTORS:

_________________________
[DIRECTOR 1 NAME]
Date: _________________

_________________________
[DIRECTOR 2 NAME]
Date: _________________

_________________________
[DIRECTOR 3 NAME]
Date: _________________

CERTIFICATE

I, [COMPANY SECRETARY NAME], the Secretary of the Company, hereby certify that the above is a true copy of a written resolution duly passed by the Board of Directors.

_________________________
Company Secretary
Date: ___________________
`,
  },

  // ==================== FAMILY LAW ====================
  prenuptialAgreement: {
    name: 'Prenuptial Agreement',
    description: 'Antenuptial agreement for Trinidad & Tobago',
    category: 'family',
    jurisdiction: 'Trinidad and Tobago',
    variables: ['Party 1 Name', 'Party 2 Name', 'Assets of Party 1', 'Assets of Party 2', 'Terms'],
    template: `
ANTE-NUPTIAL AGREEMENT

This Agreement is made on [DATE] between:

PARTY 1: [NAME], of [ADDRESS], in the Republic of Trinidad and Tobago, [OCCUPATION], holder of National Identification Card No. [ID NUMBER] (hereinafter referred to as "Party 1");

AND

PARTY 2: [NAME], of [ADDRESS], in the Republic of Trinidad and Tobago, [OCCUPATION], holder of National Identification Card No. [ID NUMBER] (hereinafter referred to as "Party 2");

(each a "Party" and together the "Parties")

WHEREAS the Parties intend to marry each other;

AND WHEREAS each Party possesses certain assets and property which they wish to protect;

AND WHEREAS the Parties wish to define their respective rights and obligations regarding property in the event of dissolution of the marriage or death;

NOW THEREFORE IT IS AGREED as follows:

1. INDEPENDENT LEGAL ADVICE
1.1 Each Party acknowledges that they have had the opportunity to obtain independent legal advice.
1.2 Party 1 has been advised by [ATTORNEY 1 NAME] of [LAW FIRM 1].
1.3 Party 2 has been advised by [ATTORNEY 2 NAME] of [LAW FIRM 2].
1.4 Each Party confirms they understand the terms and effect of this Agreement.

2. FULL DISCLOSURE
2.1 Party 1 discloses the assets listed in Schedule A hereto.
2.2 Party 2 discloses the assets listed in Schedule B hereto.
2.3 Each Party acknowledges that they have received full disclosure of the other's assets and financial circumstances.

3. SEPARATE PROPERTY
3.1 The following shall remain the separate property of Party 1:
    (a) All assets listed in Schedule A
    (b) Any property acquired by Party 1 by gift, inheritance, or bequest
    (c) Any income or appreciation derived from the above
    (d) Any property acquired in exchange for the above

3.2 The following shall remain the separate property of Party 2:
    (a) All assets listed in Schedule B
    (b) Any property acquired by Party 2 by gift, inheritance, or bequest
    (c) Any income or appreciation derived from the above
    (d) Any property acquired in exchange for the above

4. MARITAL PROPERTY
4.1 The following shall constitute marital property:
    (a) Property acquired jointly during the marriage
    (b) Property acquired with joint funds
    (c) Property designated as marital property by written agreement

5. DIVISION UPON DISSOLUTION
In the event of dissolution of the marriage:
5.1 Each Party shall retain their separate property.
5.2 Marital property shall be divided [EQUALLY/AS AGREED/PERCENTAGE].
5.3 The Matrimonial Proceedings and Property Act shall apply to the extent not varied by this Agreement.

6. MAINTENANCE
6.1 [Each Party waives the right to claim maintenance / Maintenance shall be determined as follows: ...]
6.2 This waiver is [not] subject to change in circumstances.

7. DEBTS
Each Party shall be solely responsible for their own debts and liabilities, except for debts jointly incurred.

8. DEATH
Upon the death of either Party, the surviving Party shall have [NO RIGHTS TO SEPARATE PROPERTY / SUCH RIGHTS AS PROVIDED BY WILL / STATUTORY RIGHTS].

9. CHILDREN
This Agreement does not affect the rights of any children of the marriage, including rights under the Children Act.

10. VOLUNTARY EXECUTION
Each Party acknowledges that:
(a) They are entering this Agreement voluntarily
(b) They are not under duress or undue influence
(c) They have had sufficient time to consider this Agreement
(d) They have read and understood this Agreement

11. GOVERNING LAW
This Agreement shall be governed by the laws of Trinidad and Tobago, including the Matrimonial Proceedings and Property Act.

12. SEVERABILITY
If any provision is held invalid, the remainder shall continue in effect.

SIGNED by PARTY 1 )
in the presence of: )
                   )
_____________________ )  _______________________
Attorney Name        )  PARTY 1 SIGNATURE
_____________________ )
Attorney's Signature)

SIGNED by PARTY 2 )
in the presence of: )
                   )
_____________________ )  _______________________
Attorney Name        )  PARTY 2 SIGNATURE
_____________________ )
Attorney's Signature)

SCHEDULE A - PARTY 1'S ASSETS
[LIST OF ASSETS WITH VALUES]

SCHEDULE B - PARTY 2'S ASSETS
[LIST OF ASSETS WITH VALUES]

IMPORTANT NOTES FOR TRINIDAD & TOBAGO:
1. Both parties MUST have independent legal advice
2. Full financial disclosure is essential
3. Agreement should be signed at least 21 days before marriage
4. The Court retains discretion under the Matrimonial Proceedings and Property Act
5. Consider review clauses for significant changes in circumstances
`,
  },

  // ==================== COMMERCIAL ====================
  serviceAgreementTT: {
    name: 'Service Agreement (T&T)',
    description: 'Professional services agreement for Trinidad & Tobago',
    category: 'commercial',
    jurisdiction: 'Trinidad and Tobago',
    variables: ['Service Provider', 'Client', 'Services Description', 'Fees', 'Term', 'Payment Terms'],
    template: `
PROFESSIONAL SERVICES AGREEMENT

This Agreement is made on [DATE] between:

CLIENT: [CLIENT NAME], [a company incorporated under the laws of Trinidad and Tobago / an individual] of [ADDRESS] (hereinafter referred to as "the Client");

AND

PROVIDER: [PROVIDER NAME], [a company incorporated under the laws of Trinidad and Tobago / an individual] of [ADDRESS] (hereinafter referred to as "the Service Provider");

WHEREAS the Client requires certain professional services and the Service Provider has agreed to provide such services;

NOW THEREFORE IT IS AGREED as follows:

1. SERVICES
1.1 The Service Provider shall provide the services described in Schedule A attached hereto (hereinafter referred to as "the Services").
1.2 Any additional services shall require written agreement and additional compensation.

2. TERM
2.1 This Agreement shall commence on [START DATE] and continue until [END DATE] or completion of Services.
2.2 Either party may terminate upon [NUMBER] days' written notice.

3. FEES AND PAYMENT
3.1 The Client shall pay the Service Provider:
    - [HOURLY RATE: TT$ [AMOUNT] per hour]
    - [FIXED FEE: TT$ [AMOUNT]]
    - [RETAINER: TT$ [AMOUNT] per month]
3.2 Payment shall be made [WEEKLY/MONTHLY/UPON COMPLETION].
3.3 Invoices shall be submitted [PERIOD] and payment is due within [NUMBER] days.
3.4 Late payments shall bear interest at [RATE]% per month.
3.5 Value Added Tax (VAT) at 12.5% shall be added where applicable.

4. PERFORMANCE STANDARDS
4.1 The Service Provider shall perform the Services:
    (a) In a professional and workmanlike manner
    (b) With reasonable skill and care
    (c) In accordance with industry standards
    (d) In compliance with all applicable laws

5. CLIENT OBLIGATIONS
The Client shall:
(a) Provide necessary information and access
(b) Respond to requests in a timely manner
(c) Pay fees when due
(d) Designate a contact person

6. INDEPENDENT CONTRACTOR
6.1 The Service Provider is an independent contractor and not an employee.
6.2 The Service Provider shall be responsible for all taxes including:
    - Income tax
    - National Insurance Contributions (if applicable)
    - Health Surcharge
6.3 The Service Provider shall not be entitled to employee benefits.

7. CONFIDENTIALITY
7.1 Each party shall maintain the confidentiality of the other's proprietary information.
7.2 This obligation shall survive termination for a period of [NUMBER] years.

8. INTELLECTUAL PROPERTY
8.1 Work product created under this Agreement shall belong to the Client.
8.2 The Service Provider retains rights to pre-existing intellectual property.
8.3 The Service Provider grants the Client a license to use any embedded pre-existing IP.

9. LIMITATION OF LIABILITY
9.1 The Service Provider's total liability shall not exceed [AMOUNT/FEES PAID].
9.2 Neither party shall be liable for indirect, incidental, or consequential damages.
9.3 These limitations shall not apply to gross negligence or willful misconduct.

10. INDEMNIFICATION
Each party shall indemnify the other against claims arising from:
(a) Breach of this Agreement
(b) Negligence or willful misconduct
(c) Infringement of third-party rights

11. FORCE MAJEURE
Neither party shall be liable for delays or failures due to circumstances beyond their reasonable control.

12. DISPUTE RESOLUTION
12.1 Disputes shall be resolved by:
    (a) Negotiation between the parties
    (b) Mediation if negotiation fails
    (c) Arbitration under the Arbitration Act if mediation fails
12.2 The prevailing party shall be entitled to costs.

13. GOVERNING LAW
This Agreement shall be governed by the laws of Trinidad and Tobago.

IN WITNESS WHEREOF the parties have executed this Agreement.

SIGNED by the Client )
_____________________ )  _______________________
Witness Name          )  CLIENT SIGNATURE
_____________________ )
Witness Signature     )

SIGNED by the Service Provider )
______________________________ )  _______________________
Witness Name                   )  PROVIDER SIGNATURE
______________________________ )
Witness Signature              )

SCHEDULE A - SCOPE OF SERVICES
[DETAILED DESCRIPTION OF SERVICES]

SCHEDULE B - FEE SCHEDULE
[DETAILED FEE BREAKDOWN]
`,
  },

  ndaTT: {
    name: 'Non-Disclosure Agreement (T&T)',
    description: 'Confidentiality agreement compliant with T&T Data Protection Act',
    category: 'commercial',
    jurisdiction: 'Trinidad and Tobago',
    variables: ['Disclosing Party', 'Receiving Party', 'Purpose', 'Duration', 'Confidential Information Definition'],
    template: `
NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement is made on [DATE] between:

DISCLOSING PARTY: [NAME], [a company incorporated under the laws of Trinidad and Tobago / an individual] of [ADDRESS] (hereinafter referred to as "the Disclosing Party");

AND

RECEIVING PARTY: [NAME], [a company incorporated under the laws of Trinidad and Tobago / an individual] of [ADDRESS] (hereinafter referred to as "the Receiving Party");

(each a "Party" and together the "Parties")

WHEREAS the Disclosing Party possesses certain confidential information and the Receiving Party desires to receive such information for the Purpose defined below;

AND WHEREAS the Parties wish to ensure the confidentiality of such information;

NOW THEREFORE IT IS AGREED as follows:

1. DEFINITIONS
1.1 "Confidential Information" means all information disclosed by the Disclosing Party, whether orally, in writing, or in electronic form, including but not limited to:
    (a) Trade secrets, business plans, and strategies
    (b) Financial information, pricing, and costs
    (c) Technical data, processes, and procedures
    (d) Customer and supplier information
    (e) Personal data as defined in the Data Protection Act
    (f) Any information marked "Confidential"
    (g) Any information that would reasonably be considered confidential

1.2 "Purpose" means [DESCRIPTION OF PURPOSE].

1.3 "Representatives" means directors, officers, employees, agents, and professional advisors.

2. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party shall:
2.1 Maintain strict confidentiality of the Confidential Information
2.2 Use the Confidential Information solely for the Purpose
2.3 Not disclose the Confidential Information to third parties without prior written consent
2.4 Protect the Confidential Information with the same degree of care as its own confidential information
2.5 Ensure that its Representatives comply with these obligations
2.6 Not copy or reproduce Confidential Information except as necessary for the Purpose

3. EXCLUSIONS
Confidential Information does not include information that:
3.1 Is or becomes publicly available through no fault of the Receiving Party
3.2 Was in the Receiving Party's possession prior to disclosure with no obligation of confidentiality
3.3 Is independently developed by the Receiving Party
3.4 Is disclosed with the Disclosing Party's prior written consent
3.5 Is required to be disclosed by law or court order

4. DATA PROTECTION
4.1 Each Party shall comply with the Data Protection Act, Chapter 22:04.
4.2 Personal data shall be processed only for the Purpose and in accordance with the Act.
4.3 Data subjects' rights shall be respected.

5. TERM
5.1 This Agreement shall remain in effect for [DURATION] from the date of signing.
5.2 The confidentiality obligations shall survive for [NUMBER] years after termination.

6. RETURN OF INFORMATION
6.1 Upon request or termination, the Receiving Party shall:
    (a) Return all Confidential Information to the Disclosing Party
    (b) Destroy any copies made
    (c) Certify destruction in writing

7. REMEDIES
7.1 The Disclosing Party acknowledges that money damages may not be adequate for breach.
7.2 The Disclosing Party shall be entitled to injunctive relief.
7.3 Nothing herein shall limit other remedies available at law.

8. NO LICENSE
Nothing herein grants any license or right to the Confidential Information except as expressly provided.

9. GOVERNING LAW AND JURISDICTION
9.1 This Agreement shall be governed by the laws of Trinidad and Tobago.
9.2 Disputes shall be submitted to the exclusive jurisdiction of the Courts of Trinidad and Tobago.

IN WITNESS WHEREOF the parties have executed this Agreement.

SIGNED by the Disclosing Party )
______________________________ )  _______________________
Witness Name                   )  DISCLOSING PARTY SIGNATURE
______________________________ )
Witness Signature              )

SIGNED by the Receiving Party )
_____________________________ )  _______________________
Witness Name                  )  RECEIVING PARTY SIGNATURE
_____________________________ )
Witness Signature             )

IMPORTANT NOTES:
1. Consider whether mutual or one-way NDA is required
2. Define Purpose narrowly to limit use
3. Consider inclusion of non-solicitation provisions
4. Review for compliance with Data Protection Act if personal data involved
`,
  },
};

export type TTTemplateKey = keyof typeof TT_LEGAL_TEMPLATES;

export function getTemplateByKey(key: TTTemplateKey): TTLegalTemplate | undefined {
  return TT_LEGAL_TEMPLATES[key];
}

export function getTemplatesByCategory(category: TTLegalTemplate['category']): TTLegalTemplate[] {
  return Object.values(TT_LEGAL_TEMPLATES).filter(t => t.category === category);
}

export function getAllTemplateVariables(): string[] {
  const variables = new Set<string>();
  Object.values(TT_LEGAL_TEMPLATES).forEach(template => {
    template.variables.forEach(v => variables.add(v));
  });
  return Array.from(variables).sort();
}

export default TT_LEGAL_TEMPLATES;
