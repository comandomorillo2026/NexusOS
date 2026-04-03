/**
 * FHIR R4 Resource Builders for NexusOS
 * Factory functions for creating FHIR resources
 */

import {
  FhirPatient,
  FhirObservation,
  FhirDiagnosticReport,
  FhirCodeableConcept,
  FhirCoding,
  FhirIdentifier,
  FhirHumanName,
  FhirAddress,
  FhirContactPoint,
  FhirReference,
  FhirQuantity,
  FhirPeriod,
  FhirBundle,
  FhirResource,
} from './client';

// UUID generator
function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Common Code Systems
export const FhirCodeSystems = {
  LOINC: 'http://loinc.org',
  SNOMED_CT: 'http://snomed.info/sct',
  ICD_10: 'http://hl7.org/fhir/sid/icd-10',
  ICD_10_CM: 'http://hl7.org/fhir/sid/icd-10-cm',
  ICD_9_CM: 'http://hl7.org/fhir/sid/icd-9-cm',
  CPT: 'http://www.ama-assn.org/go/cpt',
  HCPCS: 'http://www.cms.gov/Medicare/Coding/HCPCSReleaseCodeSets',
  NDC: 'http://hl7.org/fhir/sid/ndc',
  RXNORM: 'http://www.nlm.nih.gov/research/umls/rxnorm',
  CVX: 'http://hl7.org/fhir/sid/cvx',
  UCUM: 'http://unitsofmeasure.org',
  MIM: 'urn:oid:2.16.840.1.113883.6.69',
  LANGUAGE: 'urn:ietf:bcp:47',
  GENDER: 'http://hl7.org/fhir/administrative-gender',
  OBSERVATION_CATEGORY: 'http://terminology.hl7.org/CodeSystem/observation-category',
  DIAGNOSTIC_SERVICE: 'http://terminology.hl7.org/CodeSystem/v2-0074',
  OBSERVATION_STATUS: 'http://hl7.org/fhir/observation-status',
  DIAGNOSTIC_REPORT_STATUS: 'http://hl7.org/fhir/diagnostic-report-status',
  MARITAL_STATUS: 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus',
  RELATIONSHIP: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
  IDENTIFIER_TYPE: 'http://terminology.hl7.org/CodeSystem/v2-0203',
  CONTACT_SYSTEM: 'http://hl7.org/fhir/contact-point-system',
  CONTACT_USE: 'http://hl7.org/fhir/contact-point-use',
  ADDRESS_USE: 'http://hl7.org/fhir/address-use',
  ADDRESS_TYPE: 'http://hl7.org/fhir/address-type',
  NAME_USE: 'http://hl7.org/fhir/name-use',
  CONDITION_CATEGORY: 'http://terminology.hl7.org/CodeSystem/condition-category',
  CONDITION_VERIFICATION: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
  ALLERGY_INTOLERANCE_CATEGORY: 'http://hl7.org/fhir/allergy-intolerance-category',
  ALLERGY_INTOLERANCE_CRITICALITY: 'http://hl7.org/fhir/allergy-intolerance-criticality',
};

// Helper to create a Coding
export function createCoding(
  system: string,
  code: string,
  display?: string
): FhirCoding {
  const coding: FhirCoding = { system, code };
  if (display) {
    coding.display = display;
  }
  return coding;
}

// Helper to create a CodeableConcept
export function createCodeableConcept(
  codings: FhirCoding[],
  text?: string
): FhirCodeableConcept {
  const concept: FhirCodeableConcept = { coding: codings };
  if (text) {
    concept.text = text;
  }
  return concept;
}

// Helper to create an Identifier
export function createIdentifier(
  value: string,
  system?: string,
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old'
): FhirIdentifier {
  const identifier: FhirIdentifier = { value };
  if (system) {
    identifier.system = system;
  }
  if (use) {
    identifier.use = use;
  }
  return identifier;
}

// Helper to create a HumanName
export function createHumanName(
  family: string,
  given: string[],
  options?: {
    use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
    prefix?: string[];
    suffix?: string[];
    text?: string;
  }
): FhirHumanName {
  const name: FhirHumanName = { family, given };
  if (options) {
    if (options.use) name.use = options.use;
    if (options.prefix) name.prefix = options.prefix;
    if (options.suffix) name.suffix = options.suffix;
    if (options.text) name.text = options.text;
  }
  return name;
}

// Helper to create an Address
export function createAddress(
  options: {
    use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
    type?: 'postal' | 'physical' | 'both';
    text?: string;
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }
): FhirAddress {
  const address: FhirAddress = {};
  if (options.use) address.use = options.use;
  if (options.type) address.type = options.type;
  if (options.text) address.text = options.text;
  if (options.line) address.line = options.line;
  if (options.city) address.city = options.city;
  if (options.district) address.district = options.district;
  if (options.state) address.state = options.state;
  if (options.postalCode) address.postalCode = options.postalCode;
  if (options.country) address.country = options.country;
  return address;
}

// Helper to create a ContactPoint
export function createContactPoint(
  system: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other',
  value: string,
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile'
): FhirContactPoint {
  const contact: FhirContactPoint = { system, value };
  if (use) {
    contact.use = use;
  }
  return contact;
}

// Helper to create a Reference
export function createReference(
  resourceType: string,
  id: string,
  display?: string
): FhirReference {
  const reference: FhirReference = {
    reference: `${resourceType}/${id}`,
  };
  if (display) {
    reference.display = display;
  }
  return reference;
}

// Helper to create a Quantity
export function createQuantity(
  value: number,
  unit?: string,
  system?: string,
  code?: string
): FhirQuantity {
  const quantity: FhirQuantity = { value };
  if (unit) quantity.unit = unit;
  if (system) quantity.system = system;
  if (code) quantity.code = code;
  return quantity;
}

// Helper to create a Period
export function createPeriod(start?: string, end?: string): FhirPeriod {
  const period: FhirPeriod = {};
  if (start) period.start = start;
  if (end) period.end = end;
  return period;
}

// Patient Builder
export interface PatientBuilderOptions {
  id?: string;
  identifiers?: Array<{ system?: string; value: string; use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old' }>;
  active?: boolean;
  names?: Array<{
    family: string;
    given: string[];
    use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  }>;
  telecoms?: Array<{
    system: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
    value: string;
    use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  deceased?: boolean | string;
  addresses?: Array<{
    use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  maritalStatus?: { system: string; code: string; display?: string };
}

export function buildPatient(options: PatientBuilderOptions): FhirPatient {
  const patient: FhirPatient = {
    resourceType: 'Patient',
  };

  if (options.id) {
    patient.id = options.id;
  }

  if (options.identifiers && options.identifiers.length > 0) {
    patient.identifier = options.identifiers.map((id) =>
      createIdentifier(id.value, id.system, id.use)
    );
  }

  if (options.active !== undefined) {
    patient.active = options.active;
  }

  if (options.names && options.names.length > 0) {
    patient.name = options.names.map((n) => createHumanName(n.family, n.given, { use: n.use }));
  }

  if (options.telecoms && options.telecoms.length > 0) {
    patient.telecom = options.telecoms.map((t) =>
      createContactPoint(t.system, t.value, t.use)
    );
  }

  if (options.gender) {
    patient.gender = options.gender;
  }

  if (options.birthDate) {
    patient.birthDate = options.birthDate;
  }

  if (options.deceased !== undefined) {
    if (typeof options.deceased === 'boolean') {
      patient.deceasedBoolean = options.deceased;
    } else {
      patient.deceasedDateTime = options.deceased;
    }
  }

  if (options.addresses && options.addresses.length > 0) {
    patient.address = options.addresses.map((a) => createAddress(a));
  }

  if (options.maritalStatus) {
    patient.maritalStatus = createCodeableConcept([
      createCoding(options.maritalStatus.system, options.maritalStatus.code, options.maritalStatus.display),
    ]);
  }

  return patient;
}

// Observation Builder
export interface ObservationBuilderOptions {
  id?: string;
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: Array<{ system: string; code: string; display?: string }>;
  code: { system: string; code: string; display?: string };
  subject?: { reference: string; display?: string };
  effectiveDateTime?: string;
  effectivePeriod?: { start?: string; end?: string };
  issued?: string;
  valueQuantity?: {
    value: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueCodeableConcept?: Array<{ system: string; code: string; display?: string }>;
  interpretation?: Array<{ system: string; code: string; display?: string }>;
  note?: string;
  referenceRange?: Array<{
    low?: { value: number; unit?: string; system?: string; code?: string };
    high?: { value: number; unit?: string; system?: string; code?: string };
    text?: string;
  }>;
  performer?: Array<{ reference: string; display?: string }>;
  encounter?: { reference: string; display?: string };
}

export function buildObservation(options: ObservationBuilderOptions): FhirObservation {
  const observation: FhirObservation = {
    resourceType: 'Observation',
    status: options.status,
    code: createCodeableConcept([
      createCoding(options.code.system, options.code.code, options.code.display),
    ]),
  };

  if (options.id) {
    observation.id = options.id;
  }

  if (options.category && options.category.length > 0) {
    observation.category = options.category.map((c) =>
      createCodeableConcept([createCoding(c.system, c.code, c.display)])
    );
  }

  if (options.subject) {
    observation.subject = options.subject;
  }

  if (options.effectiveDateTime) {
    observation.effectiveDateTime = options.effectiveDateTime;
  }

  if (options.effectivePeriod) {
    observation.effectivePeriod = createPeriod(
      options.effectivePeriod.start,
      options.effectivePeriod.end
    );
  }

  if (options.issued) {
    observation.issued = options.issued;
  }

  if (options.valueQuantity) {
    observation.valueQuantity = createQuantity(
      options.valueQuantity.value,
      options.valueQuantity.unit,
      options.valueQuantity.system,
      options.valueQuantity.code
    );
  }

  if (options.valueString !== undefined) {
    observation.valueString = options.valueString;
  }

  if (options.valueBoolean !== undefined) {
    observation.valueBoolean = options.valueBoolean;
  }

  if (options.valueInteger !== undefined) {
    observation.valueInteger = options.valueInteger;
  }

  if (options.valueCodeableConcept && options.valueCodeableConcept.length > 0) {
    observation.valueCodeableConcept = createCodeableConcept(
      options.valueCodeableConcept.map((c) => createCoding(c.system, c.code, c.display))
    );
  }

  if (options.interpretation && options.interpretation.length > 0) {
    observation.interpretation = options.interpretation.map((i) =>
      createCodeableConcept([createCoding(i.system, i.code, i.display)])
    );
  }

  if (options.note) {
    observation.note = [{ text: options.note }];
  }

  if (options.referenceRange && options.referenceRange.length > 0) {
    observation.referenceRange = options.referenceRange.map((r) => ({
      low: r.low ? createQuantity(r.low.value, r.low.unit, r.low.system, r.low.code) : undefined,
      high: r.high ? createQuantity(r.high.value, r.high.unit, r.high.system, r.high.code) : undefined,
      text: r.text,
    }));
  }

  if (options.performer && options.performer.length > 0) {
    observation.performer = options.performer;
  }

  if (options.encounter) {
    observation.encounter = options.encounter;
  }

  return observation;
}

// Diagnostic Report Builder
export interface DiagnosticReportBuilderOptions {
  id?: string;
  status: 'registered' | 'partial' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'appended' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: Array<{ system: string; code: string; display?: string }>;
  code: { system: string; code: string; display?: string };
  subject?: { reference: string; display?: string };
  encounter?: { reference: string; display?: string };
  effectiveDateTime?: string;
  effectivePeriod?: { start?: string; end?: string };
  issued?: string;
  performer?: Array<{ reference: string; display?: string }>;
  resultsInterpreter?: Array<{ reference: string; display?: string }>;
  results?: Array<{ reference: string; display?: string }>;
  conclusion?: string;
  conclusionCode?: Array<{ system: string; code: string; display?: string }>;
  presentedForm?: Array<{
    contentType?: string;
    url?: string;
    title?: string;
    data?: string;
  }>;
}

export function buildDiagnosticReport(options: DiagnosticReportBuilderOptions): FhirDiagnosticReport {
  const report: FhirDiagnosticReport = {
    resourceType: 'DiagnosticReport',
    status: options.status,
    code: createCodeableConcept([
      createCoding(options.code.system, options.code.code, options.code.display),
    ]),
  };

  if (options.id) {
    report.id = options.id;
  }

  if (options.category && options.category.length > 0) {
    report.category = options.category.map((c) =>
      createCodeableConcept([createCoding(c.system, c.code, c.display)])
    );
  }

  if (options.subject) {
    report.subject = options.subject;
  }

  if (options.encounter) {
    report.encounter = options.encounter;
  }

  if (options.effectiveDateTime) {
    report.effectiveDateTime = options.effectiveDateTime;
  }

  if (options.effectivePeriod) {
    report.effectivePeriod = createPeriod(
      options.effectivePeriod.start,
      options.effectivePeriod.end
    );
  }

  if (options.issued) {
    report.issued = options.issued;
  }

  if (options.performer && options.performer.length > 0) {
    report.performer = options.performer;
  }

  if (options.resultsInterpreter && options.resultsInterpreter.length > 0) {
    report.resultsInterpreter = options.resultsInterpreter;
  }

  if (options.results && options.results.length > 0) {
    report.result = options.results;
  }

  if (options.conclusion) {
    report.conclusion = options.conclusion;
  }

  if (options.conclusionCode && options.conclusionCode.length > 0) {
    report.conclusionCode = options.conclusionCode.map((c) =>
      createCodeableConcept([createCoding(c.system, c.code, c.display)])
    );
  }

  if (options.presentedForm && options.presentedForm.length > 0) {
    report.presentedForm = options.presentedForm;
  }

  return report;
}

// Bundle Builder
export interface BundleBuilderOptions {
  type: 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection';
  resources: FhirResource[];
  identifier?: { system: string; value: string };
}

export function buildBundle(options: BundleBuilderOptions): FhirBundle {
  const bundle: FhirBundle = {
    resourceType: 'Bundle',
    type: options.type,
    timestamp: new Date().toISOString(),
    total: options.resources.length,
  };

  if (options.identifier) {
    bundle.identifier = createIdentifier(options.identifier.value, options.identifier.system, 'official');
  }

  bundle.entry = options.resources.map((resource) => ({
    fullUrl: resource.id ? `urn:uuid:${resource.id}` : `urn:uuid:${generateUuid()}`,
    resource,
  }));

  return bundle;
}

// Lab Result to FHIR Observation converter
export interface LabResultInput {
  testCode: string;
  testName: string;
  testSystem?: string;
  value?: number | string;
  unit?: string;
  unitSystem?: string;
  unitCode?: string;
  referenceLow?: number;
  referenceHigh?: number;
  interpretation?: 'normal' | 'low' | 'high' | 'critical';
  status?: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  effectiveDateTime?: string;
  patientId: string;
  patientName?: string;
  performerId?: string;
  performerName?: string;
  encounterId?: string;
}

export function labResultToObservation(lab: LabResultInput): FhirObservation {
  const options: ObservationBuilderOptions = {
    status: lab.status || 'final',
    category: [
      {
        system: FhirCodeSystems.OBSERVATION_CATEGORY,
        code: 'laboratory',
        display: 'Laboratory',
      },
    ],
    code: {
      system: lab.testSystem || FhirCodeSystems.LOINC,
      code: lab.testCode,
      display: lab.testName,
    },
    subject: {
      reference: `Patient/${lab.patientId}`,
      display: lab.patientName,
    },
    effectiveDateTime: lab.effectiveDateTime || new Date().toISOString(),
  };

  if (lab.performerId) {
    options.performer = [
      {
        reference: `Practitioner/${lab.performerId}`,
        display: lab.performerName,
      },
    ];
  }

  if (lab.encounterId) {
    options.encounter = {
      reference: `Encounter/${lab.encounterId}`,
    };
  }

  if (typeof lab.value === 'number') {
    options.valueQuantity = {
      value: lab.value,
      unit: lab.unit,
      system: lab.unitSystem || FhirCodeSystems.UCUM,
      code: lab.unitCode || lab.unit,
    };
  } else if (typeof lab.value === 'string') {
    options.valueString = lab.value;
  }

  if (lab.referenceLow !== undefined || lab.referenceHigh !== undefined) {
    options.referenceRange = [
      {
        low: lab.referenceLow !== undefined
          ? { value: lab.referenceLow, unit: lab.unit }
          : undefined,
        high: lab.referenceHigh !== undefined
          ? { value: lab.referenceHigh, unit: lab.unit }
          : undefined,
      },
    ];
  }

  if (lab.interpretation) {
    const interpretationMap: Record<string, { code: string; display: string }> = {
      normal: { code: 'N', display: 'Normal' },
      low: { code: 'L', display: 'Low' },
      high: { code: 'H', display: 'High' },
      critical: { code: 'AA', display: 'Critical' },
    };
    const interp = interpretationMap[lab.interpretation];
    if (interp) {
      options.interpretation = [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
          code: interp.code,
          display: interp.display,
        },
      ];
    }
  }

  return buildObservation(options);
}

// Export all
export default {
  FhirCodeSystems,
  createCoding,
  createCodeableConcept,
  createIdentifier,
  createHumanName,
  createAddress,
  createContactPoint,
  createReference,
  createQuantity,
  createPeriod,
  buildPatient,
  buildObservation,
  buildDiagnosticReport,
  buildBundle,
  labResultToObservation,
};
