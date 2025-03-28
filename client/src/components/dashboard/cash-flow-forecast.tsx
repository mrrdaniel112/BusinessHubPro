import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type CashFlowForecast = {
  forecast: number[];
  insight: string;
};

interface CashFlowForecastProps {
  data: CashFlowForecast;
  isLoading?: boolean;
}

export default function CashFlowForecast({ data, isLoading = false }: CashFlowForecastProps) {
  // Create chart data from forecast array
  const chartData = data.forecast.map((value, index) => {
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Calculate month for this point, starting from current month
    const monthIndex = (now.getMonth() + index) % 12;
    const monthName = monthNames[monthIndex];
    
    return {
      name: monthName,
      value: value,
      future: index > 0 // Only the first point is actual data, the rest is forecast
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Cash Flow Forecast</h3>
          <span className="text-xs text-gray-500">AI-Powered</span>
        </div>
        
        <div className="h-[220px] mt-4">
          {isLoading ? (
            <div className="w-full h-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
              <p className="text-gray-400">Loading forecast data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Cash Flow"]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <defs>
                  <linearGradient id="colorPast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorFuture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#16a34a" 
                  fillOpacity={1} 
                  fill="url(#colorPast)"
                  activeDot={{ r: 8 }}
                  name="Cash Flow"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    if (!payload.future) {
                      return (
                        <circle cx={cx} cy={cy} r={6} fill="#16a34a" stroke="white" strokeWidth={2} />
                      );
                    }
                    return (
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={5} 
                        fill="#f59e0b" 
                        stroke="white" 
                        strokeWidth={2} 
                        strokeDasharray="3,3"
                      />
                    );
                  }}
                  stroke={(props) => {
                    return props.payload.future ? "#f59e0b" : "#16a34a";
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="mt-3 text-sm text-gray-600 border-t pt-3">
          <p>
            <i className="ri-flashlight-line text-warning-500 mr-1"></i> 
            AI Insight: {data.insight}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
