import { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Calendar() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Demo events for the calendar
  const events = [
    { title: "Invoice Due", date: new Date(2025, 2, 31), type: "payment" },
    { title: "Client Meeting", date: new Date(2025, 3, 2), type: "meeting" },
    { title: "Tax Filing", date: new Date(2025, 3, 15), type: "deadline" },
    { title: "Inventory Check", date: new Date(2025, 3, 10), type: "task" },
  ];

  // Format a date to display only month and day
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Upcoming events (next 7 days)
  const upcoming = events
    .filter(event => {
      const today = new Date();
      const eventDate = new Date(event.date);
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Business Calendar</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>Manage your business appointments and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcoming.length > 0 ? (
                <div className="space-y-4">
                  {upcoming.map((event, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-md">
                      <div className={`w-2 h-10 rounded-full ${
                        event.type === 'payment' ? 'bg-green-500' :
                        event.type === 'meeting' ? 'bg-blue-500' :
                        event.type === 'deadline' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground">{formatDate(event.date)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No upcoming events in the next 7 days
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}