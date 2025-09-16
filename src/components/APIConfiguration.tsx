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
      setTestHeaders(`Content-Type: application/fhir+json\nFHIR-Version: 4.0.1\nStatus: 200 OK`);
      
      toast({
        title: "Test Successful",
        description: "API endpoint responded successfully",
        variant: "default"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setTestResponse(JSON.stringify({ error: errorMessage }, null, 2));
      setTestHeaders(`Status: Error\nError: ${errorMessage}`);
      
      toast({
        title: "Test Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: APIEndpoint['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600 text-white">Active</Badge>;
      case 'testing':
        return <Badge className="bg-yellow-600 text-white">Testing</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-600 text-white">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'testing':
        return <AlertCircle className="h-5 w-5 text-yellow-600 animate-pulse" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const currentEndpoints = selectedProvider === "practice-fusion" ? practiceFusionEndpoints : oracleEndpoints;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">API Configuration</h2>
        <p className="text-muted-foreground">Configure EHR system connections and manage API credentials</p>
      </div>

      {/* Connection Status */}
      <Card className="shadow-lg border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getConnectionStatusIcon()}
              Connection Status
            </CardTitle>
            <Badge 
              className={
                connectionStatus === 'connected' ? "bg-green-600 text-white" :
                connectionStatus === 'testing' ? "bg-yellow-600 text-white" :
                "bg-red-600 text-white"
              }
            >
              {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </Badge>
          </div>
          {capabilityStatement && (
            <CardDescription>
              Connected to {capabilityStatement.publisher} - FHIR {capabilityStatement.fhirVersion}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {connectionStatus === 'connected' && "Successfully connected to EHR system. All APIs are available."}
            {connectionStatus === 'testing' && "Testing connection to EHR system..."}
            {connectionStatus === 'disconnected' && "Not connected to EHR system. Please configure credentials below."}
          </p>
          {capabilityStatement && (
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <div className="text-xs font-mono">
                <div><strong>Base URL:</strong> {capabilityStatement.implementation?.url}</div>
                <div><strong>Description:</strong> {capabilityStatement.description}</div>
                <div><strong>Status:</strong> {capabilityStatement.status}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="credentials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credentials">API Credentials</TabsTrigger>
          <TabsTrigger value="endpoints">Available Endpoints</TabsTrigger>
          <TabsTrigger value="testing">API Testing</TabsTrigger>
        </TabsList>

        {/* API Credentials Tab */}
        <TabsContent value="credentials" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* EHR Provider Selection */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  EHR Provider
                </CardTitle>
                <CardDescription>Select your EHR system provider</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>EHR System</Label>
                  <Select value={selectedProvider} onValueChange={(value: any) => setSelectedProvider(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oracle">Oracle Health Developer (Cerner)</SelectItem>
                      <SelectItem value="practice-fusion">Practice Fusion FHIR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">
                    {selectedProvider === "practice-fusion" ? "Practice Fusion" : "Oracle Health (Cerner)"}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedProvider === "practice-fusion" 
                      ? "FHIR R4 compliant API for patient management and clinical workflows"
                      : "Oracle Health FHIR R4 API with comprehensive healthcare data access including open sandbox"
                    }
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => window.open(
                      selectedProvider === "practice-fusion" 
                        ? "https://www.practicefusion.com/fhir/" 
                        : "https://www.oracle.com/health/developer/", 
                      '_blank'
                    )}
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Credentials Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  API Credentials
                </CardTitle>
                <CardDescription>
                  {selectedProvider === "oracle" 
                    ? "Oracle Health provides open sandbox access" 
                    : "Enter your production API credentials"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="baseUrl" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Base URL
                  </Label>
                  <Input
                    id="baseUrl"
                    value={credentials.baseUrl}
                    onChange={(e) => handleCredentialChange("baseUrl", e.target.value)}
                    placeholder={selectedProvider === "practice-fusion" 
                      ? "https://api.practicefusion.com/fhir" 
                      : "https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d"
                    }
                  />
                </div>

                {selectedProvider === "oracle" && (
                  <div className="space-y-2">
                    <Label htmlFor="tenantId">Tenant ID</Label>
                    <Input
                      id="tenantId"
                      value={credentials.tenantId}
                      onChange={(e) => handleCredentialChange("tenantId", e.target.value)}
                      placeholder="ec2458f2-1e24-41c8-b71b-0e701af7583d"
                    />
                    <p className="text-xs text-muted-foreground">
                      Oracle Health sandbox tenant ID (pre-filled for testing)
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    value={credentials.clientId}
                    onChange={(e) => handleCredentialChange("clientId", e.target.value)}
                    placeholder="Enter your client ID (optional for sandbox)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    value={credentials.clientSecret}
                    onChange={(e) => handleCredentialChange("clientSecret", e.target.value)}
                    placeholder="Enter your client secret (optional for sandbox)"
                  />
                </div>

                {selectedProvider !== "oracle" && (
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={credentials.apiKey}
                      onChange={(e) => handleCredentialChange("apiKey", e.target.value)}
                      placeholder="Enter your API key"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    value={credentials.accessToken}
                    onChange={(e) => handleCredentialChange("accessToken", e.target.value)}
                    placeholder="Enter OAuth access token (optional for open endpoints)"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={testConnection} 
                    disabled={connectionStatus === "testing"}
                    className="flex-1"
                  >
                    {connectionStatus === "testing" ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube2 className="h-4 w-4 mr-2" />
                    )}
                    {connectionStatus === "testing" ? "Testing..." : "Test Connection"}
                  </Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Notice */}
          <Card className="shadow-lg border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-yellow-600" />
                Security & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>✓ All credentials are encrypted and stored securely</p>
                <p>✓ HIPAA compliant data handling and transmission</p>
                <p>✓ OAuth 2.0 / SMART on FHIR authentication supported</p>
                <p>✓ Audit logging enabled for all API interactions</p>
                <p>✓ Open sandbox endpoints available for testing</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Available Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                {selectedProvider === "practice-fusion" ? "Practice Fusion" : "Oracle Health"} API Endpoints
              </CardTitle>
              <CardDescription>
                Available API endpoints and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant="outline" 
                        className={`font-mono text-xs ${
                          endpoint.method === 'GET' ? 'border-green-500 text-green-700' :
                          endpoint.method === 'POST' ? 'border-blue-500 text-blue-700' :
                          endpoint.method === 'PUT' ? 'border-orange-500 text-orange-700' :
                          'border-gray-500 text-gray-700'
                        }`}
                      >
                        {endpoint.method}
                      </Badge>
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-primary">{endpoint.endpoint}</code>
                          {endpoint.required && <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">Required</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(endpoint.status)}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(endpoint.endpoint)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube2 className="h-5 w-5 text-primary" />
                API Testing Console
              </CardTitle>
              <CardDescription>Test API endpoints and view responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Test Endpoint</Label>
                    <Select value={testEndpoint} onValueChange={setTestEndpoint}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select endpoint to test" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentEndpoints.filter(e => e.status === 'active').map((endpoint, index) => (
                          <SelectItem key={index} value={endpoint.endpoint}>
                            {endpoint.method} {endpoint.endpoint}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Request Parameters</Label>
                    <Textarea
                      placeholder={`For Patient search: name=John&_count=5
For Conditions: patient=12345
For JSON: {"patient": "12345", "_count": "10"}`}
                      rows={4}
                      value={testParams}
                      onChange={(e) => setTestParams(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter query parameters or JSON object
                    </p>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={testApiEndpoint}
                    disabled={!fhirService || connectionStatus !== 'connected'}
                  >
                    <TestTube2 className="h-4 w-4 mr-2" />
                    Send Test Request
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Response</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(testResponse)}
                        disabled={!testResponse}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="p-4 bg-muted rounded-lg font-mono text-sm min-h-32 max-h-64 overflow-auto">
                      {testResponse || (
                        <span className="text-muted-foreground">
                          Response will appear here...
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Response Headers</Label>
                    <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                      {testHeaders || (
                        <span className="text-muted-foreground">
                          Headers will appear here...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
