import { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isSameDay, addDays, isPast } from "date-fns";
import { CalendarIcon, PlusCircle, Clock, MapPin, Users, BadgeCheck, AlertCircle, Calendar as CalendarIcon2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge"; 

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: "1", title: "Invoice Due - ABC Corp", date: new Date(2025, 2, 31), type: "invoice", description: "Payment for Project Phase 1", time: "5:00 PM" },
    { id: "2", title: "Client Meeting - XYZ Inc", date: new Date(2025, 3, 2), type: "meeting", description: "Discuss new project requirements", location: "Client Office", time: "10:00 AM" },
    { id: "3", title: "Tax Filing Deadline", date: new Date(2025, 3, 15), type: "deadline", description: "Submit quarterly tax documents" },
    { id: "4", title: "Inventory Check", date: new Date(2025, 3, 10), type: "task", description: "Monthly inventory audit", time: "2:00 PM" },
    { id: "5", title: "Supplier Meeting", date: new Date(2025, 3, 8), type: "appointment", description: "Negotiate new supply terms", location: "Virtual", time: "11:30 AM" },
  ]);
  
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isViewEventOpen, setIsViewEventOpen] = useState(false);
  const [isDateEventsOpen, setIsDateEventsOpen] = useState(false);
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
    return events.filter(event => isSameDay(new Date(event.date), day));
  };

  // Calendar date selection handler
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    
    if (selectedDate) {
      const eventsOnDay = getEventsForDay(selectedDate);
      if (eventsOnDay.length > 0) {
        setSelectedDate(selectedDate);
        setIsDateEventsOpen(true);
      } else if (eventsOnDay.length === 0) {
        // If no events, open the add event dialog with the selected date
        setNewEvent({...newEvent, date: selectedDate });
        setIsAddEventOpen(true);
      }
    }
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
    setIsDateEventsOpen(false);
  };

  // Get event type info
  const getEventTypeInfo = (type: string) => {
    return EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[3]; // Default to task
  };

  // Function to check if a day has events
  const dayHasEvents = (day: Date): boolean => {
    return getEventsForDay(day).length > 0;
  };

  // Custom day renderer to show event indicators
  const renderDay = (day: Date, events: CalendarEvent[]) => {
    const dayEvents = getEventsForDay(day);
    const types = new Set(dayEvents.map(event => event.type));
    
    // Return the event indicators for the day
    return (
      <div className="relative h-full w-full p-2">
        <div className="absolute top-1 right-1 text-xs">{format(day, 'd')}</div>
        
        {dayEvents.length > 0 && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center">
            <div className="flex space-x-1">
              {Array.from(types).slice(0, 3).map((type, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 w-1.5 rounded-full ${getEventTypeInfo(type).color}`}
                />
              ))}
              {types.size > 3 && <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />}
            </div>
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
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                  modifiersClassNames={{
                    selected: "bg-primary text-primary-foreground",
                    today: "bg-primary-50 text-primary-700 font-medium"
                  }}
                />
              </div>
                            
              <div className="mt-4 flex flex-wrap gap-2">
                {EVENT_TYPES.map(type => (
                  <Badge 
                    key={type.value} 
                    variant="outline" 
                    className="flex items-center gap-1"
                  >
                    <div className={`w-2 h-2 rounded-full ${type.color}`} />
                    <span>{type.label}</span>
                  </Badge>
                ))}
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

      {/* Events for Selected Date Dialog */}
      {selectedDate && (
        <Dialog open={isDateEventsOpen} onOpenChange={setIsDateEventsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Events on {formatDate(selectedDate)}</DialogTitle>
              <DialogDescription>
                All scheduled events for this date
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {getEventsForDay(selectedDate).map((event) => {
                  const eventType = getEventTypeInfo(event.type);
                  
                  return (
                    <div 
                      key={event.id}
                      className="flex p-3 bg-muted rounded-md hover:bg-muted/80 cursor-pointer"
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsDateEventsOpen(false);
                        setIsViewEventOpen(true);
                      }}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-1 h-full rounded-full ${eventType.color}`} />
                      </div>
                      <div className="ml-3">
                        <div className="font-medium mb-1">{event.title}</div>
                        <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3">
                          {event.time && (
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={12} />
                              <span>{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant="outline" 
                              className="px-1 h-5 text-xs flex items-center gap-1"
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${eventType.color}`} />
                              {eventType.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  if (selectedDate) {
                    setNewEvent({...newEvent, date: selectedDate});
                    setIsDateEventsOpen(false);
                    setIsAddEventOpen(true);
                  }
                }}
              >
                <PlusCircle size={16} className="mr-2" />
                Add Event
              </Button>
              <Button type="button" onClick={() => setIsDateEventsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}