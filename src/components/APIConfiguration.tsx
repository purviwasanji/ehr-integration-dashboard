import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Key, 
  Server, 
  TestTube2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Copy,
  Settings,
  Shield,
  Globe,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FHIRService, { FHIRConfig } from "@/services/fhirService";

interface APIEndpoint {
  method: string;
  endpoint: string;
  description: string;
  status: "active" | "inactive" | "testing";
  required?: boolean;
}

const practiceFusionEndpoints: APIEndpoint[] = [
  { method: "GET", endpoint: "/Patient", description: "Search and retrieve patient records", status: "active", required: true },
  { method: "GET", endpoint: "/Patient/{id}", description: "Get specific patient by ID", status: "active", required: true },
  { method: "PUT", endpoint: "/Patient/{id}", description: "Update patient information", status: "active" },
  { method: "GET", endpoint: "/Appointment", description: "Retrieve appointment schedules", status: "active" },
  { method: "POST", endpoint: "/Appointment", description: "Schedule new appointment", status: "testing" },
  { method: "GET", endpoint: "/Observation", description: "Get vital signs and clinical observations", status: "active" },
  { method: "POST", endpoint: "/Observation", description: "Record new observations", status: "testing" },
  { method: "GET", endpoint: "/DiagnosticReport", description: "Retrieve lab results and reports", status: "inactive" },
];

// Updated Oracle Health FHIR R4 endpoints based on the API documentation
const oracleEndpoints: APIEndpoint[] = [
  { method: "GET", endpoint: "/Patient", description: "Search patients by name, ID, identifier, etc.", status: "active", required: true },
  { method: "GET", endpoint: "/Patient/{id}", description: "Get specific patient by ID", status: "active", required: true },
  { method: "GET", endpoint: "/Condition", description: "Get patient conditions and diagnoses", status: "active", required: true },
  { method: "GET", endpoint: "/Condition/{id}", description: "Get specific condition by ID", status: "active" },
  { method: "GET", endpoint: "/Encounter", description: "Get patient encounters and visits", status: "active", required: true },
  { method: "GET", endpoint: "/Encounter/{id}", description: "Get specific encounter by ID", status: "active" },
  { method: "GET", endpoint: "/Procedure", description: "Get patient procedures", status: "active" },
  { method: "GET", endpoint: "/Procedure/{id}", description: "Get specific procedure by ID", status: "active" },
  { method: "GET", endpoint: "/metadata", description: "Get FHIR capability statement", status: "active", required: true },
  { method: "GET", endpoint: "/OperationDefinition/{id}", description: "Get operation definitions", status: "active" },
  { method: "GET", endpoint: "/StructureDefinition/{id}", description: "Get structure definitions", status: "active" },
];

interface APIConfigurationProps {
  fhirService?: FHIRService;
  onConfigUpdate?: (service: FHIRService) => void;
}

export const APIConfiguration = ({ fhirService: initialService, onConfigUpdate }: APIConfigurationProps) => {
  const [selectedProvider, setSelectedProvider] = useState<"practice-fusion" | "oracle">("oracle");
  const [credentials, setCredentials] = useState<FHIRConfig>({
    baseUrl: "https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d",
    clientId: "",
    clientSecret: "", 
    apiKey: "",
    tenantId: "ec2458f2-1e24-41c8-b71b-0e701af7583d",
    accessToken: ""
  });
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("disconnected");
  const [fhirService, setFhirService] = useState<FHIRService | null>(initialService || null);
  const [capabilityStatement, setCapabilityStatement] = useState<any>(null);
  const [testEndpoint, setTestEndpoint] = useState("");
  const [testParams, setTestParams] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [testHeaders, setTestHeaders] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (selectedProvider === "oracle") {
      setCredentials(prev => ({
        ...prev,
        baseUrl: "https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d",
        tenantId: "ec2458f2-1e24-41c8-b71b-0e701af7583d"
      }));
    } else {
      setCredentials(prev => ({
        ...prev,
        baseUrl: "https://api.practicefusion.com/fhir",
        tenantId: ""
      }));
    }
  }, [selectedProvider]);

  const handleCredentialChange = (field: keyof FHIRConfig, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const testConnection = async () => {
    setConnectionStatus("testing");
    
    try {
      const service = new FHIRService(credentials);
      const result = await service.testConnection();
      
      if (result.success) {
        setConnectionStatus("connected");
        setFhirService(service);
        
        // Get capability statement for display
        try {
          const capability = await service.getCapabilityStatement();
          setCapabilityStatement(capability);
        } catch (e) {
          console.warn("Could not fetch capability statement:", e);
        }

        if (onConfigUpdate) {
          onConfigUpdate(service);
        }
        
        toast({
          title: "Connection Successful", 
          description: result.message,
          variant: "default"
        });
      } else {
        setConnectionStatus("disconnected");
        setFhirService(null);
        toast({
          title: "Connection Failed", 
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus("disconnected");
      setFhirService(null);
      toast({
        title: "Connection Failed", 
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const testApiEndpoint = async () => {
    if (!fhirService || !testEndpoint) {
      toast({
        title: "Error",
        description: "Please connect to FHIR service and select an endpoint first",
        variant: "destructive"
      });
      return;
    }

    try {
      setTestResponse("Testing...");
      setTestHeaders("Loading...");

      let params: Record<string, string> = {};
      if (testParams.trim()) {
        try {
          // Try to parse as JSON first
          if (testParams.trim().startsWith('{')) {
            params = JSON.parse(testParams);
          } else {
            // Parse as query string
            const urlParams = new URLSearchParams(testParams);
            params = Object.fromEntries(urlParams);
          }
        } catch (e) {
          throw new Error("Invalid parameters format. Use JSON object or query string format.");
        }
      }

      let response;
      const endpoint = testEndpoint.replace('/Patient/{id}', '/Patient').replace('/Condition/{id}', '/Condition');
      
      if (endpoint === '/metadata') {
        response = await fhirService.getCapabilityStatement();
      } else if (endpoint === '/Patient') {
        // Ensure required parameters for patient search
        if (!params._id && !params.identifier && !params.name && !params.given && !params.family) {
          params = { name: 'Test', _count: '5' }; // Add default search
        }
        response = await fhirService.searchPatients(params);
      } else if (endpoint === '/Condition') {
        // Need patient ID for condition search
        if (!params.patient && !params.subject) {
          throw new Error("Patient ID required for condition search. Add 'patient' parameter.");
        }
        response = await fhirService.getPatientConditions(params.patient || params.subject, params);
      } else if (endpoint === '/Encounter') {
        // Need patient ID for encounter search  
        if (!params.patient && !params.subject && !params._id) {
          throw new Error("Patient ID or Encounter ID required. Add 'patient' or '_id' parameter.");
        }
        response = await fhirService.searchEncounters(params);
      } else {
        throw new Error("Endpoint not implemented in test console");
      }

      setTestResponse(JSON.stringify(response, null, 2));
      setTestHeaders(`Content-Type: application/fhir+json\nFHIR-Version
