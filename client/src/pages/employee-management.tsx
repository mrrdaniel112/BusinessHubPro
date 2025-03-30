import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  Users, 
  PlusCircle, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  DollarSign,
  Briefcase,
  Calendar,
  ClipboardList,
  Clock,
  UserCheck
} from "lucide-react";

// Mock types for employees since they're not in the schema yet
// These will need to be added to the schema

interface Employee {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  position: string;
  department: string | null;
  salary: string;
  salaryType: string; // "hourly" | "monthly" | "yearly"
  startDate: string;
  endDate: string | null;
  status: string; // "active" | "on_leave" | "terminated"
  taxInfo: string | null;
  bankAccountInfo: string | null;
  emergencyContact: string | null;
  notes: string | null;
  createdAt: string;
}

interface InsertEmployee {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  position: string;
  department: string | null;
  salary: string;
  salaryType: string;
  startDate: string;
  endDate: string | null;
  status: string;
  taxInfo?: string | null;
  bankAccountInfo?: string | null;
  emergencyContact?: string | null;
  notes?: string | null;
}

interface TimeEntry {
  id: number;
  userId: number;
  employeeId: number;
  date: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  description: string;
  projectId: number | null;
  billable: boolean;
  status: string;
  approvedBy: number | null;
  approvedAt: string | null;
}

// Define our filter types
type EmployeeFilter = "all" | "active" | "on_leave" | "terminated";

const EmployeeManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("employees");
  const [employeeFilter, setEmployeeFilter] = useState<EmployeeFilter>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Employees query
  const { 
    data: employees = [], 
    isLoading: isLoadingEmployees 
  } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/employees");
      return await res.json();
    },
    select: (data: Employee[]) => {
      if (employeeFilter === "all") return data;
      return data.filter(employee => employee.status === employeeFilter);
    }
  });

  // Filtered employees
  const filteredEmployees = employees.filter(employee => {
    if (searchQuery === "") return true;
    
    const search = searchQuery.toLowerCase();
    return (
      employee.firstName.toLowerCase().includes(search) ||
      employee.lastName.toLowerCase().includes(search) ||
      employee.position.toLowerCase().includes(search) ||
      (employee.department && employee.department.toLowerCase().includes(search))
    );
  });

  // Time entries for selected employee
  const {
    data: timeEntries = [],
    isLoading: isLoadingTimeEntries,
  } = useQuery({
    queryKey: ["/api/time-entries", selectedEmployee?.id],
    enabled: !!selectedEmployee,
    queryFn: async () => {
      if (!selectedEmployee) return [];
      const res = await apiRequest("GET", `/api/employees/${selectedEmployee.id}/time-entries`);
      return await res.json();
    }
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (newEmployee: Omit<InsertEmployee, "userId">) => {
      const res = await apiRequest("POST", "/api/employees", newEmployee);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Employee added",
        description: "The employee has been added successfully.",
      });
      queryClient.invalidateQueries({queryKey: ["/api/employees"]});
      setIsAddEmployeeOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add employee: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle employee form submission
  const handleAddEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const employee: Omit<InsertEmployee, "userId"> = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string || null,
      address: formData.get("address") as string || null,
      city: formData.get("city") as string || null,
      state: formData.get("state") as string || null,
      zipCode: formData.get("zipCode") as string || null,
      country: formData.get("country") as string || null,
      position: formData.get("position") as string,
      department: formData.get("department") as string || null,
      salary: formData.get("salary") as string,
      salaryType: formData.get("salaryType") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string || null,
      status: formData.get("status") as string,
      taxInfo: formData.get("taxInfo") as string || null,
      bankAccountInfo: formData.get("bankAccountInfo") as string || null,
      emergencyContact: formData.get("emergencyContact") as string || null,
      notes: formData.get("notes") as string || null
    };
    
    createEmployeeMutation.mutate(employee);
  };

  // Format salary for display
  const formatSalary = (salary: string, salaryType: string) => {
    const amount = parseFloat(salary).toLocaleString();
    switch (salaryType) {
      case "hourly":
        return `$${amount}/hr`;
      case "monthly":
        return `$${amount}/month`;
      case "yearly":
        return `$${amount}/year`;
      default:
        return `$${amount}`;
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "on_leave": return "bg-yellow-500";
      case "terminated": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "on_leave": return "On Leave";
      case "terminated": return "Terminated";
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Calculate total hours worked
  const getTotalHours = () => {
    if (!timeEntries.length) return 0;
    
    const total = timeEntries.reduce((sum: any, entry: any) => {
      if (entry.duration) {
        return sum + entry.duration;
      }
      return sum;
    }, 0);
    
    return (total / 60).toFixed(2); // Convert minutes to hours
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground">Manage your employees and integrate with payroll</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => setIsAddEmployeeOpen(true)} className="flex items-center gap-2">
            <PlusCircle size={16} />
            <span>Add Employee</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users size={16} />
            <span>Employees</span>
          </TabsTrigger>
          <TabsTrigger value="timetracking" className="flex items-center gap-2">
            <Clock size={16} />
            <span>Time Tracking</span>
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <DollarSign size={16} />
            <span>Payroll</span>
          </TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees">
          <Card>
            <CardHeader className="flex flex-col md:flex-row justify-between md:items-center">
              <div>
                <CardTitle>Employee Directory</CardTitle>
                <CardDescription>View and manage all your employees</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
                <div className="flex items-center gap-2">
                  <Label htmlFor="search-employees" className="sr-only">Search Employees</Label>
                  <Input
                    id="search-employees"
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-auto"
                  />
                </div>
                <Select value={employeeFilter} onValueChange={(value) => setEmployeeFilter(value as EmployeeFilter)}>
                  <SelectTrigger className="w-full sm:w-[180px] flex items-center gap-2">
                    <Filter size={16} />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingEmployees ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No employees found. Add a new employee to get started.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Position</TableHead>
                      <TableHead className="hidden lg:table-cell">Department</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Salary</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                            <p className="text-sm text-muted-foreground md:hidden">{employee.position}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {employee.position}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {employee.department || "—"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className={`${getStatusColor(employee.status)} text-white`}>
                            {formatStatus(employee.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {formatSalary(employee.salary, employee.salaryType)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => {
                                setSelectedEmployee(employee);
                                setActiveTab("timetracking");
                              }}>
                                View Time Entries
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedEmployee(employee);
                                setActiveTab("payroll");
                              }}>
                                Payroll Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Edit Employee
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Tracking Tab */}
        <TabsContent value="timetracking">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle>Employee Time Tracking</CardTitle>
                <CardDescription>
                  {selectedEmployee ? (
                    <>View time entries for <span className="font-medium">{selectedEmployee.firstName} {selectedEmployee.lastName}</span></>
                  ) : (
                    <>Select an employee to view their time entries</>
                  )}
                </CardDescription>
              </div>
              {selectedEmployee && (
                <div className="flex gap-2 mt-4 sm:mt-0">
                  <Button variant="outline" onClick={() => window.location.href = "/time-tracking"}>
                    Go to Time Tracking
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!selectedEmployee ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Select an employee from the Employees tab to view their time entries</p>
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => setActiveTab("employees")}>
                      Go to Employees
                    </Button>
                  </div>
                </div>
              ) : isLoadingTimeEntries ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : timeEntries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No time entries found for this employee</p>
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => window.location.href = "/time-tracking"}>
                      Create Time Entry
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <span className="text-muted-foreground">Total Hours</span>
                          </div>
                          <span className="text-2xl font-bold">{getTotalHours()}</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <span className="text-muted-foreground">This Week</span>
                          </div>
                          <span className="text-2xl font-bold">
                            {/* Calculate weekly hours here */}
                            {0}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <span className="text-muted-foreground">Pay Rate</span>
                          </div>
                          <span className="text-2xl font-bold">
                            {selectedEmployee.salaryType === "hourly" ? `$${selectedEmployee.salary}/hr` : `$${selectedEmployee.salary}/${selectedEmployee.salaryType}`}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="hidden md:table-cell">Description</TableHead>
                        <TableHead className="hidden lg:table-cell">Project</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeEntries.map((entry: any) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div className="font-medium">
                              {format(new Date(entry.date), "MMM d, yyyy")}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {entry.startTime.substring(0, 5)} - {entry.endTime ? entry.endTime.substring(0, 5) : "In progress"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {entry.duration ? `${(entry.duration / 60).toFixed(2)} hrs` : "—"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                            {entry.description}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {entry.projectId ? `Project #${entry.projectId}` : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={entry.status === "approved" ? "default" : "outline"}>
                              {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle>Payroll Information</CardTitle>
                <CardDescription>
                  {selectedEmployee ? (
                    <>Manage payroll for <span className="font-medium">{selectedEmployee.firstName} {selectedEmployee.lastName}</span></>
                  ) : (
                    <>Select an employee to view payroll information</>
                  )}
                </CardDescription>
              </div>
              {selectedEmployee && (
                <div className="flex gap-2 mt-4 sm:mt-0">
                  <Button variant="outline" onClick={() => window.location.href = "/payroll-processing"}>
                    Go to Payroll Processing
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!selectedEmployee ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Select an employee from the Employees tab to view their payroll information</p>
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => setActiveTab("employees")}>
                      Go to Employees
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Employee Compensation Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Compensation</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Base Salary</p>
                            <p className="font-medium">${parseFloat(selectedEmployee.salary).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Payment Frequency</p>
                            <p className="font-medium capitalize">{selectedEmployee.salaryType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Position</p>
                            <p className="font-medium">{selectedEmployee.position}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Department</p>
                            <p className="font-medium">{selectedEmployee.department || "—"}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Employment Status</p>
                          <Badge className={`${getStatusColor(selectedEmployee.status)} text-white mt-1`}>
                            {formatStatus(selectedEmployee.status)}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Employment Period</p>
                          <p className="font-medium">
                            {format(new Date(selectedEmployee.startDate), "MMM d, yyyy")} - 
                            {selectedEmployee.endDate ? format(new Date(selectedEmployee.endDate), " MMM d, yyyy") : " Present"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tax & Banking Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Tax & Banking Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Tax Information</p>
                          <p className="font-medium">{selectedEmployee.taxInfo || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Bank Account Information</p>
                          <p className="font-medium">
                            {selectedEmployee.bankAccountInfo 
                              ? `${selectedEmployee.bankAccountInfo}` 
                              : "Not provided"}
                          </p>
                        </div>

                        <div className="pt-2">
                          <Button variant="outline" className="w-full">
                            Edit Tax & Banking Information
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Payroll */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Payroll History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No payroll history available yet</p>
                        <div className="mt-4">
                          <Button variant="outline" onClick={() => window.location.href = "/payroll-processing"}>
                            Process Payroll
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notes Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea 
                        value={selectedEmployee.notes || ""} 
                        placeholder="Add notes about this employee..."
                        className="min-h-[100px]"
                        readOnly
                      />
                      <div className="mt-4">
                        <Button variant="outline">Save Notes</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Employee Dialog */}
      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Add a new employee to your organization. This information will be used for payroll processing.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEmployee}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" name="firstName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" name="lastName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input id="state" name="state" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip/Postal Code</Label>
                <Input id="zipCode" name="zipCode" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" defaultValue="USA" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input id="position" name="position" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select name="department">
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accounting">Accounting</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary/Wage *</Label>
                <Input id="salary" name="salary" type="number" step="0.01" min="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryType">Payment Frequency *</Label>
                <Select name="salaryType" defaultValue="hourly">
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input id="startDate" name="startDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" name="endDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select name="status" defaultValue="active">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="taxInfo">Tax Information</Label>
                <Input id="taxInfo" name="taxInfo" placeholder="SSN, Tax ID, W-4 details, etc." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bankAccountInfo">Bank Account Information</Label>
                <Input id="bankAccountInfo" name="bankAccountInfo" placeholder="Bank name, Account number, Routing number, etc." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input id="emergencyContact" name="emergencyContact" placeholder="Name and phone number" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsAddEmployeeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createEmployeeMutation.isPending}>
                {createEmployeeMutation.isPending ? "Saving..." : "Add Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;