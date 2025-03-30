import { useState, useEffect } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isEqual, isSameDay, isSameMonth, isToday, addDays, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isValid } from "date-fns";
import { CalendarIcon, PlusCircle, Clock, MapPin, Users, BadgeCheck, AlertCircle, Calendar as CalendarIcon2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Event types with colors
const EVENT_TYPES = [
  { value: "invoice", label: "Invoice Deadlines", color: "bg-green-500", icon: BadgeCheck },
  { value: "meeting", label: "Meeting", color: "bg-blue-500", icon: Users },
  { value: "deadline", label: "Deadline", color: "bg-red-500", icon: AlertCircle },
  { value: "task", label: "Task", color: "bg-yellow-500", icon: Clock },
  { value: "appointment", label: "Appointment", color: "bg-purple-500", icon: MapPin }
];

// Event interface
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: string;
  description?: string;
  location?: string;
  time?: string;
}

export default function Calendar() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: "1", title: "Invoice Due - ABC Corp", date: new Date(2025, 2, 31), type: "invoice", description: "Payment for Project Phase 1", time: "5:00 PM" },
    { id: "2", title: "Client Meeting - XYZ Inc", date: new Date(2025, 3, 2), type: "meeting", description: "Discuss new project requirements", location: "Client Office", time: "10:00 AM" },
    { id: "3", title: "Tax Filing Deadline", date: new Date(2025, 3, 15), type: "deadline", description: "Submit quarterly tax documents" },
    { id: "4", title: "Inventory Check", date: new Date(2025, 3, 10), type: "task", description: "Monthly inventory audit", time: "2:00 PM" },
    { id: "5", title: "Supplier Meeting", date: new Date(2025, 3, 8), type: "appointment", description: "Negotiate new supply terms", location: "Virtual", time: "11:30 AM" },
  ]);
  
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isViewEventOpen, setIsViewEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: new Date(),
    type: "task",
    description: "",
    location: "",
    time: ""
  });

  // Format a date to display only month and day
  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(day, event.date));
  };

  // Upcoming events (next 14 days)
  const upcoming = events
    .filter(event => {
      const today = new Date();
      const eventDate = new Date(event.date);
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 14;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Handle adding a new event
  const handleAddEvent = () => {
    const id = Math.random().toString(36).substring(2, 11);
    setEvents([...events, { id, ...newEvent }]);
    setNewEvent({
      title: "",
      date: new Date(),
      type: "task",
      description: "",
      location: "",
      time: ""
    });
    setIsAddEventOpen(false);
  };

  // Handle deleting an event
  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    setIsViewEventOpen(false);
  };

  // Get event type info
  const getEventTypeInfo = (type: string) => {
    return EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[3]; // Default to task
  };

  // Calendar day renderer with events
  const renderCalendarDay = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    
    return (
      <div 
        className={cn(
          "h-full w-full p-1 flex flex-col relative",
          !isSameMonth(day, date || new Date()) && "text-muted-foreground opacity-50",
          isToday(day) && "bg-primary-50 text-primary-700 font-medium rounded-md",
          dayEvents.length > 0 && "cursor-pointer hover:bg-muted"
        )}
        onClick={() => {
          if (dayEvents.length > 0) {
            setSelectedEvent(dayEvents[0]);
            setIsViewEventOpen(true);
          }
        }}
      >
        <time dateTime={format(day, 'yyyy-MM-dd')} className="ml-auto font-normal text-xs">
          {format(day, 'd')}
        </time>
        {dayEvents.length > 0 && (
          <div className="mt-auto">
            {dayEvents.slice(0, 2).map((event, i) => (
              <div 
                key={event.id} 
                className={`text-xs truncate mt-1 px-1 py-0.5 rounded-sm ${getEventTypeInfo(event.type).color} bg-opacity-20 border-l-2 ${getEventTypeInfo(event.type).color}`}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-muted-foreground mt-1">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Business Calendar</h1>
        <Button onClick={() => setIsAddEventOpen(true)} className="flex items-center gap-1">
          <PlusCircle size={16} />
          <span>Add Event</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Calendar */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Schedule</CardTitle>
                  <CardDescription>
                    {date ? format(date, 'MMMM yyyy') : 'Select a date'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
                    Today
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="pb-4">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  components={{
                    Day: ({ day, ...props }) => (
                      <CalendarComponent.Day day={day} {...props}>
                        {renderCalendarDay(day)}
                      </CalendarComponent.Day>
                    )
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar - Upcoming & Quick Add */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <CardDescription>Next 14 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcoming.length > 0 ? (
                <div className="space-y-3">
                  {upcoming.map((event) => {
                    const eventType = getEventTypeInfo(event.type);
                    const Icon = eventType.icon;
                    
                    return (
                      <div 
                        key={event.id} 
                        className="flex items-center space-x-3 p-3 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsViewEventOpen(true);
                        }}
                      >
                        <div className={`w-1 h-10 rounded-full ${eventType.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <CalendarIcon size={12} />
                            <span>{formatDate(event.date)}</span>
                            {event.time && (
                              <>
                                <span className="mx-1">•</span>
                                <Clock size={12} />
                                <span>{event.time}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No upcoming events in the next 14 days
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setIsAddEventOpen(true)}>
                <PlusCircle size={16} className="mr-2" />
                Add New Event
              </Button>
            </CardFooter>
          </Card>
          
          {/* Event Categories Legend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Event Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {EVENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  
                  return (
                    <div key={type.value} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${type.color}`} />
                      <Icon size={14} />
                      <span className="text-sm">{type.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event for your business calendar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input 
                id="event-title" 
                placeholder="Enter event title" 
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newEvent.date ? (
                        format(newEvent.date, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={newEvent.date}
                      onSelect={(date) => setNewEvent({...newEvent, date: date || new Date()})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event-time">Time (optional)</Label>
                <Input 
                  id="event-time" 
                  placeholder="e.g. 3:00 PM" 
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-type">Event Type</Label>
              <Select 
                value={newEvent.type} 
                onValueChange={(value) => setNewEvent({...newEvent, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${type.color}`} />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-location">Location (optional)</Label>
              <Input 
                id="event-location" 
                placeholder="Enter location" 
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-description">Description (optional)</Label>
              <Textarea 
                id="event-description" 
                placeholder="Enter event details" 
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddEventOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddEvent} disabled={!newEvent.title}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Event Dialog */}
      {selectedEvent && (
        <Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getEventTypeInfo(selectedEvent.type).color}`} />
                <DialogTitle>{selectedEvent.title}</DialogTitle>
              </div>
              <DialogDescription>
                {formatDate(selectedEvent.date)}
                {selectedEvent.time && ` • ${selectedEvent.time}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedEvent.location && (
                <div className="flex items-start gap-2">
                  <MapPin size={18} className="text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Location</div>
                    <div>{selectedEvent.location}</div>
                  </div>
                </div>
              )}
              
              {selectedEvent.description && (
                <div className="flex items-start gap-2">
                  <CalendarIcon2 size={18} className="text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Details</div>
                    <div>{selectedEvent.description}</div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => handleDeleteEvent(selectedEvent.id)}
              >
                Delete
              </Button>
              <Button type="button" onClick={() => setIsViewEventOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}