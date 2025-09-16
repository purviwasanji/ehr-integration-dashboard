import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  MapPin,
  RefreshCw,
  Loader2,
  User,
  Calendar,
  Activity
} from "lucide-react";
import FHIRService, { Patient, Bundle } from "@/services/fhirService";
import { useToast } from "@/hooks/use-toast";

interface PatientManagementProps {
  fhirService: FHIRService | null;
  connectionStatus: "connected" | "disconnected" | "testing";
}

export const PatientManagement = ({ fhirService, connectionStatus }: PatientManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"name" | "id" | "identifier">("name");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [patientConditions, setPatientConditions] = useState<any[]>([]);
  const [patientEncounters, setPatientEncounters] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  // Mock data for fallback
  const mockPatients: Patient[] = [
    {
      id: "1",
      resourceType: "Patient",
      name: [{
        given: ["Sarah"],
        family: "Johnson",
        use: "official"
      }],
      gender: "female",
      birthDate: "1985-03-15",
      telecom: [
        { system: "phone", value: "(555) 123-4567", use: "home" },
        { system: "email", value: "sarah.j@email.com" }
      ],
      address: [{
        line: ["123 Main St"],
        city: "Springfield",
        state: "IL",
        postalCode: "62701",
        country: "USA"
      }],
      identifier: [{
        system: "http://hospital.smarthealthit.org",
        value: "MRN001234"
      }],
      active: true
    }
  ];

  useEffect(() => {
    if (connectionStatus === 'connected' && fhirService) {
      loadInitialPatients();
    } else {
      // Use mock data when not connected
      setPatients(mockPatients);
      setSelectedPatient(mockPatients[0]);
    }
  }, [fhirService, connectionStatus]);

  const loadInitialPatients = async () => {
    if (!fhirService) return;
    
    setIsLoading(true);
    try {
      // Load some sample patients
      const result = await fhirService.searchPatients({ 
        name: "Test",
        _count: "20" 
      });
      
      if (result.entry && result.entry.length > 0) {
        const fetchedPatients = result.entry.map(entry => entry.resource as Patient);
        setPatients(fetchedPatients);
        if (fetchedPatients.length > 0 && !selectedPatient) {
          setSelectedPatient(fetchedPatients[0]);
          loadPatientDetails(fetchedPatients[0].id);
        }
      } else {
        // If no patients found, use mock data
        setPatients(mockPatients);
        setSelectedPatient(mockPatients[0]);
        toast({
          title: "No Patients Found",
          description: "Using sample data for demonstration",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Failed to load patients:", error);
      setPatients(mockPatients);
      setSelectedPatient(mockPatients[0]);
      toast({
        title: "Load Failed",
        description: "Using sample data. Check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchPatients = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search term",
        variant: "destructive"
      });
      return;
    }

    if (!fhirService || connectionStatus !== 'connected') {
      // Search mock data
      const filtered = mockPatients.filter(patient =>
        getPatientDisplayName(patient).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getPatientIdentifier(patient)?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setPatients(filtered);
      return;
    }

    setIsSearching(true);
    try {
      const searchParams: any = { _count: "50" };
      
      switch (searchType) {
        case "name":
          searchParams.name = searchTerm;
          break;
        case "id":
          searchParams._id = searchTerm;
          break;
        case "identifier":
          searchParams.identifier = searchTerm;
          break;
      }

      const result = await fhirService.searchPatients(searchParams);
      
      if (result.entry && result.entry.length > 0) {
        const fetchedPatients = result.entry.map(entry => entry.resource as Patient);
        setPatients(fetchedPatients);
        setSelectedPatient(null); // Clear selection
        toast({
          title: "Search Complete",
          description: `Found ${fetchedPatients.length} patient(s)`,
          variant: "default"
        });
      } else {
        setPatients([]);
        setSelectedPatient(null);
        toast({
          title: "No Results",
          description: "No patients found matching your search",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const loadPatientDetails = async (patientId: string) => {
    if (!fhirService || connectionStatus !== 'connected') return;

    try {
      // Load conditions
      const conditions = await fhirService.getPatientConditions(patientId);
      setPatientConditions(conditions.entry?.map(e => e.resource) || []);

      // Load encounters
      const encounters = await fhirService.getPatientEncounters(patientId);
      setPatientEncounters(encounters.entry?.map(e => e.resource) || []);
    } catch (error) {
      console.error("Failed to load patient details:", error);
      // Set empty arrays if loading fails
      setPatientConditions([]);
      setPatientEncounters([]);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    loadPatientDetails(patient.id);
  };

  const getPatientDisplayName = (patient: Patient): string => {
    if (fhirService) {
      return fhirService.getPatientDisplayName(patient);
    }
    
    if (patient.name && patient.name.length > 0) {
      const name = patient.name[0];
      const given = name.given?.join(' ') || '';
      const family = name.family || '';
      return `${given} ${family}`.trim();
    }
    return 'Unknown Patient';
  };

  const getPatientIdentifier = (patient: Patient): string | undefined => {
    if (fhirService) {
      return fhirService.getPatientIdentifier(patient);
    }
    return patient.identifier?.[0]?.value;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    if (fhirService) {
      return fhirService.formatFHIRDate(dateString);
    }
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getPatientContact = (patient: Patient, system: string): string => {
    const contact = patient.telecom?.find(t => t.system === system);
    return contact?.value || 'Not provided';
  };

  const getPatientAddress = (patient: Patient): string => {
    if (!patient.address || patient.address.length === 0) return 'Not provided';
    const addr = patient.address[0];
    const line = addr.line?.join(' ') || '';
    return `${line}, ${addr.city || ''}, ${addr.state || ''} ${addr.postalCode || ''}`.replace(/,\s*,/g, ',').replace(/,\s*$/, '');
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-2xl">
          <div className="flex gap-2">
            <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="id">Patient ID</SelectItem>
                <SelectItem value="identifier">MRN</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search patients by ${searchType}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && searchPatients()}
              />
            </div>
            <Button 
              onClick={searchPatients}
              disabled={isSearching || !searchTerm.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={loadInitialPatients}
            disabled={isLoading || connectionStatus !== 'connected'}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
              </DialogHeader>
              <div className="p-6 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Patient creation requires authenticated FHIR access. 
                  This feature will be available with production credentials.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Patient Registry
                {connectionStatus !== 'connected' && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">
                    Demo Mode
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {connectionStatus === 'connected' 
                  ? "Live patient data from Oracle Health FHIR API"
                  : "Sample patient data for demonstration"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading patients...</span>
                </div>
              ) : patients.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No patients found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Patient</TableHead>
                        <TableHead>Identifier</TableHead>
                        <TableHead>Birth Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patients.map((patient) => (
                        <TableRow 
                          key={patient.id}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedPatient?.id === patient.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">
                                {getPatientDisplayName(patient)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {patient.gender} • ID: {patient.id}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {getPatientIdentifier(patient) || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(patient.birthDate)}
                          </TableCell>
                          <TableCell>
                            <Badge className={patient.active !== false ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {patient.active !== false ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
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
              )}
            </CardContent>
          </Card>
        </div>

        {/* Patient Details Sidebar */}
        <div className="space-y-4">
          {selectedPatient ? (
            <>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {getPatientDisplayName(selectedPatient)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={selectedPatient.active !== false ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {selectedPatient.active !== false ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ID: {selectedPatient.id}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Born: {formatDate(selectedPatient.birthDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Gender: {selectedPatient.gender || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{getPatientContact(selectedPatient, 'phone')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{getPatientContact(selectedPatient, 'email')}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{getPatientAddress(selectedPatient)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Information */}
              {connectionStatus === 'connected' && (
                <>
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        Conditions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {patientConditions.length > 0 ? (
                        <div className="space-y-2">
                          {patientConditions.slice(0, 3).map((condition, index) => (
                            <div key={index} className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
                              {condition.code?.text || condition.code?.coding?.[0]?.display || 'Unknown condition'}
                            </div>
                          ))}
                          {patientConditions.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{patientConditions.length - 3} more conditions
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No conditions found</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-600" />
                        Recent Encounters
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {patientEncounters.length > 0 ? (
                        <div className="space-y-2">
                          {patientEncounters.slice(0, 3).map((encounter, index) => (
                            <div key={index} className="text-sm bg-green-50 p-2 rounded border border-green-200">
                              <div className="font-medium">{encounter.class?.display || 'Unknown type'}</div>
                              <div className="text-xs text-muted-foreground">
                                {encounter.period?.start ? formatDate(encounter.period.start) : 'Unknown date'}
                              </div>
                            </div>
                          ))}
                          {patientEncounters.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{patientEncounters.length - 3} more encounters
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No encounters found</p>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Demo Data Notice */}
              {connectionStatus !== 'connected' && (
                <Card className="shadow-lg border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-orange-800">
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-sm font-medium">Demo Mode</p>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                      Connect to FHIR API to view real patient conditions and encounters.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="shadow-lg">
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
