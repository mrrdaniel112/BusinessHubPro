import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DateRangeType = "day" | "week" | "month";

interface DateFilterProps {
  onRangeChange?: (range: DateRangeType) => void;
}

export default function DateFilter({ onRangeChange }: DateFilterProps) {
  const [selectedRange, setSelectedRange] = useState<DateRangeType>("week");
  
  const handleRangeChange = (range: DateRangeType) => {
    setSelectedRange(range);
    if (onRangeChange) {
      onRangeChange(range);
    }
  };
  
  // Calculate date range display
  const getDateRangeDisplay = () => {
    const today = new Date();
    let startDate = new Date();
    
    if (selectedRange === "day") {
      return today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (selectedRange === "week") {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
    } else if (selectedRange === "month") {
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
    }
    
    const startFormatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endFormatted = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  return (
    <div className="flex flex-wrap gap-4 justify-between items-center">
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <button
          type="button"
          className={cn(
            "px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-primary-500",
            selectedRange === "day"
              ? "text-gray-900 bg-primary-50"
              : "text-primary-600 bg-white"
          )}
          onClick={() => handleRangeChange("day")}
        >
          Day
        </button>
        <button
          type="button"
          className={cn(
            "px-4 py-2 text-sm font-medium border-t border-b border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-primary-500",
            selectedRange === "week"
              ? "text-gray-900 bg-primary-50"
              : "text-gray-500 bg-white"
          )}
          onClick={() => handleRangeChange("week")}
        >
          Week
        </button>
        <button
          type="button"
          className={cn(
            "px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-primary-500",
            selectedRange === "month"
              ? "text-gray-900 bg-primary-50"
              : "text-gray-500 bg-white"
          )}
          onClick={() => handleRangeChange("month")}
        >
          Month
        </button>
      </div>
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center"
        >
          <i className="ri-calendar-line mr-2"></i>
          {getDateRangeDisplay()}
        </Button>
      </div>
    </div>
  );
}
