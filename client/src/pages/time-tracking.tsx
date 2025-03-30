import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Clock, 
  Calendar, 
  ClipboardCheck, 
  Play, 
  Pause, 
  Plus, 
  BarChart2,
  CheckCircle2,
  Filter,
  Edit,
  Trash2,
  MoreVertical,
  XCircle,
  Tag,
  Briefcase,
  Timer,
  FileInput,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistance, differenceInMinutes, parseISO, addBusinessDays } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function TimeTracking() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isTracking, setIsTracking] = useState(false);
  const [currentProject, setCurrentProject] = useState("project-1");
  const [currentTask, setCurrentTask] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("this-week");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({
    projectId: "",
    projectName: "",
    taskDescription: "",
    startTime: new Date(),
    endTime: new Date(),
    duration: 0,
    billable: true,
    billingRate: "0",
    notes: ""
  });

  // Get the current date for display
  const currentDate = new Date();
  const formattedDate = format(currentDate, "EEEE, MMMM d, yyyy");

  // Placeholder for time entries data
  const { data: timeEntries, isLoading: isLoadingEntries } = useQuery({
    queryKey: ["/api/time-entries", filterPeriod],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/time-entries?period=${filterPeriod}`);
        if (!res.ok) throw new Error("Failed to fetch time entries");
        return res.json();
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load time entries. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  // Placeholder for projects data
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Failed to fetch projects");
        return res.json();
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load projects. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  // Function to format duration from minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Function to format duration from seconds
  const formatTimerDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer
  const startTimer = () => {
    if (timerInterval.current) return;
    
    const startTime = new Date();
    setTimerStartTime(startTime);
    setTimerSeconds(0);
    
    timerInterval.current = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
  };

  // Stop timer
  const stopTimer = () => {
    if (!timerInterval.current) return;
    
    clearInterval(timerInterval.current);
    timerInterval.current = null;
    
    return timerSeconds;
  };

  // Define types for time entry data
  interface TimeEntryData {
    projectId: string;
    projectName: string;
    taskDescription: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    billable: boolean;
    billingRate?: string;
    notes?: string;
  }

  // Create time entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (entry: TimeEntryData) => {
      const res = await apiRequest("POST", "/api/time-entries", entry);
      if (!res.ok) throw new Error("Failed to create time entry");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      toast({
        title: "Time entry created",
        description: "Your time entry has been recorded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create time entry: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Toggle time tracking
  const toggleTimeTracking = () => {
    if (isTracking) {
      const seconds = stopTimer() || 0; // Default to 0 if undefined
      
      // Calculate duration in minutes
      const durationInMinutes = Math.ceil(seconds / 60);
      
      // Send the request to create a time entry
      const projectName = document.querySelector(`[data-value="${currentProject}"]`)?.textContent || currentProject;
      
      // Only create entry if tracking lasted at least 1 minute
      if (durationInMinutes >= 1 && timerStartTime) {
        const endTime = new Date();
        const entry: TimeEntryData = {
          projectId: currentProject,
          projectName: projectName,
          taskDescription: currentTask || "Untitled Task",
          startTime: timerStartTime,
          endTime: endTime,
          duration: durationInMinutes,
          billable: true
        };
        
        createEntryMutation.mutate(entry);
      }
      
      toast({
        title: "Time tracking stopped",
        description: `Time recorded: ${formatTimerDuration(seconds)}`,
      });
      
      setTimerSeconds(0);
      setTimerStartTime(null);
      setCurrentTask("");
    } else {
      if (!currentProject) {
        toast({
          title: "Project required",
          description: "Please select a project before starting time tracking.",
          variant: "destructive",
        });
        return;
      }
      
      startTimer();
      
      toast({
        title: "Time tracking started",
        description: "Timer is now running.",
      });
    }
    
    setIsTracking(!isTracking);
  };

  // Handle manual time entry creation
  const handleCreateTimeEntry = () => {
    // Calculate duration in minutes
    const startDate = new Date(newEntry.startTime);
    const endDate = new Date(newEntry.endTime);
    const durationInMinutes = Math.ceil(differenceInMinutes(endDate, startDate));
    
    if (durationInMinutes <= 0) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }
    
    const entry: TimeEntryData = {
      ...newEntry,
      duration: durationInMinutes
    };
    
    createEntryMutation.mutate(entry);
    setShowNewEntryDialog(false);
    
    // Reset form
    setNewEntry({
      projectId: "",
      projectName: "",
      taskDescription: "",
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      billable: true,
      billingRate: "0",
      notes: ""
    });
  };

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Time Tracking</h2>
        <div className="text-sm text-muted-foreground">{formattedDate}</div>
      </div>

      <Card className="border-2 border-primary-100">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-primary mr-3" />
                <div>
                  <h3 className="text-lg font-medium">Track Your Time</h3>
                  <p className="text-sm text-muted-foreground">
                    {isTracking ? "Currently tracking time" : "Start tracking your time"}
                  </p>
                </div>
              </div>
              
              {isTracking && (
                <div className="flex items-center justify-center md:justify-start">
                  <div className="text-3xl font-bold font-mono text-primary animate-pulse">
                    {formatTimerDuration(timerSeconds)}
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select
                  value={currentProject}
                  onValueChange={setCurrentProject}
                  disabled={isTracking}
                >
                  <SelectTrigger id="project" className="w-full">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project-1">Website Redesign</SelectItem>
                    <SelectItem value="project-2">Mobile App Development</SelectItem>
                    <SelectItem value="project-3">Marketing Campaign</SelectItem>
                    <SelectItem value="project-4">Internal Meeting</SelectItem>
                    <SelectItem value="project-5">Client Consultation</SelectItem>
                    <SelectItem value="project-6">Content Creation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="task">Task Description</Label>
                <Input
                  id="task"
                  placeholder="What are you working on?"
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  disabled={isTracking}
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={toggleTimeTracking}
                  variant={isTracking ? "destructive" : "default"}
                  className="w-full"
                  size="lg"
                >
                  {isTracking ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Stop Timer
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Timer
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {!isTracking && (
              <div className="flex justify-end mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowNewEntryDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Manual Entry
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Manual Time Entry Dialog */}
      <Dialog open={showNewEntryDialog} onOpenChange={setShowNewEntryDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Time Entry</DialogTitle>
            <DialogDescription>
              Manually add a time entry to your timesheet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-project">Project</Label>
                <Select
                  value={newEntry.projectId}
                  onValueChange={(val) => {
                    const projectName = document.querySelector(`[data-value="${val}"]`)?.textContent || val;
                    setNewEntry({
                      ...newEntry,
                      projectId: val,
                      projectName
                    });
                  }}
                >
                  <SelectTrigger id="new-project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project-1">Website Redesign</SelectItem>
                    <SelectItem value="project-2">Mobile App Development</SelectItem>
                    <SelectItem value="project-3">Marketing Campaign</SelectItem>
                    <SelectItem value="project-4">Internal Meeting</SelectItem>
                    <SelectItem value="project-5">Client Consultation</SelectItem>
                    <SelectItem value="project-6">Content Creation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="billing-rate">Billing Rate ($/hr)</Label>
                <Input
                  id="billing-rate"
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={newEntry.billingRate}
                  onChange={(e) => setNewEntry({
                    ...newEntry,
                    billingRate: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-description">Task Description</Label>
              <Input
                id="task-description"
                placeholder="What did you work on?"
                value={newEntry.taskDescription}
                onChange={(e) => setNewEntry({
                  ...newEntry,
                  taskDescription: e.target.value
                })}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="datetime-local"
                  value={format(new Date(newEntry.startTime), "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setNewEntry({
                    ...newEntry,
                    startTime: new Date(e.target.value)
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="datetime-local"
                  value={format(new Date(newEntry.endTime), "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setNewEntry({
                    ...newEntry,
                    endTime: new Date(e.target.value)
                  })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="billable"
                  checked={newEntry.billable}
                  onChange={(e) => setNewEntry({
                    ...newEntry,
                    billable: e.target.checked
                  })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="billable" className="text-sm font-medium leading-none cursor-pointer">
                  Billable time
                </Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes here..."
                value={newEntry.notes}
                onChange={(e) => setNewEntry({
                  ...newEntry,
                  notes: e.target.value
                })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewEntryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTimeEntry} disabled={!newEntry.projectId || !newEntry.taskDescription}>
              Save Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3h 45m</div>
            <p className="text-xs text-muted-foreground">
              Across 2 projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18h 20m</div>
            <p className="text-xs text-muted-foreground">
              Mon-Fri (75% of weekly goal)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15h 45m</div>
            <p className="text-xs text-muted-foreground">
              86% billable rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Recent Time Entries</CardTitle>
                  <CardDescription>
                    Your most recent time tracking activities.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingEntries ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{format(new Date(), "MMM d, yyyy")}</TableCell>
                      <TableCell>Website Redesign</TableCell>
                      <TableCell>Homepage Wireframes</TableCell>
                      <TableCell>9:00 AM</TableCell>
                      <TableCell>11:15 AM</TableCell>
                      <TableCell>2h 15m</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{format(new Date(), "MMM d, yyyy")}</TableCell>
                      <TableCell>Internal Meeting</TableCell>
                      <TableCell>Weekly Team Meeting</TableCell>
                      <TableCell>1:00 PM</TableCell>
                      <TableCell>2:30 PM</TableCell>
                      <TableCell>1h 30m</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{format(new Date(new Date().setDate(new Date().getDate() - 1)), "MMM d, yyyy")}</TableCell>
                      <TableCell>Mobile App Development</TableCell>
                      <TableCell>User Authentication</TableCell>
                      <TableCell>10:30 AM</TableCell>
                      <TableCell>4:45 PM</TableCell>
                      <TableCell>6h 15m</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{format(new Date(new Date().setDate(new Date().getDate() - 1)), "MMM d, yyyy")}</TableCell>
                      <TableCell>Marketing Campaign</TableCell>
                      <TableCell>Social Media Planning</TableCell>
                      <TableCell>2:00 PM</TableCell>
                      <TableCell>3:30 PM</TableCell>
                      <TableCell>1h 30m</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Time Distribution</CardTitle>
                <CardDescription>
                  Time spent on different projects this week.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Website Redesign</div>
                      <div className="text-sm text-muted-foreground">
                        7h 30m (41%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "41%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Mobile App Development</div>
                      <div className="text-sm text-muted-foreground">
                        6h 15m (34%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "34%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Marketing Campaign</div>
                      <div className="text-sm text-muted-foreground">
                        3h 5m (17%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: "17%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Internal Meeting</div>
                      <div className="text-sm text-muted-foreground">
                        1h 30m (8%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: "8%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>
                  Your time tracking for the past 7 days.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[220px] flex items-center justify-center">
                <div className="text-center">
                  <BarChart2 className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Weekly activity chart coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timesheet" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Timesheet</CardTitle>
                  <CardDescription>
                    Manage your time entries and billable hours.
                  </CardDescription>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                  <Select
                    value={filterPeriod}
                    onValueChange={setFilterPeriod}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="last-week">Last Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Filter className="h-3.5 w-3.5" />
                      <span>Filter</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <FileInput className="h-3.5 w-3.5" />
                      <span>Export</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Billable</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{format(new Date(), "EEE, MMM d")}</TableCell>
                      <TableCell className="font-medium">Website Redesign</TableCell>
                      <TableCell>Homepage Wireframes</TableCell>
                      <TableCell>{format(new Date().setHours(9, 0), "h:mm a")}</TableCell>
                      <TableCell>{format(new Date().setHours(11, 15), "h:mm a")}</TableCell>
                      <TableCell>2h 15m</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Yes</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ClipboardCheck className="mr-2 h-4 w-4" /> Add to Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{format(new Date(), "EEE, MMM d")}</TableCell>
                      <TableCell className="font-medium">Internal Meeting</TableCell>
                      <TableCell>Weekly Team Meeting</TableCell>
                      <TableCell>{format(new Date().setHours(13, 0), "h:mm a")}</TableCell>
                      <TableCell>{format(new Date().setHours(14, 30), "h:mm a")}</TableCell>
                      <TableCell>1h 30m</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">No</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ClipboardCheck className="mr-2 h-4 w-4" /> Add to Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{format(addBusinessDays(new Date(), -1), "EEE, MMM d")}</TableCell>
                      <TableCell className="font-medium">Mobile App Development</TableCell>
                      <TableCell>User Authentication</TableCell>
                      <TableCell>{format(new Date().setHours(10, 30), "h:mm a")}</TableCell>
                      <TableCell>{format(new Date().setHours(16, 45), "h:mm a")}</TableCell>
                      <TableCell>6h 15m</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Yes</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ClipboardCheck className="mr-2 h-4 w-4" /> Add to Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{format(addBusinessDays(new Date(), -1), "EEE, MMM d")}</TableCell>
                      <TableCell className="font-medium">Marketing Campaign</TableCell>
                      <TableCell>Social Media Planning</TableCell>
                      <TableCell>{format(new Date().setHours(14, 0), "h:mm a")}</TableCell>
                      <TableCell>{format(new Date().setHours(15, 30), "h:mm a")}</TableCell>
                      <TableCell>1h 30m</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Yes</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ClipboardCheck className="mr-2 h-4 w-4" /> Add to Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing 4 entries for {filterPeriod === "today" ? "today" : filterPeriod === "this-week" ? "this week" : filterPeriod === "last-week" ? "last week" : "this month"}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm" disabled>Next</Button>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">11h 30m</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Billable Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">10h 0m</div>
                    <p className="text-xs text-muted-foreground">87% billable</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Estimated Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$985.00</div>
                    <p className="text-xs text-muted-foreground">Based on hourly rates</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>
                    Manage your projects and track time by project.
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <h3 className="mb-2 text-lg font-medium">Projects Feature Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're currently working on implementing project management features.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Reports</CardTitle>
              <CardDescription>
                Generate and view time tracking reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <h3 className="mb-2 text-lg font-medium">Reports Feature Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're currently working on implementing time tracking reports.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}