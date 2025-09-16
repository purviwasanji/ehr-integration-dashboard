import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Clock
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

interface ClinicalNote {
  id: string;
  patientName: string;
  provider: string;
  date: string;
  type: string;
  content: string;
  diagnosis: string[];
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

const mockNotes: ClinicalNote[] = [
  {
    id: "1",
    patientName: "Sarah Johnson",
    provider: "Dr. Smith",
    date: "2024-01-12",
    type: "Progress Note",
    content: "Patient presents for routine diabetes follow-up. Blood glucose levels have been well-controlled with current medication regimen. HbA1c improved from 8.2% to 7.1%. Patient reports good adherence to dietary recommendations and exercise routine.",
    diagnosis: ["Type 2 Diabetes Mellitus", "Hypertension"]
  },
  {
    id: "2", 
    patientName: "Michael Chen",
    provider: "Dr. Williams",
    date: "2024-01-10",
    type: "Consultation Note",
    content: "64-year-old male with progressive shortness of breath on exertion. Pulmonary function tests show moderate obstruction. Recommending bronchodilator therapy adjustment and pulmonary rehabilitation program enrollment.",
    diagnosis: ["COPD Exacerbation", "Chronic Bronchitis"]
  }
];

export const ClinicalOperations = () => {
  const [vitals, setVitals] = useState<VitalSigns>(mockVitals);
  const [notes] = useState<ClinicalNote[]>(mockNotes);
  const [activeTab, setActiveTab] = useState<"vitals" | "notes" | "labs" | "medications">("vitals");
  const [newNote, setNewNote] = useState({
    patient: "",
    type: "",
    content: "",
    diagnosis: ""
  });

  const handleVitalChange = (field: keyof VitalSigns, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Clinical Operations</h2>
        <p className="text-muted-foreground">Record and manage clinical data, notes, and observations</p>
      </div>

      {/* Quick Navigation */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "vitals", label: "Vital Signs", icon: Heart },
          { key: "notes", label: "Clinical Notes", icon: FileText },
          { key: "labs", label: "Lab Results", icon: TestTube },
          { key: "medications", label: "Medications", icon: Pill }
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

      {/* Clinical Notes Section */}
      {activeTab === "notes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Note Form */}
          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                New Clinical Note
              </CardTitle>
              <CardDescription>Create a new clinical note or observation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient</Label>
                <Select value={newNote.patient} onValueChange={(value) => setNewNote(prev => ({ ...prev, patient: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                    <SelectItem value="michael">Michael Chen</SelectItem>
                    <SelectItem value="emma">Emma Rodriguez</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="noteType">Note Type</Label>
                <Select value={newNote.type} onValueChange={(value) => setNewNote(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select note type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress">Progress Note</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="admission">Admission Note</SelectItem>
                    <SelectItem value="discharge">Discharge Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Primary Diagnosis</Label>
                <Input
                  id="diagnosis"
                  value={newNote.diagnosis}
                  onChange={(e) => setNewNote(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Enter diagnosis codes or descriptions"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Clinical Note</Label>
                <Textarea
                  id="content"
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter detailed clinical observations, assessment, and plan..."
                  rows={6}
                />
              </div>

              <Button className="w-full bg-gradient-primary hover:opacity-90">
                <Save className="h-4 w-4 mr-2" />
                Save Clinical Note
              </Button>
            </CardContent>
          </Card>

          {/* Recent Notes */}
          <div className="lg:col-span-2">
            <Card className="shadow-medical">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Recent Clinical Notes
                </CardTitle>
                <CardDescription>Latest clinical documentation and notes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{note.patientName}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{note.provider}</span>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>{note.date}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">{note.type}</Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {note.diagnosis.map((dx, index) => (
                            <Badge key={index} className="bg-primary-lighter text-primary text-xs">
                              {dx}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-foreground line-clamp-3">{note.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Lab Results Placeholder */}
      {activeTab === "labs" && (
        <Card className="shadow-medical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              Laboratory Results
            </CardTitle>
            <CardDescription>View and manage laboratory test results</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Laboratory results interface will be integrated with EHR API</p>
          </CardContent>
        </Card>
      )}

      {/* Medications Placeholder */}
      {activeTab === "medications" && (
        <Card className="shadow-medical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Medication Management
            </CardTitle>
            <CardDescription>Manage patient medications and prescriptions</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Medication management interface will be integrated with EHR API</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
