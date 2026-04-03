/**
 * Lab Integration Connector for NexusOS
 * Handles lab order submission, result retrieval, and critical value alerts
 */

import { Hl7Generator, Hl7Parser } from '../hl7';
import { labResultToObservation, FhirCodeSystems } from '../fhir/resources';
import { db } from '@/lib/db';

// Lab Order Status
export type LabOrderStatus =
  | 'ordered'
  | 'sent'
  | 'sample_collected'
  | 'in_transit'
  | 'received'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'error';

// Lab Connection Types
export type LabConnectionType = 'hl7' | 'fhir' | 'rest' | 'file';

// Lab Test Definition
export interface LabTestDefinition {
  code: string;
  name: string;
  loincCode?: string;
  category?: string;
  specimenType?: string;
  containerType?: string;
  collectionVolume?: string;
  minCollectionVolume?: string;
  stabilityDuration?: string;
  stabilityTemperature?: string;
  specialInstructions?: string;
  clinicalIndications?: string[];
  turnaroundHours?: number;
  referenceRanges?: {
    low?: number;
    high?: number;
    unit?: string;
    ageMin?: number;
    ageMax?: number;
    gender?: 'M' | 'F' | 'U';
  }[];
  criticalValues?: {
    low?: number;
    high?: number;
    unit?: string;
  };
}

// Lab Order Input
export interface LabOrderInput {
  orderId: string;
  patientId: string;
  patientMrn?: string;
  patientName: string;
  patientDob?: string;
  patientSex?: 'M' | 'F' | 'U';
  orderingProviderId: string;
  orderingProviderName: string;
  orderingProviderNpi?: string;
  tests: LabTestOrderItem[];
  diagnosisCodes?: string[];
  priority?: 'routine' | 'urgent' | 'stat';
  collectionDateTime?: string;
  clinicalNotes?: string;
  specimenSource?: string;
  billingType?: 'patient' | 'insurance' | 'self';
  insuranceId?: string;
}

// Lab Test Order Item
export interface LabTestOrderItem {
  testCode: string;
  testName?: string;
  testId?: string;
  clinicalIndication?: string;
  specimenType?: string;
  specialInstructions?: string;
}

// Lab Result Input
export interface LabResultInput {
  orderId: string;
  externalOrderId?: string;
  reportId?: string;
  reportStatus: 'preliminary' | 'final' | 'corrected' | 'cancelled';
  resultDateTime: string;
  specimenReceivedDateTime?: string;
  specimenCollectionDateTime?: string;
  performer?: {
    id?: string;
    name?: string;
    npi?: string;
  };
  results: LabTestResult[];
  notes?: string;
  verifiedBy?: string;
  verifiedDateTime?: string;
}

// Lab Test Result
export interface LabTestResult {
  testCode: string;
  testName: string;
  testId?: string;
  loincCode?: string;
  status: 'preliminary' | 'final' | 'corrected';
  valueType: 'numeric' | 'text' | 'coded' | 'range';
  value?: number | string;
  unit?: string;
  referenceRange?: {
    low?: number;
    high?: number;
    text?: string;
  };
  interpretation?: 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high' | 'abnormal';
  abnormalFlag?: boolean;
  criticalFlag?: boolean;
  comment?: string;
  performer?: string;
  observationDateTime?: string;
}

// Critical Value Alert
export interface CriticalValueAlert {
  id: string;
  labOrderId: string;
  patientId: string;
  patientName: string;
  testCode: string;
  testName: string;
  value: string;
  criticalRange: string;
  alertDateTime: string;
  acknowledgedBy?: string;
  acknowledgedDateTime?: string;
  callbackNumber?: string;
  notes?: string;
  status: 'pending' | 'acknowledged' | 'notified';
}

// Lab Connector Configuration
export interface LabConnectorConfig {
  labId: string;
  labName: string;
  labCode: string;
  connectionType: LabConnectionType;
  endpointUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  clientId?: string;
  clientSecret?: string;
  senderApplication?: string;
  senderFacility?: string;
  receiverApplication?: string;
  receiverFacility?: string;
  fhirBaseUrl?: string;
  hl7Version?: string;
  timeout?: number;
  retryAttempts?: number;
  supportedTests?: LabTestDefinition[];
}

/**
 * Lab Integration Connector
 */
export class LabConnector {
  private config: LabConnectorConfig;
  private hl7Generator: Hl7Generator;
  private hl7Parser: Hl7Parser;

  constructor(config: LabConnectorConfig) {
    this.config = config;
    this.hl7Generator = new Hl7Generator();
    this.hl7Parser = new Hl7Parser();
  }

  /**
   * Submit lab order
   */
  async submitOrder(order: LabOrderInput): Promise<{
    success: boolean;
    externalOrderId?: string;
    message?: string;
    error?: string;
  }> {
    try {
      switch (this.config.connectionType) {
        case 'hl7':
          return this.submitOrderHL7(order);
        case 'fhir':
          return this.submitOrderFHIR(order);
        case 'rest':
          return this.submitOrderREST(order);
        default:
          return { success: false, error: 'Unsupported connection type' };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Submit order via HL7
   */
  private async submitOrderHL7(order: LabOrderInput): Promise<{
    success: boolean;
    externalOrderId?: string;
    message?: string;
    error?: string;
  }> {
    const hl7Message = this.hl7Generator.generateOrmMessage(
      {
        messageType: 'ORM',
        triggerEvent: 'O01',
        sendingApplication: this.config.senderApplication || 'NexusOS',
        sendingFacility: this.config.senderFacility,
        receivingApplication: this.config.receiverApplication,
        receivingFacility: this.config.receiverFacility,
        messageControlId: this.generateMessageId(),
        processingId: 'P',
      },
      {
        patientId: order.patientId,
        patientIdType: order.patientMrn ? 'MR' : 'PI',
        familyName: order.patientName.split(' ').pop() || '',
        givenName: order.patientName.split(' ')[0] || '',
        dateOfBirth: order.patientDob,
        sex: order.patientSex,
      },
      order.tests.map((test, index) => ({
        orderControl: 'NW',
        placerOrderNumber: `${order.orderId}-${index + 1}`,
        testCode: test.testCode,
        testName: test.testName || test.testCode,
        priority: order.priority?.toUpperCase(),
        orderingProvider: {
          id: order.orderingProviderId,
          familyName: order.orderingProviderName.split(' ').pop() || '',
          givenName: order.orderingProviderName.split(' ')[0] || '',
        },
        clinicalInfo: order.clinicalNotes,
        specimenSource: order.specimenSource,
      })),
      undefined
    );

    // Send to lab endpoint
    const response = await this.sendHL7Message(hl7Message);

    return {
      success: response.success,
      externalOrderId: response.acknowledgmentId,
      message: hl7Message,
      error: response.error,
    };
  }

  /**
   * Submit order via FHIR
   */
  private async submitOrderFHIR(order: LabOrderInput): Promise<{
    success: boolean;
    externalOrderId?: string;
    message?: string;
    error?: string;
  }> {
    if (!this.config.fhirBaseUrl) {
      return { success: false, error: 'FHIR base URL not configured' };
    }

    // Create ServiceRequest resources for each test
    const serviceRequests = order.tests.map((test) => ({
      resourceType: 'ServiceRequest',
      status: 'active',
      intent: 'order',
      category: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '108252007',
              display: 'Laboratory procedure',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: FhirCodeSystems.LOINC,
            code: test.testCode,
            display: test.testName,
          },
        ],
      },
      subject: {
        reference: `Patient/${order.patientId}`,
        display: order.patientName,
      },
      requester: {
        reference: `Practitioner/${order.orderingProviderId}`,
        display: order.orderingProviderName,
      },
      priority: order.priority === 'stat' ? 'stat' : order.priority === 'urgent' ? 'urgent' : 'routine',
    }));

    // Create a Bundle
    const bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: serviceRequests.map((sr) => ({
        resource: sr,
        request: {
          method: 'POST',
          url: 'ServiceRequest',
        },
      })),
    };

    try {
      const response = await fetch(`${this.config.fhirBaseUrl}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json',
          ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify(bundle),
      });

      if (!response.ok) {
        throw new Error(`FHIR request failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        externalOrderId: result.id,
        message: JSON.stringify(result),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Submit order via REST API
   */
  private async submitOrderREST(order: LabOrderInput): Promise<{
    success: boolean;
    externalOrderId?: string;
    message?: string;
    error?: string;
  }> {
    if (!this.config.endpointUrl) {
      return { success: false, error: 'Endpoint URL not configured' };
    }

    try {
      const response = await fetch(`${this.config.endpointUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'X-API-Key': this.config.apiKey }),
        },
        body: JSON.stringify({
          orderId: order.orderId,
          patient: {
            id: order.patientId,
            mrn: order.patientMrn,
            name: order.patientName,
            dob: order.patientDob,
            sex: order.patientSex,
          },
          orderingProvider: {
            id: order.orderingProviderId,
            name: order.orderingProviderName,
            npi: order.orderingProviderNpi,
          },
          tests: order.tests,
          diagnosisCodes: order.diagnosisCodes,
          priority: order.priority,
          collectionDateTime: order.collectionDateTime,
          clinicalNotes: order.clinicalNotes,
          specimenSource: order.specimenSource,
        }),
      });

      if (!response.ok) {
        throw new Error(`REST request failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        externalOrderId: result.externalOrderId || result.id,
        message: JSON.stringify(result),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send HL7 message to lab
   */
  private async sendHL7Message(message: string): Promise<{
    success: boolean;
    acknowledgmentId?: string;
    error?: string;
  }> {
    if (!this.config.endpointUrl) {
      return { success: false, error: 'Endpoint URL not configured' };
    }

    try {
      const response = await fetch(`${this.config.endpointUrl}/hl7`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          ...(this.config.apiKey && { 'X-API-Key': this.config.apiKey }),
        },
        body: message,
      });

      if (!response.ok) {
        throw new Error(`HL7 send failed: ${response.statusText}`);
      }

      const ackMessage = await response.text();
      const parsed = this.hl7Parser.parse(ackMessage);

      return {
        success: true,
        acknowledgmentId: parsed.messageControlId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Parse incoming lab results
   */
  parseResults(message: string): LabResultInput | null {
    try {
      const parsed = this.hl7Parser.parse(message);

      if (parsed.messageType !== 'ORU') {
        return null;
      }

      const result: LabResultInput = {
        orderId: parsed.orders?.[0]?.placerOrderNumber || '',
        externalOrderId: parsed.orders?.[0]?.fillerOrderNumber,
        reportStatus: 'final',
        resultDateTime: parsed.messageDateTime || new Date().toISOString(),
        results: [],
      };

      // Extract results from observations
      if (parsed.orders) {
        for (const order of parsed.orders) {
          if (order.observations) {
            for (const obs of order.observations) {
              result.results.push({
                testCode: obs.observationIdentifier?.identifier || '',
                testName: obs.observationIdentifier?.text || '',
                loincCode: obs.observationIdentifier?.codingSystem,
                status: obs.observationResultStatus === 'F' ? 'final' : 'preliminary',
                valueType: obs.valueType === 'NM' ? 'numeric' : 'text',
                value: obs.observationValue,
                unit: obs.units,
                interpretation: this.mapInterpretation(obs.abnormalFlags),
                abnormalFlag: obs.abnormalFlags !== undefined && obs.abnormalFlags !== 'N',
                criticalFlag: obs.abnormalFlags === 'HH' || obs.abnormalFlags === 'LL',
                referenceRange: obs.referenceRange ? { text: obs.referenceRange } : undefined,
                comment: obs.note,
                observationDateTime: obs.dateTimeOfObservation,
              });
            }
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Failed to parse lab results:', error);
      return null;
    }
  }

  /**
   * Map HL7 abnormal flags to interpretation
   */
  private mapInterpretation(flag?: string): LabTestResult['interpretation'] {
    switch (flag) {
      case 'H':
      case 'HH':
        return 'high';
      case 'L':
      case 'LL':
        return 'low';
      case 'AA':
        return 'critical_high';
      case 'LL':
        return 'critical_low';
      case 'A':
        return 'abnormal';
      case 'N':
      default:
        return 'normal';
    }
  }

  /**
   * Check for critical values and generate alerts
   */
  async checkCriticalValues(result: LabResultInput): Promise<CriticalValueAlert[]> {
    const alerts: CriticalValueAlert[] = [];

    for (const testResult of result.results) {
      if (testResult.criticalFlag) {
        const alert: CriticalValueAlert = {
          id: this.generateMessageId(),
          labOrderId: result.orderId,
          patientId: '', // Would be populated from database
          patientName: '', // Would be populated from database
          testCode: testResult.testCode,
          testName: testResult.testName,
          value: `${testResult.value} ${testResult.unit || ''}`,
          criticalRange: testResult.referenceRange?.text || '',
          alertDateTime: new Date().toISOString(),
          status: 'pending',
        };

        alerts.push(alert);

        // Save to database
        // await db.criticalValueAlert.create({ data: alert });
      }
    }

    return alerts;
  }

  /**
   * Convert lab result to FHIR Observation
   */
  convertToFhirObservation(result: LabTestResult, patientId: string): unknown {
    return labResultToObservation({
      testCode: result.loincCode || result.testCode,
      testName: result.testName,
      value: result.value as number,
      unit: result.unit,
      interpretation: result.interpretation?.includes('critical')
        ? 'critical'
        : result.interpretation,
      status: result.status === 'final' ? 'final' : 'preliminary',
      patientId,
      referenceLow: result.referenceRange?.low,
      referenceHigh: result.referenceRange?.high,
    });
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${this.config.labCode}${timestamp}${random}`;
  }

  /**
   * Query order status
   */
  async queryOrderStatus(externalOrderId: string): Promise<{
    status: LabOrderStatus;
    lastUpdate?: string;
    message?: string;
  }> {
    try {
      switch (this.config.connectionType) {
        case 'rest':
          const response = await fetch(
            `${this.config.endpointUrl}/orders/${externalOrderId}/status`,
            {
              headers: {
                ...(this.config.apiKey && { 'X-API-Key': this.config.apiKey }),
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Status query failed: ${response.statusText}`);
          }

          const result = await response.json();
          return {
            status: result.status as LabOrderStatus,
            lastUpdate: result.lastUpdate,
            message: result.message,
          };

        default:
          return { status: 'ordered', message: 'Status query not supported' };
      }
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default LabConnector;
