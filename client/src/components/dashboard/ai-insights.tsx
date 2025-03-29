import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type Insight = {
  id: number;
  type: 'cash_flow' | 'revenue' | 'expense';
  title: string;
  content: string;
};

interface AiInsightsProps {
  insights: Insight[];
  isLoading?: boolean;
}

// Get icon and color based on insight type
const getInsightIcon = (type: string) => {
  switch (type) {
    case 'cash_flow':
      return "ri-lightbulb-flash-line text-xl text-warning-300";
    case 'revenue':
      return "ri-bar-chart-grouped-line text-xl text-success-300";
    case 'expense':
      return "ri-alarm-warning-line text-xl text-danger-300";
    default:
      return "ri-lightbulb-line text-xl text-gray-300";
  }
};

const InsightSkeleton = () => (
  <div className="p-4 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
    <div className="flex items-center">
      <div className="h-6 w-6 bg-gray-200 animate-pulse rounded-full"></div>
      <div className="ml-2 h-4 bg-gray-200 animate-pulse w-40 rounded"></div>
    </div>
    <div className="mt-2 h-12 bg-gray-200 animate-pulse rounded"></div>
  </div>
);

export default function AiInsights({ insights, isLoading = false }: AiInsightsProps) {
  return (
    <div className="bg-gradient-to-r from-primary-700 to-primary-900 shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center">
          <i className="ri-ai-generate text-2xl text-white"></i>
          <h3 className="ml-2 text-lg font-medium text-white">AI Business Insights</h3>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <InsightSkeleton key={index} />
            ))
          ) : insights.length > 0 ? (
            insights.map((insight) => (
              <div key={insight.id} className="p-4 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
                <div className="flex items-center">
                  <i className={getInsightIcon(insight.type)}></i>
                  <h4 className="ml-2 text-sm font-medium text-white">{insight.title}</h4>
                </div>
                <p className="mt-2 text-sm text-gray-200">{insight.content}</p>
              </div>
            ))
          ) : (
            <div className="p-4 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm col-span-3">
              <p className="text-sm text-gray-200 text-center">
                No insights available. Generate insights to see AI-powered recommendations here.
              </p>
            </div>
          )}
        </div>
        <div className="mt-6">
          <a href="/ai-insights">
            <Button variant="outline" className="text-primary-700 bg-white hover:bg-gray-100">
              View All AI Insights
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
