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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function PredictiveAnalytics() {
  const [timeframe, setTimeframe] = useState("6m");
  const [metric, setMetric] = useState("revenue");

  // Mock data - replace with real API calls
  const { data: predictions } = useQuery({
    queryKey: ["predictions", timeframe, metric],
    queryFn: async () => {
      // Simulate API call
      return {
        revenue: Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
          actual: Math.random() * 100000,
          predicted: Math.random() * 100000,
          confidence: Math.random() * 0.3 + 0.7
        })),
        customers: Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
          actual: Math.random() * 1000,
          predicted: Math.random() * 1000,
          confidence: Math.random() * 0.3 + 0.7
        }))
      };
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Predictive Analytics</h1>
          <p className="text-gray-500">AI-powered insights and forecasts</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="2y">Last 2 years</SelectItem>
            </SelectContent>
          </Select>
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="customers">Customers</SelectItem>
              <SelectItem value="conversion">Conversion Rate</SelectItem>
              <SelectItem value="churn">Churn Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
                <CardDescription>Next 3 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1.2M</div>
                <p className="text-green-500 text-sm">+12.5% vs last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>Next 3 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+245</div>
                <p className="text-green-500 text-sm">+8.3% vs last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate</CardTitle>
                <CardDescription>Next 3 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2%</div>
                <p className="text-red-500 text-sm">-0.5% vs last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Churn Rate</CardTitle>
                <CardDescription>Next 3 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.1%</div>
                <p className="text-green-500 text-sm">-0.3% vs last period</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
              <CardDescription>Historical data and predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <LineChart
                  width={800}
                  height={400}
                  data={predictions?.revenue || []}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Actual" />
                  <Line type="monotone" dataKey="predicted" stroke="#82ca9d" name="Predicted" />
                </LineChart>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>Key findings and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800">Positive Trends</h3>
                <ul className="mt-2 space-y-2">
                  <li>• Customer acquisition cost has decreased by 15%</li>
                  <li>• Customer lifetime value increased by 22%</li>
                  <li>• Website conversion rate improved by 8%</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-800">Areas for Improvement</h3>
                <ul className="mt-2 space-y-2">
                  <li>• Consider optimizing mobile checkout process</li>
                  <li>• Review pricing strategy for premium features</li>
                  <li>• Enhance customer support response time</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800">Recommendations</h3>
                <ul className="mt-2 space-y-2">
                  <li>• Implement targeted email campaigns</li>
                  <li>• Focus on upselling to existing customers</li>
                  <li>• Invest in customer success program</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Detection</CardTitle>
              <CardDescription>Unusual patterns and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-semibold text-red-800">Detected Anomalies</h3>
                  <ul className="mt-2 space-y-2">
                    <li>• Unusual spike in customer churn rate (March 2024)</li>
                    <li>• Significant drop in conversion rate (February 2024)</li>
                    <li>• Unexpected increase in support tickets (January 2024)</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800">Correlation Analysis</h3>
                  <ul className="mt-2 space-y-2">
                    <li>• Strong correlation between support response time and churn rate</li>
                    <li>• Positive correlation between customer satisfaction and revenue</li>
                    <li>• Negative correlation between pricing changes and conversion rate</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 