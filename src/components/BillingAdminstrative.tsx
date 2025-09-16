import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  CreditCard, 
  DollarSign, 
  FileText, 
  Search, 
  Plus, 
  Edit,
  Eye,
  BarChart3,
  Shield,
  Calendar,
  Receipt
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const BillingAdministrative = () => {
  const [activeSubTab, setActiveSubTab] = useState("insurance");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [insuranceQuery, setInsuranceQuery] = useState("");
  const { toast } = useToast();

  // Mock data for demonstration
  const insuranceEligibility = [
    {
      id: "INS001",
      patientId: "PAT001",
      patientName: "John Smith",
      insuranceProvider: "Blue Cross Blue Shield",
      policyNumber: "BCBS123456789",
      groupNumber: "GRP001",
      status: "Active",
      copay: "$25.00",
      deductible: "$1,500.00",
      deductibleMet: "$450.00",
      coverageLevel: "Individual",
      effectiveDate: "2024-01-01",
      expirationDate: "2024-12-31"
    },
    {
      id: "INS002", 
      patientId: "PAT002",
      patientName: "Sarah Johnson",
      insuranceProvider: "Aetna",
      policyNumber: "AET987654321",
      groupNumber: "GRP002",
      status: "Active",
      copay: "$30.00",
      deductible: "$2,000.00",
      deductibleMet: "$0.00",
      coverageLevel: "Family",
      effectiveDate: "2024-03-01",
      expirationDate: "2024-12-31"
    }
  ];

  const patientBalances = [
    {
      patientId: "PAT001",
      patientName: "John Smith",
      totalBalance: "$485.75",
      insuranceBalance: "$325.00",
      patientBalance: "$160.75",
      lastPayment: "$25.00",
      lastPaymentDate: "2024-01-15",
      status: "Outstanding"
    },
    {
      patientId: "PAT002", 
      patientName: "Sarah Johnson",
      totalBalance: "$0.00",
      insuranceBalance: "$0.00",
      patientBalance: "$0.00",
      lastPayment: "$150.00",
      lastPaymentDate: "2024-01-10",
      status: "Paid"
    }
  ];

  const billingCodes = [
    {
      code: "99213",
      type: "CPT",
      description: "Office visit, established patient, 20-29 minutes",
      category: "Evaluation & Management",
      fee: "$125.00",
      rvu: "1.42"
    },
    {
      code: "99214",
      type: "CPT", 
      description: "Office visit, established patient, 30-39 minutes",
      category: "Evaluation & Management",
      fee: "$185.00",
      rvu: "2.06"
    },
    {
      code: "85025",
      type: "CPT",
      description: "Complete blood count with differential", 
      category: "Laboratory",
      fee: "$45.00",
      rvu: "0.25"
    }
  ];

  const handleInsuranceVerification = () => {
    toast({
      title: "Insurance Verification",
      description: "Checking eligibility and benefits...",
    });
  };

  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "Revenue analytics report has been generated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Billing & Administrative</h2>
          <p className="text-muted-foreground">Manage insurance, billing, and financial operations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerateReport}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted p-1 rounded-lg">
          <TabsTrigger 
            value="insurance"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Shield className="h-4 w-4 mr-2" />
            Insurance
          </TabsTrigger>
          <TabsTrigger 
            value="billing"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Patient Billing
          </TabsTrigger>
          <TabsTrigger 
            value="codes"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Receipt className="h-4 w-4 mr-2" />
            Billing Codes
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insurance">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Insurance Eligibility & Coverage
              </CardTitle>
              <CardDescription>
                Verify insurance eligibility and check coverage details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Insurance Verification Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="patient-search">Patient Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="patient-search"
                      placeholder="Search by name or ID..."
                      value={insuranceQuery}
                      onChange={(e) => setInsuranceQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurance-type">Insurance Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select insurance type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary Insurance</SelectItem>
                      <SelectItem value="secondary">Secondary Insurance</SelectItem>
                      <SelectItem value="tertiary">Tertiary Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleInsuranceVerification} className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Eligibility
                  </Button>
                </div>
              </div>

              {/* Insurance Eligibility Results */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Current Eligibility Records</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Insurance Provider</TableHead>
                        <TableHead>Policy Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Copay</TableHead>
                        <TableHead>Deductible</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {insuranceEligibility.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.patientName}</TableCell>
                          <TableCell>{record.insuranceProvider}</TableCell>
                          <TableCell>{record.policyNumber}</TableCell>
                          <TableCell>
                            <Badge variant={record.status === "Active" ? "default" : "secondary"}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.copay}</TableCell>
                          <TableCell>{record.deductibleMet} / {record.deductible}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Patient Billing & Payments
              </CardTitle>
              <CardDescription>
                Manage patient balances and payment history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Outstanding</p>
                        <p className="text-2xl font-bold text-foreground">$2,485.75</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-warning" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Collected Today</p>
                        <p className="text-2xl font-bold text-foreground">$1,250.00</p>
                      </div>
                      <CreditCard className="h-8 w-8 text-success" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Insurance Pending</p>
                        <p className="text-2xl font-bold text-foreground">$3,750.00</p>
                      </div>
                      <Shield className="h-8 w-8 text-accent-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Collection Rate</p>
                        <p className="text-2xl font-bold text-foreground">92.5%</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Patient Balances Table */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Patient Balances</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Total Balance</TableHead>
                        <TableHead>Insurance Balance</TableHead>
                        <TableHead>Patient Balance</TableHead>
                        <TableHead>Last Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientBalances.map((balance) => (
                        <TableRow key={balance.patientId}>
                          <TableCell className="font-medium">{balance.patientName}</TableCell>
                          <TableCell>{balance.totalBalance}</TableCell>
                          <TableCell>{balance.insuranceBalance}</TableCell>
                          <TableCell>{balance.patientBalance}</TableCell>
                          <TableCell>
                            {balance.lastPayment}
                            <br />
                            <span className="text-xs text-muted-foreground">{balance.lastPaymentDate}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={balance.status === "Paid" ? "outline" : "destructive"}>
                              {balance.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <CreditCard className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="codes">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Billing Codes & Fee Schedules
              </CardTitle>
              <CardDescription>
                Manage CPT codes, ICD codes, and fee schedules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Code Form */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input id="code" placeholder="99213" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code-type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="CPT/ICD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpt">CPT</SelectItem>
                      <SelectItem value="icd10">ICD-10</SelectItem>
                      <SelectItem value="hcpcs">HCPCS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Service description" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee">Fee</Label>
                  <Input id="fee" placeholder="$0.00" />
                </div>
                <div className="flex items-end">
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Code
                  </Button>
                </div>
              </div>

              {/* Billing Codes Table */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Current Fee Schedule</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>RVU</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingCodes.map((code) => (
                        <TableRow key={code.code}>
                          <TableCell className="font-medium">{code.code}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{code.type}</Badge>
                          </TableCell>
                          <TableCell>{code.description}</TableCell>
                          <TableCell>{code.category}</TableCell>
                          <TableCell>{code.fee}</TableCell>
                          <TableCell>{code.rvu}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Revenue Analytics
                </CardTitle>
                <CardDescription>
                  Financial performance and revenue tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-primary">$45,280</p>
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-success">+12.5%</p>
                    <p className="text-sm text-muted-foreground">Growth Rate</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Collection Rate</span>
                    <span className="text-sm font-medium">92.5%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "92.5%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Custom Reports
                </CardTitle>
                <CardDescription>
                  Generate custom financial and operational reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue Summary</SelectItem>
                      <SelectItem value="aging">Aging Report</SelectItem>
                      <SelectItem value="insurance">Insurance Analysis</SelectItem>
                      <SelectItem value="productivity">Provider Productivity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input id="end-date" type="date" />
                  </div>
                </div>
                <Button onClick={handleGenerateReport} className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
