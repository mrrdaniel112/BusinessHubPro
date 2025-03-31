import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, DollarSign, TrendingUp, Plus, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Sparkles, Loader2 } from "lucide-react";

interface BudgetCategory {
  id: number;
  name: string;
  planned: number;
  actual: number;
}

export default function BudgetPlanning() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', planned: '' });
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // Placeholder for budgets data
  const { data: budgets, isLoading: isLoadingBudgets } = useQuery({
    queryKey: ["/api/budgets"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/budgets");
        if (!res.ok) throw new Error("Failed to fetch budgets");
        return res.json();
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load budgets. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      const response = await fetch('/api/budgets/current');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      } else {
        // If API not implemented, use sample data
        setCategories([
          { id: 1, name: "Operations", planned: 45000, actual: 18500 },
          { id: 2, name: "Marketing", planned: 30000, actual: 12750 },
          { id: 3, name: "Product Development", planned: 25000, actual: 8600 },
          { id: 4, name: "Human Resources", planned: 20000, actual: 2500 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
      // Use sample data if API fails
      setCategories([
        { id: 1, name: "Operations", planned: 45000, actual: 18500 },
        { id: 2, name: "Marketing", planned: 30000, actual: 12750 },
        { id: 3, name: "Product Development", planned: 25000, actual: 8600 },
        { id: 4, name: "Human Resources", planned: 20000, actual: 2500 }
      ]);
    }
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    amount: '',
    type: 'operational',
    department: '',
    purpose: '',
    hasEndDate: true,
    status: 'planning',
    recurring: false,
    recurrenceInterval: 'monthly',
    categories: [
      { name: 'Staffing', percentage: 40, amount: 0 },
      { name: 'Facilities', percentage: 25, amount: 0 },
      { name: 'Equipment', percentage: 20, amount: 0 },
      { name: 'Miscellaneous', percentage: 15, amount: 0 }
    ]
  });
  const [isCreatingWithAI, setIsCreatingWithAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  
  const handleCreateBudget = () => {
    setIsCreateModalOpen(true);
  };
  
  const generateBudgetWithAI = async () => {
    setIsCreatingWithAI(true);
    
    try {
      // Simulating AI response for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiGeneratedBudget = {
        name: 'Q2 2025 Operations Budget',
        description: 'Quarterly budget for all operational expenses including office supplies, utilities, and staff resources.',
        startDate: '2025-04-01',
        endDate: '2025-06-30',
        amount: '55000',
        type: 'operational',
        department: 'Operations',
        purpose: 'Maintain essential operations for Q2 2025',
        hasEndDate: true,
        status: 'planning',
        recurring: false,
        recurrenceInterval: 'monthly',
        categories: [
          { name: 'Staffing', percentage: 40, amount: 22000 },
          { name: 'Facilities', percentage: 25, amount: 13750 },
          { name: 'Equipment', percentage: 20, amount: 11000 },
          { name: 'Miscellaneous', percentage: 15, amount: 8250 }
        ]
      };
      
      setNewBudget(aiGeneratedBudget);
      setAiSuggestion(`I've analyzed your previous budgets and financial patterns, and I recommend a quarterly operations budget of $55,000, which is a 10% increase from Q1 due to anticipated cost increases in utilities and office supplies. This budget allocates 40% to staffing, 25% to facilities, 20% to equipment, and 15% to miscellaneous operational expenses.`);
    } catch (error) {
      console.error('Error generating budget with AI:', error);
      toast({
        title: "AI Generation Failed",
        description: "Could not generate budget with AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingWithAI(false);
    }
  };
  
  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation
    if (!newBudget.name || !newBudget.amount || !newBudget.startDate || (newBudget.hasEndDate && !newBudget.endDate)) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Show loading toast
    toast({
      title: "Creating budget...",
      description: "Your new budget is being saved.",
    });
    
    try {
      // Call API (simulated success for now)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success toast
      toast({
        title: "Budget Created",
        description: "Your new budget has been created successfully.",
      });
      
      // Close modal and reset form
      setIsCreateModalOpen(false);
      setNewBudget({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        amount: '',
        type: 'operational',
        department: '',
        purpose: '',
        hasEndDate: true,
        status: 'planning',
        recurring: false,
        recurrenceInterval: 'monthly',
        categories: [
          { name: 'Staffing', percentage: 40, amount: 0 },
          { name: 'Facilities', percentage: 25, amount: 0 },
          { name: 'Equipment', percentage: 20, amount: 0 },
          { name: 'Miscellaneous', percentage: 15, amount: 0 }
        ]
      });
      
      // Refresh budget data
      fetchBudgetData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create budget. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = async () => {
    // Validate inputs
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!newCategory.planned || parseFloat(newCategory.planned) <= 0) {
      toast({
        title: "Error",
        description: "Planned amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/budget-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.name,
          planned: parseFloat(newCategory.planned)
        })
      });

      if (response.ok) {
        fetchBudgetData();
        setNewCategory({ name: '', planned: '' });
        toast({
          title: "Success",
          description: `${newCategory.name} category added successfully.`,
        });
      } else {
        // If the API endpoint isn't implemented, add the category locally
        const newCategoryObj = {
          id: categories.length + 1,
          name: newCategory.name,
          planned: parseFloat(newCategory.planned),
          actual: 0,
        };
        
        setCategories([...categories, newCategoryObj]);
        setNewCategory({ name: '', planned: '' });
        
        toast({
          title: "Success",
          description: `${newCategory.name} category added successfully.`,
        });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      
      // If the API endpoint fails, add the category locally
      const newCategoryObj = {
        id: categories.length + 1,
        name: newCategory.name,
        planned: parseFloat(newCategory.planned),
        actual: 0,
      };
      
      setCategories([...categories, newCategoryObj]);
      setNewCategory({ name: '', planned: '' });
      
      toast({
        title: "Success",
        description: `${newCategory.name} category added successfully.`,
      });
    }
  };

  const chartData = categories.map(cat => ({
    name: cat.name,
    planned: cat.planned,
    actual: cat.actual
  }));

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Budget Planning</h2>
        <Button onClick={handleCreateBudget}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Budget
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$120,000.00</div>
                <p className="text-xs text-muted-foreground">
                  For fiscal year 2025
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Spent To Date</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$42,350.75</div>
                <p className="text-xs text-muted-foreground">
                  35.3% of total budget
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$77,649.25</div>
                <p className="text-xs text-muted-foreground">
                  64.7% remaining
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">
                  Across 8 departments
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
              <CardDescription>
                Track your budget allocation and spending by category.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium">Operations</div>
                    <div className="text-sm text-muted-foreground">
                      $18,500 / $45,000
                    </div>
                  </div>
                  <Progress value={41} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium">Marketing</div>
                    <div className="text-sm text-muted-foreground">
                      $12,750 / $30,000
                    </div>
                  </div>
                  <Progress value={42.5} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium">Product Development</div>
                    <div className="text-sm text-muted-foreground">
                      $8,600 / $25,000
                    </div>
                  </div>
                  <Progress value={34.4} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium">Human Resources</div>
                    <div className="text-sm text-muted-foreground">
                      $2,500 / $20,000
                    </div>
                  </div>
                  <Progress value={12.5} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget List</CardTitle>
              <CardDescription>
                View and manage all your budgets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBudgets ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : budgets?.length > 0 ? (
                <div className="space-y-4">
                  {/* Budget cards would go here */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Q1 2025 Operations Budget</h3>
                        <p className="text-sm text-muted-foreground">Jan 1 - Mar 31, 2025</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">$45,000.00</p>
                        <div className="flex items-center">
                          <Progress value={41} className="h-2 w-24 mr-2" />
                          <span className="text-sm">41%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">2025 Marketing Budget</h3>
                        <p className="text-sm text-muted-foreground">Annual</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">$30,000.00</p>
                        <div className="flex items-center">
                          <Progress value={42.5} className="h-2 w-24 mr-2" />
                          <span className="text-sm">42.5%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <h3 className="mb-2 text-lg font-medium">No Budgets Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first budget to start tracking your spending.
                  </p>
                  <Button onClick={handleCreateBudget}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Budget
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Categories</CardTitle>
              <CardDescription>Add and manage budget categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Category name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Planned amount"
                    value={newCategory.planned}
                    onChange={(e) => setNewCategory({ ...newCategory, planned: e.target.value })}
                  />
                  <Button onClick={handleAddCategory}>Add Category</Button>
                </div>

                <div className="mt-6">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Category</th>
                        <th className="text-right">Planned</th>
                        <th className="text-right">Actual</th>
                        <th className="text-right">Variance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.id}>
                          <td>{category.name}</td>
                          <td className="text-right">${category.planned.toFixed(2)}</td>
                          <td className="text-right">${category.actual.toFixed(2)}</td>
                          <td className="text-right">
                            ${(category.planned - category.actual).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
              <CardDescription>Compare planned budget with actual spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="planned" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="actual" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Budget Creation Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Budget</DialogTitle>
            <DialogDescription>
              Create a new budget to track your expenses and financial goals.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleBudgetSubmit} className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium">Budget Details</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateBudgetWithAI}
                disabled={isCreatingWithAI}
                className="flex items-center gap-1"
              >
                {isCreatingWithAI ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate with AI</span>
                  </>
                )}
              </Button>
            </div>
            
            {aiSuggestion && (
              <div className="bg-muted p-3 rounded-lg mb-4 text-sm">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 mt-1 text-primary" />
                  <div>
                    <h5 className="font-medium mb-1">AI Suggestion</h5>
                    <p>{aiSuggestion}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Budget Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  placeholder="Q2 2025 Marketing Budget"
                  value={newBudget.name}
                  onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department <span className="text-destructive">*</span></Label>
                <Select 
                  value={newBudget.department} 
                  onValueChange={(value) => setNewBudget({ ...newBudget, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="product">Product Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date <span className="text-destructive">*</span></Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newBudget.startDate}
                  onChange={(e) => setNewBudget({ ...newBudget, startDate: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="endDate">End Date {newBudget.hasEndDate && <span className="text-destructive">*</span>}</Label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="hasEndDate" 
                      className="rounded border-gray-300" 
                      checked={newBudget.hasEndDate}
                      onChange={(e) => setNewBudget({ ...newBudget, hasEndDate: e.target.checked })}
                    />
                    <Label htmlFor="hasEndDate" className="text-sm">Has End Date</Label>
                  </div>
                </div>
                <Input
                  id="endDate"
                  type="date"
                  value={newBudget.endDate}
                  onChange={(e) => setNewBudget({ ...newBudget, endDate: e.target.value })}
                  required={newBudget.hasEndDate}
                  disabled={!newBudget.hasEndDate}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Total Amount <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">$</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="25000"
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                    className="pl-7"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Budget Type <span className="text-destructive">*</span></Label>
                <Select 
                  value={newBudget.type} 
                  onValueChange={(value) => setNewBudget({ ...newBudget, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="capital">Capital</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="periodic">Periodic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purpose">Budget Purpose</Label>
                  <Input
                    id="purpose"
                    placeholder="What is this budget for? (e.g., Office Supplies, Team Events)"
                    value={newBudget.purpose}
                    onChange={(e) => setNewBudget({ ...newBudget, purpose: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose and scope of this budget"
                  value={newBudget.description}
                  onChange={(e) => setNewBudget({ ...newBudget, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="recurring" 
                      className="rounded border-gray-300" 
                      checked={newBudget.recurring}
                      onChange={(e) => setNewBudget({ ...newBudget, recurring: e.target.checked })}
                    />
                    <Label htmlFor="recurring">Recurring Budget</Label>
                  </div>
                </div>
                
                {newBudget.recurring && (
                  <div className="space-y-2">
                    <Label htmlFor="recurrenceInterval">Recurrence Interval</Label>
                    <Select 
                      value={newBudget.recurrenceInterval} 
                      onValueChange={(value) => setNewBudget({ ...newBudget, recurrenceInterval: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-medium">Category Breakdown</h4>
                <div className="border rounded-md p-4">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-sm font-medium">Category</th>
                        <th className="text-center text-sm font-medium">Percentage</th>
                        <th className="text-right text-sm font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newBudget.categories.map((category, index) => {
                        // Calculate amount based on percentage and total budget
                        const amount = newBudget.amount ? (parseFloat(newBudget.amount) * category.percentage / 100) : 0;
                        
                        return (
                          <tr key={index}>
                            <td className="py-2">
                              <Input 
                                value={category.name} 
                                onChange={(e) => {
                                  const updatedCategories = [...newBudget.categories];
                                  updatedCategories[index].name = e.target.value;
                                  setNewBudget({...newBudget, categories: updatedCategories});
                                }}
                              />
                            </td>
                            <td className="py-2 px-2">
                              <Input 
                                type="number"
                                min="0"
                                max="100"
                                value={category.percentage} 
                                onChange={(e) => {
                                  const updatedCategories = [...newBudget.categories];
                                  updatedCategories[index].percentage = parseFloat(e.target.value);
                                  setNewBudget({...newBudget, categories: updatedCategories});
                                }}
                                className="text-center"
                              />
                            </td>
                            <td className="py-2 text-right">
                              ${amount.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td colSpan={2} className="text-right pt-4 font-medium">Total:</td>
                        <td className="text-right pt-4 font-medium">
                          ${newBudget.amount ? parseFloat(newBudget.amount).toFixed(2) : '0.00'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Budget</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}