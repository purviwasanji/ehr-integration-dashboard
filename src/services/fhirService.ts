export interface FHIRConfig {
  baseUrl: string;
  tenantId?: string;
  apiKey?: string;
  accessToken?: string;
}

export interface Patient {
  id: string;
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
  }>;
  identifier?: Array<{
    system: string;
    value: string;
  }>;
}

export interface Appointment {
  id: string;
  status: string;
  start: string;
  end: string;
  participant: Array<{
    actor: {
      reference: string;
      display: string;
    };
  }>;
  description?: string;
}

export interface Condition {
  id: string;
  subject: {
    reference: string;
  };
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  clinicalStatus?: {
    coding: Array<{
      system: string;
      code: string;
    }>;
  };
  onsetDateTime?: string;
}

export interface Encounter {
  id: string;
  status: string;
  class: {
    system: string;
    code: string;
    display: string;
  };
  subject: {
    reference: string;
  };
  period?: {
    start: string;
    end?: string;
  };
}

class FHIRService {
  private config: FHIRConfig;

  constructor(config: FHIRConfig) {
    this.config = config;
  }

  updateConfig(config: FHIRConfig) {
    this.config = config;
  }

  private getHeaders(): Headers {
    const headers = new Headers();
    headers.append('Accept', 'application/fhir+json');
    headers.append('Content-Type', 'application/fhir+json');
    
    if (this.config.accessToken) {
      headers.append('Authorization', `Bearer ${this.config.accessToken}`);
    }
    
    return headers;
  }

  private buildUrl(resource: string, params?: Record<string, string>): string {
    let url = `${this.config.baseUrl}`;
    
    if (this.config.tenantId) {
      url += `/${this.config.tenantId}`;
    }
    
    url += `/${resource}`;
    
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    
    return url;
  }

  async makeRequest<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
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
  }): Promise<{ entry: Array<{ resource: Patient }> }> {
    const searchParams: Record<string, string> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams[key] = value;
    });

    const url = this.buildUrl('Patient', searchParams);
    return this.makeRequest<{ entry: Array<{ resource: Patient }> }>(url);
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

  async getPatientConditions(patientId: string): Promise<{ entry: Array<{ resource: Condition }> }> {
    const url = this.buildUrl('Condition', { patient: patientId });
    return this.makeRequest<{ entry: Array<{ resource: Condition }> }>(url);
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

  async getPatientEncounters(patientId: string): Promise<{ entry: Array<{ resource: Encounter }> }> {
    const url = this.buildUrl('Encounter', { patient: patientId });
    return this.makeRequest<{ entry: Array<{ resource: Encounter }> }>(url);
  }

  async getEncounter(id: string): Promise<Encounter> {
    const url = this.buildUrl(`Encounter/${id}`);
    return this.makeRequest<Encounter>(url);
  }

  async getPatientProcedures(patientId: string): Promise<{ entry: Array<{ resource: any }> }> {
    const url = this.buildUrl('Procedure', { patient: patientId });
    return this.makeRequest<{ entry: Array<{ resource: any }> }>(url);
  }

  async getCapabilityStatement(): Promise<any> {
    const url = this.buildUrl('metadata');
    return this.makeRequest<any>(url);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getCapabilityStatement();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export default FHIRService;
