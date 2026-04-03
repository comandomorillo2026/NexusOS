/**
 * HL7 v2 Message Parser for NexusOS
 * Supports ADT, ORU, MDM message types
 */

// HL7 v2 Segment Types
export type Hl7SegmentType =
  | 'MSH' // Message Header
  | 'EVN' // Event Type
  | 'PID' // Patient Identification
  | 'PD1' // Patient Additional Demographic
  | 'NK1' // Next of Kin
  | 'PV1' // Patient Visit
  | 'PV2' // Patient Visit - Additional Info
  | 'OBX' // Observation/Result
  | 'ORC' // Common Order
  | 'OBR' // Observation Request
  | 'NTE' // Notes and Comments
  | 'AL1' // Allergy Information
  | 'DG1' // Diagnosis Information
  | 'IN1' // Insurance
  | 'IN2' // Insurance Additional Info
  | 'IN3' // Insurance Additional Info - Certification
  | 'TXA' // Transcription Document Header
  | 'PRD' // Provider Data
  | 'CTD' // Contact Data
  | 'ZPV' // Custom Patient Visit
  | 'ZIN' // Custom Insurance
  | 'ZSP' // Custom Specimen
  | 'ZAL'; // Custom Allergy

// HL7 Field Value (can be string or array for repeating fields)
export type Hl7FieldValue = string | string[];

// HL7 Segment
export interface Hl7Segment {
  type: Hl7SegmentType;
  fields: Hl7FieldValue[];
  raw: string;
}

// HL7 Message Types
export type Hl7MessageType =
  | 'ADT' // Admit/Discharge/Transfer
  | 'ORU' // Unsolicited Observation
  | 'ORM' // Order Message
  | 'MDM' // Medical Document Management
  | 'DFT' // Detail Financial Transaction
  | 'RAS' // Pharmacy Administration
  | 'BAR' // Add/Change Billing Account
  | 'PPR' // Patient Problem
  | 'REF' // Patient Referral
  | 'SIU' // Schedule Information Unsolicited
  | 'RDS' // Pharmacy Dispense
  | 'RGV' // Pharmacy Give
  | 'VXU'; // Vaccination Update

// Trigger Events
export type Hl7TriggerEvent =
  // ADT Events
  | 'A01' // Admit
  | 'A02' // Transfer
  | 'A03' // Discharge
  | 'A04' // Register
  | 'A05' // Pre-admit
  | 'A06' // Change outpatient to inpatient
  | 'A07' // Change inpatient to outpatient
  | 'A08' // Update patient info
  | 'A09' // Patient departing
  | 'A10' // Patient arriving
  | 'A11' // Cancel admit
  | 'A12' // Cancel transfer
  | 'A13' // Cancel discharge
  | 'A14' // Pending admit
  | 'A15' // Pending transfer
  | 'A16' // Pending discharge
  | 'A17' // Swap patients
  | 'A18' // Merge patients
  | 'A21' // Patient goes on "leave of absence"
  | 'A22' // Patient returns from "leave of absence"
  | 'A23' // Cancel patient going on "leave of absence"
  | 'A24' // Link patient information
  | 'A25' // Cancel pending discharge
  | 'A26' // Cancel pending transfer
  | 'A27' // Cancel pending admit
  | 'A28' // Add patient information
  | 'A29' // Delete patient information
  | 'A30' // Merge patient information - patient ID only
  | 'A31' // Update patient information
  | 'A32' // Cancel patient arriving
  | 'A33' // Cancel patient departing
  | 'A34' // Merge patient information - patient account number only
  | 'A35' // Merge patient information - patient ID and patient account number
  | 'A36' // Merge patient information - patient account number and patient ID
  | 'A37' // Unlink patient information
  | 'A38' // Cancel pre-admit
  | 'A39' // Merge person - patient UID only
  | 'A40' // Merge patient - patient identifier list
  | 'A41' // Merge patient - patient account number only
  | 'A42' // Merge visit - visit number only
  | 'A43' // Merge patient - patient UID only
  | 'A44' // Merge account - patient account number only
  | 'A45' // Merge visit - visit number and patient UID
  | 'A46' // Change patient UID only
  | 'A47' // Change patient identifier list
  | 'A48' // Change alternate patient ID
  | 'A49' // Change patient account number
  | 'A50' // Change visit number
  | 'A51' // Change alternate visit ID
  | 'A52' // Cancel leave of absence for patient
  | 'A53' // Cancel patient returns from a leave of absence
  | 'A54' // Change attending doctor
  | 'A55' // Cancel change attending doctor
  | 'A60' // Update ADT/financial information
  | 'A61' // Change consulting doctor
  | 'A62' // Cancel change consulting doctor
  // ORU Events
  | 'R01' // Unsolicited observation message
  | 'R02' // Response to query for results of diagnostic tests
  | 'R03' // Deferred response to query for results of diagnostic tests
  | 'R04' // Unsolicited diagnostic imaging observation message
  // MDM Events
  | 'T01' // Original document notification
  | 'T02' // Original document notification and content
  | 'T03' // Document status change notification
  | 'T04' // Document status change notification and content
  | 'T05' // Document addendum notification
  | 'T06' // Document addendum notification and content
  | 'T07' // Document edit notification
  | 'T08' // Document edit notification and content
  | 'T09' // Document replacement notification
  | 'T10' // Document replacement notification and content
  | 'T11'; // Delete document notification

// HL7 Encoding Characters
export interface Hl7EncodingCharacters {
  fieldSeparator: string;        // |
  componentSeparator: string;    // ^
  repetitionSeparator: string;   // ~
  escapeCharacter: string;       // \
  subcomponentSeparator: string; // &
}

// Default HL7 Encoding Characters
export const DEFAULT_ENCODING: Hl7EncodingCharacters = {
  fieldSeparator: '|',
  componentSeparator: '^',
  repetitionSeparator: '~',
  escapeCharacter: '\\',
  subcomponentSeparator: '&',
};

// Parsed HL7 Message
export interface ParsedHl7Message {
  messageType: Hl7MessageType;
  triggerEvent: Hl7TriggerEvent;
  version: string;
  sendingApplication: string;
  sendingFacility: string;
  receivingApplication: string;
  receivingFacility: string;
  messageDateTime: string;
  messageControlId: string;
  processingId: string;
  encodingCharacters: Hl7EncodingCharacters;
  segments: Hl7Segment[];
  raw: string;
}

// Patient Information from PID Segment
export interface Hl7PatientInfo {
  patientId?: string;
  patientIdType?: string;
  patientName?: {
    familyName?: string;
    givenName?: string;
    middleName?: string;
    suffix?: string;
    prefix?: string;
    degree?: string;
    nameType?: string;
  }[];
  dateOfBirth?: string;
  dateOfBirthPrecision?: 'Y' | 'YM' | 'YMD';
  administrativeSex?: 'M' | 'F' | 'O' | 'U' | 'A' | 'N';
  patientAlias?: string;
  race?: string;
  raceDescription?: string;
  address?: {
    streetAddress?: string;
    otherDesignation?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    addressType?: string;
    otherGeographicDesignation?: string;
  }[];
  countryCode?: string;
  phoneHome?: string[];
  phoneBusiness?: string[];
  primaryLanguage?: string;
  maritalStatus?: string;
  religion?: string;
  patientAccountNumber?: string;
  ssn?: string;
  driversLicense?: string;
  mothersMaidenName?: {
    familyName?: string;
    givenName?: string;
  };
  nationality?: string;
  deathDateTime?: string;
  deathIndicator?: boolean;
}

// Visit Information from PV1 Segment
export interface Hl7VisitInfo {
  patientClass?: string;
  assignedPatientLocation?: {
    pointOfCare?: string;
    room?: string;
    bed?: string;
    facility?: string;
    locationStatus?: string;
    personLocationType?: string;
    building?: string;
    floor?: string;
  };
  admissionType?: string;
  preadmitNumber?: string;
  priorPatientLocation?: string;
  attendingDoctor?: {
    id?: string;
    familyName?: string;
    givenName?: string;
    middleInitial?: string;
  };
  referringDoctor?: {
    id?: string;
    familyName?: string;
    givenName?: string;
  };
  consultingDoctor?: {
    id?: string;
    familyName?: string;
    givenName?: string;
  };
  hospitalService?: string;
  temporaryLocation?: string;
  preadmitTestIndicator?: string;
  readmissionIndicator?: string;
  admissionSource?: string;
  ambulatoryStatus?: string;
  vipIndicator?: string;
  admittingDoctor?: {
    id?: string;
    familyName?: string;
    givenName?: string;
  };
  patientType?: string;
  visitNumber?: string;
  financialClass?: string;
  chargePriceIndicator?: string;
  courtesyCode?: string;
  creditRating?: string;
  contractCode?: string;
  contractEffectiveDate?: string;
  contractAmount?: string;
  contractPeriod?: string;
  interestCode?: string;
  transferToBadDebtCode?: string;
  transferToBadDebtDate?: string;
  badDebtAgencyCode?: string;
  badDebtTransferAmount?: string;
  badDebtRecoveryAmount?: string;
  deleteAccountIndicator?: string;
  deleteAccountDate?: string;
  dischargeDisposition?: string;
  dischargedToLocation?: string;
  dietType?: string;
  servicingFacility?: string;
  bedStatus?: string;
  accountStatus?: string;
  pendingLocation?: string;
  priorTemporaryLocation?: string;
  admitDateTime?: string;
  dischargeDateTime?: string;
  currentPatientBalance?: string;
  totalCharges?: string;
  totalAdjustments?: string;
  totalPayments?: string;
}

// Observation from OBX Segment
export interface Hl7Observation {
  setId?: string;
  valueType?: string;
  observationIdentifier?: {
    identifier?: string;
    text?: string;
    codingSystem?: string;
  };
  observationSubId?: string;
  observationValue?: string | string[];
  units?: string;
  referenceRange?: string;
  abnormalFlags?: string;
  probability?: string;
  natureOfAbnormalTest?: string;
  observationResultStatus?: string;
  dateLastObsNormalValues?: string;
  userDefinedAccessChecks?: string;
  dateTimeOfObservation?: string;
  producersId?: string;
  responsibleObserver?: string;
  observationMethod?: string;
  equipmentInstanceIdentifier?: string;
  dateTimeOfAnalysis?: string;
}

// Order from ORC/OBR Segments
export interface Hl7Order {
  orderControl?: string;
  placerOrderNumber?: string;
  fillerOrderNumber?: string;
  placerGroupNumber?: string;
  orderStatus?: string;
  responseFlag?: string;
  quantityTiming?: string;
  parentOrder?: string;
  dateTimeOfTransaction?: string;
  enteredBy?: string;
  verifiedBy?: string;
  orderingProvider?: {
    id?: string;
    familyName?: string;
    givenName?: string;
  };
  enterersLocation?: string;
  callBackPhoneNumber?: string;
  orderEffectiveDateTime?: string;
  orderControlCodeReason?: string;
  enteringOrganization?: string;
  enteringDevice?: string;
  actionBy?: string;
  advancedBeneficiaryNoticeCode?: string;
  orderingFacilityName?: string;
  orderingFacilityAddress?: string;
  orderingFacilityPhoneNumber?: string;
  orderingProviderAddress?: string;
  orderStatusModifier?: string;
  universalServiceIdentifier?: {
    identifier?: string;
    text?: string;
    codingSystem?: string;
  };
  priority?: string;
  requestedDateTime?: string;
  observationEndDateTime?: string;
  collectionVolume?: string;
  collectorIdentifier?: string;
  specimenActionCode?: string;
  dangerCode?: string;
  relevantClinicalInfo?: string;
  specimenReceivedDateTime?: string;
  specimenSource?: string;
  orderingProviderPhone?: string;
  patientLocation?: string;
  reasonForStudy?: string;
  technician?: string;
  transcriptionist?: string;
  scheduledDateTime?: string;
  observations?: Hl7Observation[];
}

// Document from MDM
export interface Hl7Document {
  documentType?: string;
  documentId?: string;
  documentStatus?: string;
  documentDateTime?: string;
  documentTitle?: string;
  documentContent?: string;
  documentFormat?: string;
  provider?: {
    id?: string;
    name?: string;
  };
}

// Full parsed message with structured data
export interface StructuredHl7Message extends ParsedHl7Message {
  patient?: Hl7PatientInfo;
  visit?: Hl7VisitInfo;
  orders?: Hl7Order[];
  documents?: Hl7Document[];
  notes?: string[];
  eventDateTime?: string;
  eventReason?: string;
  operatorId?: string;
}

/**
 * HL7 v2 Parser
 */
export class Hl7Parser {
  private encoding: Hl7EncodingCharacters;

  constructor(encoding?: Partial<Hl7EncodingCharacters>) {
    this.encoding = { ...DEFAULT_ENCODING, ...encoding };
  }

  /**
   * Parse a raw HL7 message string
   */
  parse(message: string): StructuredHl7Message {
    // Normalize line endings
    const normalizedMessage = message.replace(/\r\n|\r|\n/g, '\r');

    // Split into segments
    const segmentLines = normalizedMessage.split('\r').filter((s) => s.trim());

    // Parse encoding characters from MSH segment
    if (segmentLines.length > 0 && segmentLines[0].startsWith('MSH')) {
      this.parseEncodingCharacters(segmentLines[0]);
    }

    // Parse all segments
    const segments: Hl7Segment[] = segmentLines.map((line) => this.parseSegment(line));

    // Get message header info
    const msh = segments.find((s) => s.type === 'MSH');
    if (!msh) {
      throw new Error('Invalid HL7 message: Missing MSH segment');
    }

    // Extract message type and trigger event
    const messageTypeField = this.getField(msh, 9);
    let messageType: Hl7MessageType = 'ADT';
    let triggerEvent: Hl7TriggerEvent = 'A01';

    if (typeof messageTypeField === 'string') {
      const parts = messageTypeField.split(this.encoding.componentSeparator);
      messageType = (parts[0] as Hl7MessageType) || 'ADT';
      triggerEvent = (parts[1] as Hl7TriggerEvent) || 'A01';
    }

    const parsed: StructuredHl7Message = {
      messageType,
      triggerEvent,
      version: this.getFieldString(msh, 12) || '2.5',
      sendingApplication: this.getFieldString(msh, 3),
      sendingFacility: this.getFieldString(msh, 4),
      receivingApplication: this.getFieldString(msh, 5),
      receivingFacility: this.getFieldString(msh, 6),
      messageDateTime: this.getFieldString(msh, 7),
      messageControlId: this.getFieldString(msh, 10),
      processingId: this.getFieldString(msh, 11),
      encodingCharacters: this.encoding,
      segments,
      raw: message,
    };

    // Parse structured data based on message type
    parsed.patient = this.parsePatient(segments);
    parsed.visit = this.parseVisit(segments);
    parsed.orders = this.parseOrders(segments);
    parsed.documents = this.parseDocuments(segments);
    parsed.notes = this.parseNotes(segments);
    parsed.eventDateTime = this.parseEventDateTime(segments);

    return parsed;
  }

  /**
   * Parse encoding characters from MSH segment
   */
  private parseEncodingCharacters(mshSegment: string): void {
    // MSH|^~\&| - characters are at positions 2-4
    if (mshSegment.length >= 5) {
      this.encoding = {
        fieldSeparator: mshSegment[3],
        componentSeparator: mshSegment[4] || DEFAULT_ENCODING.componentSeparator,
        repetitionSeparator: mshSegment[5] || DEFAULT_ENCODING.repetitionSeparator,
        escapeCharacter: mshSegment[6] || DEFAULT_ENCODING.escapeCharacter,
        subcomponentSeparator: mshSegment[7] || DEFAULT_ENCODING.subcomponentSeparator,
      };
    }
  }

  /**
   * Parse a single segment
   */
  private parseSegment(line: string): Hl7Segment {
    const separator = this.encoding.fieldSeparator;
    const parts = line.split(separator);
    const type = parts[0] as Hl7SegmentType;

    // MSH segment has encoding characters at position 1
    const fields: Hl7FieldValue[] = type === 'MSH'
      ? [separator, parts[2] || '', ...parts.slice(3)]
      : parts.slice(1);

    return { type, fields, raw: line };
  }

  /**
   * Get field value from segment
   */
  private getField(segment: Hl7Segment, index: number): Hl7FieldValue {
    if (index < 1 || index > segment.fields.length) {
      return '';
    }
    return segment.fields[index - 1];
  }

  /**
   * Get field value as string
   */
  private getFieldString(segment: Hl7Segment, index: number): string {
    const value = this.getField(segment, index);
    if (Array.isArray(value)) {
      return value.join(this.encoding.repetitionSeparator);
    }
    return value;
  }

  /**
   * Get component from field
   */
  private getComponent(field: Hl7FieldValue, componentIndex: number): string {
    const fieldValue = Array.isArray(field) ? field[0] : field;
    const components = fieldValue.split(this.encoding.componentSeparator);
    return components[componentIndex - 1] || '';
  }

  /**
   * Get subcomponent from component
   */
  private getSubcomponent(component: string, subcomponentIndex: number): string {
    const subcomponents = component.split(this.encoding.subcomponentSeparator);
    return subcomponents[subcomponentIndex - 1] || '';
  }

  /**
   * Parse patient information from PID segment
   */
  private parsePatient(segments: Hl7Segment[]): Hl7PatientInfo | undefined {
    const pid = segments.find((s) => s.type === 'PID');
    if (!pid) return undefined;

    const patient: Hl7PatientInfo = {};

    // PID-3: Patient Identifier List
    const patientIdField = this.getField(pid, 3);
    patient.patientId = this.getComponent(patientIdField, 1);
    patient.patientIdType = this.getComponent(patientIdField, 5);

    // PID-5: Patient Name
    const nameField = this.getField(pid, 5);
    if (typeof nameField === 'string') {
      patient.patientName = [{
        familyName: this.getComponent(nameField, 1),
        givenName: this.getComponent(nameField, 2),
        middleName: this.getComponent(nameField, 3),
        suffix: this.getComponent(nameField, 4),
        prefix: this.getComponent(nameField, 5),
        degree: this.getComponent(nameField, 6),
        nameType: this.getComponent(nameField, 7),
      }];
    } else if (Array.isArray(nameField)) {
      patient.patientName = nameField.map((n) => ({
        familyName: this.getComponent(n, 1),
        givenName: this.getComponent(n, 2),
        middleName: this.getComponent(n, 3),
        suffix: this.getComponent(n, 4),
        prefix: this.getComponent(n, 5),
      }));
    }

    // PID-7: Date of Birth
    patient.dateOfBirth = this.getFieldString(pid, 7);

    // PID-8: Administrative Sex
    const sex = this.getFieldString(pid, 8);
    if (['M', 'F', 'O', 'U', 'A', 'N'].includes(sex)) {
      patient.administrativeSex = sex as Hl7PatientInfo['administrativeSex'];
    }

    // PID-10: Race
    const raceField = this.getField(pid, 10);
    patient.race = this.getComponent(raceField, 1);
    patient.raceDescription = this.getComponent(raceField, 2);

    // PID-11: Patient Address
    const addressField = this.getField(pid, 11);
    if (typeof addressField === 'string') {
      patient.address = [{
        streetAddress: this.getComponent(addressField, 1),
        otherDesignation: this.getComponent(addressField, 2),
        city: this.getComponent(addressField, 3),
        state: this.getComponent(addressField, 4),
        postalCode: this.getComponent(addressField, 5),
        country: this.getComponent(addressField, 6),
        addressType: this.getComponent(addressField, 7),
      }];
    }

    // PID-13: Phone Number - Home
    const homePhoneField = this.getField(pid, 13);
    if (typeof homePhoneField === 'string') {
      patient.phoneHome = [this.getComponent(homePhoneField, 1)];
    } else if (Array.isArray(homePhoneField)) {
      patient.phoneHome = homePhoneField.map((p) => this.getComponent(p, 1));
    }

    // PID-14: Phone Number - Business
    const workPhoneField = this.getField(pid, 14);
    if (typeof workPhoneField === 'string') {
      patient.phoneBusiness = [this.getComponent(workPhoneField, 1)];
    } else if (Array.isArray(workPhoneField)) {
      patient.phoneBusiness = workPhoneField.map((p) => this.getComponent(p, 1));
    }

    // PID-15: Primary Language
    patient.primaryLanguage = this.getComponent(this.getField(pid, 15), 1);

    // PID-16: Marital Status
    patient.maritalStatus = this.getComponent(this.getField(pid, 16), 1);

    // PID-18: Patient Account Number
    patient.patientAccountNumber = this.getComponent(this.getField(pid, 18), 1);

    // PID-19: SSN Number
    patient.ssn = this.getFieldString(pid, 19);

    // PID-20: Driver's License
    patient.driversLicense = this.getComponent(this.getField(pid, 20), 1);

    // PID-30: Death Date/Time
    patient.deathDateTime = this.getFieldString(pid, 30);

    // PID-31: Death Indicator
    const deathIndicator = this.getFieldString(pid, 31);
    patient.deathIndicator = deathIndicator === 'Y';

    return patient;
  }

  /**
   * Parse visit information from PV1 segment
   */
  private parseVisit(segments: Hl7Segment[]): Hl7VisitInfo | undefined {
    const pv1 = segments.find((s) => s.type === 'PV1');
    if (!pv1) return undefined;

    const visit: Hl7VisitInfo = {};

    // PV1-2: Patient Class
    visit.patientClass = this.getFieldString(pv1, 2);

    // PV1-3: Assigned Patient Location
    const locationField = this.getField(pv1, 3);
    visit.assignedPatientLocation = {
      pointOfCare: this.getComponent(locationField, 1),
      room: this.getComponent(locationField, 2),
      bed: this.getComponent(locationField, 3),
      facility: this.getComponent(locationField, 4),
      locationStatus: this.getComponent(locationField, 5),
      personLocationType: this.getComponent(locationField, 6),
      building: this.getComponent(locationField, 7),
      floor: this.getComponent(locationField, 8),
    };

    // PV1-4: Admission Type
    visit.admissionType = this.getFieldString(pv1, 4);

    // PV1-7: Attending Doctor
    const attendingField = this.getField(pv1, 7);
    visit.attendingDoctor = {
      id: this.getComponent(attendingField, 1),
      familyName: this.getComponent(attendingField, 2),
      givenName: this.getComponent(attendingField, 3),
    };

    // PV1-8: Referring Doctor
    const referringField = this.getField(pv1, 8);
    visit.referringDoctor = {
      id: this.getComponent(referringField, 1),
      familyName: this.getComponent(referringField, 2),
      givenName: this.getComponent(referringField, 3),
    };

    // PV1-17: Admitting Doctor
    const admittingField = this.getField(pv1, 17);
    visit.admittingDoctor = {
      id: this.getComponent(admittingField, 1),
      familyName: this.getComponent(admittingField, 2),
      givenName: this.getComponent(admittingField, 3),
    };

    // PV1-19: Visit Number
    visit.visitNumber = this.getComponent(this.getField(pv1, 19), 1);

    // PV1-36: Discharge Disposition
    visit.dischargeDisposition = this.getFieldString(pv1, 36);

    // PV1-44: Admit Date/Time
    visit.admitDateTime = this.getFieldString(pv1, 44);

    // PV1-45: Discharge Date/Time
    visit.dischargeDateTime = this.getFieldString(pv1, 45);

    return visit;
  }

  /**
   * Parse orders from ORC/OBR/OBX segments
   */
  private parseOrders(segments: Hl7Segment[]): Hl7Order[] {
    const orders: Hl7Order[] = [];
    let currentOrder: Hl7Order | null = null;

    for (const segment of segments) {
      if (segment.type === 'ORC') {
        // Save previous order
        if (currentOrder) {
          orders.push(currentOrder);
        }

        currentOrder = {
          orderControl: this.getFieldString(segment, 1),
          placerOrderNumber: this.getComponent(this.getField(segment, 2), 1),
          fillerOrderNumber: this.getComponent(this.getField(segment, 3), 1),
          orderStatus: this.getFieldString(segment, 5),
          dateTimeOfTransaction: this.getFieldString(segment, 9),
          observations: [],
        };

        // ORC-12: Ordering Provider
        const providerField = this.getField(segment, 12);
        currentOrder.orderingProvider = {
          id: this.getComponent(providerField, 1),
          familyName: this.getComponent(providerField, 2),
          givenName: this.getComponent(providerField, 3),
        };
      } else if (segment.type === 'OBR' && currentOrder) {
        // OBR-4: Universal Service Identifier
        const serviceField = this.getField(segment, 4);
        currentOrder.universalServiceIdentifier = {
          identifier: this.getComponent(serviceField, 1),
          text: this.getComponent(serviceField, 2),
          codingSystem: this.getComponent(serviceField, 3),
        };

        // OBR-6: Requested Date/Time
        currentOrder.requestedDateTime = this.getFieldString(segment, 6);

        // OBR-16: Ordering Provider (override if set)
        const obrProviderField = this.getField(segment, 16);
        if (obrProviderField) {
          currentOrder.orderingProvider = {
            id: this.getComponent(obrProviderField, 1),
            familyName: this.getComponent(obrProviderField, 2),
            givenName: this.getComponent(obrProviderField, 3),
          };
        }

        // OBR-27: Quantity/Timing (Priority)
        currentOrder.priority = this.getComponent(this.getField(segment, 27), 5);

        // OBR-25: Status
        currentOrder.orderStatus = this.getFieldString(segment, 25);
      } else if (segment.type === 'OBX' && currentOrder) {
        // Parse observation
        const valueType = this.getFieldString(segment, 2);
        const identifierField = this.getField(segment, 3);
        const valueField = this.getField(segment, 5);

        const observation: Hl7Observation = {
          setId: this.getFieldString(segment, 1),
          valueType,
          observationIdentifier: {
            identifier: this.getComponent(identifierField, 1),
            text: this.getComponent(identifierField, 2),
            codingSystem: this.getComponent(identifierField, 3),
          },
          observationSubId: this.getFieldString(segment, 4),
          units: this.getComponent(this.getField(segment, 6), 1),
          referenceRange: this.getFieldString(segment, 7),
          abnormalFlags: this.getFieldString(segment, 8),
          observationResultStatus: this.getFieldString(segment, 11),
          dateTimeOfObservation: this.getFieldString(segment, 14),
        };

        // Handle observation value based on type
        if (['NM', 'SN', 'TX', 'FT', 'ST'].includes(valueType)) {
          observation.observationValue = this.getFieldString(segment, 5);
        } else if (valueType === 'CE' || valueType === 'CWE') {
          observation.observationValue = [
            this.getComponent(valueField, 1),
            this.getComponent(valueField, 2),
            this.getComponent(valueField, 3),
          ].join(' - ');
        }

        currentOrder.observations!.push(observation);
      }
    }

    // Add last order
    if (currentOrder) {
      orders.push(currentOrder);
    }

    return orders;
  }

  /**
   * Parse documents from MDM/TXA segments
   */
  private parseDocuments(segments: Hl7Segment[]): Hl7Document[] {
    const documents: Hl7Document[] = [];
    let currentDocument: Hl7Document | null = null;

    for (const segment of segments) {
      if (segment.type === 'TXA') {
        if (currentDocument) {
          documents.push(currentDocument);
        }

        const documentTypeField = this.getField(segment, 2);
        currentDocument = {
          documentType: this.getComponent(documentTypeField, 1),
          documentId: this.getFieldString(segment, 3),
          documentStatus: this.getFieldString(segment, 12),
          documentDateTime: this.getFieldString(segment, 4),
        };

        const providerField = this.getField(segment, 5);
        if (providerField) {
          currentDocument.provider = {
            id: this.getComponent(providerField, 1),
            name: `${this.getComponent(providerField, 3)} ${this.getComponent(providerField, 2)}`.trim(),
          };
        }
      } else if (segment.type === 'OBX' && currentDocument) {
        // Document content might be in OBX
        const valueType = this.getFieldString(segment, 2);
        if (valueType === 'TX' || valueType === 'FT') {
          currentDocument.documentContent = this.getFieldString(segment, 5);
        }
      }
    }

    if (currentDocument) {
      documents.push(currentDocument);
    }

    return documents;
  }

  /**
   * Parse notes from NTE segments
   */
  private parseNotes(segments: Hl7Segment[]): string[] {
    const notes: string[] = [];

    for (const segment of segments) {
      if (segment.type === 'NTE') {
        const comment = this.getFieldString(segment, 3);
        if (comment) {
          notes.push(comment);
        }
      }
    }

    return notes;
  }

  /**
   * Parse event date/time from EVN segment
   */
  private parseEventDateTime(segments: Hl7Segment[]): string | undefined {
    const evn = segments.find((s) => s.type === 'EVN');
    if (evn) {
      return this.getFieldString(evn, 2);
    }
    return undefined;
  }

  /**
   * Validate HL7 message structure
   */
  validate(message: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const parsed = this.parse(message);

      // Check required MSH fields
      if (!parsed.sendingApplication) {
        errors.push('Missing sending application (MSH-3)');
      }
      if (!parsed.messageDateTime) {
        errors.push('Missing message date/time (MSH-7)');
      }
      if (!parsed.messageControlId) {
        errors.push('Missing message control ID (MSH-10)');
      }

      // Validate based on message type
      switch (parsed.messageType) {
        case 'ADT':
          if (!parsed.segments.find((s) => s.type === 'PID')) {
            errors.push('ADT message missing PID segment');
          }
          break;
        case 'ORU':
          if (!parsed.orders || parsed.orders.length === 0) {
            errors.push('ORU message missing order/observation segments');
          }
          break;
        case 'MDM':
          if (!parsed.documents || parsed.documents.length === 0) {
            errors.push('MDM message missing document segments');
          }
          break;
      }

      return { valid: errors.length === 0, errors };
    } catch (e) {
      return { valid: false, errors: [(e as Error).message] };
    }
  }

  /**
   * Convert to JSON for storage/transmission
   */
  toJson(message: string): string {
    const parsed = this.parse(message);
    return JSON.stringify(parsed, null, 2);
  }
}

export default Hl7Parser;
