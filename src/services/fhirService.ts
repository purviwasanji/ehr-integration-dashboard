export interface FHIRConfig {
  baseUrl: string;
  tenantId?: string;
  apiKey?: string;
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface Patient {
  id: string;
  resourceType: "Patient";
  name: Array<{
    given: string[];
    family: string;
    use?: string;
  }>;
  gender?: string;
  birthDate?: string;
  telecom?: Array<{
    system: string;
    value: string;
    use?: string;
  }>;
  address?: Array<{
    line: string[];
    city: string;
    state: string;
    postalCode: string;
    country: string;
    use?: string;
  }>;
  identifier?: Array<{
    system: string;
    value: string;
    use?: string;
  }>;
  active?: boolean;
}

export interface Appointment {
  id: string;
  resourceType: "Appointment";
  status: string;
  start: string;
  end: string;
  participant: Array<{
    actor: {
      reference: string;
      display: string;
    };
    status: string;
  }>;
  description?: string;
  serviceType?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
}

export interface Condition {
  id: string;
  resourceType: "Condition";
  subject: {
    reference: string;
  };
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  clinicalStatus?: {
    coding: Array<{
      system: string;
      code: string;
    }>;
  };
  verificationStatus?: {
    coding: Array<{
      system: string;
      code: string;
    }>;
  };
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  onsetDateTime?: string;
  recordedDate?: string;
}

export interface Encounter {
  id: string;
  resourceType: "Encounter";
  status: string;
  class: {
    system: string;
    code: string;
    display: string;
  };
  subject: {
    reference: string;
  };
  participant?: Array<{
    individual?: {
      reference: string;
      display: string;
    };
  }>;
  period?: {
    start: string;
    end?: string;
  };
  serviceProvider?: {
    reference: string;
    display: string;
  };
}

export interface Procedure {
  id: string;
  resourceType: "Procedure";
  status: string;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string;
  };
  performedDateTime?: string;
  performer?: Array<{
    actor: {
      reference: string;
      display: string;
    };
  }>;
}

export interface Observation {
  id: string;
  resourceType: "Observation";
  status: string;
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string;
  };
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  valueString?: string;
  effectiveDateTime?: string;
}

export interface Bundle {
  resourceType: "Bundle";
  id: string;
  type: string;
  total?: number;
  entry?: Array<{
    resource: Patient | Encounter | Condition | Procedure | Observation;
  }>;
}

class FHIRService {
  private config: FHIRConfig;

  constructor(config: FHIRConfig) {
    this.config = {
      baseUrl: "https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d",
      ...config
    };
  }

  updateConfig(config: FHIRConfig) {
    this.config = { ...this.config, ...config };
  }

  private getHeaders(): Headers {
    const headers = new Headers();
    headers.append('Accept', 'application/fhir+json');
    headers.append('Content-Type', 'application/fhir+json');
    
    if (this.config.accessToken) {
      headers.append('Authorization', `Bearer ${this.config.accessToken}`);
    }
    
    if (this.config.apiKey) {
      headers.append('x-api-key', this.config.apiKey);
    }
    
    return headers;
  }

  private buildUrl(resource: string, params?: Record<string, string>): string {
    let url = this.config.baseUrl;
    
    url = url.replace(/\/$/, '');
    
    url += `/${resource}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value);
        }
      });
      
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }
    
    return url;
  }

  async makeRequest<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      console.log('Making FHIR request to:', url);
      
      const response = await fetch(url, {
        headers: this.getHeaders(),
        mode: 'cors',
        ...options,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorBody = await response.text();
          if (errorBody) {
            try {
              const errorJson = JSON.parse(errorBody);
              if (errorJson.resourceType === 'OperationOutcome' && errorJson.issue) {
                errorMessage = errorJson.issue.map((issue: any) => issue.details?.text || issue.diagnostics || 'Unknown error').join(', ');
              }
            } catch {
              errorMessage += `: ${errorBody}`;
            }
          }
        } catch (e) {
          // If we can't read the error body, just use the status
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('FHIR response:', data);
      return data;
    } catch (error) {
      console.error('FHIR API Error:', error);
      throw error;
    }
  }

  async searchPatients(params: {
    name?: string;
    given?: string;
    family?: string;
    identifier?: string;
    birthdate?: string;
    _id?: string;
    phone?: string;
    email?: string;
    'address-postalcode'?: string;
    gender?: string;
    _count?: string;
  }): Promise<Bundle> {
    const searchParams: Record<string, string> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams[key] = value;
    });

    const requiredParams = ['_id', 'identifier', 'name', 'given', 'family', 'birthdate', 'phone', 'email', 'address-postalcode'];
    const hasRequiredParam = requiredParams.some(param => searchParams[param]);
    
    if (!hasRequiredParam) {
      throw new Error('At least one search parameter is required: _id, identifier, name, given, family, birthdate, phone, email, or address-postalcode');
    }

    const url = this.buildUrl('Patient', searchParams);
    return this.makeRequest<Bundle>(url);
  }

  async getPatient(id: string): Promise<Patient> {
    const url = this.buildUrl(`Patient/${id}`);
    return this.makeRequest<Patient>(url);
  }

  async updatePatient(id: string, patient: Partial<Patient>): Promise<Patient> {
    const url = this.buildUrl(`Patient/${id}`);
    return this.makeRequest<Patient>(url, {
      method: 'PUT',
      body: JSON.stringify({
        resourceType: 'Patient',
        id,
        ...patient,
      }),
    });
  }

  async getPatientConditions(patientId: string, params?: {
    'clinical-status'?: string;
    category?: string;
  }): Promise<Bundle> {
    const searchParams = { 
      patient: patientId,
      ...params 
    };
    const url = this.buildUrl('Condition', searchParams);
    return this.makeRequest<Bundle>(url);
  }

  async getCondition(id: string): Promise<Condition> {
    const url = this.buildUrl(`Condition/${id}`);
    return this.makeRequest<Condition>(url);
  }

  async createCondition(condition: Omit<Condition, 'id'>): Promise<Condition> {
    const url = this.buildUrl('Condition');
    return this.makeRequest<Condition>(url, {
      method: 'POST',
      body: JSON.stringify({
        resourceType: 'Condition',
        ...condition,
      }),
    });
  }

  async getPatientEncounters(patientId: string, params?: {
    _count?: string;
  }): Promise<Bundle> {
    const searchParams = { 
      patient: patientId,
      ...params 
    };
    const url = this.buildUrl('Encounter', searchParams);
    return this.makeRequest<Bundle>(url);
  }

  async getEncounter(id: string): Promise<Encounter> {
    const url = this.buildUrl(`Encounter/${id}`);
    return this.makeRequest<Encounter>(url);
  }

  async searchEncounters(params: {
    _id?: string;
    patient?: string;
    subject?: string;
    _count?: string;
  }): Promise<Bundle> {
    if (!params._id && !params.patient && !params.subject) {
      throw new Error('At least one search parameter is required: _id, patient, or subject');
    }

    const url = this.buildUrl('Encounter', params);
    return this.makeRequest<Bundle>(url);
  }

  async getPatientProcedures(patientId: string): Promise<Bundle> {
    const url = this.buildUrl('Procedure', { patient: patientId });
    return this.makeRequest<Bundle>(url);
  }

  async getProcedure(id: string): Promise<Procedure> {
    const url = this.buildUrl(`Procedure/${id}`);
    return this.makeRequest<Procedure>(url);
  }

  async searchProcedures(params: {
    _id?: string;
    patient?: string;
    subject?: string;
  }): Promise<Bundle> {
    if (!params._id && !params.patient && !params.subject) {
      throw new Error('At least one search parameter is required: _id, patient, or subject');
    }

    const url = this.buildUrl('Procedure', params);
    return this.makeRequest<Bundle>(url);
  }

  async getPatientObservations(patientId: string, params?: {
    category?: string;
    code?: string;
    date?: string;
    _count?: string;
  }): Promise<Bundle> {
    const searchParams = { 
      patient: patientId,
      ...params 
    };
    const url = this.buildUrl('Observation', searchParams);
    return this.makeRequest<Bundle>(url);
  }

  async createObservation(observation: Omit<Observation, 'id'>): Promise<Observation> {
    const url = this.buildUrl('Observation');
    return this.makeRequest<Observation>(url, {
      method: 'POST',
      body: JSON.stringify({
        resourceType: 'Observation',
        ...observation,
      }),
    });
  }

  async getCapabilityStatement(): Promise<any> {
    const url = this.buildUrl('metadata');
    return this.makeRequest<any>(url);
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const capability = await this.getCapabilityStatement();
      return { 
        success: true, 
        message: `Connected to ${capability.publisher || 'FHIR Server'} - ${capability.fhirVersion || 'Unknown Version'}` 
      };
    } catch (error) {
      console.error('Connection test failed:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown connection error' 
      };
    }
  }

  getPatientDisplayName(patient: Patient): string {
    if (patient.name && patient.name.length > 0) {
      const name = patient.name[0];
      const given = name.given?.join(' ') || '';
      const family = name.family || '';
      return `${given} ${family}`.trim();
    }
    return 'Unknown Patient';
  }

  getPatientIdentifier(patient: Patient, system?: string): string | undefined {
    if (!patient.identifier) return undefined;
    
    if (system) {
      const identifier = patient.identifier.find(id => id.system === system);
      return identifier?.value;
    }
    
    return patient.identifier[0]?.value;
  }

  formatFHIRDate(date: string): string {
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return date;
    }
  }

  formatFHIRDateTime(dateTime: string): string {
    try {
      return new Date(dateTime).toLocaleString();
    } catch {
      return dateTime;
    }
  }
}

export default FHIRService;
