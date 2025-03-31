import { useState, useRef } from "react";
import { useQuery, useMutation, UseQueryResult } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { format, addMonths, addDays, isAfter, isBefore, differenceInDays } from "date-fns";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Filter, 
  Calendar, 
  Upload, 
  Download, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  CalendarClock,
  BarChart,
  PieChart,
  FileSpreadsheet,
  FileCog,
  FileStack,
  Sparkles,
  Calculator,
  CircleDollarSign
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

// Types
type TaxItem = {
  id: number;
  userId: number;
  name: string;
  category: string;
  amount: string;
  taxYear: number;
  quarter?: number;
  dueDate?: string;
  dateFiled?: string;
  datePaid?: string;
  status: "pending" | "filed" | "paid" | "overdue";
  description?: string;
  receiptId?: number;
  createdAt: string;
};

type UploadedDocument = {
  id: number;
  name: string;
  size: string;
  type: string;
  uploadDate: string;
  category: string;
  taxYear: number;
};

type TaxReminder = {
  id: number;
  title: string;
  taxYear: number;
  dueDate: string;
  description: string;
  status: "upcoming" | "due" | "overdue" | "completed";
  priority: "low" | "medium" | "high";
};

type TaxScenario = {
  id: number;
  name: string;
  description: string;
  baseAmount: number;
  scenarioAmount: number;
  savings: number;
  createdAt: string;
};

// COLORS
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  filed: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  upcoming: "bg-blue-100 text-blue-800",
  due: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800"
};

export default function TaxManagementEnhanced() {
  // State and hooks
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAIAnalyzerOpen, setIsAIAnalyzerOpen] = useState(false);
  const [isScenarioDialogOpen, setIsScenarioDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TaxItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDocumentViewOpen, setIsDocumentViewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument | null>(null);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);

  // Form state for new tax item
  const [formData, setFormData] = useState({
    name: "",
    category: "income",
    amount: "",
    taxYear: new Date().getFullYear(),
    quarter: 1,
    dueDate: format(new Date(), "yyyy-MM-dd"),
    status: "pending",
    description: ""
  });

  // Form state for scenario modeling
  const [scenarioData, setScenarioData] = useState({
    name: "New Equipment Purchase",
    description: "Purchase $10,000 in new equipment this year vs. next year",
    baseAmount: 10000,
    deductionRate: 0.21,
    timingOption: "thisYear",
  });

  // Form state for new reminder
  const [reminderData, setReminderData] = useState({
    title: "Quarterly Estimated Tax Payment",
    taxYear: new Date().getFullYear(),
    dueDate: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
    description: "Submit quarterly estimated tax payment",
    priority: "medium"
  });

  // Mock uploaded documents
  const [documents, setDocuments] = useState<UploadedDocument[]>([
    {
      id: 1,
      name: "Q1-Receipt-2025.pdf",
      size: "245 KB",
      type: "application/pdf",
      uploadDate: "2025-01-15",
      category: "receipt",
      taxYear: 2025
    },
    {
      id: 2,
      name: "Business-Property-Tax-2025.pdf",
      size: "1.2 MB",
      type: "application/pdf",
      uploadDate: "2025-02-10",
      category: "tax_form",
      taxYear: 2025
    },
    {
      id: 3,
      name: "Vehicle-Expense-Log-2025.xlsx",
      size: "78 KB",
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      uploadDate: "2025-03-01",
      category: "expense_log",
      taxYear: 2025
    }
  ]);

  // Mock tax reminders with calculations for actual due dates
  const currentDate = new Date();
  const nextMonth = addMonths(currentDate, 1);
  const twoMonthsOut = addMonths(currentDate, 2);
  const threeMonthsOut = addMonths(currentDate, 3);
  
  const [reminders, setReminders] = useState<TaxReminder[]>([
    {
      id: 1,
      title: "Q2 Estimated Tax Payment",
      taxYear: currentDate.getFullYear(),
      dueDate: format(nextMonth, "yyyy-MM-dd"),
      description: "Quarterly estimated tax payment due for Q2",
      status: isBefore(nextMonth, addDays(currentDate, 7)) ? "due" : "upcoming",
      priority: "high"
    },
    {
      id: 2,
      title: "Business Property Tax",
      taxYear: currentDate.getFullYear(),
      dueDate: format(twoMonthsOut, "yyyy-MM-dd"),
      description: "Annual property tax for business location",
      status: "upcoming",
      priority: "medium"
    },
    {
      id: 3,
      title: "Vehicle Tax Documentation",
      taxYear: currentDate.getFullYear(),
      dueDate: format(threeMonthsOut, "yyyy-MM-dd"),
      description: "Submit vehicle mileage and expense documentation",
      status: "upcoming",
      priority: "low"
    }
  ]);

  // Mock tax scenarios
  const [scenarios, setScenarios] = useState<TaxScenario[]>([
    {
      id: 1,
      name: "Equipment Purchase Timing",
      description: "Compare tax implications of purchasing equipment this year vs. next year",
      baseAmount: 15000,
      scenarioAmount: 12750,
      savings: 2250,
      createdAt: format(addDays(currentDate, -15), "yyyy-MM-dd")
    },
    {
      id: 2,
      name: "Contractor vs. Employee",
      description: "Compare tax implications of hiring contractor vs. employee",
      baseAmount: 62000,
      scenarioAmount: 57800,
      savings: 4200,
      createdAt: format(addDays(currentDate, -30), "yyyy-MM-dd")
    }
  ]);

  // Query tax items
  const { data: taxItems, isLoading }: UseQueryResult<TaxItem[], Error> = useQuery({
    queryKey: ["/api/tax-items", selectedYear],
    queryFn: async () => {
      const res = await fetch(`/api/tax-items/year/${selectedYear}`);
      if (!res.ok) throw new Error("Failed to fetch tax items");
      return res.json();
    }
  });

  // Add tax item mutation with proper field mapping
  const addTaxItemMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Map the form data to what the API expects
      const apiData = {
        name: data.name,
        category: data.category,
        amount: data.amount,
        taxYear: data.taxYear,
        quarter: data.quarter,
        description: data.description,
        status: data.status,
        // Include missing fields that the API requires
        userId: user?.id || 1, // Fallback to 1 if not available
      };
      
      const res = await fetch("/api/tax-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add tax item");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tax-items"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Tax item added successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Tax item add error:", error);
      toast({
        title: "Error",
        description: `Failed to add tax item: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update tax item mutation
  const updateTaxItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<TaxItem> }) => {
      // Map the data correctly
      const apiData = {
        name: data.name,
        category: data.category,
        amount: data.amount,
        taxYear: data.taxYear,
        quarter: data.quarter,
        description: data.description,
        status: data.status,
        userId: user?.id || 1,
      };
      
      const res = await fetch(`/api/tax-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update tax item");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tax-items"] });
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      toast({
        title: "Success",
        description: "Tax item updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update tax item: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // AI analysis mutation (mock for now)
  const analyzeWithAI = async () => {
    setIsProcessingAI(true);
    
    try {
      // This would be a real API call in production
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock result
      let result = "";
      if (aiDescription.toLowerCase().includes("receipt") || aiDescription.toLowerCase().includes("expense")) {
        result = "Category: Business Expense\nTax Deductible: Yes\nRecommended Classification: Office Supplies\nPotential Deduction Value: $156.75\n\nThis appears to be a legitimate business expense for office supplies that is fully deductible against business income.";
      } else if (aiDescription.toLowerCase().includes("income") || aiDescription.toLowerCase().includes("revenue")) {
        result = "Category: Business Income\nTaxable: Yes\nRecommended Classification: Service Revenue\nTax Implication: Subject to income tax and self-employment tax\n\nThis transaction represents business income that must be reported on your tax return. Consider making estimated tax payments based on this income.";
      } else if (aiDescription.toLowerCase().includes("vehicle") || aiDescription.toLowerCase().includes("mileage")) {
        result = "Category: Travel Expense\nTax Deductible: Yes\nRecommended Classification: Vehicle Expense\nDeduction Method Options: Standard mileage rate or actual expenses\n\nConsider logging miles driven for business to maximize your deduction. The current standard mileage rate is $0.67 per mile which may be more advantageous than tracking actual expenses.";
      } else {
        result = "Based on your description, I've analyzed this transaction and determined:\n\n• Most likely tax category: Business Expense\n• Deductibility: Potentially deductible (80% confidence)\n• Recommendation: Keep detailed records including purpose of expense and business relationship\n• Suggested documentation: Receipt, invoice, and business purpose memo\n\nConsider consulting your tax professional for final determination based on your specific business circumstances.";
      }
      
      setAiResult(result);
    } catch (error) {
      toast({
        title: "AI Analysis Failed",
        description: "Could not complete the analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const saveUploadedDocument = () => {
    if (!uploadedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    // Create a new document entry
    const newDoc: UploadedDocument = {
      id: documents.length + 1,
      name: uploadedFile.name,
      size: formatFileSize(uploadedFile.size),
      type: uploadedFile.type,
      uploadDate: format(new Date(), "yyyy-MM-dd"),
      category: "receipt", // Default category
      taxYear: selectedYear
    };

    setDocuments([...documents, newDoc]);
    setUploadedFile(null);
    setIsUploadDialogOpen(false);
    
    toast({
      title: "Document Uploaded",
      description: `${uploadedFile.name} has been uploaded successfully.`,
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // View document details
  const viewDocument = (doc: UploadedDocument) => {
    setSelectedDocument(doc);
    setIsDocumentViewOpen(true);
  };

  // Add a new reminder
  const addReminder = () => {
    const newReminder: TaxReminder = {
      id: reminders.length + 1,
      title: reminderData.title,
      taxYear: reminderData.taxYear,
      dueDate: reminderData.dueDate,
      description: reminderData.description,
      status: "upcoming",
      priority: reminderData.priority as "low" | "medium" | "high"
    };
    
    setReminders([...reminders, newReminder]);
    setIsReminderDialogOpen(false);
    
    toast({
      title: "Reminder Added",
      description: "Your tax reminder has been added to the calendar.",
    });
  };

  // Create tax scenario
  const createTaxScenario = () => {
    // Calculate tax savings based on inputs
    const baseAmount = parseFloat(scenarioData.baseAmount.toString());
    const deductionRate = parseFloat(scenarioData.deductionRate.toString());
    
    let thisYearTax, nextYearTax, savings;
    
    if (scenarioData.timingOption === "thisYear") {
      thisYearTax = baseAmount * deductionRate;
      nextYearTax = 0;
      savings = thisYearTax;
    } else {
      thisYearTax = 0;
      nextYearTax = baseAmount * deductionRate;
      savings = 0; // No immediate savings, but there's a time value of money benefit
    }
    
    const newScenario: TaxScenario = {
      id: scenarios.length + 1,
      name: scenarioData.name,
      description: scenarioData.description,
      baseAmount: baseAmount,
      scenarioAmount: baseAmount - savings,
      savings: savings,
      createdAt: format(new Date(), "yyyy-MM-dd")
    };
    
    setScenarios([...scenarios, newScenario]);
    setIsScenarioDialogOpen(false);
    
    toast({
      title: "Tax Scenario Created",
      description: "Your tax scenario has been created and saved.",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTaxItemMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    updateTaxItemMutation.mutate({
      id: selectedItem.id,
      data: {
        name: selectedItem.name,
        category: selectedItem.category,
        amount: selectedItem.amount,
        taxYear: selectedItem.taxYear,
        quarter: selectedItem.quarter,
        dueDate: selectedItem.dueDate,
        datePaid: selectedItem.datePaid,
        status: selectedItem.status as "pending" | "filed" | "paid" | "overdue",
        description: selectedItem.description,
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "income",
      amount: "",
      taxYear: new Date().getFullYear(),
      quarter: 1,
      dueDate: format(new Date(), "yyyy-MM-dd"),
      status: "pending",
      description: ""
    });
  };

  const handleEditItem = (item: TaxItem) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleEditItemChange = (name: string, value: any) => {
    if (!selectedItem) return;
    setSelectedItem({ ...selectedItem, [name]: value });
  };

  // Calculate summary data
  const calculateSummary = () => {
    if (!taxItems || taxItems.length === 0) {
      return {
        income: 0, expense: 0, deduction: 0, credit: 0,
        pending: 0, filed: 0, paid: 0, overdue: 0,
        totalTax: 0, estimatedRefund: 0
      };
    }
    
    // Calculate category totals
    const income = taxItems
      .filter((item: TaxItem) => item.category === "income")
      .reduce((sum: number, item: TaxItem) => sum + parseFloat(item.amount), 0);
    
    const expense = taxItems
      .filter((item: TaxItem) => item.category === "expense")
      .reduce((sum: number, item: TaxItem) => sum + parseFloat(item.amount), 0);

    const deduction = taxItems
      .filter((item: TaxItem) => item.category === "deduction")
      .reduce((sum: number, item: TaxItem) => sum + parseFloat(item.amount), 0);
    
    const credit = taxItems
      .filter((item: TaxItem) => item.category === "credit")
      .reduce((sum: number, item: TaxItem) => sum + parseFloat(item.amount), 0);

    // Calculate status totals
    const pending = taxItems
      .filter((item: TaxItem) => item.status === "pending")
      .reduce((sum: number, item: TaxItem) => sum + parseFloat(item.amount), 0);
    
    const filed = taxItems
      .filter((item: TaxItem) => item.status === "filed")
      .reduce((sum: number, item: TaxItem) => sum + parseFloat(item.amount), 0);
    
    const paid = taxItems
      .filter((item: TaxItem) => item.status === "paid")
      .reduce((sum: number, item: TaxItem) => sum + parseFloat(item.amount), 0);
    
    const overdue = taxItems
      .filter((item: TaxItem) => item.status === "overdue")
      .reduce((sum: number, item: TaxItem) => sum + parseFloat(item.amount), 0);

    // Calculate estimated tax/refund
    const taxableIncome = income - expense - deduction;
    const estimatedTaxRate = 0.25; // 25% estimated tax rate
    const totalTax = Math.max(0, taxableIncome * estimatedTaxRate - credit);
    const estimatedRefund = credit > totalTax ? credit - totalTax : 0;
    
    return {
      income,
      expense,
      deduction,
      credit,
      pending,
      filed,
      paid,
      overdue,
      totalTax,
      estimatedRefund
    };
  };

  const summary = calculateSummary();

  // Prepare chart data for categories
  const categoryData = [
    { name: "Income", value: summary.income, fill: "#0088FE" },
    { name: "Expenses", value: summary.expense, fill: "#00C49F" },
    { name: "Deductions", value: summary.deduction, fill: "#FFBB28" },
    { name: "Credits", value: summary.credit, fill: "#FF8042" }
  ].filter(item => item.value > 0);

  // Prepare chart data for status
  const statusData = [
    { name: "Pending", value: summary.pending, fill: "#FFBB28" },
    { name: "Filed", value: summary.filed, fill: "#0088FE" },
    { name: "Paid", value: summary.paid, fill: "#00C49F" },
    { name: "Overdue", value: summary.overdue, fill: "#FF8042" }
  ].filter(item => item.value > 0);

  // Prepare quarterly tax data for the year
  const quarterlyData = [
    { name: "Q1", income: 12500, expenses: 4200, tax: 2075 },
    { name: "Q2", income: 15600, expenses: 5100, tax: 2625 },
    { name: "Q3", income: 14800, expenses: 4800, tax: 2500 },
    { name: "Q4", income: 16200, expenses: 5400, tax: 2700 }
  ];

  // Get status style class
  const getStatusClass = (status: string) => STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "";

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case "high": return <Badge variant="destructive">High</Badge>;
      case "medium": return <Badge variant="default">Medium</Badge>;
      case "low": return <Badge className="bg-blue-500">Low</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Calculate days until due for a date
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    return differenceInDays(due, today);
  };

  // Get status for a due date
  const getDateStatus = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntil = getDaysUntilDue(dueDate);
    
    if (isBefore(due, today)) return "overdue";
    if (daysUntil <= 7) return "due";
    return "upcoming";
  };

  // Available years for filtering
  const availableYears = [2023, 2024, 2025, 2026]; // Static list including future years
  const years = availableYears.sort((a, b) => b - a);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tax Management</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsAIDialogOpen(true)} variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Tax Assistant
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tax Item
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Tax Items</TabsTrigger>
          <TabsTrigger value="calendar">Tax Calendar</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="planning">Tax Planning</TabsTrigger>
        </TabsList>
        
        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Income Tax</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.income.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Taxable income for {selectedYear}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tax Deductions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.deduction.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total deductions for {selectedYear}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Estimated Tax</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.totalTax.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Based on current income and deductions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reminders.filter(r => r.status === "upcoming" || r.status === "due").length}</div>
                <p className="text-xs text-muted-foreground">Deadlines in the next 90 days</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Tax Category Breakdown</CardTitle>
                <CardDescription>
                  Distribution of your tax items by category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Quarterly Tax Trend</CardTitle>
                <CardDescription>
                  Income, expenses, and estimated taxes by quarter
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={quarterlyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#0088FE" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#00C49F" strokeWidth={2} />
                    <Line type="monotone" dataKey="tax" stroke="#FF8042" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tax Deadlines</CardTitle>
              <CardDescription>
                Important tax deadlines for the next 90 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reminders
                  .filter(reminder => getDaysUntilDue(reminder.dueDate) <= 90 && getDaysUntilDue(reminder.dueDate) >= -7)
                  .slice(0, 3)
                  .map(reminder => (
                    <div key={reminder.id} className="flex items-center justify-between space-x-2 pb-2 border-b">
                      <div className="flex items-center space-x-2">
                        <CalendarClock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{reminder.title}</p>
                          <p className="text-sm text-muted-foreground">{format(new Date(reminder.dueDate), "MMMM d, yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(reminder.priority)}
                        <Badge className={getStatusClass(getDateStatus(reminder.dueDate))}>
                          {getDaysUntilDue(reminder.dueDate) < 0 
                            ? `${Math.abs(getDaysUntilDue(reminder.dueDate))} days overdue` 
                            : `${getDaysUntilDue(reminder.dueDate)} days left`}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                {reminders.filter(reminder => getDaysUntilDue(reminder.dueDate) <= 90).length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No upcoming tax deadlines for the next 90 days</p>
                  </div>
                )}
                
                <div className="text-center pt-2">
                  <Button variant="outline" onClick={() => setActiveTab("calendar")}>
                    View All Deadlines
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* TAX ITEMS TAB */}
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tax Items</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year: number) => (
                        <SelectItem key={year.toString()} value={year.toString()}>
                          {year.toString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => setIsAIAnalyzerOpen(true)}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Categorize
                  </Button>
                </div>
              </div>
              <CardDescription>
                Manage your tax items for {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Quarter</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxItems && taxItems.length > 0 ? (
                      taxItems.map((item: TaxItem) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name || item.description}</TableCell>
                          <TableCell className="capitalize">{item.category}</TableCell>
                          <TableCell>${parseFloat(item.amount).toFixed(2)}</TableCell>
                          <TableCell>{item.taxYear}</TableCell>
                          <TableCell>{item.quarter ? `Q${item.quarter}` : "—"}</TableCell>
                          <TableCell>
                            <Badge className={getStatusClass(item.status)}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditItem(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          <div className="py-4">
                            <p className="text-muted-foreground mb-2">No tax items found for {selectedYear}</p>
                            <Button onClick={() => setIsAddDialogOpen(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Your First Tax Item
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {taxItems?.length || 0} items for tax year {selectedYear}
              </div>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tax Item
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* TAX CALENDAR TAB */}
        <TabsContent value="calendar" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Tax Calendar and Reminders</h3>
            <Button onClick={() => setIsReminderDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tax Deadlines</CardTitle>
              <CardDescription>Important dates and deadlines for your tax planning</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Days Left</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminders.map(reminder => {
                    const daysLeft = getDaysUntilDue(reminder.dueDate);
                    const status = getDateStatus(reminder.dueDate);
                    
                    return (
                      <TableRow key={reminder.id}>
                        <TableCell className="font-medium">{reminder.title}</TableCell>
                        <TableCell>{format(new Date(reminder.dueDate), "MMMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Badge className={getStatusClass(status)}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(reminder.priority)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={reminder.description}>
                          {reminder.description}
                        </TableCell>
                        <TableCell className="text-right">
                          {daysLeft < 0 ? (
                            <span className="text-red-500">{Math.abs(daysLeft)} days overdue</span>
                          ) : (
                            <span>{daysLeft} days left</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {reminders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No tax deadlines found. Add a reminder to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Key Tax Dates for {new Date().getFullYear()}</CardTitle>
              <CardDescription>Important tax dates for all businesses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-medium">January 15</h4>
                  <p className="text-sm text-muted-foreground">Q4 Estimated Tax Payment Due (previous tax year)</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-medium">April 15</h4>
                  <p className="text-sm text-muted-foreground">Annual Tax Return Filing Deadline & Q1 Estimated Tax Payment Due</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-medium">June 15</h4>
                  <p className="text-sm text-muted-foreground">Q2 Estimated Tax Payment Due</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-medium">September 15</h4>
                  <p className="text-sm text-muted-foreground">Q3 Estimated Tax Payment Due</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-medium">October 15</h4>
                  <p className="text-sm text-muted-foreground">Extended Tax Filing Deadline (if extension filed)</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-medium">December 31</h4>
                  <p className="text-sm text-muted-foreground">Last Day for Tax-Deductible Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* DOCUMENTS TAB */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Tax Documents</h3>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
              <CardDescription>Store and organize all tax-related documents</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Tax Year</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>{doc.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell>{doc.taxYear}</TableCell>
                      <TableCell>{format(new Date(doc.uploadDate), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => viewDocument(doc)}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {documents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No documents found. Upload a document to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileSpreadsheet className="h-5 w-5 mr-2" />
                  Receipt Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Upload and organize receipts for tax deductions. Our system automatically extracts key information.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setIsUploadDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Receipt
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileCog className="h-5 w-5 mr-2" />
                  Form Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Store and manage tax forms. Keep track of important tax documentation in one secure location.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setIsUploadDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Tax Form
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileStack className="h-5 w-5 mr-2" />
                  Document Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Export your tax documents in various formats for your accountant or tax preparation software.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Documents
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* TAX PLANNING TAB */}
        <TabsContent value="planning" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tax Scenario Modeling</CardTitle>
                <CardDescription>
                  Create "what-if" scenarios to optimize your tax strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scenarios.map(scenario => (
                    <div key={scenario.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{scenario.name}</h4>
                          <p className="text-sm text-muted-foreground">{scenario.description}</p>
                        </div>
                        <Badge variant="secondary">Created: {format(new Date(scenario.createdAt), "MMM d, yyyy")}</Badge>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Base Amount</p>
                          <p className="font-medium">${scenario.baseAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Optimized Amount</p>
                          <p className="font-medium">${scenario.scenarioAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Potential Savings</p>
                          <p className="font-medium text-green-600">${scenario.savings.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button className="w-full" onClick={() => setIsScenarioDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Scenario
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tax Saving Opportunities</CardTitle>
                <CardDescription>
                  Recommended actions to minimize your tax burden
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-md">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Maximize Retirement Contributions</h4>
                      <p className="text-sm text-muted-foreground">Contributing to retirement accounts can reduce your taxable income. Consider maximizing contributions to your SEP IRA or Solo 401(k).</p>
                      <p className="text-sm font-medium text-green-700 mt-1">Potential Savings: $5,000 - $10,000</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-md">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Home Office Deduction</h4>
                      <p className="text-sm text-muted-foreground">If you use part of your home regularly and exclusively for business, you may qualify for a home office deduction.</p>
                      <p className="text-sm font-medium text-green-700 mt-1">Potential Savings: $1,200 - $3,000</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-md">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Business Vehicle Expenses</h4>
                      <p className="text-sm text-muted-foreground">Track your business mileage and vehicle expenses. You can deduct actual expenses or use the standard mileage rate.</p>
                      <p className="text-sm font-medium text-green-700 mt-1">Potential Savings: $2,500 - $5,000</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-md">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Section 179 Deduction</h4>
                      <p className="text-sm text-muted-foreground">Consider purchasing business equipment before year-end to take advantage of Section 179 deduction for immediate expensing.</p>
                      <p className="text-sm font-medium text-green-700 mt-1">Potential Savings: Varies by purchase amount</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Tax Service Integrations</CardTitle>
              <CardDescription>
                Connect with tax preparation services and professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-medium">Export to Tax Software</h4>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Export your tax data in formats compatible with popular tax software</p>
                  <Button variant="outline" className="mt-auto">Connect</Button>
                </div>
                
                <div className="border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                    <CircleDollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="font-medium">Find Tax Professionals</h4>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Connect with certified accountants and tax professionals in your area</p>
                  <Button variant="outline" className="mt-auto">Search</Button>
                </div>
                
                <div className="border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                    <Calculator className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-medium">Tax Calculator</h4>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Use our advanced tax calculator to estimate your tax liability</p>
                  <Button variant="outline" className="mt-auto">Calculate</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Tax Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Tax Item</DialogTitle>
            <DialogDescription>
              Enter the details for the new tax item
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="deduction">Deduction</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="taxYear" className="text-right">
                  Tax Year
                </Label>
                <Input
                  id="taxYear"
                  name="taxYear"
                  type="number"
                  value={formData.taxYear}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quarter" className="text-right">
                  Quarter
                </Label>
                <Select
                  value={formData.quarter.toString()}
                  onValueChange={(value) => handleSelectChange("quarter", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Q1</SelectItem>
                    <SelectItem value="2">Q2</SelectItem>
                    <SelectItem value="3">Q3</SelectItem>
                    <SelectItem value="4">Q4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="filed">Filed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={addTaxItemMutation.isPending}>
                {addTaxItemMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Tax Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Tax Item</DialogTitle>
            <DialogDescription>
              Update the details for this tax item
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={selectedItem.name || ""}
                    onChange={(e) => handleEditItemChange("name", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="edit-description"
                    value={selectedItem.description || ""}
                    onChange={(e) => handleEditItemChange("description", e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={selectedItem.category}
                    onValueChange={(value) => handleEditItemChange("category", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="deduction">Deduction</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={selectedItem.amount}
                    onChange={(e) => handleEditItemChange("amount", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-taxYear" className="text-right">
                    Tax Year
                  </Label>
                  <Input
                    id="edit-taxYear"
                    type="number"
                    value={selectedItem.taxYear}
                    onChange={(e) => handleEditItemChange("taxYear", parseInt(e.target.value))}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-quarter" className="text-right">
                    Quarter
                  </Label>
                  <Select
                    value={(selectedItem.quarter || 1).toString()}
                    onValueChange={(value) => handleEditItemChange("quarter", parseInt(value))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Q1</SelectItem>
                      <SelectItem value="2">Q2</SelectItem>
                      <SelectItem value="3">Q3</SelectItem>
                      <SelectItem value="4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={selectedItem.status}
                    onValueChange={(value) => handleEditItemChange("status", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="filed">Filed</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateTaxItemMutation.isPending}>
                  {updateTaxItemMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* AI Tax Assistant Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>AI Tax Assistant</DialogTitle>
            <DialogDescription>
              Analyze transactions and get tax category recommendations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ai-description">
                Describe the transaction or item you need help with:
              </Label>
              <Textarea
                id="ai-description"
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                placeholder="Example: 'I purchased a new laptop for $1,200 that I use 80% for my business'"
                className="min-h-[100px]"
              />
            </div>
            
            {aiResult && (
              <div className="rounded-md border p-4 mt-4">
                <h4 className="font-medium mb-2">Analysis Results</h4>
                <pre className="whitespace-pre-wrap text-sm">{aiResult}</pre>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setAiDescription('');
                setAiResult('');
              }}
              disabled={isProcessingAI}
            >
              Clear
            </Button>
            <Button 
              onClick={analyzeWithAI} 
              disabled={!aiDescription.trim() || isProcessingAI}
            >
              {isProcessingAI ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Upload Document Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload tax-related documents for storage and analysis
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="document-upload">Select Document</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                {uploadedFile ? (
                  <div className="space-y-2">
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setUploadedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to browse or drag and drop
                    </p>
                    <input
                      id="document-upload"
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document-category">Document Category</Label>
              <Select defaultValue="receipt">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receipt">Receipt</SelectItem>
                  <SelectItem value="tax_form">Tax Form</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="expense_log">Expense Log</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document-year">Tax Year</Label>
              <Select defaultValue={new Date().getFullYear().toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025, 2026].map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={saveUploadedDocument} 
              disabled={!uploadedFile}
            >
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Document View Dialog */}
      <Dialog open={isDocumentViewOpen} onOpenChange={setIsDocumentViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedDocument && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedDocument.name}</DialogTitle>
                <DialogDescription>
                  Uploaded on {format(new Date(selectedDocument.uploadDate), "MMMM d, yyyy")}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="bg-slate-100 rounded-md p-6 min-h-[300px] flex items-center justify-center">
                  {selectedDocument.type.includes("image") ? (
                    <p className="text-center text-muted-foreground">Image preview would appear here</p>
                  ) : selectedDocument.type.includes("pdf") ? (
                    <p className="text-center text-muted-foreground">PDF preview would appear here</p>
                  ) : (
                    <p className="text-center text-muted-foreground">Preview not available for this file type</p>
                  )}
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Document Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p>{selectedDocument.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p>{selectedDocument.size}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p>{selectedDocument.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tax Year</p>
                      <p>{selectedDocument.taxYear}</p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => setIsAIAnalyzerOpen(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze with AI
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Reminder Dialog */}
      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Tax Reminder</DialogTitle>
            <DialogDescription>
              Create a new reminder for an important tax deadline
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-title">Title</Label>
              <Input 
                id="reminder-title" 
                value={reminderData.title}
                onChange={(e) => setReminderData({...reminderData, title: e.target.value})}
                placeholder="Quarterly Tax Payment"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminder-description">Description</Label>
              <Textarea 
                id="reminder-description" 
                value={reminderData.description}
                onChange={(e) => setReminderData({...reminderData, description: e.target.value})}
                placeholder="Details about this tax deadline"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminder-due-date">Due Date</Label>
              <Input 
                id="reminder-due-date" 
                type="date" 
                value={reminderData.dueDate}
                onChange={(e) => setReminderData({...reminderData, dueDate: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminder-priority">Priority</Label>
              <Select 
                value={reminderData.priority}
                onValueChange={(value) => setReminderData({...reminderData, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminder-tax-year">Tax Year</Label>
              <Input 
                id="reminder-tax-year" 
                type="number" 
                value={reminderData.taxYear}
                onChange={(e) => setReminderData({...reminderData, taxYear: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addReminder}>
              Add Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Tax Scenario Dialog */}
      <Dialog open={isScenarioDialogOpen} onOpenChange={setIsScenarioDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Tax Scenario</DialogTitle>
            <DialogDescription>
              Create a "what-if" scenario to compare tax outcomes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="scenario-name">Scenario Name</Label>
              <Input 
                id="scenario-name" 
                value={scenarioData.name}
                onChange={(e) => setScenarioData({...scenarioData, name: e.target.value})}
                placeholder="Equipment Purchase Timing"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scenario-description">Description</Label>
              <Textarea 
                id="scenario-description" 
                value={scenarioData.description}
                onChange={(e) => setScenarioData({...scenarioData, description: e.target.value})}
                placeholder="Compare purchasing equipment this year vs. next year"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scenario-amount">Amount</Label>
              <Input 
                id="scenario-amount" 
                type="number" 
                value={scenarioData.baseAmount}
                onChange={(e) => setScenarioData({...scenarioData, baseAmount: parseFloat(e.target.value)})}
                placeholder="10000"
              />
              <p className="text-sm text-muted-foreground">The cost of the purchase or investment</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scenario-tax-rate">Tax Rate (%)</Label>
              <Input 
                id="scenario-tax-rate" 
                type="number" 
                step="0.01"
                value={scenarioData.deductionRate}
                onChange={(e) => setScenarioData({...scenarioData, deductionRate: parseFloat(e.target.value)})}
                placeholder="0.21"
              />
              <p className="text-sm text-muted-foreground">Your effective tax rate (e.g., 0.21 for 21%)</p>
            </div>
            
            <div className="space-y-2">
              <Label>Timing Option</Label>
              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="radio" 
                  id="this-year" 
                  name="timing" 
                  value="thisYear"
                  checked={scenarioData.timingOption === "thisYear"}
                  onChange={() => setScenarioData({...scenarioData, timingOption: "thisYear"})}
                  className="h-4 w-4"
                />
                <Label htmlFor="this-year" className="font-normal cursor-pointer">Purchase this year</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="next-year" 
                  name="timing" 
                  value="nextYear"
                  checked={scenarioData.timingOption === "nextYear"}
                  onChange={() => setScenarioData({...scenarioData, timingOption: "nextYear"})}
                  className="h-4 w-4"
                />
                <Label htmlFor="next-year" className="font-normal cursor-pointer">Purchase next year</Label>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-md mt-4">
              <h4 className="font-medium mb-2">Projected Tax Impact</h4>
              <p className="text-sm">
                {scenarioData.timingOption === "thisYear" 
                  ? `By purchasing this year, you may save approximately $${(scenarioData.baseAmount * scenarioData.deductionRate).toFixed(2)} in taxes.`
                  : `By delaying until next year, you'll defer the tax benefit of $${(scenarioData.baseAmount * scenarioData.deductionRate).toFixed(2)} until next year's tax return.`}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createTaxScenario}>
              Create Scenario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* AI Tax Categorizer Dialog */}
      <Dialog open={isAIAnalyzerOpen} onOpenChange={setIsAIAnalyzerOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>AI Transaction Categorizer</DialogTitle>
            <DialogDescription>
              Automatically categorize transactions for tax purposes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Upload receipts or transactions</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">
                  Drag and drop files or click to browse
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Select Files
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Or paste transaction details</Label>
              <Textarea 
                placeholder="Example: 'Office Depot - $156.75 - March 15, 2025 - Office supplies and printer ink'"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="rounded-md bg-slate-50 p-4">
              <h4 className="font-medium mb-2">How it works:</h4>
              <ol className="text-sm space-y-1 list-decimal pl-4">
                <li>Upload receipts, bank statements, or enter transaction details</li>
                <li>Our AI analyzes the data to identify tax categories</li>
                <li>Review the suggested categories and make adjustments if needed</li>
                <li>Save the categorized transactions to your tax items</li>
              </ol>
            </div>
          </div>
          <DialogFooter>
            <Button 
              disabled={false}
              onClick={() => {
                setIsAIAnalyzerOpen(false);
                toast({
                  title: "AI Categorization Complete",
                  description: "3 transactions were analyzed and categorized",
                });
              }}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze & Categorize
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}