/**
 * Zapier App Definition for NexusOS
 * 
 * This file defines the Zapier integration for NexusOS, enabling users to:
 * - Connect NexusOS with 5,000+ apps through Zapier
 * - Create triggers for events in NexusOS (case created, invoice paid, etc.)
 * - Perform actions in NexusOS from other apps (create case, update client, etc.)
 * 
 * @see https://platform.zapier.com/cli_docs
 */

// ============================================
// TRIGGERS - Events that start Zaps
// ============================================

const triggers = {
  // Case Triggers
  case_created: {
    key: 'case_created',
    noun: 'Case',
    display: {
      label: 'New Case',
      description: 'Triggers when a new case is created.',
    },
    operation: {
      type: 'polling',
      perform: async (z: any, bundle: any) => {
        const response = await z.request({
          url: `${bundle.authData.apiUrl}/api/integrations/zapier/triggers/case_created`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
          },
        });
        return response.data;
      },
    },
  },

  case_updated: {
    key: 'case_updated',
    noun: 'Case',
    display: {
      label: 'Case Updated',
      description: 'Triggers when a case is updated.',
    },
    operation: {
      type: 'polling',
      perform: async (z: any, bundle: any) => {
        const response = await z.request({
          url: `${bundle.authData.apiUrl}/api/integrations/zapier/triggers/case_updated`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
          },
        });
        return response.data;
      },
    },
  },

  case_closed: {
    key: 'case_closed',
    noun: 'Case',
    display: {
      label: 'Case Closed',
      description: 'Triggers when a case is marked as closed.',
    },
    operation: {
      type: 'polling',
      perform: async (z: any, bundle: any) => {
        const response = await z.request({
          url: `${bundle.authData.apiUrl}/api/integrations/zapier/triggers/case_closed`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
          },
        });
        return response.data;
      },
    },
  },

  // Invoice Triggers
  invoice_created: {
    key: 'invoice_created',
    noun: 'Invoice',
    display: {
      label: 'New Invoice',
      description: 'Triggers when a new invoice is created.',
    },
    operation: {
      type: 'polling',
      perform: async (z: any, bundle: any) => {
        const response = await z.request({
          url: `${bundle.authData.apiUrl}/api/integrations/zapier/triggers/invoice_created`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
          },
        });
        return response.data;
      },
    },
  },

  invoice_paid: {
    key: 'invoice_paid',
    noun: 'Invoice',
    display: {
      label: 'Invoice Paid',
      description: 'Triggers when an invoice is paid.',
    },
    operation: {
      type: 'polling',
      perform: async (z: any, bundle: any) => {
        const response = await z.request({
          url: `${bundle.authData.apiUrl}/api/integrations/zapier/triggers/invoice_paid`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
          },
        });
        return response.data;
      },
    },
  },

  // Document Triggers
  document_uploaded: {
    key: 'document_uploaded',
    noun: 'Document',
    display: {
      label: 'Document Uploaded',
      description: 'Triggers when a document is uploaded.',
    },
    operation: {
      type: 'polling',
      perform: async (z: any, bundle: any) => {
        const response = await z.request({
          url: `${bundle.authData.apiUrl}/api/integrations/zapier/triggers/document_uploaded`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
          },
        });
        return response.data;
      },
    },
  },

  // Appointment Triggers
  appointment_scheduled: {
    key: 'appointment_scheduled',
    noun: 'Appointment',
    display: {
      label: 'Appointment Scheduled',
      description: 'Triggers when a new appointment is scheduled.',
    },
    operation: {
      type: 'polling',
      perform: async (z: any, bundle: any) => {
        const response = await z.request({
          url: `${bundle.authData.apiUrl}/api/integrations/zapier/triggers/appointment_scheduled`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
          },
        });
        return response.data;
      },
    },
  },

  // Client/Patient Triggers
  client_created: {
    key: 'client_created',
    noun: 'Client',
    display: {
      label: 'New Client',
      description: 'Triggers when a new client is created.',
    },
    operation: {
      type: 'polling',
      perform: async (z: any, bundle: any) => {
        const response = await z.request({
          url: `${bundle.authData.apiUrl}/api/integrations/zapier/triggers/client_created`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
          },
        });
        return response.data;
      },
    },
  },
};

// ============================================
// ACTIONS - Things Zapier can do in NexusOS
// ============================================

const creates = {
  // Case Actions
  create_case: {
    key: 'create_case',
    noun: 'Case',
    display: {
      label: 'Create Case',
      description: 'Creates a new case in NexusOS.',
    },
    operation: {
      inputFields: [
        { key: 'title', label: 'Case Title', required: true },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'clientId', label: 'Client ID', required: true },
        { key: 'practiceArea', label: 'Practice Area', required: true },
        { key: 'priority', label: 'Priority', choices: { low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' } },
        { key: 'openDate', label: 'Open Date', type: 'datetime' },
      ],
      perform: async (z: any, bundle: any) => {
        const response = await z.request({
          url: `${bundle.authData.apiUrl}/api/integrations/zapier/actions/create_case`,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: bundle.inputData,
        });
        return response.data;
      },
    },
  },

  update_case: {
    key: 'update_case',
    noun: 'Case',
    display: {
      label: 'Update Case',
      description: 'Updates an existing case in NexusOS.',
    },
    operation: {
      inputFields: [
        { key: 'caseId', label: 'Case ID', required: true },
        { key: 'title', label: 'Case Title' },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'status', label: 'Status', choices: { open: 'Open', in_progress: 'In Progress', pending: 'Pending', closed: 'Closed' } },
        { key: 'priority', label: 'Priority', choices: { low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' } },
      ],
      perform: async (z: any, bundle: any) => {
        const response = await z.request({
          url: `${bundle.authData.apiUrl}/api/integrations/zapier/actions/update_case`,
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: bundle.inputData,
        });
        return response.data;
      },
    },
  },

  // Client Actions
  create_client: {
    key: 'create_client',
    noun: 'Client',
    display: {
      label: 'Create Client',
      description: 'Creates a new client in NexusOS.',
    },
    operation: {
      inputFields: [
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'fullName', label: 'Full Name', required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone', required: true },
        { key: 'address', label: 'Address' },
        { key: 'clientType', label: 'Client Type', choices: { individual: 'Individual', company: 'Company' } },
      ],
      perform: async (z: any, bundle: any) => {
        const response = await z.request({
          url: `${bundle.authData.apiUrl}/api/integrations/zapier/actions/create_client`,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: bundle.inputData,
        });
        return response.data;
      },
    },
  },

  // Invoice Actions
  create_invoice: {
    key: 'create_invoice',
    noun: 'Invoice',
    display: {
      label: 'Create Invoice',
      description: 'Creates a new invoice in NexusOS.',
    },
    operation: {
      inputFields: [
        { key: 'clientId', label: 'Client ID', required: true },
        { key: 'caseId', label: 'Case ID' },
        { key: 'items', label: 'Line Items', type: 'text', helpText: 'JSON array of line items' },
        { key: 'dueDate', label: 'Due Date', type: 'datetime' },
        { key: 'notes', label: 'Notes', type: 'text' },
      ],
      perform: async (z: any, bundle: any) => {
        const response = await z.request({
          url: `${bundle.authData.apiUrl}/api/integrations/zapier/actions/create_invoice`,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: bundle.inputData,
        });
        return response.data;
      },
    },
  },

  // Appointment Actions
  create_appointment: {
    key: 'create_appointment',
    noun: 'Appointment',
    display: {
      label: 'Create Appointment',
      description: 'Creates a new appointment in NexusOS.',
    },
    operation: {
      inputFields: [
        { key: 'patientId', label: 'Patient/Client ID', required: true },
        { key: 'title', label: 'Title', required: true },
        { key: 'date', label: 'Date', type: 'datetime', required: true },
        { key: 'startTime', label: 'Start Time', required: true },
        { key: 'endTime', label: 'End Time' },
        { key: 'providerId', label: 'Provider ID' },
        { key: 'notes', label: 'Notes', type: 'text' },
      ],
      perform: async (z: any, bundle: any) => {
        const response = await z.request({
          url: `${bundle.authData.apiUrl}/api/integrations/zapier/actions/create_appointment`,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: bundle.inputData,
        });
        return response.data;
      },
    },
  },

  // Document Actions
  create_document: {
    key: 'create_document',
    noun: 'Document',
    display: {
      label: 'Upload Document',
      description: 'Uploads a document to NexusOS.',
    },
    operation: {
      inputFields: [
        { key: 'caseId', label: 'Case ID' },
        { key: 'name', label: 'Document Name', required: true },
        { key: 'fileUrl', label: 'File URL', required: true, helpText: 'Publicly accessible URL to the file' },
        { key: 'category', label: 'Category' },
        { key: 'description', label: 'Description', type: 'text' },
      ],
      perform: async (z: any, bundle: any) => {
        const response = await z.request({
          url: `${bundle.authData.apiUrl}/api/integrations/zapier/actions/create_document`,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: bundle.inputData,
        });
        return response.data;
      },
    },
  },

  // Time Entry Actions
  create_time_entry: {
    key: 'create_time_entry',
    noun: 'Time Entry',
    display: {
      label: 'Log Time Entry',
      description: 'Creates a time entry in NexusOS.',
    },
    operation: {
      inputFields: [
        { key: 'caseId', label: 'Case ID' },
        { key: 'description', label: 'Description', required: true },
        { key: 'duration', label: 'Duration (minutes)', type: 'number', required: true },
        { key: 'date', label: 'Date', type: 'datetime' },
        { key: 'billable', label: 'Billable', type: 'boolean', default: 'true' },
        { key: 'hourlyRate', label: 'Hourly Rate', type: 'number' },
      ],
      perform: async (z: any, bundle: any) => {
        const response = await z.request({
          url: `${bundle.authData.apiUrl}/api/integrations/zapier/actions/create_time_entry`,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: bundle.inputData,
        });
        return response.data;
      },
    },
  },
};

// ============================================
// SEARCHES - Find existing records
// ============================================

const searches = {
  find_case: {
    key: 'find_case',
    noun: 'Case',
    display: {
      label: 'Find Case',
      description: 'Finds an existing case by ID or search criteria.',
    },
    operation: {
      inputFields: [
        { key: 'caseId', label: 'Case ID' },
        { key: 'caseNumber', label: 'Case Number' },
        { key: 'title', label: 'Title (contains)' },
        { key: 'clientId', label: 'Client ID' },
        { key: 'status', label: 'Status' },
      ],
      perform: async (z: any, bundle: any) => {
        const response = await z.request({
          url: `${bundle.authData.apiUrl}/api/integrations/zapier/search/case`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
          },
          params: bundle.inputData,
        });
        return response.data;
      },
    },
  },

  find_client: {
    key: 'find_client',
    noun: 'Client',
    display: {
      label: 'Find Client',
      description: 'Finds an existing client by ID or search criteria.',
    },
    operation: {
      inputFields: [
        { key: 'clientId', label: 'Client ID' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'name', label: 'Name (contains)' },
      ],
      perform: async (z: any, bundle: any) => {
        const response = await z.request({
          url: `${bundle.authData.apiUrl}/api/integrations/zapier/search/client`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
          },
          params: bundle.inputData,
        });
        return response.data;
      },
    },
  },
};

// ============================================
// AUTHENTICATION
// ============================================

const authentication = {
  type: 'session',
  fields: [
    {
      key: 'apiKey',
      label: 'API Key',
      type: 'password',
      required: true,
      helpText: 'Your NexusOS API key. Get it from Settings > Integrations > API Keys.',
    },
    {
      key: 'apiUrl',
      label: 'API URL',
      type: 'string',
      required: true,
      default: 'https://api.nexusos.tt',
      helpText: 'The base URL for NexusOS API. Use https://api.nexusos.tt for production.',
    },
  ],
  test: async (z: any, bundle: any) => {
    const response = await z.request({
      url: `${bundle.authData.apiUrl}/api/integrations/zapier/test`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bundle.authData.apiKey}`,
      },
    });
    if (response.status !== 200) {
      throw new Error('Invalid API key or API URL');
    }
    return response.data;
  },
  connectionLabel: '{{bundle.authData.apiKey}}',
};

// ============================================
// APP DEFINITION
// ============================================

const App = {
  title: 'NexusOS',
  description: 'Connect NexusOS with 5,000+ apps through Zapier. Automate workflows for law firms, clinics, beauty salons, and more.',
  image: 'https://nexusos.tt/logo.png',
  icon: 'https://nexusos.tt/icon.png',
  version: '1.0.0',
  platformVersion: '15.0.0',
  
  authentication,
  
  triggers,
  creates,
  searches,
  
  // Bulk read for polling triggers
  bulkReads: {
    cases: {
      display: {
        label: 'Get Cases',
        description: 'Gets a list of cases.',
      },
      operation: {
        perform: async (z: any, bundle: any) => {
          const response = await z.request({
            url: `${bundle.authData.apiUrl}/api/integrations/zapier/bulk/cases`,
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${bundle.authData.apiKey}`,
            },
          });
          return response.data;
        },
      },
    },
    clients: {
      display: {
        label: 'Get Clients',
        description: 'Gets a list of clients.',
      },
      operation: {
        perform: async (z: any, bundle: any) => {
          const response = await z.request({
            url: `${bundle.authData.apiUrl}/api/integrations/zapier/bulk/clients`,
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${bundle.authData.apiKey}`,
            },
          });
          return response.data;
        },
      },
    },
  },
};

export default App;

// ============================================
// SAMPLE WEBHOOK PAYLOADS
// ============================================

export const samplePayloads = {
  case_created: {
    id: 'case_abc123',
    caseNumber: '2024-0001',
    title: 'Smith v. Jones',
    description: 'Personal injury case',
    clientId: 'client_xyz789',
    clientName: 'John Smith',
    practiceArea: 'Personal Injury',
    status: 'open',
    priority: 'normal',
    openDate: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
  },

  invoice_paid: {
    id: 'inv_abc123',
    invoiceNumber: 'INV-2024-0001',
    clientId: 'client_xyz789',
    clientName: 'John Smith',
    caseId: 'case_abc123',
    caseTitle: 'Smith v. Jones',
    total: 5000.00,
    currency: 'TTD',
    status: 'paid',
    paidAt: '2024-01-20T14:30:00Z',
    paymentMethod: 'bank_transfer',
  },

  appointment_scheduled: {
    id: 'apt_abc123',
    patientId: 'patient_xyz789',
    patientName: 'John Smith',
    providerId: 'provider_123',
    providerName: 'Dr. Jane Doe',
    title: 'Initial Consultation',
    date: '2024-01-25',
    startTime: '10:00',
    endTime: '11:00',
    status: 'scheduled',
    createdAt: '2024-01-15T09:00:00Z',
  },
};
