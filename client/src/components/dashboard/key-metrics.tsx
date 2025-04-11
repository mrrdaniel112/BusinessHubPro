import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MetricData = {
  revenue: {
    value: number;
    change: number;
  };
  expenses: {
    value: number;
    change: number;
  };
  profit: {
    value: number;
    change: number;
  };
  inventory: {
    total: number;
    lowStock: number;
  };
};

interface KeyMetricsProps {
  data: MetricData;
  isLoading?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const MetricCard = ({ 
  icon, 
  bgColor, 
  iconColor, 
  title, 
  value, 
  change, 
  footer,
  isLoading
}: { 
  icon: string; 
  bgColor: string; 
  iconColor: string; 
  title: string; 
  value: string | number; 
  change?: number; 
  footer?: React.ReactNode;
  isLoading?: boolean;
}) => (
  <Card className="overflow-hidden shadow-md border-2 border-gray-100 hover:border-gray-200 transition-all duration-200">
    <CardContent className="p-0">
      <div className="p-6">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 p-4 rounded-md shadow", bgColor)}>
            <i className={cn(`ri-${icon} text-2xl`, iconColor)}></i>
          </div>
          <div className="ml-6 w-0 flex-1">
            <dl>
              <dt className="text-base font-medium text-gray-600 truncate mb-1">{title}</dt>
              <dd>
                {isLoading ? (
                  <div className="h-8 w-28 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <div className="text-2xl font-bold text-gray-900">{value}</div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {(change !== undefined || footer) && (
        <div className="bg-gray-50 border-t-2 border-gray-100 px-6 py-4">
          {isLoading ? (
            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
          ) : change !== undefined ? (
            <div className="text-sm font-medium">
              <span className={cn(
                "font-bold text-base",
                change >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(0)}%
              </span>
              <span className="text-gray-600 ml-2">from last period</span>
            </div>
          ) : (
            footer
          )}
        </div>
      )}
    </CardContent>
  </Card>
);

export default function KeyMetrics({ data, isLoading = false }: KeyMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon="money-dollar-circle-line"
        bgColor="bg-primary-50"
        iconColor="text-primary-600"
        title="Revenue"
        value={isLoading ? "" : formatCurrency(data.revenue.value)}
        change={data.revenue.change}
        isLoading={isLoading}
      />
      
      <MetricCard
        icon="shopping-bag-line"
        bgColor="bg-danger-50"
        iconColor="text-danger-600"
        title="Expenses"
        value={isLoading ? "" : formatCurrency(data.expenses.value)}
        change={data.expenses.change}
        isLoading={isLoading}
      />
      
      <MetricCard
        icon="line-chart-line"
        bgColor="bg-success-50"
        iconColor="text-success-600"
        title="Profit"
        value={isLoading ? "" : formatCurrency(data.profit.value)}
        change={data.profit.change}
        isLoading={isLoading}
      />
      
      <MetricCard
        icon="store-2-line"
        bgColor="bg-warning-50"
        iconColor="text-warning-600"
        title="Inventory Items"
        value={isLoading ? "" : data.inventory.total}
        footer={
          <div className="text-sm">
            <span className="font-medium text-warning-600">◆ {data.inventory.lowStock}</span>
            <span className="text-gray-500 ml-2">low stock items</span>
          </div>
        }
        isLoading={isLoading}
      />
    </div>
  );
}
