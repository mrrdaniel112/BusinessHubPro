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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart2, TrendingDown, TrendingUp, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export default function InventoryCostAnalysis() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Placeholder for inventory costs data
  const { data: inventoryCosts, isLoading: isLoadingCosts } = useQuery({
    queryKey: ["/api/inventory-costs"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/inventory-costs");
        if (!res.ok) throw new Error("Failed to fetch inventory costs");
        return res.json();
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load inventory cost data. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Inventory Cost Analysis</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Cost Entry
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Item Costs</TabsTrigger>
          <TabsTrigger value="trends">Cost Trends</TabsTrigger>
          <TabsTrigger value="optimization">Cost Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$87,354.22</div>
                <p className="text-xs text-muted-foreground">
                  +5.2% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Item Cost</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$34.58</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost Reduction Opportunities</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$5,245.00</div>
                <p className="text-xs text-muted-foreground">
                  6% of total inventory value
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Distribution by Category</CardTitle>
              <CardDescription>
                View how inventory costs are distributed across categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Raw Materials</span>
                  <span className="text-sm font-medium">$32,450.75 (37.1%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "37.1%" }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Work in Progress</span>
                  <span className="text-sm font-medium">$18,329.45 (21.0%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "21.0%" }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Finished Goods</span>
                  <span className="text-sm font-medium">$28,574.02 (32.7%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: "32.7%" }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Packaging Materials</span>
                  <span className="text-sm font-medium">$8,000.00 (9.2%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-orange-600 h-2.5 rounded-full" style={{ width: "9.2%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Item Cost Analysis</CardTitle>
                  <CardDescription>
                    View and manage inventory item costs.
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="raw">Raw Materials</SelectItem>
                      <SelectItem value="wip">Work in Progress</SelectItem>
                      <SelectItem value="finished">Finished Goods</SelectItem>
                      <SelectItem value="packaging">Packaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCosts ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Cost Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Steel Sheets</TableCell>
                      <TableCell>Raw Materials</TableCell>
                      <TableCell>$12.45</TableCell>
                      <TableCell>1,250</TableCell>
                      <TableCell>$15,562.50</TableCell>
                      <TableCell className="text-green-600">↗ 2.3%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Aluminum Framing</TableCell>
                      <TableCell>Raw Materials</TableCell>
                      <TableCell>$8.75</TableCell>
                      <TableCell>950</TableCell>
                      <TableCell>$8,312.50</TableCell>
                      <TableCell className="text-red-600">↘ 1.5%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Partial Assembly A</TableCell>
                      <TableCell>Work in Progress</TableCell>
                      <TableCell>$28.30</TableCell>
                      <TableCell>215</TableCell>
                      <TableCell>$6,084.50</TableCell>
                      <TableCell className="text-green-600">↗ 0.8%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Model X500</TableCell>
                      <TableCell>Finished Goods</TableCell>
                      <TableCell>$124.99</TableCell>
                      <TableCell>85</TableCell>
                      <TableCell>$10,624.15</TableCell>
                      <TableCell className="text-green-600">↗ 3.2%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Premium Packaging</TableCell>
                      <TableCell>Packaging</TableCell>
                      <TableCell>$2.35</TableCell>
                      <TableCell>1,500</TableCell>
                      <TableCell>$3,525.00</TableCell>
                      <TableCell className="text-red-600">↘ 0.7%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Trends</CardTitle>
              <CardDescription>
                Analyze how inventory costs have changed over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <h3 className="mb-2 text-lg font-medium">Cost Trends Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're currently working on implementing cost trend analysis.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Optimization</CardTitle>
              <CardDescription>
                Identify opportunities to reduce inventory costs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <h3 className="mb-2 text-lg font-medium">Cost Optimization Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're currently working on implementing cost optimization tools.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}