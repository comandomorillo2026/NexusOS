/**
 * Insurance/E-Claims Processing for NexusOS
 * X12 837P claims, X12 270/271 eligibility, NCPDP SCRIPT
 */

// X12 Segment Types
export type X12Segment = 'ISA' | 'GS' | 'ST' | 'BHT' | 'NM1' | 'N3' | 'N4' | 'REF' | 'DMG' | 'INS' | 'HI' | 'SV1' | 'SE' | 'GE' | 'IEA';

// Insurance Claim Types
export type ClaimType = 'professional' | 'institutional' | 'dental';

// Claim Status
export type ClaimStatus = 'draft' | 'submitted' | 'accepted' | 'rejected' | 'paid' | 'partial' | 'denied';

// Eligibility Status
export type EligibilityStatus = 'active' | 'inactive' | 'pending' | 'not_found';

// Provider Information
export interface ProviderInfo {
  npi: string;
  name: string;
  taxId: string;
  taxonomyCode?: string;
  address: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
  phone?: string;
  fax?: string;
}

// Subscriber/Patient Information
export interface SubscriberInfo {
  memberId: string;
  groupNumber?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  sex: 'M' | 'F' | 'U';
  address?: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
  phone?: string;
  relationshipToSubscriber?: 'self' | 'spouse' | 'child' | 'other';
}

// Insurance Information
export interface InsuranceInfo {
  payerId: string;
  payerName: string;
  payerAddress?: {
    street1: string;
    city: string;
    state: string;
    postalCode: string;
  };
  planName?: string;
  planType?: 'HMO' | 'PPO' | 'POS' | 'EPO' | 'FFS';
}

// Service Line Item
export interface ServiceLineItem {
  lineNumber: number;
  serviceDate: string;
  serviceDateEnd?: string;
  placeOfService: string;
  procedureCode: string;
  modifier1?: string;
  modifier2?: string;
  modifier3?: string;
  modifier4?: string;
  diagnosisPointer?: string[];
  quantity?: number;
  unit?: 'UN' | 'MJ' | 'DA' | 'WK' | 'MO';
  chargeAmount: number;
  emergencyIndicator?: boolean;
  epsdtIndicator?: boolean;
  familyPlanningIndicator?: boolean;
  notes?: string;
}

// Claim Input
export interface ClaimInput {
  claimId: string;
  claimType: ClaimType;
  provider: ProviderInfo;
  subscriber: SubscriberInfo;
  insurance: InsuranceInfo;
  serviceLines: ServiceLineItem[];
  referringProvider?: {
    npi: string;
    name: string;
  };
  renderingProvider?: {
    npi: string;
    name: string;
  };
  billingProvider?: ProviderInfo;
  diagnosisCodes: string[];
  priorAuthorizationNumber?: string;
  admissionDate?: string;
  dischargeDate?: string;
  admissionType?: string;
  patientStatus?: string;
}

// Claim Response
export interface ClaimResponse {
  claimId: string;
  claimStatus: ClaimStatus;
  claimNumber?: string;
  batchNumber?: string;
  receivedDate?: string;
  processedDate?: string;
  totalCharges: number;
  totalAllowed?: number;
  totalPaid?: number;
  patientResponsibility?: number;
  adjustmentAmount?: number;
  rejectReason?: string;
  rejectCode?: string;
  serviceLines?: {
    lineNumber: number;
    procedureCode: string;
    allowedAmount?: number;
    paidAmount?: number;
    patientResponsibility?: number;
    adjustmentReason?: string;
    rejectReason?: string;
  }[];
}

// Eligibility Request
export interface EligibilityRequest {
  transactionId: string;
  provider: ProviderInfo;
  subscriber: SubscriberInfo;
  insurance: InsuranceInfo;
  serviceDate: string;
  serviceType?: string[];
}

// Eligibility Response
export interface EligibilityResponse {
  transactionId: string;
  status: EligibilityStatus;
  eligible: boolean;
  eligibilityDate: string;
  planName?: string;
  planType?: string;
  coverageType?: string;
  effectiveDate?: string;
  terminationDate?: string;
  copay?: {
    inNetwork?: number;
    outNetwork?: number;
    specialist?: number;
    emergency?: number;
  };
  deductible?: {
    individual?: {
      amount: number;
      met: number;
    };
    family?: {
      amount: number;
      met: number;
    };
  };
  outOfPocketMax?: {
    individual?: number;
    family?: number;
  };
  coinsurance?: {
    inNetwork?: number;
    outNetwork?: number;
  };
  priorAuthRequired?: boolean;
  referralRequired?: boolean;
  inNetwork?: boolean;
  networkId?: string;
  networkName?: string;
  message?: string;
  error?: string;
}

// X12 Interchange Control Header (ISA)
interface ISA {
  authorizationInfoQualifier: string;
  authorizationInformation: string;
  securityInfoQualifier: string;
  securityInformation: string;
  senderIdQualifier: string;
  senderId: string;
  receiverIdQualifier: string;
  receiverId: string;
  interchangeDate: string;
  interchangeTime: string;
  repetitionSeparator: string;
  interchangeControlVersion: string;
  interchangeControlNumber: string;
  acknowledgmentRequested: string;
  usageIndicator: 'P' | 'T';
  componentElementSeparator: string;
}

// X12 Functional Group Header (GS)
interface GS {
  functionalIdCode: string;
  senderId: string;
  receiverId: string;
  groupDate: string;
  groupTime: string;
  groupControlNumber: string;
  responsibleAgency: string;
  version: string;
}

/**
 * X12 Claims Processing
 */
export class X12ClaimsProcessor {
  private elementSeparator: string = '*';
  private segmentTerminator: string = '~';
  private componentSeparator: string = ':';
  private repetitionSeparator: string = '^';

  constructor(options?: {
    elementSeparator?: string;
    segmentTerminator?: string;
    componentSeparator?: string;
    repetitionSeparator?: string;
  }) {
    if (options) {
      this.elementSeparator = options.elementSeparator || this.elementSeparator;
      this.segmentTerminator = options.segmentTerminator || this.segmentTerminator;
      this.componentSeparator = options.componentSeparator || this.componentSeparator;
      this.repetitionSeparator = options.repetitionSeparator || this.repetitionSeparator;
    }
  }

  /**
   * Build X12 segment
   */
  private buildSegment(segmentId: string, elements: (string | number | undefined)[]): string {
    return segmentId + this.elementSeparator + elements.map(e => e ?? '').join(this.elementSeparator) + this.segmentTerminator;
  }

  /**
   * Build ISA segment
   */
  private buildISASegment(config: {
    senderId: string;
    receiverId: string;
    controlNumber: string;
    testMode?: boolean;
  }): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const time = now.toISOString().slice(11, 16).replace(':', '');

    return this.buildSegment('ISA', [
      '00',           // Authorization Information Qualifier
      '          ',   // Authorization Information (10 chars)
      '00',           // Security Information Qualifier
      '          ',   // Security Information (10 chars)
      'ZZ',           // Sender ID Qualifier
      config.senderId.padEnd(15),  // Sender ID
      'ZZ',           // Receiver ID Qualifier
      config.receiverId.padEnd(15), // Receiver ID
      date,           // Interchange Date
      time,           // Interchange Time
      this.repetitionSeparator, // Repetition Separator
      '00501',        // Interchange Control Version
      config.controlNumber.padStart(9, '0'), // Control Number
      '0',            // Acknowledgment Requested
      config.testMode ? 'T' : 'P', // Usage Indicator
      this.componentSeparator, // Component Element Separator
    ]);
  }

  /**
   * Build GS segment
   */
  private buildGSSegment(config: {
    senderId: string;
    receiverId: string;
    controlNumber: string;
    transactionType: string;
  }): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const time = now.toISOString().slice(11, 16).replace(':', '');

    return this.buildSegment('GS', [
      config.transactionType, // Functional ID Code
      config.senderId,        // Sender ID
      config.receiverId,      // Receiver ID
      date,                   // Group Date
      time,                   // Group Time
      config.controlNumber,   // Group Control Number
      'X',                    // Responsible Agency
      '005010X222A1',         // Version
    ]);
  }

  /**
   * Build ST segment
   */
  private buildSTSegment(transactionType: string, controlNumber: string): string {
    return this.buildSegment('ST', [
      transactionType,
      controlNumber,
      '005010X222A1',
    ]);
  }

  /**
   * Build SE segment
   */
  private buildSESegment(segmentCount: number, controlNumber: string): string {
    return this.buildSegment('SE', [segmentCount.toString(), controlNumber]);
  }

  /**
   * Build GE segment
   */
  private buildGESegment(controlNumber: string): string {
    return this.buildSegment('GE', ['1', controlNumber]);
  }

  /**
   * Build IEA segment
   */
  private buildIEASegment(controlNumber: string): string {
    return this.buildSegment('IEA', ['1', controlNumber]);
  }

  /**
   * Build NM1 segment (Name)
   */
  private buildNM1Segment(config: {
    entityIdentifier: string;
    entityType: '1' | '2'; // 1=person, 2=organization
    nameLast?: string;
    nameFirst?: string;
    nameMiddle?: string;
    nameSuffix?: string;
    identificationQualifier?: string;
    identificationCode?: string;
  }): string {
    if (config.entityType === '2') {
      return this.buildSegment('NM1', [
        config.entityIdentifier,
        config.entityType,
        config.nameLast, // Organization name
        '',
        '',
        '',
        '',
        config.identificationQualifier,
        config.identificationCode,
      ]);
    }

    return this.buildSegment('NM1', [
      config.entityIdentifier,
      config.entityType,
      config.nameLast,
      config.nameFirst,
      config.nameMiddle,
      config.nameSuffix,
      '',
      config.identificationQualifier,
      config.identificationCode,
    ]);
  }

  /**
   * Build N3 segment (Address)
   */
  private buildN3Segment(street1: string, street2?: string): string {
    return this.buildSegment('N3', [street1, street2]);
  }

  /**
   * Build N4 segment (City, State, Zip)
   */
  private buildN4Segment(city: string, state: string, postalCode: string, country?: string): string {
    return this.buildSegment('N4', [city, state, postalCode, country]);
  }

  /**
   * Build REF segment (Reference)
   */
  private buildREFSegment(qualifier: string, reference: string, description?: string): string {
    return this.buildSegment('REF', [qualifier, reference, description]);
  }

  /**
   * Build DMG segment (Demographics)
   */
  private buildDMGSegment(dob: string, sex: 'M' | 'F' | 'U'): string {
    return this.buildSegment('DMG', ['D8', dob.replace(/-/g, ''), sex]);
  }

  /**
   * Build HI segment (Diagnosis)
   */
  private buildHISegment(diagnosisCodes: string[], type: 'BK' | 'BF' = 'BK'): string {
    const diagnoses = diagnosisCodes.map((code, index) => {
      if (index === 0) {
        return `${type}:${this.componentSeparator}ICD-10-CM${this.componentSeparator}${code}`;
      }
      return `BF:${this.componentSeparator}ICD-10-CM${this.componentSeparator}${code}`;
    });
    return this.buildSegment('HI', diagnoses);
  }

  /**
   * Build SV1 segment (Service Line)
   */
  private buildSV1Segment(line: ServiceLineItem): string {
    const procedure = [
      'HC',
      line.procedureCode,
      line.modifier1,
      line.modifier2,
      line.modifier3,
      line.modifier4,
    ].filter(Boolean).join(this.componentSeparator);

    return this.buildSegment('SV1', [
      procedure,
      line.chargeAmount.toFixed(2),
      line.unit || 'UN',
      line.quantity?.toFixed(1) || '1',
      '', // Composite Diagnosis Code Pointer
      line.serviceDate.replace(/-/g, ''),
      line.serviceDateEnd?.replace(/-/g, ''),
      '', // Place of Service Code (we'll add later)
      '', // Service Type Code
      '', // Coverage Level Code
      '', // Diagnosis Code Pointer
      '', // Multiple Procedure Code
      '', // Emergency Indicator
      '', // EPSDT Indicator
      '', // Family Planning Indicator
      '', // Review Code
      '', // National Uniform Billing Committee Revenue Code
      '', // Description
      '', // Provider Taxonomy Code
    ]);
  }

  /**
   * Generate X12 837P (Professional Claim)
   */
  generate837P(claim: ClaimInput): string {
    const segments: string[] = [];
    const interchangeControlNumber = Date.now().toString().slice(-9);
    const groupControlNumber = interchangeControlNumber;
    const transactionControlNumber = interchangeControlNumber.slice(-6);

    // ISA - Interchange Control Header
    segments.push(this.buildISASegment({
      senderId: claim.provider.npi,
      receiverId: claim.insurance.payerId,
      controlNumber: interchangeControlNumber,
    }));

    // GS - Functional Group Header
    segments.push(this.buildGSSegment({
      senderId: claim.provider.npi,
      receiverId: claim.insurance.payerId,
      controlNumber: groupControlNumber,
      transactionType: 'HC',
    }));

    // ST - Transaction Set Header
    segments.push(this.buildSTSegment('837', transactionControlNumber));

    // BHT - Beginning of Hierarchical Transaction
    segments.push(this.buildSegment('BHT', ['0019', '00', transactionControlNumber, 
      new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      new Date().toISOString().slice(11, 16).replace(':', ''),
      'CH']));

    // NM1 - Payer Information
    segments.push(this.buildNM1Segment({
      entityIdentifier: 'PR',
      entityType: '2',
      nameLast: claim.insurance.payerName,
      identificationQualifier: 'PI',
      identificationCode: claim.insurance.payerId,
    }));

    // Payer Address
    if (claim.insurance.payerAddress) {
      segments.push(this.buildN3Segment(claim.insurance.payerAddress.street1));
      segments.push(this.buildN4Segment(
        claim.insurance.payerAddress.city,
        claim.insurance.payerAddress.state,
        claim.insurance.payerAddress.postalCode
      ));
    }

    // Loop 2010AA - Billing Provider
    segments.push(this.buildNM1Segment({
      entityIdentifier: '85',
      entityType: '2',
      nameLast: (claim.billingProvider || claim.provider).name,
      identificationQualifier: 'XX',
      identificationCode: (claim.billingProvider || claim.provider).npi,
    }));

    const billingProvider = claim.billingProvider || claim.provider;
    segments.push(this.buildN3Segment(billingProvider.address.street1, billingProvider.address.street2));
    segments.push(this.buildN4Segment(
      billingProvider.address.city,
      billingProvider.address.state,
      billingProvider.address.postalCode
    ));
    segments.push(this.buildREFSegment('EI', billingProvider.taxId));
    if (billingProvider.taxonomyCode) {
      segments.push(this.buildREFSegment('B3', billingProvider.taxonomyCode));
    }

    // Loop 2010BA - Subscriber
    segments.push(this.buildNM1Segment({
      entityIdentifier: 'NM',
      entityType: '1',
      nameLast: claim.subscriber.lastName,
      nameFirst: claim.subscriber.firstName,
      nameMiddle: claim.subscriber.middleName,
      identificationQualifier: 'MI',
      identificationCode: claim.subscriber.memberId,
    }));

    if (claim.subscriber.address) {
      segments.push(this.buildN3Segment(claim.subscriber.address.street1, claim.subscriber.address.street2));
      segments.push(this.buildN4Segment(
        claim.subscriber.address.city,
        claim.subscriber.address.state,
        claim.subscriber.address.postalCode
      ));
    }

    segments.push(this.buildDMGSegment(claim.subscriber.dateOfBirth, claim.subscriber.sex));

    // Loop 2300 - Claim Information
    segments.push(this.buildSegment('CLM', [
      claim.claimId,
      claim.serviceLines.reduce((sum, line) => sum + line.chargeAmount, 0).toFixed(2),
      '',
      '',
      '', // Provider Accept Assignment Code
      'A', // Assignment of Benefits Indicator
      'Y', // Benefits Assignment Certification
      '', // Release of Information Code
    ]));

    // Diagnosis Codes
    segments.push(this.buildHISegment(claim.diagnosisCodes));

    // Prior Authorization
    if (claim.priorAuthorizationNumber) {
      segments.push(this.buildREFSegment('G4', claim.priorAuthorizationNumber));
    }

    // Loop 2400 - Service Lines
    claim.serviceLines.forEach((line, index) => {
      // SV1 segment
      const procedure = [
        'HC',
        line.procedureCode,
        line.modifier1,
        line.modifier2,
        line.modifier3,
        line.modifier4,
      ].filter(Boolean).join(this.componentSeparator);

      segments.push(this.buildSegment('SV1', [
        procedure,
        line.chargeAmount.toFixed(2),
        line.unit || 'UN',
        line.quantity?.toFixed(1) || '1',
        '', // Diagnosis Pointer
        line.serviceDate.replace(/-/g, ''),
        line.serviceDateEnd?.replace(/-/g, ''),
        line.placeOfService,
      ]));

      // Date Reference
      segments.push(this.buildSegment('DTP', ['472', 'D8', line.serviceDate.replace(/-/g, '')]));
    });

    // SE - Transaction Set Trailer
    const segmentCount = segments.length; // Count all segments from ST to SE
    segments.push(this.buildSESegment(segmentCount, transactionControlNumber));

    // GE - Functional Group Trailer
    segments.push(this.buildGESegment(groupControlNumber));

    // IEA - Interchange Control Trailer
    segments.push(this.buildIEASegment(interchangeControlNumber));

    return segments.join('\n');
  }

  /**
   * Generate X12 270 (Eligibility Inquiry)
   */
  generate270(request: EligibilityRequest): string {
    const segments: string[] = [];
    const interchangeControlNumber = Date.now().toString().slice(-9);
    const groupControlNumber = interchangeControlNumber;
    const transactionControlNumber = interchangeControlNumber.slice(-6);

    // ISA - Interchange Control Header
    segments.push(this.buildISASegment({
      senderId: request.provider.npi,
      receiverId: request.insurance.payerId,
      controlNumber: interchangeControlNumber,
    }));

    // GS - Functional Group Header
    segments.push(this.buildGSSegment({
      senderId: request.provider.npi,
      receiverId: request.insurance.payerId,
      controlNumber: groupControlNumber,
      transactionType: 'HS',
    }));

    // ST - Transaction Set Header
    segments.push(this.buildSTSegment('270', transactionControlNumber));

    // BHT - Beginning of Hierarchical Transaction
    segments.push(this.buildSegment('BHT', ['0022', '13', transactionControlNumber,
      new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      new Date().toISOString().slice(11, 16).replace(':', ''),
    ]));

    // Loop 2000A - Information Source (Payer)
    segments.push(this.buildSegment('HL', ['1', '', '20', '1']));
    segments.push(this.buildNM1Segment({
      entityIdentifier: 'PR',
      entityType: '2',
      nameLast: request.insurance.payerName,
      identificationQualifier: 'PI',
      identificationCode: request.insurance.payerId,
    }));

    // Loop 2000B - Information Receiver (Provider)
    segments.push(this.buildSegment('HL', ['2', '1', '21', '1']));
    segments.push(this.buildNM1Segment({
      entityIdentifier: 'FA',
      entityType: '2',
      nameLast: request.provider.name,
      identificationQualifier: 'XX',
      identificationCode: request.provider.npi,
    }));

    // Loop 2000C - Subscriber
    segments.push(this.buildSegment('HL', ['3', '2', '22', '0']));
    segments.push(this.buildNM1Segment({
      entityIdentifier: 'IL',
      entityType: '1',
      nameLast: request.subscriber.lastName,
      nameFirst: request.subscriber.firstName,
      nameMiddle: request.subscriber.middleName,
      identificationQualifier: 'MI',
      identificationCode: request.subscriber.memberId,
    }));

    // Service Date
    segments.push(this.buildSegment('DTP', ['291', 'D8', request.serviceDate.replace(/-/g, '')]));

    // Service Type Requested
    if (request.serviceType && request.serviceType.length > 0) {
      segments.push(this.buildSegment('EQ', [request.serviceType.join(this.repetitionSeparator)]));
    }

    // SE - Transaction Set Trailer
    segments.push(this.buildSESegment(segments.length, transactionControlNumber));

    // GE - Functional Group Trailer
    segments.push(this.buildGESegment(groupControlNumber));

    // IEA - Interchange Control Trailer
    segments.push(this.buildIEASegment(interchangeControlNumber));

    return segments.join('\n');
  }

  /**
   * Parse X12 271 (Eligibility Response)
   */
  parse271(response: string): EligibilityResponse {
    const segments = response.split(this.segmentTerminator).map(s => s.trim()).filter(Boolean);
    const result: EligibilityResponse = {
      transactionId: '',
      status: 'active',
      eligible: false,
      eligibilityDate: new Date().toISOString(),
    };

    let currentSegment: string[] = [];

    for (const segment of segments) {
      const elements = segment.split(this.elementSeparator);
      const segmentId = elements[0];

      switch (segmentId) {
        case 'ST':
          // Transaction Set Header
          break;
        case 'BHT':
          // Beginning of Hierarchical Transaction
          result.transactionId = elements[3] || '';
          break;
        case 'EB':
          // Eligibility Benefit Information
          result.eligible = true;
          result.coverageType = elements[2];
          break;
        case 'MSG':
          // Message
          result.message = elements[1];
          break;
        case 'III':
          // Eligibility Information
          // Can contain copay, deductible info
          break;
        case 'DTP':
          // Date/Time Reference
          if (elements[1] === '291') {
            result.eligibilityDate = elements[3]?.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') || '';
          }
          break;
      }
    }

    return result;
  }

  /**
   * Generate NCPDP SCRIPT e-prescription
   */
  generateNcpdpScript(prescription: {
    prescriptionId: string;
    patient: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      sex: 'M' | 'F';
      address: { street: string; city: string; state: string; postalCode: string };
      phone?: string;
    };
    prescriber: {
      npi: string;
      dea: string;
      name: string;
      phone: string;
    };
    pharmacy?: {
      ncpdpId: string;
      name: string;
      phone: string;
    };
    medication: {
      drugCode: string;
      drugName: string;
      strength: string;
      quantity: number;
      quantityUnit: string;
      daysSupply: number;
      directions: string;
      refills: number;
      substitutions: '0' | '1' | '2';
    };
  }): string {
    // Simplified NCPDP SCRIPT format
    const segments: string[] = [];

    segments.push(`UNB+UNOA:2+${prescription.prescriber.npi}+${prescription.pharmacy?.ncpdpId || 'PHARMACY'}+${new Date().toISOString().slice(0, 10)}+${prescription.prescriptionId}'`);
    
    segments.push(`UNG+MEDPREQ+${prescription.prescriber.npi}+${prescription.pharmacy?.ncpdpId || 'PHARMACY'}+${new Date().toISOString().slice(0, 10)}+${prescription.prescriptionId}'`);

    // Patient segment
    segments.push(`PAT+${prescription.patient.lastName}+${prescription.patient.firstName}++${prescription.patient.dateOfBirth.replace(/-/g, '')}+${prescription.patient.sex}'`);

    // Prescriber segment
    segments.push(`PDR+${prescription.prescriber.npi}+${prescription.prescriber.dea}+${prescription.prescriber.name}+${prescription.prescriber.phone}'`);

    // Pharmacy segment
    if (prescription.pharmacy) {
      segments.push(`PHY+${prescription.pharmacy.ncpdpId}+${prescription.pharmacy.name}+${prescription.pharmacy.phone}'`);
    }

    // Medication segment
    segments.push(`MED+${prescription.medication.drugCode}+${prescription.medication.drugName}+${prescription.medication.strength}+${prescription.medication.quantity}+${prescription.medication.quantityUnit}+${prescription.medication.daysSupply}+${prescription.medication.directions}+${prescription.medication.refills}+${prescription.medication.substitutions}'`);

    segments.push(`UNE+${prescription.prescriptionId}'`);
    segments.push(`UNZ+${prescription.prescriptionId}'`);

    return segments.join('\n');
  }
}

export default X12ClaimsProcessor;
