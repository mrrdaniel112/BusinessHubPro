import { useState, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  CalendarDays, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Plus, 
  Search,
  Check,
  Clock,
  CheckCircle2,
  Inbox,
  MoreVertical,
  Edit,
  Trash2,
  AlarmClock,
  Mail,
  Download,
  Upload,
  FileInput,
  Printer,
  HelpCircle,
  BellRing
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  format, 
  addMonths, 
  subMonths, 
  eachDayOfInterval, 
  startOfMonth, 
  endOfMonth, 
  isToday,
  isSameMonth
} from "date-fns";

export default function PayrollProcessing() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [payPeriod, setPayPeriod] = useState("current");

  // Get the current date for display
  const currentDate = new Date();
  const payPeriodStart = new Date(currentDate);
  payPeriodStart.setDate(1);
  const payPeriodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Format dates
  const formattedStartDate = format(payPeriodStart, "MMM d, yyyy");
  const formattedEndDate = format(payPeriodEnd, "MMM d, yyyy");

  // Placeholder for payroll data
  const { data: payrollData, isLoading: isLoadingPayroll } = useQuery({
    queryKey: ["/api/payroll", payPeriod],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/payroll?period=${payPeriod}`);
        if (!res.ok) throw new Error("Failed to fetch payroll data");
        return res.json();
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load payroll data. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Payroll Processing</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Payroll Run
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Pay Period</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{formattedStartDate} - {formattedEndDate}</div>
            <p className="text-xs text-muted-foreground">Next pay date: {format(payPeriodEnd, "MMM d, yyyy")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">3 new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$47,250.00</div>
            <p className="text-xs text-muted-foreground">+5.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">Pending</div>
            <p className="text-xs text-muted-foreground">Due in 5 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Payroll Summary</CardTitle>
                  <CardDescription>
                    Current pay period: {formattedStartDate} - {formattedEndDate}
                  </CardDescription>
                </div>
                <Select value={payPeriod} onValueChange={setPayPeriod}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Pay Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Period</SelectItem>
                    <SelectItem value="previous">Previous Period</SelectItem>
                    <SelectItem value="last-quarter">Last Quarter</SelectItem>
                    <SelectItem value="ytd">Year to Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Gross Pay</div>
                  <div className="text-2xl font-bold">$58,500.00</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Net Pay</div>
                  <div className="text-2xl font-bold">$47,250.00</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Tax Withholding</div>
                  <div className="text-2xl font-bold">$8,775.00</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Benefits</div>
                  <div className="text-2xl font-bold">$2,475.00</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Upcoming Actions</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center p-3 border rounded-lg bg-amber-50 border-amber-200">
                    <Clock className="h-5 w-5 text-amber-500 mr-3" />
                    <div>
                      <div className="font-medium">Approve Current Payroll</div>
                      <div className="text-sm text-muted-foreground">Due by {format(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 3), "MMM d, yyyy")}</div>
                    </div>
                    <Button size="sm" variant="outline" className="ml-auto">
                      Review
                    </Button>
                  </div>
                  <div className="flex items-center p-3 border rounded-lg">
                    <FileText className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <div className="font-medium">Submit Tax Forms</div>
                      <div className="text-sm text-muted-foreground">Due by {format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 15), "MMM d, yyyy")}</div>
                    </div>
                    <Button size="sm" variant="outline" className="ml-auto">
                      View
                    </Button>
                  </div>
                  <div className="flex items-center p-3 border rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <div className="font-medium">Process Direct Deposits</div>
                      <div className="text-sm text-muted-foreground">Scheduled for {format(payPeriodEnd, "MMM d, yyyy")}</div>
                    </div>
                    <Button size="sm" variant="outline" className="ml-auto">
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Employee Payroll</CardTitle>
                  <CardDescription>
                    Manage employee payroll information.
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    className="pl-8 min-w-[240px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPayroll ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Pay Rate</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Gross Pay</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Sarah Johnson</TableCell>
                      <TableCell>Engineering</TableCell>
                      <TableCell>$45.00/hr</TableCell>
                      <TableCell>80</TableCell>
                      <TableCell>$3,600.00</TableCell>
                      <TableCell>$720.00</TableCell>
                      <TableCell>$2,880.00</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <Check className="inline-block h-3 w-3 mr-1" />
                          Verified
                        </span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Michael Chen</TableCell>
                      <TableCell>Marketing</TableCell>
                      <TableCell>$40.00/hr</TableCell>
                      <TableCell>80</TableCell>
                      <TableCell>$3,200.00</TableCell>
                      <TableCell>$640.00</TableCell>
                      <TableCell>$2,560.00</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <Check className="inline-block h-3 w-3 mr-1" />
                          Verified
                        </span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Alex Rodriguez</TableCell>
                      <TableCell>Sales</TableCell>
                      <TableCell>$30.00/hr + 5% Commission</TableCell>
                      <TableCell>80</TableCell>
                      <TableCell>$2,900.00</TableCell>
                      <TableCell>$580.00</TableCell>
                      <TableCell>$2,320.00</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          <Clock className="inline-block h-3 w-3 mr-1" />
                          Pending
                        </span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Emily Wilson</TableCell>
                      <TableCell>Human Resources</TableCell>
                      <TableCell>$38.00/hr</TableCell>
                      <TableCell>80</TableCell>
                      <TableCell>$3,040.00</TableCell>
                      <TableCell>$608.00</TableCell>
                      <TableCell>$2,432.00</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <Check className="inline-block h-3 w-3 mr-1" />
                          Verified
                        </span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">James Smith</TableCell>
                      <TableCell>Customer Support</TableCell>
                      <TableCell>$28.00/hr</TableCell>
                      <TableCell>80</TableCell>
                      <TableCell>$2,240.00</TableCell>
                      <TableCell>$448.00</TableCell>
                      <TableCell>$1,792.00</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          <Clock className="inline-block h-3 w-3 mr-1" />
                          Pending
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Payroll Processing</CardTitle>
                  <CardDescription>
                    Run and manage payroll processing.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="current-period">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Pay Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current-period">Current Period</SelectItem>
                      <SelectItem value="off-cycle">Off-Cycle Payroll</SelectItem>
                      <SelectItem value="bonus">Bonus Payment</SelectItem>
                      <SelectItem value="commission">Commission Run</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted p-4 border-b">
                  <h3 className="text-lg font-medium">Current Pay Period ({formattedStartDate} - {formattedEndDate})</h3>
                  <div className="text-sm text-muted-foreground">Pay Date: {format(payPeriodEnd, "MMMM d, yyyy")}</div>
                </div>
                
                <div className="p-4">
                  <ol className="relative border-l border-gray-200 ml-3 space-y-6">
                    <li className="mb-6 ml-6">
                      <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 bg-green-100 text-green-800">
                        <CheckCircle2 className="w-5 h-5" />
                      </span>
                      <h3 className="font-medium">Time and Attendance</h3>
                      <p className="text-sm text-muted-foreground mb-2">Review and approve employee time data</p>
                      <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">Completed</Badge>
                    </li>
                    
                    <li className="mb-6 ml-6">
                      <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 bg-green-100 text-green-800">
                        <CheckCircle2 className="w-5 h-5" />
                      </span>
                      <h3 className="font-medium">Pre-Process Review</h3>
                      <p className="text-sm text-muted-foreground mb-2">Verify employee data and pay rates</p>
                      <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">Completed</Badge>
                    </li>
                    
                    <li className="mb-6 ml-6">
                      <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 bg-amber-100 text-amber-800">
                        <AlarmClock className="w-5 h-5" />
                      </span>
                      <h3 className="font-medium">Process Payroll</h3>
                      <p className="text-sm text-muted-foreground mb-2">Calculate wages, taxes, and deductions</p>
                      <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">In Progress</Badge>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Processing (75%)</span>
                          <span>18 of 24 employees</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    </li>
                    
                    <li className="mb-6 ml-6">
                      <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 bg-gray-100 text-gray-800">
                        <div className="w-5 h-5 flex items-center justify-center">4</div>
                      </span>
                      <h3 className="font-medium">Review and Approve</h3>
                      <p className="text-sm text-muted-foreground mb-2">Review calculated payroll and approve for payment</p>
                      <Badge variant="outline">Pending</Badge>
                    </li>
                    
                    <li className="mb-6 ml-6">
                      <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 bg-gray-100 text-gray-800">
                        <div className="w-5 h-5 flex items-center justify-center">5</div>
                      </span>
                      <h3 className="font-medium">Payment Processing</h3>
                      <p className="text-sm text-muted-foreground mb-2">Process payments via direct deposit or check</p>
                      <Badge variant="outline">Pending</Badge>
                    </li>
                  </ol>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Scheduled Pay Runs</CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[200px]">Upcoming payroll runs that are already scheduled.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">{format(addMonths(payPeriodEnd, 0), "MMMM d, yyyy")}</div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">Scheduled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">{format(addMonths(payPeriodEnd, 1), "MMMM d, yyyy")}</div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">Scheduled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">{format(addMonths(payPeriodEnd, 2), "MMMM d, yyyy")}</div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">Scheduled</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Recent Payroll Alerts</CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[200px]">Recent alerts related to payroll processing.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <BellRing className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="font-medium">Missing time entries for 2 employees</div>
                          <div className="text-muted-foreground">Action required before processing</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <BellRing className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="font-medium">Tax withholding changes</div>
                          <div className="text-muted-foreground">3 employees updated their W-4 forms</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Quick Actions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Pay Notifications
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Payroll Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Time Data
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Print Paystubs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            
            <CardFooter className="border-t pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col">
                <div className="text-sm font-medium mb-1">Current Payroll Status</div>
                <div className="text-amber-500 font-medium flex items-center">
                  <AlarmClock className="h-4 w-4 mr-1" />
                  Processing in progress (75% complete)
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  Cancel Run
                </Button>
                <Button>
                  Continue to Approval
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Reports</CardTitle>
              <CardDescription>
                Generate and view payroll reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <h3 className="mb-2 text-lg font-medium">Reports Feature Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're currently working on implementing payroll reports.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Settings</CardTitle>
              <CardDescription>
                Configure your payroll settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <h3 className="mb-2 text-lg font-medium">Settings Feature Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're currently working on implementing payroll settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}