import { useState } from "react";
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
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface APIEndpoint {
  method: string;
  endpoint: string;
  description: string;
  status: "active" | "inactive" | "testing";
}

const practiceFusionEndpoints: APIEndpoint[] = [
  { method: "GET", endpoint: "/Patient", description: "Search and retrieve patient records", status: "active" },
  { method: "POST", endpoint: "/Patient", description: "Create new patient record", status: "active" },
  { method: "PUT", endpoint: "/Patient/{id}", description: "Update patient information", status: "active" },
  { method: "GET", endpoint: "/Appointment", description: "Retrieve appointment schedules", status: "active" },
  { method: "POST", endpoint: "/Appointment", description: "Schedule new appointment", status: "testing" },
  { method: "GET", endpoint: "/Observation", description: "Get vital signs and clinical observations", status: "active" },
  { method: "POST", endpoint: "/Observation", description: "Record new observations", status: "testing" },
  { method: "GET", endpoint: "/DiagnosticReport", description: "Retrieve lab results and reports", status: "inactive" },
];

const oracleEndpoints: APIEndpoint[] = [
  { method: "GET", endpoint: "/fhir/Patient", description: "FHIR R4 Patient resource access", status: "active" },
  { method: "GET", endpoint: "/fhir/Encounter", description: "Patient encounters and visits", status: "active" },
  { method: "GET", endpoint: "/fhir/Condition", description: "Patient conditions and diagnoses", status: "testing" },
  { method: "GET", endpoint: "/fhir/MedicationRequest", description: "Prescription and medication data", status: "inactive" },
  { method: "GET", endpoint: "/fhir/AllergyIntolerance", description: "Patient allergies and intolerances", status: "active" },
  { method: "POST", endpoint: "/fhir/DocumentReference", description: "Clinical document management", status: "testing" },
];

export const APIConfiguration = () => {
  const [selectedProvider, setSelectedProvider] = useState<"practice-fusion" | "oracle">("practice-fusion");
  const [credentials, setCredentials] = useState({
    clientId: "",
    clientSecret: "", 
    apiKey: "",
    baseUrl: "",
    accessToken: ""
  });
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("disconnected");
  const { toast } = useToast();

  const handleCredentialChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const testConnection = async () => {
    setConnectionStatus("testing");
    
    // Simulate API connection test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      setConnectionStatus(success ? "connected" : "disconnected");
      
      toast({
        title: success ? "Connection Successful" : "Connection Failed", 
        description: success 
          ? "Successfully connected to EHR system" 
          : "Failed to connect. Please check your credentials.",
        variant: success ? "default" : "destructive"
      });
    }, 2000);
  };

  const getStatusBadge = (status: APIEndpoint['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-medical-stable text-white">Active</Badge>;
      case 'testing':
        return <Badge className="bg-warning text-white">Testing</Badge>;
      case 'inactive':
        return <Badge className="bg-medical-inactive text-white">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-medical-stable" />;
      case 'testing':
        return <AlertCircle className="h-5 w-5 text-warning animate-pulse" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-medical-critical" />;
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
      <Card className="shadow-medical border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getConnectionStatusIcon()}
              Connection Status
            </CardTitle>
            <Badge 
              className={
                connectionStatus === 'connected' ? "bg-medical-stable text-white" :
                connectionStatus === 'testing' ? "bg-warning text-white" :
                "bg-medical-critical text-white"
              }
            >
              {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {connectionStatus === 'connected' && "Successfully connected to EHR system. All APIs are available."}
            {connectionStatus === 'testing' && "Testing connection to EHR system..."}
            {connectionStatus === 'disconnected' && "Not connected to EHR system. Please configure credentials below."}
          </p>
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
            <Card className="shadow-medical">
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
                      <SelectItem value="practice-fusion">Practice Fusion FHIR</SelectItem>
                      <SelectItem value="oracle">Oracle Health Developer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">
                    {selectedProvider === "practice-fusion" ? "Practice Fusion" : "Oracle Health"}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedProvider === "practice-fusion" 
                      ? "FHIR R4 compliant API for patient management and clinical workflows"
                      : "Comprehensive healthcare developer platform with FHIR R4 support"
                    }
                  </p>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-3 w-3" />
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Credentials Form */}
            <Card className="shadow-medical">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  API Credentials
                </CardTitle>
                <CardDescription>Enter your production API credentials</CardDescription>
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
                      : "https://api.oraclehealth.com/fhir"
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    value={credentials.clientId}
                    onChange={(e) => handleCredentialChange("clientId", e.target.value)}
                    placeholder="Enter your client ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    value={credentials.clientSecret}
                    onChange={(e) => handleCredentialChange("clientSecret", e.target.value)}
                    placeholder="Enter your client secret"
                  />
                </div>

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

                <div className="flex gap-2">
                  <Button 
                    onClick={testConnection} 
                    disabled={connectionStatus === "testing"}
                    className="flex-1 bg-gradient-primary hover:opacity-90"
                  >
                    {connectionStatus === "testing" ? (
                      <AlertCircle className="h-4 w-4 mr-2 animate-pulse" />
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
          <Card className="shadow-medical border-l-4 border-l-warning">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-warning" />
                Security & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p> All credentials are encrypted and stored securely</p>
                <p> HIPAA compliant data handling and transmission</p>
                <p> OAuth 2.0 / SMART on FHIR authentication supported</p>
                <p> Audit logging enabled for all API interactions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Available Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-6">
          <Card className="shadow-medical">
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
                      <Badge variant="outline" className="font-mono text-xs">
                        {endpoint.method}
                      </Badge>
                      <div>
                        <code className="text-sm font-mono text-primary">{endpoint.endpoint}</code>
                        <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(endpoint.status)}
                      <Button variant="outline" size="sm">
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
          <Card className="shadow-medical">
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
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select endpoint to test" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentEndpoints.map((endpoint, index) => (
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
                      placeholder="Enter JSON parameters or query string..."
                      rows={4}
                    />
                  </div>

                  <Button className="w-full bg-gradient-primary hover:opacity-90">
                    <TestTube2 className="h-4 w-4 mr-2" />
                    Send Test Request
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Response</Label>
                    <div className="p-4 bg-muted rounded-lg font-mono text-sm min-h-32">
                      <span className="text-muted-foreground">
                        Response will appear here...
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Response Headers</Label>
                    <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                      <span className="text-muted-foreground">
                        Headers will appear here...
                      </span>
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
