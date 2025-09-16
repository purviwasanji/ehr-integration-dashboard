import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Activity, 
  Pill, 
  TestTube, 
  Heart, 
  Thermometer,
  Scale,
  Eye,
  Plus,
  Save,
  Clock,
  AlertCircle,
  Loader2,
  Stethoscope,
  Calendar
} from "lucide-react";

interface VitalSigns {
  temperature: string;
  bloodPressure: string;
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  weight: string;
  height: string;
  bmi: string;
}

interface FHIRCondition {
  id?: string;
  resourceType: "Condition";
  clinicalStatus?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  subject: {
    reference: string;
    display?: string;
  };
  onsetDateTime?: string;
  recordedDate?: string;
}

interface FHIRProcedure {
  id?: string;
  resourceType: "Procedure";
  status: string;
  code?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  subject: {
    reference: string;
    display?: string;
  };
  performedDateTime?: string;
}

interface FHIREncounter {
  id?: string;
  resourceType: "Encounter";
  status: string;
  class: {
    system: string;
    code: string;
    display: string;
  };
  type?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  subject: {
    reference: string;
    display?: string;
  };
  period?: {
    start: string;
    end?: string;
  };
}

const mockVitals: VitalSigns = {
  temperature: "98.6",
  bloodPressure: "120/80",
  heartRate: "72",
  respiratoryRate: "16",
  oxygenSaturation: "99",
  weight: "165",
  height: "5'8\"",
  bmi: "25.1"
};

// Mock FHIR service functions (replace with actual service calls)
const fhirService = {
  searchConditions: async (patientId: string): Promise<FHIRCondition[]> => {
    // This would call your actual FHIR service
    const response = await fetch(`/api/fhir/Condition?patient=${patientId}`, {
      headers: { 'Accept': 'application/fhir+json' }
    });
    const bundle = await response.json();
    return bundle.entry?.map((entry: any) => entry.resource) || [];
  },

  createCondition: async (condition: FHIRCondition): Promise<FHIRCondition> => {
    const response = await fetch('/api/fhir/Condition', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(condition)
    });
    return await response.json();
  },

  searchProcedures: async (patientId: string): Promise<FHIRProcedure[]> => {
    const response = await fetch(`/api/fhir/Procedure?patient=${patientId}`, {
      headers: { 'Accept': 'application/fhir+json' }
    });
    const bundle = await response.json();
    return bundle.entry?.map((entry: any) => entry.resource) || [];
  },

  createProcedure: async (procedure: FHIRProcedure): Promise<FHIRProcedure> => {
    const response = await fetch('/api/fhir/Procedure', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(procedure)
    });
    return await response.json();
  },

  searchEncounters: async (patientId: string): Promise<FHIREncounter[]> => {
    const response = await fetch(`/api/fhir/Encounter?patient=${patientId}`, {
      headers: { 'Accept': 'application/fhir+json' }
    });
    const bundle = await response.json();
    return bundle.entry?.map((entry: any) => entry.resource) || [];
  },

  createEncounter: async (encounter: FHIREncounter): Promise<FHIREncounter> => {
    const response = await fetch('/api/fhir/Encounter', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(encounter)
    });
    return await response.json();
  }
};

export const ClinicalOperations = () => {
  const [vitals, setVitals] = useState<VitalSigns>(mockVitals);
  const [conditions, setConditions] = useState<FHIRCondition[]>([]);
  const [procedures, setProcedures] = useState<FHIRProcedure[]>([]);
  const [encounters, setEncounters] = useState<FHIREncounter[]>([]);
  const [activeTab, setActiveTab] = useState<"vitals" | "conditions" | "procedures" | "encounters">("vitals");
  const [selectedPatient, setSelectedPatient] = useState<string>("12724066");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New condition form
  const [newCondition, setNewCondition] = useState({
    code: "",
    display: "",
    clinicalStatus: "active",
    category: "problem-list-item",
    onsetDate: ""
  });

  // New procedure form
  const [newProcedure, setNewProcedure] = useState({
    code: "",
    display: "",
    status: "completed",
    performedDate: ""
  });

  // New encounter form
  const [newEncounter, setNewEncounter] = useState({
    status: "in-progress",
    class: "outpatient",
    type: "",
    typeDisplay: "",
    startDate: ""
  });

  useEffect(() => {
    if (selectedPatient) {
      loadClinicalData();
    }
  }, [selectedPatient, activeTab]);

  const loadClinicalData = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case "conditions":
          const conditionsData = await fhirService.searchConditions(selectedPatient);
          setConditions(conditionsData);
          break;
        case "procedures":
          const proceduresData = await fhirService.searchProcedures(selectedPatient);
          setProcedures(proceduresData);
          break;
        case "encounters":
          const encountersData = await fhirService.searchEncounters(selectedPatient);
          setEncounters(encountersData);
          break;
      }
    } catch (err) {
      setError(`Failed to load ${activeTab}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVitalChange = (field: keyof VitalSigns, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateCondition = async () => {
    setLoading(true);
    try {
      const condition: FHIRCondition = {
        resourceType: "Condition",
        clinicalStatus: {
          coding: [{
            system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
            code: newCondition.clinicalStatus,
            display: newCondition.clinicalStatus === "active" ? "Active" : "Resolved"
          }]
        },
        category: [{
          coding: [{
            system: "http://terminology.hl7.org/CodeSystem/condition-category",
            code: newCondition.category,
            display: newCondition.category === "problem-list-item" ? "Problem List Item" : "Encounter Diagnosis"
          }]
        }],
        code: {
          coding: [{
            system: "http://snomed.info/sct",
            code: newCondition.code,
            display: newCondition.display
          }],
          text: newCondition.display
        },
        subject: {
          reference: `Patient/${selectedPatient}`
        },
        onsetDateTime: newCondition.onsetDate,
        recordedDate: new Date().toISOString()
      };

      await fhirService.createCondition(condition);
      await loadClinicalData();
      setNewCondition({ code: "", display: "", clinicalStatus: "active", category: "problem-list-item", onsetDate: "" });
    } catch (err) {
      setError(`Failed to create condition: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProcedure = async () => {
    setLoading(true);
    try {
      const procedure: FHIRProcedure = {
        resourceType: "Procedure",
        status: newProcedure.status,
        code: {
          coding: [{
            system: "http://snomed.info/sct",
            code: newProcedure.code,
            display: newProcedure.display
          }],
          text: newProcedure.display
        },
        subject: {
          reference: `Patient/${selectedPatient}`
        },
        performedDateTime: newProcedure.performedDate
      };

      await fhirService.createProcedure(procedure);
      await loadClinicalData();
      setNewProcedure({ code: "", display: "", status: "completed", performedDate: "" });
    } catch (err) {
      setError(`Failed to create procedure: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEncounter = async () => {
    setLoading(true);
    try {
      const encounter: FHIREncounter = {
        resourceType: "Encounter",
        status: newEncounter.status,
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: newEncounter.class.toUpperCase(),
          display: newEncounter.class === "outpatient" ? "Outpatient" : "Inpatient"
        },
        type: newEncounter.type ? [{
          coding: [{
            system: "http://snomed.info/sct",
            code: newEncounter.type,
            display: newEncounter.typeDisplay
          }]
        }] : undefined,
        subject: {
          reference: `Patient/${selectedPatient}`
        },
        period: {
          start: newEncounter.startDate
        }
      };

      await fhirService.createEncounter(encounter);
      await loadClinicalData();
      setNewEncounter({ status: "in-progress", class: "outpatient", type: "", typeDisplay: "", startDate: "" });
    } catch (err) {
      setError(`Failed to create encounter: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Clinical Operations</h2>
        <p className="text-muted-foreground">Record and manage clinical data using FHIR standards</p>
      </div>

      {/* Patient Selection */}
      <Card className="shadow-medical">
        <CardHeader>
          <CardTitle>Patient Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="patient">Patient ID</Label>
              <Input
                id="patient"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                placeholder="Enter Patient ID (e.g., 12724066)"
              />
            </div>
            <Button onClick={loadClinicalData} disabled={!selectedPatient || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Load Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Navigation */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "vitals", label: "Vital Signs", icon: Heart },
          { key: "conditions", label: "Conditions", icon: Stethoscope },
          { key: "procedures", label: "Procedures", icon: Activity },
          { key: "encounters", label: "Encounters", icon: Calendar }
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={activeTab === key ? "default" : "outline"}
            onClick={() => setActiveTab(key as any)}
            className={activeTab === key ? "bg-primary text-primary-foreground" : ""}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </Button>
        ))}
      </div>

      {/* Vital Signs Section */}
      {activeTab === "vitals" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-medical-critical" />
                Record Vital Signs
              </CardTitle>
              <CardDescription>Enter current patient vital signs and measurements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature" className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Temperature (°F)
                  </Label>
                  <Input
                    id="temperature"
                    value={vitals.temperature}
                    onChange={(e) => handleVitalChange("temperature", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="heartRate" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Heart Rate (bpm)
                  </Label>
                  <Input
                    id="heartRate"
                    value={vitals.heartRate}
                    onChange={(e) => handleVitalChange("heartRate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
                  <Input
                    id="bloodPressure"
                    value={vitals.bloodPressure}
                    onChange={(e) => handleVitalChange("bloodPressure", e.target.value)}
                    placeholder="120/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oxygenSaturation">O2 Saturation (%)</Label>
                  <Input
                    id="oxygenSaturation"
                    value={vitals.oxygenSaturation}
                    onChange={(e) => handleVitalChange("oxygenSaturation", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Weight (lbs)
                  </Label>
                  <Input
                    id="weight"
                    value={vitals.weight}
                    onChange={(e) => handleVitalChange("weight", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    value={vitals.height}
                    onChange={(e) => handleVitalChange("height", e.target.value)}
                    placeholder="5'8&quot;"
                  />
                </div>
              </div>

              <Button className="w-full bg-gradient-primary hover:opacity-90">
                <Save className="h-4 w-4 mr-2" />
                Save Vital Signs
              </Button>
            </CardContent>
          </Card>

          {/* Vital Signs History */}
          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Vital Signs Trends
              </CardTitle>
              <CardDescription>Recent vital signs history and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "2024-01-12", temp: "98.6", bp: "118/75", hr: "68", o2: "99" },
                  { date: "2024-01-10", temp: "99.1", bp: "122/78", hr: "74", o2: "98" },
                  { date: "2024-01-08", temp: "98.4", bp: "120/80", hr: "72", o2: "99" }
                ].map((vital, index) => (
                  <div key={index} className="p-3 border border-border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-foreground">{vital.date}</span>
                      <Badge variant="outline" className="text-xs">Recorded</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Temp: <span className="font-medium">{vital.temp}°F</span></div>
                      <div>HR: <span className="font-medium">{vital.hr} bpm</span></div>
                      <div>BP: <span className="font-medium">{vital.bp}</span></div>
                      <div>O2: <span className="font-medium">{vital.o2}%</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conditions Section */}
      {activeTab === "conditions" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add New Condition
              </CardTitle>
              <CardDescription>Record a new medical condition or diagnosis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="conditionCode">Condition Code</Label>
                <Input
                  id="conditionCode"
                  value={newCondition.code}
                  onChange={(e) => setNewCondition(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="SNOMED CT Code (e.g., 73211009)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditionDisplay">Condition Name</Label>
                <Input
                  id="conditionDisplay"
                  value={newCondition.display}
                  onChange={(e) => setNewCondition(prev => ({ ...prev, display: e.target.value }))}
                  placeholder="e.g., Diabetes mellitus"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicalStatus">Clinical Status</Label>
                <Select value={newCondition.clinicalStatus} onValueChange={(value) => setNewCondition(prev => ({ ...prev, clinicalStatus: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newCondition.category} onValueChange={(value) => setNewCondition(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="problem-list-item">Problem List Item</SelectItem>
                    <SelectItem value="encounter-diagnosis">Encounter Diagnosis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="onsetDate">Onset Date</Label>
                <Input
                  id="onsetDate"
                  type="date"
                  value={newCondition.onsetDate}
                  onChange={(e) => setNewCondition(prev => ({ ...prev, onsetDate: e.target.value }))}
                />
              </div>

              <Button 
                className="w-full bg-gradient-primary hover:opacity-90" 
                onClick={handleCreateCondition}
                disabled={loading || !newCondition.code || !newCondition.display}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Add Condition
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Patient Conditions
              </CardTitle>
              <CardDescription>Current and historical medical conditions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : conditions.length > 0 ? (
                <div className="space-y-4">
                  {conditions.map((condition, index) => (
                    <div key={condition.id || index} className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-foreground">
                          {condition.code?.text || condition.code?.coding?.[0]?.display || 'Unknown Condition'}
                        </h3>
                        <Badge 
                          variant={condition.clinicalStatus?.coding?.[0]?.code === 'active' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {condition.clinicalStatus?.coding?.[0]?.display || 'Unknown Status'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Category: {condition.category?.[0]?.coding?.[0]?.display || 'Unspecified'}</div>
                        {condition.onsetDateTime && (
                          <div>Onset: {new Date(condition.onsetDateTime).toLocaleDateString()}</div>
                        )}
                        {condition.recordedDate && (
                          <div>Recorded: {new Date(condition.recordedDate).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No conditions found for this patient
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Procedures Section */}
      {activeTab === "procedures" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Record New Procedure
              </CardTitle>
              <CardDescription>Document a medical procedure or intervention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="procedureCode">Procedure Code</Label>
                <Input
                  id="procedureCode"
                  value={newProcedure.code}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="SNOMED CT Code (e.g., 80146002)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="procedureDisplay">Procedure Name</Label>
                <Input
                  id="procedureDisplay"
                  value={newProcedure.display}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, display: e.target.value }))}
                  placeholder="e.g., Appendectomy"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="procedureStatus">Status</Label>
                <Select value={newProcedure.status} onValueChange={(value) => setNewProcedure(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="not-done">Not Done</SelectItem>
                    <SelectItem value="preparation">Preparation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="performedDate">Performed Date</Label>
                <Input
                  id="performedDate"
                  type="datetime-local"
                  value={newProcedure.performedDate}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, performedDate: e.target.value }))}
                />
              </div>

              <Button 
                className="w-full bg-gradient-primary hover:opacity-90" 
                onClick={handleCreateProcedure}
                disabled={loading || !newProcedure.code || !newProcedure.display}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Record Procedure
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Patient Procedures
              </CardTitle>
              <CardDescription>Recorded medical procedures and interventions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : procedures.length > 0 ? (
                <div className="space-y-4">
                  {procedures.map((procedure, index) => (
                    <div key={procedure.id || index} className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-foreground">
                          {procedure.code?.text || procedure.code?.coding?.[0]?.display || 'Unknown Procedure'}
                        </h3>
                        <Badge 
                          variant={procedure.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {procedure.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {procedure.performedDateTime && (
                          <div>Performed: {new Date(procedure.performedDateTime).toLocaleDateString()}</div>
                        )}
                        {procedure.code?.coding?.[0]?.code && (
                          <div>Code: {procedure.code.coding[0].code}</div>
                        )}
                      </div>
                    </div>
                  ))}
