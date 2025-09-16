import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  UserPlus, 
  Edit3, 
  Eye, 
  AlertCircle, 
  Heart, 
  Pill,
  FileText,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  mrn: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  status: "active" | "inactive" | "critical";
  lastVisit: string;
  allergies: string[];
  conditions: string[];
}

const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    mrn: "MRN001234",
    dob: "1985-03-15",
    gender: "Female",
    phone: "(555) 123-4567",
    email: "sarah.j@email.com",
    address: "123 Main St, Springfield, IL 62701",
    status: "active",
    lastVisit: "2024-01-10",
    allergies: ["Penicillin", "Shellfish"],
    conditions: ["Hypertension", "Type 2 Diabetes"]
  },
  {
    id: "2", 
    name: "Michael Chen",
    mrn: "MRN001235",
    dob: "1972-11-28",
    gender: "Male",
    phone: "(555) 234-5678",
    email: "m.chen@email.com",
    address: "456 Oak Ave, Springfield, IL 62702",
    status: "critical",
    lastVisit: "2024-01-12",
    allergies: ["Latex"],
    conditions: ["COPD", "Coronary Artery Disease"]
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    mrn: "MRN001236", 
    dob: "1990-07-22",
    gender: "Female",
    phone: "(555) 345-6789",
    email: "emma.r@email.com",
    address: "789 Pine St, Springfield, IL 62703",
    status: "active",
    lastVisit: "2024-01-08",
    allergies: [],
    conditions: ["Asthma"]
  }
];

export const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients] = useState<Patient[]>(mockPatients);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Patient['status']) => {
    switch (status) {
      case 'critical':
        return <Badge className="bg-medical-critical text-white">Critical</Badge>;
      case 'active':
        return <Badge className="bg-medical-stable text-white">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-medical-inactive text-white">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name, MRN, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Patient
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-2">
          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Patient Registry
              </CardTitle>
              <CardDescription>
                Manage patient records and medical information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Patient</TableHead>
                      <TableHead>MRN</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow 
                        key={patient.id}
                        className="hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">{patient.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {patient.gender} • DOB: {patient.dob}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{patient.mrn}</TableCell>
                        <TableCell>{getStatusBadge(patient.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{patient.lastVisit}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Details Sidebar */}
        <div className="space-y-4">
          {selectedPatient ? (
            <>
              <Card className="shadow-medical">
                <CardHeader>
                  <CardTitle className="text-lg">{selectedPatient.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedPatient.status)}
                    <span className="text-sm text-muted-foreground">MRN: {selectedPatient.mrn}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedPatient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedPatient.email}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{selectedPatient.address}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-medical">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPatient.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.allergies.map((allergy, index) => (
                        <Badge key={index} variant="outline" className="bg-warning/10 text-warning-foreground border-warning">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No known allergies</p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-medical">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Medical Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPatient.conditions.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPatient.conditions.map((condition, index) => (
                        <div key={index} className="text-sm bg-muted p-2 rounded">
                          {condition}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No active conditions</p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="shadow-medical">
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a patient to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
