/**
 * FHIR R4 Client for NexusOS Integrations Hub
 * Supports Patient, Observation, DiagnosticReport, and other FHIR R4 resources
 */

// FHIR R4 Resource Types
export type FhirResourceType =
  | 'Patient'
  | 'Practitioner'
  | 'Organization'
  | 'Location'
  | 'Encounter'
  | 'Observation'
  | 'DiagnosticReport'
  | 'MedicationRequest'
  | 'Medication'
  | 'Condition'
  | 'Procedure'
  | 'AllergyIntolerance'
  | 'Immunization'
  | 'CarePlan'
  | 'CareTeam'
  | 'Goal'
  | 'ServiceRequest'
  | 'Specimen'
  | 'Task'
  | 'Bundle'
  | 'DocumentReference'
  | 'Binary';

// FHIR R4 Base Resource
export interface FhirResource {
  resourceType: FhirResourceType;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    source?: string;
    profile?: string[];
    security?: { system: string; code: string; display?: string }[];
    tag?: { system: string; code: string; display?: string }[];
  };
  language?: string;
  implicitRules?: string;
  contained?: FhirResource[];
  extension?: FhirExtension[];
  modifierExtension?: FhirExtension[];
}

// FHIR Extension
export interface FhirExtension {
  url: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueString?: string;
  valueDecimal?: number;
  valueUri?: string;
  valueDate?: string;
  valueDateTime?: string;
  valueTime?: string;
  valueCode?: string;
  valueCoding?: FhirCoding;
  valueCodeableConcept?: FhirCodeableConcept;
  valueReference?: FhirReference;
  valueQuantity?: FhirQuantity;
  valueAttachment?: FhirAttachment;
}

// FHIR Coding
export interface FhirCoding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

// FHIR CodeableConcept
export interface FhirCodeableConcept {
  coding?: FhirCoding[];
  text?: string;
}

// FHIR Reference
export interface FhirReference {
  reference?: string;
  type?: string;
  identifier?: FhirIdentifier;
  display?: string;
}

// FHIR Identifier
export interface FhirIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
  type?: FhirCodeableConcept;
  system?: string;
  value?: string;
  period?: FhirPeriod;
  assigner?: FhirReference;
}

// FHIR Period
export interface FhirPeriod {
  start?: string;
  end?: string;
}

// FHIR Quantity
export interface FhirQuantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: string;
  code?: string;
}

// FHIR Attachment
export interface FhirAttachment {
  contentType?: string;
  language?: string;
  data?: string;
  url?: string;
  size?: number;
  hash?: string;
  title?: string;
  creation?: string;
}

// FHIR HumanName
export interface FhirHumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: FhirPeriod;
}

// FHIR Address
export interface FhirAddress {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: FhirPeriod;
}

// FHIR ContactPoint
export interface FhirContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number;
  period?: FhirPeriod;
}

// FHIR Patient Resource
export interface FhirPatient extends FhirResource {
  resourceType: 'Patient';
  identifier?: FhirIdentifier[];
  active?: boolean;
  name?: FhirHumanName[];
  telecom?: FhirContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  deceasedBoolean?: boolean;
  deceasedDateTime?: string;
  address?: FhirAddress[];
  maritalStatus?: FhirCodeableConcept;
  multipleBirthBoolean?: boolean;
  multipleBirthInteger?: number;
  photo?: FhirAttachment[];
  contact?: {
    relationship?: FhirCodeableConcept[];
    name?: FhirHumanName;
    telecom?: FhirContactPoint[];
    address?: FhirAddress;
    gender?: 'male' | 'female' | 'other' | 'unknown';
    organization?: FhirReference;
    period?: FhirPeriod;
  }[];
  communication?: {
    language: FhirCodeableConcept;
    preferred?: boolean;
  }[];
  generalPractitioner?: FhirReference[];
  managingOrganization?: FhirReference;
  link?: {
    other: FhirReference;
    type: 'replaced-by' | 'replaces' | 'refer' | 'seealso';
  }[];
}

// FHIR Observation Resource
export interface FhirObservation extends FhirResource {
  resourceType: 'Observation';
  identifier?: FhirIdentifier[];
  basedOn?: FhirReference[];
  partOf?: FhirReference[];
  status:
    | 'registered'
    | 'preliminary'
    | 'final'
    | 'amended'
    | 'corrected'
    | 'cancelled'
    | 'entered-in-error'
    | 'unknown';
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject?: FhirReference;
  focus?: FhirReference[];
  encounter?: FhirReference;
  effectiveDateTime?: string;
  effectivePeriod?: FhirPeriod;
  effectiveTiming?: unknown;
  effectiveInstant?: string;
  issued?: string;
  performer?: FhirReference[];
  valueQuantity?: FhirQuantity;
  valueCodeableConcept?: FhirCodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueRange?: { low: FhirQuantity; high: FhirQuantity };
  valueRatio?: { numerator: FhirQuantity; denominator: FhirQuantity };
  valueSampledData?: unknown;
  valueTime?: string;
  valueDateTime?: string;
  valuePeriod?: FhirPeriod;
  dataAbsentReason?: FhirCodeableConcept;
  interpretation?: FhirCodeableConcept[];
  note?: { authorReference?: FhirReference; authorString?: string; time?: string; text: string }[];
  bodySite?: FhirCodeableConcept;
  method?: FhirCodeableConcept;
  specimen?: FhirReference;
  device?: FhirReference;
  referenceRange?: {
    low?: FhirQuantity;
    high?: FhirQuantity;
    type?: FhirCodeableConcept;
    appliesTo?: FhirCodeableConcept[];
    age?: { low: FhirQuantity; high: FhirQuantity };
    text?: string;
  }[];
  hasMember?: FhirReference[];
  derivedFrom?: FhirReference[];
  component?: {
    code: FhirCodeableConcept;
    valueQuantity?: FhirQuantity;
    valueCodeableConcept?: FhirCodeableConcept;
    valueString?: string;
    valueBoolean?: boolean;
    valueInteger?: number;
    valueRange?: { low: FhirQuantity; high: FhirQuantity };
    valueRatio?: { numerator: FhirQuantity; denominator: FhirQuantity };
    valueSampledData?: unknown;
    valueTime?: string;
    valueDateTime?: string;
    valuePeriod?: FhirPeriod;
    dataAbsentReason?: FhirCodeableConcept;
    interpretation?: FhirCodeableConcept[];
    referenceRange?: {
      low?: FhirQuantity;
      high?: FhirQuantity;
      type?: FhirCodeableConcept;
      appliesTo?: FhirCodeableConcept[];
      age?: { low: FhirQuantity; high: FhirQuantity };
      text?: string;
    }[];
  }[];
}

// FHIR DiagnosticReport Resource
export interface FhirDiagnosticReport extends FhirResource {
  resourceType: 'DiagnosticReport';
  identifier?: FhirIdentifier[];
  basedOn?: FhirReference[];
  status:
    | 'registered'
    | 'partial'
    | 'preliminary'
    | 'final'
    | 'amended'
    | 'corrected'
    | 'appended'
    | 'cancelled'
    | 'entered-in-error'
    | 'unknown';
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject?: FhirReference;
  encounter?: FhirReference;
  effectiveDateTime?: string;
  effectivePeriod?: FhirPeriod;
  issued?: string;
  performer?: FhirReference[];
  resultsInterpreter?: FhirReference[];
  specimen?: FhirReference[];
  result?: FhirReference[];
  imagingStudy?: FhirReference[];
  media?: { comment?: string; link: FhirReference }[];
  conclusion?: string;
  conclusionCode?: FhirCodeableConcept[];
  presentedForm?: FhirAttachment[];
}

// FHIR Bundle
export interface FhirBundle extends FhirResource {
  resourceType: 'Bundle';
  identifier?: FhirIdentifier;
  type:
    | 'document'
    | 'message'
    | 'transaction'
    | 'transaction-response'
    | 'batch'
    | 'batch-response'
    | 'history'
    | 'searchset'
    | 'collection';
  timestamp?: string;
  total?: number;
  link?: { relation: string; url: string }[];
  entry?: {
    link?: { relation: string; url: string }[];
    fullUrl?: string;
    resource?: FhirResource;
    search?: {
      mode?: 'match' | 'include' | 'outcome';
      score?: number;
    };
    request?: {
      method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      url: string;
      ifNoneMatch?: string;
      ifModifiedSince?: string;
      ifMatch?: string;
      ifNoneExist?: string;
    };
    response?: {
      status: string;
      location?: string;
      etag?: string;
      lastModified?: string;
      outcome?: FhirResource;
    };
  }[];
  signature?: {
    type: { system: string; code: string; display?: string }[];
    when: string;
    whoReference?: FhirReference;
    whoUri?: string;
    onBehalfOfReference?: FhirReference;
    onBehalfOfUri?: string;
    targetFormat?: string;
    sigFormat?: string;
    data?: string;
  };
}

// FHIR OperationOutcome
export interface FhirOperationOutcome extends FhirResource {
  resourceType: 'OperationOutcome';
  issue: {
    severity: 'fatal' | 'error' | 'warning' | 'information';
    code: string;
    details?: FhirCodeableConcept;
    diagnostics?: string;
    location?: string[];
    expression?: string[];
  }[];
}

// FHIR Client Configuration
export interface FhirClientConfig {
  baseUrl: string;
  tenantId: string;
  apiKey?: string;
  bearerToken?: string;
  clientId?: string;
  clientSecret?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// FHIR Search Parameters
export interface FhirSearchParams {
  [key: string]: string | number | boolean | string[] | undefined;
  _id?: string;
  _lastUpdated?: string;
  _tag?: string;
  _profile?: string;
  _security?: string;
  _source?: string;
  _identifier?: string;
  _text?: string;
  _content?: string;
  _list?: string;
  _has?: string;
  _include?: string;
  _revinclude?: string;
  _sort?: string;
  _count?: number;
  _summary?: 'true' | 'text' | 'data' | 'count';
  _total?: 'none' | 'estimate' | 'accurate';
  _elements?: string;
  _contained?: 'true' | 'false' | 'both';
  _containedType?: 'container' | 'contained';
  _format?: string;
  _pretty?: boolean;
}

// FHIR Client Response
export interface FhirClientResponse<T extends FhirResource = FhirResource> {
  resource: T;
  statusCode: number;
  headers: Record<string, string>;
}

// FHIR Bundle Response
export interface FhirBundleResponse {
  bundle: FhirBundle;
  statusCode: number;
  headers: Record<string, string>;
}

/**
 * FHIR R4 Client
 */
export class FhirClient {
  private config: FhirClientConfig;
  private defaultHeaders: Record<string, string>;

  constructor(config: FhirClientConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };

    this.defaultHeaders = {
      'Content-Type': 'application/fhir+json',
      Accept: 'application/fhir+json',
      ...config.headers,
    };

    if (config.apiKey) {
      this.defaultHeaders['X-API-Key'] = config.apiKey;
    }

    if (config.bearerToken) {
      this.defaultHeaders['Authorization'] = `Bearer ${config.bearerToken}`;
    }
  }

  /**
   * Build URL with path and query parameters
   */
  private buildUrl(path: string, params?: FhirSearchParams): string {
    const url = new URL(`${this.config.baseUrl}/${path}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    return url.toString();
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: FhirSearchParams
  ): Promise<{ data: T; statusCode: number; headers: Record<string, string> }> {
    const url = this.buildUrl(path, params);

    const response = await fetch(url, {
      method,
      headers: this.defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: this.config.timeout
        ? AbortSignal.timeout(this.config.timeout)
        : undefined,
    });

    const data = await response.json();
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return { data, statusCode: response.status, headers };
  }

  /**
   * Get capability statement
   */
  async getCapabilityStatement(): Promise<FhirClientResponse> {
    const result = await this.request<FhirResource>('GET', 'metadata');
    return {
      resource: result.data,
      statusCode: result.statusCode,
      headers: result.headers,
    };
  }

  /**
   * Read a resource by ID
   */
  async read<T extends FhirResource>(
    resourceType: FhirResourceType,
    id: string
  ): Promise<FhirClientResponse<T>> {
    const result = await this.request<T>('GET', `${resourceType}/${id}`);
    return {
      resource: result.data,
      statusCode: result.statusCode,
      headers: result.headers,
    };
  }

  /**
   * Read a specific version of a resource
   */
  async vread<T extends FhirResource>(
    resourceType: FhirResourceType,
    id: string,
    versionId: string
  ): Promise<FhirClientResponse<T>> {
    const result = await this.request<T>(
      'GET',
      `${resourceType}/${id}/_history/${versionId}`
    );
    return {
      resource: result.data,
      statusCode: result.statusCode,
      headers: result.headers,
    };
  }

  /**
   * Update a resource
   */
  async update<T extends FhirResource>(
    resource: T
  ): Promise<FhirClientResponse<T>> {
    if (!resource.id) {
      throw new Error('Resource must have an id for update operation');
    }

    const result = await this.request<T>(
      'PUT',
      `${resource.resourceType}/${resource.id}`,
      resource
    );
    return {
      resource: result.data,
      statusCode: result.statusCode,
      headers: result.headers,
    };
  }

  /**
   * Create a new resource
   */
  async create<T extends FhirResource>(
    resource: T
  ): Promise<FhirClientResponse<T>> {
    const result = await this.request<T>(
      'POST',
      resource.resourceType,
      resource
    );
    return {
      resource: result.data,
      statusCode: result.statusCode,
      headers: result.headers,
    };
  }

  /**
   * Delete a resource
   */
  async delete(
    resourceType: FhirResourceType,
    id: string
  ): Promise<{ statusCode: number; headers: Record<string, string> }> {
    const result = await this.request<unknown>('DELETE', `${resourceType}/${id}`);
    return { statusCode: result.statusCode, headers: result.headers };
  }

  /**
   * Search for resources
   */
  async search<T extends FhirResource = FhirResource>(
    resourceType: FhirResourceType,
    params?: FhirSearchParams
  ): Promise<FhirBundleResponse> {
    const result = await this.request<FhirBundle>(
      'GET',
      resourceType,
      undefined,
      params
    );
    return {
      bundle: result.data,
      statusCode: result.statusCode,
      headers: result.headers,
    };
  }

  /**
   * Search all resources
   */
  async searchAll(params?: FhirSearchParams): Promise<FhirBundleResponse> {
    const result = await this.request<FhirBundle>('GET', '', undefined, params);
    return {
      bundle: result.data,
      statusCode: result.statusCode,
      headers: result.headers,
    };
  }

  /**
   * Execute a transaction (batch of operations)
   */
  async transaction(bundle: FhirBundle): Promise<FhirBundleResponse> {
    const result = await this.request<FhirBundle>('POST', '', bundle);
    return {
      bundle: result.data,
      statusCode: result.statusCode,
      headers: result.headers,
    };
  }

  /**
   * Patch a resource
   */
  async patch<T extends FhirResource>(
    resourceType: FhirResourceType,
    id: string,
    patches: { op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'; path: string; value?: unknown }[]
  ): Promise<FhirClientResponse<T>> {
    const headers = { ...this.defaultHeaders, 'Content-Type': 'application/json-patch+json' };
    
    const response = await fetch(
      `${this.config.baseUrl}/${resourceType}/${id}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(patches),
        signal: this.config.timeout
          ? AbortSignal.timeout(this.config.timeout)
          : undefined,
      }
    );

    const data = await response.json();
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      resource: data,
      statusCode: response.status,
      headers: responseHeaders,
    };
  }

  /**
   * Get patient by identifier
   */
  async getPatientByIdentifier(
    system: string,
    value: string
  ): Promise<FhirBundleResponse> {
    return this.search('Patient', {
      identifier: `${system}|${value}`,
    });
  }

  /**
   * Get observations for a patient
   */
  async getPatientObservations(
    patientId: string,
    category?: string,
    code?: string,
    dateRange?: string
  ): Promise<FhirBundleResponse> {
    const params: FhirSearchParams = {
      patient: patientId,
    };

    if (category) {
      params.category = category;
    }

    if (code) {
      params.code = code;
    }

    if (dateRange) {
      params.date = dateRange;
    }

    return this.search('Observation', params);
  }

  /**
   * Get diagnostic reports for a patient
   */
  async getPatientDiagnosticReports(
    patientId: string,
    category?: string,
    code?: string,
    dateRange?: string
  ): Promise<FhirBundleResponse> {
    const params: FhirSearchParams = {
      patient: patientId,
    };

    if (category) {
      params.category = category;
    }

    if (code) {
      params.code = code;
    }

    if (dateRange) {
      params.date = dateRange;
    }

    return this.search('DiagnosticReport', params);
  }

  /**
   * Create a bundle of resources
   */
  createBundle(
    type: FhirBundle['type'],
    resources: FhirResource[]
  ): FhirBundle {
    return {
      resourceType: 'Bundle',
      type,
      timestamp: new Date().toISOString(),
      entry: resources.map((resource) => ({
        fullUrl: resource.id
          ? `${this.config.baseUrl}/${resource.resourceType}/${resource.id}`
          : undefined,
        resource,
        request: resource.id
          ? { method: 'PUT', url: `${resource.resourceType}/${resource.id}` }
          : { method: 'POST', url: resource.resourceType },
      })),
    };
  }

  /**
   * Validate a resource
   */
  async validate<T extends FhirResource>(
    resource: T
  ): Promise<FhirClientResponse<FhirOperationOutcome>> {
    const result = await this.request<FhirOperationOutcome>(
      'POST',
      `${resource.resourceType}/$validate`,
      resource
    );
    return {
      resource: result.data,
      statusCode: result.statusCode,
      headers: result.headers,
    };
  }
}

export default FhirClient;
