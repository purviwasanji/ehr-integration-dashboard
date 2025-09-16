import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MapPin, 
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  provider: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: "scheduled" | "confirmed" | "cancelled" | "completed" | "no-show";
  location: string;
  reason: string;
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientName: "Sarah Johnson",
    provider: "Dr. Smith",
    date: "2024-01-15",
    time: "09:00",
    duration: 30,
    type: "Follow-up",
    status: "confirmed",
    location: "Room 201",
    reason: "Diabetes management check-up"
  },
  {
    id: "2",
    patientName: "Michael Chen",
    provider: "Dr. Williams",
    date: "2024-01-15",
    time: "10:30",
    duration: 45,
    type: "Consultation", 
    status: "scheduled",
    location: "Room 105",
    reason: "COPD evaluation and treatment plan"
  },
  {
    id: "3",
    patientName: "Emma Rodriguez",
    provider: "Dr. Smith",
    date: "2024-01-15",
    time: "14:00",
    duration: 20,
    type: "Routine",
    status: "confirmed",
    location: "Room 201",
    reason: "Annual physical examination"
  },
  {
    id: "4",
    patientName: "James Wilson",
    provider: "Dr. Johnson",
    date: "2024-01-15",
    time: "15:30",
    duration: 60,
    type: "Procedure",
    status: "scheduled",
    location: "Procedure Room A",
    reason: "Minor surgery consultation"
  }
];

export const AppointmentScheduling = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2024, 0, 15));
  const [appointments] = useState<Appointment[]>(mockAppointments);

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-medical-stable text-white">Confirmed</Badge>;
      case 'scheduled':
        return <Badge className="bg-accent-primary text-white">Scheduled</Badge>;
      case 'cancelled':
        return <Badge className="bg-medical-critical text-white">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-success text-white">Completed</Badge>;
      case 'no-show':
        return <Badge className="bg-medical-inactive text-white">No Show</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-medical-stable" />;
      case 'cancelled':
      case 'no-show':
        return <XCircle className="h-4 w-4 text-medical-critical" />;
      case 'scheduled':
        return <AlertCircle className="h-4 w-4 text-accent-primary" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (!selectedDate) return true;
    return apt.date === selectedDate.toISOString().split('T')[0];
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Appointment Scheduling</h2>
          <p className="text-muted-foreground">Manage patient appointments and provider schedules</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <Card className="shadow-medical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Calendar
            </CardTitle>
            <CardDescription>Select a date to view appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border border-border"
            />
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="lg:col-span-3">
          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {selectedDate 
                  ? `Appointments for ${selectedDate.toLocaleDateString()}`
                  : "All Appointments"
                }
              </CardTitle>
              <CardDescription>
                {filteredAppointments.length} appointment(s) scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((appointment) => (
                    <div 
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1">
                          {getStatusIcon(appointment.status)}
                          <span className="text-xs text-muted-foreground">
                            {appointment.time}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-foreground">
                              {appointment.patientName}
                            </h3>
                            {getStatusBadge(appointment.status)}
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <span>{appointment.provider}</span>
                              <span>•</span>
                              <span>{appointment.duration} min</span>
                              <span>•</span>
                              <span className="text-accent-primary font-medium">{appointment.type}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>{appointment.location}</span>
                            </div>
                            
                            <p className="text-foreground">{appointment.reason}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        {appointment.status === 'scheduled' && (
                          <Button variant="outline" size="sm" className="text-medical-stable border-medical-stable hover:bg-medical-stable hover:text-white">
                            Confirm
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="text-medical-critical border-medical-critical hover:bg-medical-critical hover:text-white">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {selectedDate 
                        ? "No appointments scheduled for this date"
                        : "No appointments found"
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Provider Schedule Summary */}
      <Card className="shadow-medical">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Provider Availability
          </CardTitle>
          <CardDescription>Current provider schedules and availability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Dr. Smith", "Dr. Williams", "Dr. Johnson"].map((provider, index) => (
              <div key={provider} className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">{provider}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Today's Schedule:</span>
                    <span className="text-foreground">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Appointments:</span>
                    <span className="text-accent-primary font-medium">
                      {appointments.filter(apt => apt.provider === provider).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next Available:</span>
                    <span className="text-medical-stable">2:30 PM</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
