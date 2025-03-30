
import { storage } from "../storage";

export async function generateFinancialReports(userId: number) {
  const transactions = await storage.getTransactions(userId);
  const invoices = await storage.getInvoices(userId);
  
  // Calculate profit & loss
  const revenue = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const netIncome = revenue - expenses;

  // Simplified balance sheet
  const assets = revenue;
  const liabilities = expenses;
  const equity = assets - liabilities;

  // Cash flow calculation
  const operating = netIncome;
  const investing = 0; // Add investment tracking
  const financing = 0; // Add financing tracking

  return {
    profitLoss: { revenue, expenses, netIncome },
    balanceSheet: { assets, liabilities, equity },
    cashFlow: { operating, investing, financing }
  };
}
