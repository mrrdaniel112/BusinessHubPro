import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type Transaction = {
  id: number;
  type: string; // 'income' or 'expense'
  amount: string | number;
  description: string;
  date: string | Date;
};

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const formatCurrency = (value: string | number) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

const formatDate = (dateStr: string | Date) => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const isIncome = transaction.type === 'income';
  
  return (
    <li className="px-5 py-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className={cn(
          "p-2 rounded-md",
          isIncome ? "bg-success-50" : "bg-danger-50"
        )}>
          <i className={cn(
            isIncome ? "ri-arrow-down-line text-success-600" : "ri-arrow-up-line text-danger-600"
          )}></i>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
          <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
        </div>
      </div>
      <div className={cn(
        "text-sm font-medium",
        isIncome ? "text-success-600" : "text-danger-600"
      )}>
        {isIncome ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </div>
    </li>
  );
};

const TransactionSkeleton = () => (
  <li className="px-5 py-4 flex items-center justify-between">
    <div className="flex items-center">
      <div className="p-2 rounded-md bg-gray-200 animate-pulse w-8 h-8"></div>
      <div className="ml-3">
        <div className="h-4 bg-gray-200 animate-pulse w-36 mb-2 rounded"></div>
        <div className="h-3 bg-gray-200 animate-pulse w-24 rounded"></div>
      </div>
    </div>
    <div className="h-4 bg-gray-200 animate-pulse w-20 rounded"></div>
  </li>
);

export default function RecentTransactions({ transactions, isLoading = false }: RecentTransactionsProps) {
  return (
    <Card className="h-full">
      <CardHeader className="px-5 py-4 border-b border-gray-200 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium leading-6 text-gray-900">Recent Transactions</CardTitle>
        <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</a>
      </CardHeader>
      <CardContent className="p-0 bg-gray-50">
        <ul role="list" className="divide-y divide-gray-200">
          {isLoading ? (
            Array(4).fill(0).map((_, index) => (
              <TransactionSkeleton key={index} />
            ))
          ) : transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <li className="px-5 py-4 text-center text-gray-500">
              No transactions found
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
