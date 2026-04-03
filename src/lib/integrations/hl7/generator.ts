/**
 * HL7 v2 Message Generator for NexusOS
 * Generate ADT, ORU, MDM messages
 */

import {
  Hl7EncodingCharacters,
  Hl7MessageType,
  Hl7TriggerEvent,
  Hl7PatientInfo,
  Hl7VisitInfo,
  Hl7Order,
  Hl7Document,
  DEFAULT_ENCODING,
} from './parser';

// Message generation options
export interface Hl7MessageOptions {
  messageType: Hl7MessageType;
  triggerEvent: Hl7TriggerEvent;
  version?: string;
  sendingApplication?: string;
  sendingFacility?: string;
  receivingApplication?: string;
  receivingFacility?: string;
  messageControlId?: string;
  processingId?: 'P' | 'T' | 'D';
  encodingCharacters?: Hl7EncodingCharacters;
}

// Patient data for message generation
export interface PatientData {
  patientId: string;
  patientIdType?: string;
  familyName: string;
  givenName: string;
  middleName?: string;
  dateOfBirth?: string;
  sex?: 'M' | 'F' | 'O' | 'U';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  phoneHome?: string;
  phoneBusiness?: string;
  ssn?: string;
  accountNumber?: string;
  maritalStatus?: string;
  religion?: string;
  race?: string;
  ethnicity?: string;
}

// Visit data for message generation
export interface VisitData {
  patientClass?: 'I' | 'O' | 'E' | 'P' | 'B' | 'C';
  location?: {
    pointOfCare?: string;
    room?: string;
    bed?: string;
    facility?: string;
  };
  admissionType?: string;
  referringDoctor?: { id: string; familyName: string; givenName: string };
  attendingDoctor?: { id: string; familyName: string; givenName: string };
  admittingDoctor?: { id: string; familyName: string; givenName: string };
  visitNumber?: string;
  admitDateTime?: string;
  dischargeDateTime?: string;
  dischargeDisposition?: string;
  preadmitNumber?: string;
}

// Order data for message generation
export interface OrderData {
  orderControl?: 'NW' | 'SC' | 'CA' | 'DC' | 'RE' | 'RO' | 'OH' | 'OK' | 'XO' | 'RP' | 'UA';
  placerOrderNumber?: string;
  fillerOrderNumber?: string;
  orderStatus?: string;
  orderingProvider?: { id: string; familyName: string; givenName: string };
  testCode: string;
  testName: string;
  testSystem?: string;
  priority?: string;
  requestedDateTime?: string;
  observations?: ObservationData[];
  collectionDateTime?: string;
  specimenSource?: string;
  clinicalInfo?: string;
  reasonForStudy?: string;
}

// Observation data for message generation
export interface ObservationData {
  setId?: string;
  valueType?: 'NM' | 'ST' | 'TX' | 'FT' | 'CE' | 'CWE' | 'SN' | 'DT' | 'TM' | 'DTM';
  testCode: string;
  testName: string;
  testSystem?: string;
  subId?: string;
  value?: string | number;
  units?: string;
  unitSystem?: string;
  referenceRange?: string;
  abnormalFlag?: 'N' | 'H' | 'HH' | 'L' | 'LL' | '<' | '>' | 'A' | 'AA' | 'R' | 'I' | 'S' | 'MS';
  resultStatus?: 'F' | 'P' | 'C' | 'R' | 'I' | 'S' | 'X' | 'Y' | 'Z';
  observationDateTime?: string;
  producerId?: string;
  responsibleObserver?: string;
  method?: string;
}

// Document data for MDM messages
export interface DocumentData {
  documentId?: string;
  documentType?: string;
  documentSubtype?: string;
  documentDateTime?: string;
  provider?: { id: string; familyName: string; givenName: string };
  documentTitle?: string;
  documentContent?: string;
  documentStatus?: string;
  documentFormat?: string;
  availability?: 'AV' | 'NA' | 'CA' | 'OB' | 'UN';
  confidentiality?: string;
}

/**
 * HL7 v2 Message Generator
 */
export class Hl7Generator {
  private encoding: Hl7EncodingCharacters;
  private segmentTerminator: string;

  constructor(options?: {
    encodingCharacters?: Partial<Hl7EncodingCharacters>;
    segmentTerminator?: string;
  }) {
    this.encoding = { ...DEFAULT_ENCODING, ...options?.encodingCharacters };
    this.segmentTerminator = options?.segmentTerminator || '\r';
  }

  /**
   * Generate message control ID
   */
  private generateMessageControlId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `MSG${timestamp}${random}`;
  }

  /**
   * Get current timestamp in HL7 format
   */
  private getCurrentTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
  }

  /**
   * Format date for HL7
   */
  private formatDate(date?: string): string {
    if (!date) return '';
    // Convert YYYY-MM-DD to YYYYMMDD
    return date.replace(/[-:T.Z]/g, '').substring(0, 14);
  }

  /**
   * Build a segment with fields
   */
  private buildSegment(segmentType: string, fields: (string | undefined)[]): string {
    const sep = this.encoding.fieldSeparator;
    const nonEmptyFields = fields.map((f) => f || '');
    return segmentType + sep + nonEmptyFields.join(sep);
  }

  /**
   * Build a component
   */
  private buildComponent(components: (string | undefined)[]): string {
    return components.filter((c) => c !== undefined && c !== '').join(this.encoding.componentSeparator);
  }

  /**
   * Build a name component (XPN type)
   */
  private buildName(familyName: string, givenName: string, middleName?: string): string {
    return this.buildComponent([
      familyName,
      givenName,
      middleName,
      undefined, // Suffix
      undefined, // Prefix
      undefined, // Degree
      undefined, // Name Type
    ]);
  }

  /**
   * Build a coded element (CE/CWE type)
   */
  private buildCodedElement(
    identifier?: string,
    text?: string,
    system?: string,
    altIdentifier?: string,
    altText?: string,
    altSystem?: string
  ): string {
    return this.buildComponent([
      identifier,
      text,
      system,
      altIdentifier,
      altText,
      altSystem,
    ]);
  }

  /**
   * Build MSH (Message Header) segment
   */
  private buildMshSegment(options: Hl7MessageOptions): string {
    const encChars = `${this.encoding.componentSeparator}${this.encoding.repetitionSeparator}${this.encoding.escapeCharacter}${this.encoding.subcomponentSeparator}`;
    const timestamp = this.getCurrentTimestamp();
    const controlId = options.messageControlId || this.generateMessageControlId();

    return this.buildSegment('MSH', [
      this.encoding.fieldSeparator,
      encChars,
      options.sendingApplication || 'NEXUSOS',
      options.sendingFacility || 'NEXUS',
      options.receivingApplication || 'RECV',
      options.receivingFacility || 'RECV_FAC',
      timestamp,
      '', // Security
      `${options.messageType}${this.encoding.componentSeparator}${options.triggerEvent}`,
      controlId,
      options.processingId || 'P',
      options.version || '2.5.1',
    ]);
  }

  /**
   * Build EVN (Event Type) segment
   */
  private buildEvnSegment(triggerEvent: Hl7TriggerEvent, dateTime?: string, operatorId?: string): string {
    return this.buildSegment('EVN', [
      triggerEvent,
      this.formatDate(dateTime) || this.getCurrentTimestamp(),
      '', // Planned Event Date/Time
      operatorId || '',
      '', // Event Reason
    ]);
  }

  /**
   * Build PID (Patient Identification) segment
   */
  private buildPidSegment(patient: PatientData, sequence: number = 1): string {
    // PID-3: Patient Identifier List
    const patientIdList = this.buildCodedElement(
      patient.patientId,
      undefined,
      patient.patientIdType || 'MR'
    );

    // PID-5: Patient Name
    const patientName = this.buildName(patient.familyName, patient.givenName, patient.middleName);

    // PID-7: Date of Birth
    const dob = this.formatDate(patient.dateOfBirth);

    // PID-11: Patient Address
    let address = '';
    if (patient.address) {
      address = this.buildComponent([
        patient.address.street,
        '', // Other Designation
        patient.address.city,
        patient.address.state,
        patient.address.postalCode,
        patient.address.country,
        'H', // Address Type
      ]);
    }

    // PID-13: Phone Number - Home
    // PID-14: Phone Number - Business
    const phoneHome = patient.phoneHome;
    const phoneBusiness = patient.phoneBusiness;

    return this.buildSegment('PID', [
      sequence.toString(),
      '', // Patient ID (External)
      patientIdList, // Patient Identifier List
      '', // Alternate Patient ID
      patientName, // Patient Name
      '', // Mother's Maiden Name
      dob, // Date of Birth
      patient.sex || 'U', // Administrative Sex
      '', // Patient Alias
      this.buildCodedElement(patient.race), // Race
      address, // Patient Address
      '', // County Code
      phoneHome, // Phone Number - Home
      phoneBusiness, // Phone Number - Business
      '', // Primary Language
      this.buildCodedElement(patient.maritalStatus), // Marital Status
      this.buildCodedElement(patient.religion), // Religion
      patient.accountNumber, // Patient Account Number
      patient.ssn, // SSN Number
    ]);
  }

  /**
   * Build PV1 (Patient Visit) segment
   */
  private buildPv1Segment(visit: VisitData, sequence: number = 1): string {
    // PV1-3: Assigned Patient Location
    let location = '';
    if (visit.location) {
      location = this.buildComponent([
        visit.location.pointOfCare,
        visit.location.room,
        visit.location.bed,
        visit.location.facility,
      ]);
    }

    // PV1-7: Attending Doctor
    let attendingDoc = '';
    if (visit.attendingDoctor) {
      attendingDoc = this.buildComponent([
        visit.attendingDoctor.id,
        visit.attendingDoctor.familyName,
        visit.attendingDoctor.givenName,
      ]);
    }

    // PV1-8: Referring Doctor
    let referringDoc = '';
    if (visit.referringDoctor) {
      referringDoc = this.buildComponent([
        visit.referringDoctor.id,
        visit.referringDoctor.familyName,
        visit.referringDoctor.givenName,
      ]);
    }

    // PV1-17: Admitting Doctor
    let admittingDoc = '';
    if (visit.admittingDoctor) {
      admittingDoc = this.buildComponent([
        visit.admittingDoctor.id,
        visit.admittingDoctor.familyName,
        visit.admittingDoctor.givenName,
      ]);
    }

    // PV1-19: Visit Number
    const visitNumber = visit.visitNumber ? this.buildCodedElement(visit.visitNumber) : '';

    return this.buildSegment('PV1', [
      sequence.toString(),
      visit.patientClass || 'I',
      location,
      '', // Admission Type
      '', // Pre-admit Number
      '', // Prior Patient Location
      attendingDoc,
      referringDoc,
      '', // Consulting Doctor
      '', // Hospital Service
      '', // Temporary Location
      '', // Preadmit Test Indicator
      '', // Re-admission Indicator
      '', // Admit Source
      '', // Ambulatory Status
      '', // VIP Indicator
      admittingDoc,
      '', // Patient Type
      visitNumber,
      '', // Financial Class
      '', // Charge Price Indicator
      '', // Courtesy Code
      '', // Credit Rating
      '', // Contract Code
      '', // Contract Effective Date
      '', // Contract Amount
      '', // Contract Period
      '', // Interest Code
      '', // Transfer to Bad Debt Code
      '', // Transfer to Bad Debt Date
      '', // Bad Debt Agency Code
      '', // Bad Debt Transfer Amount
      '', // Bad Debt Recovery Amount
      '', // Delete Account Indicator
      '', // Delete Account Date
      '', // Discharge Disposition
      '', // Discharged to Location
      '', // Diet Type
      '', // Servicing Facility
      '', // Bed Status
      '', // Account Status
      '', // Pending Location
      '', // Prior Temporary Location
      '', // Admit Date/Time
      '', // Discharge Date/Time
      '', // Current Patient Balance
      '', // Total Charges
      '', // Total Adjustments
      '', // Total Payments
      '', // Alternate Visit ID
      '', // Visit Indicator
    ]);
  }

  /**
   * Build ORC (Common Order) segment
   */
  private buildOrcSegment(order: OrderData): string {
    // ORC-12: Ordering Provider
    let orderingProvider = '';
    if (order.orderingProvider) {
      orderingProvider = this.buildComponent([
        order.orderingProvider.id,
        order.orderingProvider.familyName,
        order.orderingProvider.givenName,
      ]);
    }

    return this.buildSegment('ORC', [
      order.orderControl || 'NW',
      order.placerOrderNumber || '',
      order.fillerOrderNumber || '',
      '', // Placer Group Number
      order.orderStatus || 'SC',
      '', // Response Flag
      '', // Quantity/Timing
      '', // Parent Order
      this.formatDate(order.requestedDateTime) || this.getCurrentTimestamp(),
      '', // Entered By
      '', // Verified By
      orderingProvider,
      '', // Enterer's Location
      '', // Call Back Phone Number
      '', // Order Effective Date/Time
      '', // Order Control Code Reason
      '', // Entering Organization
      '', // Entering Device
      '', // Action By
      '', // Advanced Beneficiary Notice Code
      '', // Ordering Facility Name
      '', // Ordering Facility Address
      '', // Ordering Facility Phone Number
      '', // Ordering Provider Address
    ]);
  }

  /**
   * Build OBR (Observation Request) segment
   */
  private buildObrSegment(order: OrderData, sequence: number = 1): string {
    // OBR-4: Universal Service Identifier
    const serviceId = this.buildCodedElement(
      order.testCode,
      order.testName,
      order.testSystem || 'L'
    );

    // OBR-16: Ordering Provider
    let orderingProvider = '';
    if (order.orderingProvider) {
      orderingProvider = this.buildComponent([
        order.orderingProvider.id,
        order.orderingProvider.familyName,
        order.orderingProvider.givenName,
      ]);
    }

    // OBR-27: Quantity/Timing
    let quantityTiming = '';
    if (order.priority) {
      quantityTiming = this.buildComponent([
        '', '', '', '', order.priority,
      ]);
    }

    return this.buildSegment('OBR', [
      sequence.toString(),
      order.placerOrderNumber || '',
      order.fillerOrderNumber || '',
      serviceId,
      order.priority || '',
      this.formatDate(order.requestedDateTime) || this.getCurrentTimestamp(),
      this.formatDate(order.collectionDateTime),
      this.formatDate(order.collectionDateTime),
      order.collectionDateTime ? '1' : '',
      '', // Danger Code
      order.clinicalInfo || '',
      '', // Specimen Received Date/Time
      order.specimenSource || '',
      orderingProvider,
      '', // Call Back Phone Number
      this.formatDate(order.requestedDateTime) || this.getCurrentTimestamp(),
      quantityTiming,
      '', // Parent Result
      order.reasonForStudy || '',
      '', // Assistant Result Interpreter
      '', // Technician
      '', // Transcriptionist
      '', // Scheduled Date/Time
    ]);
  }

  /**
   * Build OBX (Observation Result) segment
   */
  private buildObxSegment(observation: ObservationData, sequence: number = 1): string {
    // OBX-3: Observation Identifier
    const obsId = this.buildCodedElement(
      observation.testCode,
      observation.testName,
      observation.testSystem || 'L'
    );

    // OBX-5: Observation Value
    let value = '';
    if (observation.value !== undefined && observation.value !== null) {
      value = String(observation.value);
    }

    // OBX-6: Units
    const units = observation.units
      ? this.buildCodedElement(observation.units, observation.units, observation.unitSystem || 'UCUM')
      : '';

    return this.buildSegment('OBX', [
      sequence.toString(),
      observation.valueType || 'NM',
      obsId,
      observation.subId || '',
      value,
      units,
      observation.referenceRange || '',
      observation.abnormalFlag || '',
      '', // Probability
      '', // Nature of Abnormal Test
      observation.resultStatus || 'F',
      this.formatDate(observation.observationDateTime) || this.getCurrentTimestamp(),
      '', // Producer's ID
      '', // Responsible Observer
      '', // Observation Method
      '', // Equipment Instance Identifier
      '', // Date/Time of Analysis
    ]);
  }

  /**
   * Build TXA (Transcription Document Header) segment
   */
  private buildTxaSegment(document: DocumentData, sequence: number = 1): string {
    // TXA-2: Document Type
    const docType = this.buildCodedElement(
      document.documentType || 'DOC',
      document.documentSubtype
    );

    // TXA-5: Transcriptionist
    let provider = '';
    if (document.provider) {
      provider = this.buildComponent([
        document.provider.id,
        document.provider.familyName,
        document.provider.givenName,
      ]);
    }

    return this.buildSegment('TXA', [
      sequence.toString(),
      docType,
      document.documentId || this.generateMessageControlId(),
      document.documentStatus || 'AV',
      this.formatDate(document.documentDateTime) || this.getCurrentTimestamp(),
      provider,
      '', // Transcriptionist
      '', // Transcription Date/Time
      document.documentFormat || 'TXT',
      '', // Transcription Method
      document.documentContent ? '1' : '0',
      document.availability || 'AV',
      '', // Document Storage Location
      '', // Document Storage Type
      '', // Document Compression
      '', // Document Title
      document.documentTitle || '',
      '', // Unique Document Number
      '', // Parent Document Number
      '', // Placer Group Number
      document.documentId || '',
      document.confidentiality || 'N',
    ]);
  }

  /**
   * Build NTE (Notes and Comments) segment
   */
  private buildNteSegment(note: string, source?: string, sequence: number = 1): string {
    return this.buildSegment('NTE', [
      sequence.toString(),
      source || '',
      note,
      '', // Comment Type
    ]);
  }

  /**
   * Generate ADT (Admit/Discharge/Transfer) message
   */
  generateAdtMessage(
    options: Hl7MessageOptions,
    patient: PatientData,
    visit?: VisitData,
    notes?: string[]
  ): string {
    if (!options.messageType) options.messageType = 'ADT';
    if (!options.triggerEvent) options.triggerEvent = 'A01';

    const segments: string[] = [];

    // MSH segment
    segments.push(this.buildMshSegment(options));

    // EVN segment
    segments.push(this.buildEvnSegment(options.triggerEvent));

    // PID segment
    segments.push(this.buildPidSegment(patient));

    // PV1 segment (if visit info provided)
    if (visit) {
      segments.push(this.buildPv1Segment(visit));
    }

    // NTE segments (if notes provided)
    if (notes) {
      notes.forEach((note, index) => {
        segments.push(this.buildNteSegment(note, 'RE', index + 1));
      });
    }

    return segments.join(this.segmentTerminator) + this.segmentTerminator;
  }

  /**
   * Generate ORU (Unsolicited Observation) message
   */
  generateOruMessage(
    options: Hl7MessageOptions,
    patient: PatientData,
    orders: OrderData[],
    notes?: string[]
  ): string {
    options.messageType = 'ORU';
    if (!options.triggerEvent) options.triggerEvent = 'R01';

    const segments: string[] = [];

    // MSH segment
    segments.push(this.buildMshSegment(options));

    // PID segment
    segments.push(this.buildPidSegment(patient));

    // Orders with observations
    orders.forEach((order) => {
      // ORC segment
      segments.push(this.buildOrcSegment(order));

      // OBR segment
      segments.push(this.buildObrSegment(order));

      // OBX segments for observations
      if (order.observations) {
        order.observations.forEach((obs, index) => {
          segments.push(this.buildObxSegment(obs, index + 1));
        });
      }

      // NTE segments for this order
      if (notes) {
        notes.forEach((note, index) => {
          segments.push(this.buildNteSegment(note, 'RE', index + 1));
        });
      }
    });

    return segments.join(this.segmentTerminator) + this.segmentTerminator;
  }

  /**
   * Generate ORM (Order Message) message
   */
  generateOrmMessage(
    options: Hl7MessageOptions,
    patient: PatientData,
    orders: OrderData[],
    visit?: VisitData
  ): string {
    options.messageType = 'ORM';
    if (!options.triggerEvent) options.triggerEvent = 'O01';

    const segments: string[] = [];

    // MSH segment
    segments.push(this.buildMshSegment(options));

    // PID segment
    segments.push(this.buildPidSegment(patient));

    // PV1 segment (if visit info provided)
    if (visit) {
      segments.push(this.buildPv1Segment(visit));
    }

    // Orders
    orders.forEach((order) => {
      // ORC segment
      order.orderControl = order.orderControl || 'NW';
      segments.push(this.buildOrcSegment(order));

      // OBR segment
      segments.push(this.buildObrSegment(order));
    });

    return segments.join(this.segmentTerminator) + this.segmentTerminator;
  }

  /**
   * Generate MDM (Medical Document Management) message
   */
  generateMdmMessage(
    options: Hl7MessageOptions,
    patient: PatientData,
    documents: DocumentData[],
    visit?: VisitData
  ): string {
    options.messageType = 'MDM';
    if (!options.triggerEvent) options.triggerEvent = 'T02';

    const segments: string[] = [];

    // MSH segment
    segments.push(this.buildMshSegment(options));

    // EVN segment
    segments.push(this.buildEvnSegment(options.triggerEvent));

    // PID segment
    segments.push(this.buildPidSegment(patient));

    // PV1 segment (if visit info provided)
    if (visit) {
      segments.push(this.buildPv1Segment(visit));
    }

    // Documents
    documents.forEach((document) => {
      // TXA segment
      segments.push(this.buildTxaSegment(document));

      // OBX segment for document content if available
      if (document.documentContent) {
        segments.push(this.buildObxSegment({
          valueType: 'TX',
          testCode: 'DOCUMENT',
          testName: document.documentTitle || 'Document',
          value: document.documentContent,
        }, 1));
      }
    });

    return segments.join(this.segmentTerminator) + this.segmentTerminator;
  }

  /**
   * Generate a generic HL7 message
   */
  generate(
    options: Hl7MessageOptions,
    data: {
      patient?: PatientData;
      visit?: VisitData;
      orders?: OrderData[];
      documents?: DocumentData[];
      notes?: string[];
    }
  ): string {
    switch (options.messageType) {
      case 'ADT':
        return this.generateAdtMessage(
          options,
          data.patient!,
          data.visit,
          data.notes
        );
      case 'ORU':
        return this.generateOruMessage(
          options,
          data.patient!,
          data.orders || [],
          data.notes
        );
      case 'ORM':
        return this.generateOrmMessage(
          options,
          data.patient!,
          data.orders || [],
          data.visit
        );
      case 'MDM':
        return this.generateMdmMessage(
          options,
          data.patient!,
          data.documents || [],
          data.visit
        );
      default:
        throw new Error(`Unsupported message type: ${options.messageType}`);
    }
  }
}

export default Hl7Generator;
