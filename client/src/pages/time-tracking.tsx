import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { 
  Clock, 
  Calendar, 
  ClipboardCheck, 
  Play, 
  Pause, 
  Plus, 
  BarChart2,
  CheckCircle2,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInMinutes, parseISO } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TimeTracking() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isTracking, setIsTracking] = useState(false);
  const [currentProject, setCurrentProject] = useState("project-1");
  const [filterPeriod, setFilterPeriod] = useState("this-week");

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

  // Toggle time tracking
  const toggleTimeTracking = () => {
    if (isTracking) {
      // Here we would normally send a request to stop tracking
      toast({
        title: "Time tracking stopped",
        description: "Your time has been recorded.",
      });
    } else {
      // Here we would normally send a request to start tracking
      toast({
        title: "Time tracking started",
        description: "Timer is now running.",
      });
    }
    setIsTracking(!isTracking);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Time Tracking</h2>
        <div className="text-sm text-muted-foreground">{formattedDate}</div>
      </div>

      <Card className="border-2 border-primary-100">
        <CardContent className="pt-6">
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
            
            <div className="flex items-center gap-3">
              <Select
                value={currentProject}
                onValueChange={setCurrentProject}
                disabled={isTracking}
              >
                <SelectTrigger className="min-w-[200px]">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project-1">Website Redesign</SelectItem>
                  <SelectItem value="project-2">Mobile App Development</SelectItem>
                  <SelectItem value="project-3">Marketing Campaign</SelectItem>
                  <SelectItem value="project-4">Internal Meeting</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={toggleTimeTracking}
                variant={isTracking ? "destructive" : "default"}
                className="min-w-[120px]"
              >
                {isTracking ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    Manage your time entries.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
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
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <h3 className="mb-2 text-lg font-medium">Timesheet Feature Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're currently working on implementing detailed timesheet management.
                </p>
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