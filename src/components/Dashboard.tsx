import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Calendar, 
  FileText, 
  Heart, 
  Search, 
  Settings, 
  Stethoscope, 
  Users, 
  UserPlus,
  AlertTriangle,
  Clock,
  Database,
  CreditCard,
  BookOpen
} from "lucide-react";
import { PatientManagement } from "./PatientManagement";
import { AppointmentScheduling } from "./AppointmentScheduling"; 
import { ClinicalOperations } from "./ClinicalOperations";
import { APIConfiguration } from "./APIConfiguration";
import { BillingAdministrative } from "./BillingAdministrative";
import { Documentation } from "./Documentation";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("patients");

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-primary">EHR Integration Hub</h1>
              </div>
              <Badge variant="outline" className="bg-primary-lighter text-primary">
                FHIR R4 Compatible
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Badge className="bg-success text-success-foreground">
                Connected
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <div className="container mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Patients
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">2,847</div>
              <p className="text-xs text-success">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Appointments
              </CardTitle>
              <Calendar className="h-4 w-4 text-accent-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">43</div>
              <p className="text-xs text-muted-foreground">8 pending confirmations</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Results
              </CardTitle>
              <Activity className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">18</div>
              <p className="text-xs text-warning">5 critical reviews needed</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                System Status
              </CardTitle>
              <Heart className="h-4 w-4 text-medical-stable" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-medical-stable">Healthy</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6 bg-muted p-1 rounded-lg">
            <TabsTrigger 
              value="patients" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="h-4 w-4 mr-2" />
              Patients
            </TabsTrigger>
            <TabsTrigger 
              value="appointments"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger 
              value="clinical"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="h-4 w-4 mr-2" />
              Clinical
            </TabsTrigger>
            <TabsTrigger 
              value="billing"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger 
              value="config"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Database className="h-4 w-4 mr-2" />
              API Config
            </TabsTrigger>
            <TabsTrigger 
              value="docs"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Docs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <PatientManagement />
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentScheduling />
          </TabsContent>

          <TabsContent value="clinical">
            <ClinicalOperations />
          </TabsContent>

          <TabsContent value="billing">
            <BillingAdministrative />
          </TabsContent>

          <TabsContent value="config">
            <APIConfiguration />
          </TabsContent>

          <TabsContent value="docs">
            <Documentation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
