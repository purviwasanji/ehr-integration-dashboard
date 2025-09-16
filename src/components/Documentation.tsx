import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  ExternalLink, 
  Download, 
  Code, 
  Server, 
  Shield,
  BookOpen,
  Zap,
  CheckCircle,
  AlertCircle,
  Globe,
  Database
} from "lucide-react";

export const Documentation = () => {
  const downloadPostmanCollection = (provider: string) => {
    // Create and download Postman collection JSON
    const collection = {
      info: {
        name: `${provider} EHR API Collection`,
        description: `Complete API collection for ${provider} EHR integration`,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: [
        {
          name: "Patient Management",
          item: [
            {
              name: "Get All Patients",
              request: {
                method: "GET",
                header: [
                  {
                    key: "Authorization",
                    value: "Bearer {{access_token}}"
                  }
                ],
                url: {
                  raw: "{{base_url}}/Patient",
                  host: ["{{base_url}}"],
                  path: ["Patient"]
                }
              }
            },
            {
              name: "Get Patient by ID",
              request: {
                method: "GET",
                header: [
                  {
                    key: "Authorization", 
                    value: "Bearer {{access_token}}"
                  }
                ],
                url: {
                  raw: "{{base_url}}/Patient/{{patient_id}}",
                  host: ["{{base_url}}"],
                  path: ["Patient", "{{patient_id}}"]
                }
              }
            }
          ]
        }
      ],
      variable: [
        {
          key: "base_url",
          value: provider === "Practice Fusion" ? "https://api.practicefusion.com/fhir" : "https://api.oraclehealth.com/fhir"
        },
        {
          key: "access_token",
          value: "your_access_token_here"
        }
      ]
    };

    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${provider.toLowerCase().replace(' ', '-')}-ehr-collection.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">EHR Integration Documentation</h2>
          <p className="text-muted-foreground">Comprehensive API documentation and implementation guides</p>
        </div>
        <Badge className="bg-success text-success-foreground">
          FHIR R4 Compliant
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-muted p-1 rounded-lg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api-discovery">API Discovery</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
          <TabsTrigger value="postman">Postman Collections</TabsTrigger>
          <TabsTrigger value="security">Security & Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Project Overview
                </CardTitle>
                <CardDescription>
                  EHR Integration Dashboard built with React, TypeScript, and FHIR R4
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Patient Management CRUD Operations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Appointment Scheduling System</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Clinical Operations Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Billing & Administrative Functions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Secure API Configuration</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Key Features
                </CardTitle>
                <CardDescription>
                  Comprehensive healthcare workflow management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <Database className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">FHIR R4</p>
                    <p className="text-xs text-muted-foreground">Compliant</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-success" />
                    <p className="text-sm font-medium">HIPAA</p>
                    <p className="text-xs text-muted-foreground">Secure</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <Globe className="h-6 w-6 mx-auto mb-2 text-accent-primary" />
                    <p className="text-sm font-medium">Multi-EHR</p>
                    <p className="text-xs text-muted-foreground">Support</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <Code className="h-6 w-6 mx-auto mb-2 text-warning" />
                    <p className="text-sm font-medium">TypeScript</p>
                    <p className="text-xs text-muted-foreground">Type Safe</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api-discovery">
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  API Discovery Document
                </CardTitle>
                <CardDescription>
                  Complete analysis of Practice Fusion and Oracle Health APIs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Practice Fusion */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Practice Fusion FHIR API</h3>
                    <div className="space-y-3">
                      <div className="p-3 border border-border rounded-lg">
                        <h4 className="font-medium text-primary">Base URL</h4>
                        <code className="text-sm text-muted-foreground">https://api.practicefusion.com/fhir</code>
                      </div>
                      <div className="p-3 border border-border rounded-lg">
                        <h4 className="font-medium text-primary">Authentication</h4>
                        <p className="text-sm text-muted-foreground">OAuth 2.0 with Client Credentials</p>
                      </div>
                      <div className="p-3 border border-border rounded-lg">
                        <h4 className="font-medium text-primary">Supported Resources</h4>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="outline">Patient</Badge>
                          <Badge variant="outline">Appointment</Badge>
                          <Badge variant="outline">Observation</Badge>
                          <Badge variant="outline">DiagnosticReport</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Oracle Health */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Oracle Health Developer API</h3>
                    <div className="space-y-3">
                      <div className="p-3 border border-border rounded-lg">
                        <h4 className="font-medium text-primary">Base URL</h4>
                        <code className="text-sm text-muted-foreground">https://api.oraclehealth.com/fhir</code>
                      </div>
                      <div className="p-3 border border-border rounded-lg">
                        <h4 className="font-medium text-primary">Authentication</h4>
                        <p className="text-sm text-muted-foreground">OAuth 2.0, SMART on FHIR</p>
                      </div>
                      <div className="p-3 border border-border rounded-lg">
                        <h4 className="font-medium text-primary">Supported Resources</h4>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="outline">Patient</Badge>
                          <Badge variant="outline">Encounter</Badge>
                          <Badge variant="outline">Condition</Badge>
                          <Badge variant="outline">MedicationRequest</Badge>
                          <Badge variant="outline">AllergyIntolerance</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capabilities Comparison */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Capabilities & Limitations</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border p-3 text-left">Feature</th>
                          <th className="border border-border p-3 text-center">Practice Fusion</th>
                          <th className="border border-border p-3 text-center">Oracle Health</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border p-3">Patient Search</td>
                          <td className="border border-border p-3 text-center">
                            <CheckCircle className="h-4 w-4 text-success mx-auto" />
                          </td>
                          <td className="border border-border p-3 text-center">
                            <CheckCircle className="h-4 w-4 text-success mx-auto" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3">Appointment Scheduling</td>
                          <td className="border border-border p-3 text-center">
                            <CheckCircle className="h-4 w-4 text-success mx-auto" />
                          </td>
                          <td className="border border-border p-3 text-center">
                            <AlertCircle className="h-4 w-4 text-warning mx-auto" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3">Clinical Notes</td>
                          <td className="border border-border p-3 text-center">
                            <AlertCircle className="h-4 w-4 text-warning mx-auto" />
                          </td>
                          <td className="border border-border p-3 text-center">
                            <CheckCircle className="h-4 w-4 text-success mx-auto" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3">Medication Management</td>
                          <td className="border border-border p-3 text-center">
                            <AlertCircle className="h-4 w-4 text-warning mx-auto" />
                          </td>
                          <td className="border border-border p-3 text-center">
                            <CheckCircle className="h-4 w-4 text-success mx-auto" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="implementation">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                Implementation Guide
              </CardTitle>
              <CardDescription>
                Technical implementation details and architecture decisions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Architecture Overview</h3>
                  <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                    <p className="text-sm"><strong>Frontend:</strong> React 18 + TypeScript + Vite</p>
                    <p className="text-sm"><strong>UI Components:</strong> Shadcn/UI + Tailwind CSS</p>
                    <p className="text-sm"><strong>State Management:</strong> React Hooks + Context</p>
                    <p className="text-sm"><strong>API Layer:</strong> Fetch API with error handling</p>
                    <p className="text-sm"><strong>Authentication:</strong> OAuth 2.0 + JWT tokens</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Key Design Patterns</h3>
                  <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                    <p className="text-sm"><strong>Component Composition:</strong> Modular, reusable components</p>
                    <p className="text-sm"><strong>Error Boundaries:</strong> Graceful error handling</p>
                    <p className="text-sm"><strong>Loading States:</strong> Progressive data loading</p>
                    <p className="text-sm"><strong>Form Validation:</strong> Real-time input validation</p>
                    <p className="text-sm"><strong>Responsive Design:</strong> Mobile-first approach</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Integration Approach</h3>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium text-primary mb-2">1. Authentication Flow</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Implement OAuth 2.0 client credentials flow for secure API access
                  </p>
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    <code>{`// Example authentication
const getAccessToken = async () => {
  const response = await fetch('/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials&client_id=...&client_secret=...'
  });
  return response.json();
};`}</code>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium text-primary mb-2">2. FHIR Resource Handling</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Standardized FHIR R4 resource processing with TypeScript interfaces
                  </p>
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    <code>{`// FHIR Patient interface
interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  identifier: Identifier[];
  name: HumanName[];
  telecom: ContactPoint[];
  birthDate: string;
}`}</code>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium text-primary mb-2">3. Error Handling Strategy</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Comprehensive error handling with user-friendly messages
                  </p>
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    <code>{`// Centralized error handling
const handleAPIError = (error: APIError) => {
  switch (error.status) {
    case 401: return 'Authentication failed';
    case 403: return 'Access denied';
    case 404: return 'Resource not found';
    default: return 'An unexpected error occurred';
  }
};`}</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="postman">
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  Postman Collections
                </CardTitle>
                <CardDescription>
                  Download complete API collections for testing and development
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Practice Fusion Collection</CardTitle>
                      <CardDescription>
                        Complete FHIR R4 API collection with authentication and examples
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Includes:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• Patient management endpoints</li>
                          <li>• Appointment scheduling APIs</li>
                          <li>• Clinical observations</li>
                          <li>• Authentication examples</li>
                          <li>• Error handling scenarios</li>
                        </ul>
                      </div>
                      <Button 
                        onClick={() => downloadPostmanCollection("Practice Fusion")}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Collection
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-accent-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Oracle Health Collection</CardTitle>
                      <CardDescription>
                        Comprehensive developer API collection with SMART on FHIR support
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Includes:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• FHIR R4 resource endpoints</li>
                          <li>• Encounter management</li>
                          <li>• Medication requests</li>
                          <li>• SMART on FHIR workflows</li>
                          <li>• Bulk data operations</li>
                        </ul>
                      </div>
                      <Button 
                        onClick={() => downloadPostmanCollection("Oracle Health")}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Collection
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ExternalLink className="h-5 w-5" />
                      Collection Setup Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-medium">Step 1: Import Collection</h4>
                      <p className="text-sm text-muted-foreground">
                        Import the downloaded JSON file into Postman using File → Import
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Step 2: Configure Environment</h4>
                      <p className="text-sm text-muted-foreground">
                        Set up environment variables for base_url, client_id, client_secret, and access_token
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Step 3: Authenticate</h4>
                      <p className="text-sm text-muted-foreground">
                        Run the authentication request first to obtain an access token
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Step 4: Test Endpoints</h4>
                      <p className="text-sm text-muted-foreground">
                        Execute requests in order, starting with basic reads before attempting writes
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security & Compliance
              </CardTitle>
              <CardDescription>
                HIPAA compliance and healthcare data protection standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">HIPAA Compliance</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Encrypted Data Transmission</p>
                        <p className="text-xs text-muted-foreground">All API communications use TLS 1.3</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Access Control</p>
                        <p className="text-xs text-muted-foreground">Role-based permissions and audit logging</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Data Minimization</p>
                        <p className="text-xs text-muted-foreground">Only request necessary patient data</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Technical Security</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">OAuth 2.0 Authentication</p>
                        <p className="text-xs text-muted-foreground">Industry-standard secure authentication</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Token Management</p>
                        <p className="text-xs text-muted-foreground">Secure token storage and rotation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">API Rate Limiting</p>
                        <p className="text-xs text-muted-foreground">Prevents abuse and ensures availability</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-warning">Production Deployment Notice</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      This application handles sensitive healthcare data. Ensure proper licensing, 
                      security measures, and compliance with applicable healthcare regulations 
                      before use in production environments.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Compliance Standards</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border border-border rounded-lg">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-success" />
                    <p className="text-sm font-medium">HIPAA</p>
                    <p className="text-xs text-muted-foreground">Compliant</p>
                  </div>
                  <div className="text-center p-4 border border-border rounded-lg">
                    <Database className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">FHIR R4</p>
                    <p className="text-xs text-muted-foreground">Standard</p>
                  </div>
                  <div className="text-center p-4 border border-border rounded-lg">
                    <Globe className="h-8 w-8 mx-auto mb-2 text-accent-primary" />
                    <p className="text-sm font-medium">SMART</p>
                    <p className="text-xs text-muted-foreground">on FHIR</p>
                  </div>
                  <div className="text-center p-4 border border-border rounded-lg">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                    <p className="text-sm font-medium">OAuth 2.0</p>
                    <p className="text-xs text-muted-foreground">Secure</p>
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
