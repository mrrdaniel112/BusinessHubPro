import { useState } from "react";
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

export default function BudgetPlanning() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

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

  const handleCreateBudget = () => {
    toast({
      title: "Create Budget",
      description: "Budget creation feature is coming soon.",
    });
  };

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
              <CardTitle>Budget Planning</CardTitle>
              <CardDescription>
                Plan and allocate future budgets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <h3 className="mb-2 text-lg font-medium">Planning Feature Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're currently working on implementing the budget planning tools.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Reports</CardTitle>
              <CardDescription>
                Generate and view budget reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <h3 className="mb-2 text-lg font-medium">Reports Feature Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're currently working on implementing budget reports.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}