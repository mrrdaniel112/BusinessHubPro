import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AiInsight } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AiInsights() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const { toast } = useToast();

  const { data: insights = [], isLoading } = useQuery<AiInsight[]>({
    queryKey: ['/api/ai-insights'],
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/ai-insights/generate', {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-insights'] });
      toast({
        title: "Success",
        description: "New insights have been generated!",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (insightId: number) => {
      const res = await apiRequest('PATCH', `/api/ai-insights/${insightId}/read`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-insights'] });
    }
  });

  // Filter insights based on search term and active tab
  const filteredInsights = insights.filter(insight => {
    const matchesSearch = 
      insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = activeTab === 'all' || insight.type === activeTab;
    
    return matchesSearch && matchesType;
  });

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'cash_flow':
        return "ri-money-dollar-circle-line text-warning-600";
      case 'revenue':
        return "ri-line-chart-line text-success-600";
      case 'expense':
        return "ri-shopping-bag-line text-danger-600";
      default:
        return "ri-lightbulb-line text-primary-600";
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'cash_flow':
        return "bg-warning-50";
      case 'revenue':
        return "bg-success-50";
      case 'expense':
        return "bg-danger-50";
      default:
        return "bg-primary-50";
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-semibold text-gray-900">AI-Powered Insights</h1>
          <Button 
            onClick={() => generateInsightsMutation.mutate()}
            disabled={generateInsightsMutation.isPending}
          >
            {generateInsightsMutation.isPending ? (
              <i className="ri-loader-4-line animate-spin mr-1"></i>
            ) : (
              <i className="ri-brain-line mr-1"></i>
            )}
            Generate New Insights
          </Button>
        </div>
      </div>

      {/* Insight stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-lg p-6 text-white">
          <div className="flex items-center mb-4">
            <i className="ri-ai-generate text-2xl"></i>
            <h2 className="text-lg font-medium ml-2">How AI Helps Your Business</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center">
                <i className="ri-line-chart-line text-xl text-warning-300"></i>
                <h3 className="text-sm font-medium ml-2">Financial Analysis</h3>
              </div>
              <p className="mt-2 text-sm text-gray-200">
                Get detailed analysis of your financial data with trends and forecasts to help make better decisions.
              </p>
            </div>
            <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center">
                <i className="ri-lightbulb-flash-line text-xl text-success-300"></i>
                <h3 className="text-sm font-medium ml-2">Business Opportunities</h3>
              </div>
              <p className="mt-2 text-sm text-gray-200">
                Identify potential growth opportunities and revenue streams based on your business patterns.
              </p>
            </div>
            <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center">
                <i className="ri-alert-line text-xl text-danger-300"></i>
                <h3 className="text-sm font-medium ml-2">Risk Detection</h3>
              </div>
              <p className="mt-2 text-sm text-gray-200">
                Get alerts about potential risks and recommendations on how to mitigate them.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights list */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8 mb-8">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 items-start sm:items-center justify-between">
            <CardTitle>Business Insights</CardTitle>
            <Input
              type="search"
              placeholder="Search insights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="cash_flow">Cash Flow</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="expense">Expenses</TabsTrigger>
              </TabsList>
              
              <div>
                {isLoading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="w-full h-40 bg-gray-100 animate-pulse rounded-md"></div>
                    ))}
                  </div>
                ) : filteredInsights.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredInsights.map((insight) => (
                      <Card key={insight.id} className={`${!insight.isRead ? 'border-primary-200' : ''}`}>
                        <CardContent className="p-0">
                          <div className="p-4 border-b">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <div className={`p-2 rounded-md ${getInsightColor(insight.type)}`}>
                                  <i className={`${getInsightIcon(insight.type)}`}></i>
                                </div>
                                <h3 className="font-medium ml-2">{insight.title}</h3>
                              </div>
                              {!insight.isRead && (
                                <Badge variant="outline" className="bg-primary-50">New</Badge>
                              )}
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="text-sm text-gray-500 mb-2">
                              Generated on {formatDate(insight.createdAt)}
                            </div>
                            <p className="text-gray-700">
                              {insight.content}
                            </p>
                          </div>
                        </CardContent>
                        {!insight.isRead && (
                          <CardFooter className="flex justify-end p-4 pt-0 border-t mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => markAsReadMutation.mutate(insight.id)}
                              disabled={markAsReadMutation.isPending}
                            >
                              Mark as Read
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="ri-brain-line text-4xl text-gray-300"></i>
                    <p className="mt-2 text-gray-500">No insights found</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => generateInsightsMutation.mutate()}
                      disabled={generateInsightsMutation.isPending}
                    >
                      Generate Insights
                    </Button>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
