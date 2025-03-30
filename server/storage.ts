import {
  users, User, InsertUser,
  transactions, Transaction, InsertTransaction,
  inventoryItems, InventoryItem, InsertInventoryItem,
  contracts, Contract, InsertContract,
  receipts, Receipt, InsertReceipt,
  invoices, Invoice, InsertInvoice,
  aiInsights, AiInsight, InsertAiInsight,
  // New schemas
  taxItems, TaxItem, InsertTaxItem,
  payrollItems, PayrollItem, InsertPayrollItem,
  timeEntries, TimeEntry, InsertTimeEntry,
  bankAccounts, BankAccount, InsertBankAccount,
  bankTransactions, BankTransaction, InsertBankTransaction,
  budgets, Budget, InsertBudget,
  budgetCategories, BudgetCategory, InsertBudgetCategory,
  inventoryCosts, InventoryCost, InsertInventoryCost
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transactions
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Inventory
  getInventoryItems(userId: number): Promise<InventoryItem[]>;
  getInventoryItemById(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  
  // Contracts
  getContracts(userId: number): Promise<Contract[]>;
  getContractById(id: number): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: number, contract: Partial<InsertContract>): Promise<Contract | undefined>;
  
  // Receipts
  getReceipts(userId: number): Promise<Receipt[]>;
  getReceiptById(id: number): Promise<Receipt | undefined>;
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  
  // Invoices
  getInvoices(userId: number): Promise<Invoice[]>;
  getInvoiceById(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  
  // AI Insights
  getAiInsights(userId: number): Promise<AiInsight[]>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  markAiInsightAsRead(id: number): Promise<AiInsight | undefined>;
  
  // Tax Management
  getTaxItems(userId: number): Promise<TaxItem[]>;
  getTaxItemById(id: number): Promise<TaxItem | undefined>;
  createTaxItem(item: InsertTaxItem): Promise<TaxItem>;
  updateTaxItem(id: number, item: Partial<InsertTaxItem>): Promise<TaxItem | undefined>;
  getTaxItemsByYear(userId: number, year: number): Promise<TaxItem[]>;
  
  // Payroll Processing
  getPayrollItems(userId: number): Promise<PayrollItem[]>;
  getPayrollItemById(id: number): Promise<PayrollItem | undefined>;
  createPayrollItem(item: InsertPayrollItem): Promise<PayrollItem>;
  updatePayrollItem(id: number, item: Partial<InsertPayrollItem>): Promise<PayrollItem | undefined>;
  getPayrollItemsByEmployee(userId: number, employeeId: string): Promise<PayrollItem[]>;
  getPayrollItemsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<PayrollItem[]>;
  
  // Time Tracking
  getTimeEntries(userId: number): Promise<TimeEntry[]>;
  getTimeEntryById(id: number): Promise<TimeEntry | undefined>;
  createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, entry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined>;
  getTimeEntriesByProject(userId: number, projectId: string): Promise<TimeEntry[]>;
  getTimeEntriesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<TimeEntry[]>;
  
  // Bank Reconciliation
  getBankAccounts(userId: number): Promise<BankAccount[]>;
  getBankAccountById(id: number): Promise<BankAccount | undefined>;
  createBankAccount(account: InsertBankAccount): Promise<BankAccount>;
  updateBankAccount(id: number, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined>;
  
  getBankTransactions(userId: number, bankAccountId: number): Promise<BankTransaction[]>;
  getBankTransactionById(id: number): Promise<BankTransaction | undefined>;
  createBankTransaction(transaction: InsertBankTransaction): Promise<BankTransaction>;
  updateBankTransaction(id: number, transaction: Partial<InsertBankTransaction>): Promise<BankTransaction | undefined>;
  markTransactionReconciled(id: number, matchedTransactionId?: number): Promise<BankTransaction | undefined>;
  
  // Budget Planning
  getBudgets(userId: number): Promise<Budget[]>;
  getBudgetById(id: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  
  getBudgetCategories(budgetId: number): Promise<BudgetCategory[]>;
  getBudgetCategoryById(id: number): Promise<BudgetCategory | undefined>;
  createBudgetCategory(category: InsertBudgetCategory): Promise<BudgetCategory>;
  updateBudgetCategory(id: number, category: Partial<InsertBudgetCategory>): Promise<BudgetCategory | undefined>;
  
  // Inventory Cost Analysis
  getInventoryCosts(userId: number): Promise<InventoryCost[]>;
  getInventoryCostById(id: number): Promise<InventoryCost | undefined>;
  createInventoryCost(cost: InsertInventoryCost): Promise<InventoryCost>;
  updateInventoryCost(id: number, cost: Partial<InsertInventoryCost>): Promise<InventoryCost | undefined>;
  getInventoryCostsByItem(userId: number, inventoryItemId: number): Promise<InventoryCost[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private inventoryItems: Map<number, InventoryItem>;
  private contracts: Map<number, Contract>;
  private receipts: Map<number, Receipt>;
  private invoices: Map<number, Invoice>;
  private aiInsights: Map<number, AiInsight>;
  
  // New feature collections
  private taxItems: Map<number, TaxItem>;
  private payrollItems: Map<number, PayrollItem>;
  private timeEntries: Map<number, TimeEntry>;
  private bankAccounts: Map<number, BankAccount>;
  private bankTransactions: Map<number, BankTransaction>;
  private budgets: Map<number, Budget>;
  private budgetCategories: Map<number, BudgetCategory>;
  private inventoryCosts: Map<number, InventoryCost>;
  
  private userCurrentId: number;
  private transactionCurrentId: number;
  private inventoryItemCurrentId: number;
  private contractCurrentId: number;
  private receiptCurrentId: number;
  private invoiceCurrentId: number;
  private aiInsightCurrentId: number;
  
  // New feature IDs
  private taxItemCurrentId: number;
  private payrollItemCurrentId: number;
  private timeEntryCurrentId: number;
  private bankAccountCurrentId: number;
  private bankTransactionCurrentId: number;
  private budgetCurrentId: number;
  private budgetCategoryCurrentId: number;
  private inventoryCostCurrentId: number;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.transactions = new Map();
    this.inventoryItems = new Map();
    this.contracts = new Map();
    this.receipts = new Map();
    this.invoices = new Map();
    this.aiInsights = new Map();
    
    // Initialize new feature maps
    this.taxItems = new Map();
    this.payrollItems = new Map();
    this.timeEntries = new Map();
    this.bankAccounts = new Map();
    this.bankTransactions = new Map();
    this.budgets = new Map();
    this.budgetCategories = new Map();
    this.inventoryCosts = new Map();
    
    // Initialize IDs
    this.userCurrentId = 1;
    this.transactionCurrentId = 1;
    this.inventoryItemCurrentId = 1;
    this.contractCurrentId = 1;
    this.receiptCurrentId = 1;
    this.invoiceCurrentId = 1;
    this.aiInsightCurrentId = 1;
    
    // Initialize new feature IDs
    this.taxItemCurrentId = 1;
    this.payrollItemCurrentId = 1;
    this.timeEntryCurrentId = 1;
    this.bankAccountCurrentId = 1;
    this.bankTransactionCurrentId = 1;
    this.budgetCurrentId = 1;
    this.budgetCategoryCurrentId = 1;
    this.inventoryCostCurrentId = 1;
    
    // No demo user or pre-seeded data - each user will get their own data when created
  }

  private seedDemoData(userId: number) {
    const currentUserName = `User-${userId}`;
    const currentYear = new Date().getFullYear();
    
    // Create sample transactions based on user ID to ensure different data for each user
    const transactions: InsertTransaction[] = [
      {
        userId,
        type: "income",
        amount: `${4000 + (userId * 100)}`,
        description: `Client Payment - ${currentUserName} Corp`,
        category: "Sales",
        date: new Date(2023, 4, 4, 10, 23)
      },
      {
        userId,
        type: "expense",
        amount: `${210 + (userId * 5)}.50`,
        description: "Office Supplies",
        category: "Office",
        date: new Date(2023, 4, 3, 15, 45)
      },
      {
        userId,
        type: "expense",
        amount: "49.99",
        description: "Software Subscription",
        category: "Software",
        date: new Date(2023, 4, 1, 0, 0)
      },
      {
        userId,
        type: "income",
        amount: `${2500 + (userId * 150)}`,
        description: `Client Payment - ${currentUserName} Ltd`,
        category: "Sales",
        date: new Date(2023, 3, 29, 14, 30)
      }
    ];
    
    transactions.forEach(t => {
      const transaction: Transaction = { 
        ...t, 
        id: this.transactionCurrentId++,
        date: t.date || new Date() // Ensure date is not undefined
      };
      this.transactions.set(transaction.id, transaction);
    });

    // Add some inventory items
    const inventory: InsertInventoryItem[] = [
      {
        userId,
        name: "Laptop",
        description: "MacBook Pro 16-inch",
        quantity: 5,
        price: "2499.99",
        lowStockThreshold: 2,
        category: "Electronics"
      },
      {
        userId,
        name: `${currentUserName}'s Office Chair`,
        description: "Ergonomic office chair",
        quantity: 10,
        price: "349.99",
        lowStockThreshold: 3,
        category: "Furniture"
      },
      {
        userId,
        name: "Notebook",
        description: "Leather-bound notebook",
        quantity: 2,
        price: "24.99",
        lowStockThreshold: 5,
        category: "Office Supplies"
      }
    ];
    
    inventory.forEach(i => {
      const item: InventoryItem = { 
        id: this.inventoryItemCurrentId++,
        userId: i.userId,
        name: i.name,
        description: i.description || null,
        category: i.category || null,
        quantity: i.quantity,
        price: i.price,
        lowStockThreshold: i.lowStockThreshold || null,
        createdAt: new Date()
      };
      this.inventoryItems.set(item.id, item);
    });

    // Add some invoices
    const invoices: InsertInvoice[] = [
      {
        userId,
        invoiceNumber: `INV-${userId}-001`,
        clientName: `${currentUserName} Corp`,
        amount: `${4000 + (userId * 100)}.00`,
        issueDate: new Date(2023, 4, 1),
        dueDate: new Date(2023, 4, 15),
        status: "paid",
        items: JSON.stringify([
          { description: "Consulting Services", amount: 4000 + (userId * 100) }
        ]),
        notes: "Payment received on time"
      },
      {
        userId,
        invoiceNumber: `INV-${userId}-002`,
        clientName: `${currentUserName} Ltd`,
        amount: `${2500 + (userId * 150)}.00`,
        issueDate: new Date(2023, 4, 1),
        dueDate: new Date(2023, 4, 15),
        status: "pending",
        items: JSON.stringify([
          { description: "Web Development", amount: 2500 + (userId * 150) }
        ]),
        notes: "Follow up on payment method"
      },
      {
        userId,
        invoiceNumber: `INV-${userId}-003`,
        clientName: `${currentUserName} Industries`,
        amount: `${2200 + (userId * 50)}.00`,
        issueDate: new Date(2023, 3, 15),
        dueDate: new Date(2023, 3, 30),
        status: "overdue",
        items: JSON.stringify([
          { description: "Design Services", amount: 2200 + (userId * 50) }
        ]),
        notes: "Need to call about late payment"
      }
    ];
    
    invoices.forEach(i => {
      const invoice: Invoice = { 
        ...i, 
        id: this.invoiceCurrentId++,
        createdAt: new Date(),
        notes: i.notes || null
      };
      this.invoices.set(invoice.id, invoice);
    });

    // Add some contracts
    const contracts: InsertContract[] = [
      {
        userId,
        clientName: `${currentUserName} Corp`,
        title: "Consulting Agreement",
        content: "This is a consulting agreement contract...",
        status: "signed",
        expiryDate: new Date(2023, 12, 31)
      },
      {
        userId,
        clientName: `${currentUserName} Ltd`,
        title: "Web Development Contract",
        content: "This is a web development contract...",
        status: "sent",
        expiryDate: null
      }
    ];
    
    contracts.forEach(c => {
      const contract: Contract = { 
        id: this.contractCurrentId++,
        status: c.status,
        userId: c.userId,
        createdAt: new Date(),
        clientName: c.clientName,
        title: c.title,
        content: c.content,
        expiryDate: c.expiryDate || null
      };
      this.contracts.set(contract.id, contract);
    });

    // Add some AI insights
    const insights: InsertAiInsight[] = [
      {
        userId,
        type: "cash_flow",
        title: "Cash Flow Optimization",
        content: `Consider sending payment reminders for overdue invoices from ${currentUserName} Industries to improve short-term cash flow.`
      },
      {
        userId,
        type: "revenue",
        title: "Revenue Opportunity",
        content: `Client ${currentUserName} Corp's spending is up 15% this quarter. Consider offering a premium service package.`
      },
      {
        userId,
        type: "expense",
        title: "Expense Alert",
        content: "Your software subscription costs have increased 22% in the last 6 months. Review for potential consolidation."
      }
    ];
    
    insights.forEach(i => {
      const insight: AiInsight = { 
        ...i, 
        id: this.aiInsightCurrentId++,
        createdAt: new Date(),
        isRead: false
      };
      this.aiInsights.set(insight.id, insight);
    });

    // ==== Add Tax Management Sample Data ====
    const taxItems: InsertTaxItem[] = [
      {
        userId,
        name: "Q1 Income Tax",
        category: "income",
        amount: `${userId * 500 + 1200}`,
        taxYear: currentYear,
        quarter: 1,
        description: "Q1 estimated tax payment",
        status: "filed",
        dateFiled: new Date(currentYear, 3, 15)
      },
      {
        userId,
        name: "Business Property Tax",
        category: "expense",
        amount: `${userId * 50 + 750}`,
        taxYear: currentYear,
        description: "Annual property tax for business location",
        status: "pending"
      },
      {
        userId,
        name: "Vehicle Tax Deduction",
        category: "deduction",
        amount: `${userId * 25 + 350}`,
        taxYear: currentYear,
        description: "Business vehicle expense deduction",
        status: "pending"
      }
    ];
    
    taxItems.forEach(item => {
      const taxItem: TaxItem = {
        id: this.taxItemCurrentId++,
        userId: item.userId,
        name: item.name,
        category: item.category,
        amount: item.amount,
        taxYear: item.taxYear,
        quarter: item.quarter || null,
        description: item.description || null,
        dateFiled: item.dateFiled || null,
        status: item.status,
        receiptId: item.receiptId || null,
        createdAt: new Date()
      };
      this.taxItems.set(taxItem.id, taxItem);
    });

    // ==== Add Payroll Sample Data ====
    const employees = [
      { name: "John Smith", id: `EMP-${userId}-001` },
      { name: "Sarah Johnson", id: `EMP-${userId}-002` },
      { name: "Michael Brown", id: `EMP-${userId}-003` }
    ];
    
    const payrollItems: InsertPayrollItem[] = [];
    
    // Create payroll entries for the last 2 months for each employee
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    // Loop through employees
    employees.forEach(employee => {
      // Create 2 months of payroll
      for (let i = 0; i < 2; i++) {
        const month = thisMonth - i;
        const year = thisMonth - i < 0 ? thisYear - 1 : thisYear;
        const payPeriodStart = new Date(year, month, 1);
        const payPeriodEnd = new Date(year, month, 15);
        const paymentDate = new Date(year, month, 16);
        
        // Base salary with some variation per employee
        const base = 2500 + (employee.name.length * 25) + (userId * 100);
        const gross = base;
        const tax = gross * 0.2;
        const otherDeductions = gross * 0.05;
        const net = gross - tax - otherDeductions;
        
        payrollItems.push({
          userId,
          employeeName: employee.name,
          employeeId: employee.id,
          payPeriodStart,
          payPeriodEnd,
          paymentDate,
          grossAmount: `${gross}`,
          taxWithholdings: `${tax}`,
          otherDeductions: `${otherDeductions}`,
          netAmount: `${net}`,
          paymentMethod: i % 2 === 0 ? "direct_deposit" : "check",
          status: "processed",
          notes: `Monthly salary payment for ${payPeriodStart.toLocaleDateString()} to ${payPeriodEnd.toLocaleDateString()}`
        });
      }
    });
    
    payrollItems.forEach(item => {
      const payrollItem: PayrollItem = {
        id: this.payrollItemCurrentId++,
        userId: item.userId,
        employeeName: item.employeeName,
        employeeId: item.employeeId,
        payPeriodStart: item.payPeriodStart,
        payPeriodEnd: item.payPeriodEnd,
        paymentDate: item.paymentDate,
        grossAmount: item.grossAmount,
        taxWithholdings: item.taxWithholdings,
        otherDeductions: item.otherDeductions,
        netAmount: item.netAmount,
        paymentMethod: item.paymentMethod,
        status: item.status,
        notes: item.notes || null,
        createdAt: new Date()
      };
      this.payrollItems.set(payrollItem.id, payrollItem);
    });

    // ==== Add Time Tracking Sample Data ====
    const projects = [
      { id: `PROJ-${userId}-001`, name: `${currentUserName} Website Redesign` },
      { id: `PROJ-${userId}-002`, name: `${currentUserName} Mobile App` },
      { id: `PROJ-${userId}-003`, name: "Internal Systems Upgrade" }
    ];
    
    const timeEntries: InsertTimeEntry[] = [];
    
    // Create time entries for the past 5 days, 2 entries per day per project
    for (let day = 1; day <= 5; day++) {
      const entryDate = new Date();
      entryDate.setDate(entryDate.getDate() - day);
      
      projects.forEach(project => {
        // Morning Entry
        const morningStart = new Date(entryDate);
        morningStart.setHours(9, 0, 0);
        const morningEnd = new Date(entryDate);
        morningEnd.setHours(12, 0, 0);
        
        timeEntries.push({
          userId,
          projectId: project.id,
          projectName: project.name,
          taskDescription: `Working on ${project.name} - Morning Session`,
          startTime: morningStart,
          endTime: morningEnd,
          duration: "180", // 3 hours in minutes
          billable: true,
          billingRate: `${75 + (userId * 5)}`,
          notes: `Progress on ${project.name.split(' ').slice(-1)[0]} module`
        });
        
        // Afternoon Entry
        const afternoonStart = new Date(entryDate);
        afternoonStart.setHours(13, 0, 0);
        const afternoonEnd = new Date(entryDate);
        afternoonEnd.setHours(17, 0, 0);
        
        timeEntries.push({
          userId,
          projectId: project.id,
          projectName: project.name,
          taskDescription: `Working on ${project.name} - Afternoon Session`,
          startTime: afternoonStart,
          endTime: afternoonEnd,
          duration: "240", // 4 hours in minutes
          billable: true,
          billingRate: `${75 + (userId * 5)}`,
          notes: `Continued work on ${project.name.split(' ').slice(-1)[0]}`
        });
      });
    }
    
    // Add one in-progress entry for today
    const currentEntry = {
      userId,
      projectId: projects[0].id,
      projectName: projects[0].name,
      taskDescription: `Working on ${projects[0].name} - Current Session`,
      startTime: new Date(),
      billable: true,
      billingRate: `${75 + (userId * 5)}`
    };
    
    timeEntries.push(currentEntry);
    
    timeEntries.forEach(entry => {
      const timeEntry: TimeEntry = {
        id: this.timeEntryCurrentId++,
        userId: entry.userId,
        projectId: entry.projectId || null,
        projectName: entry.projectName,
        taskDescription: entry.taskDescription,
        startTime: entry.startTime,
        endTime: entry.endTime || null,
        duration: entry.duration || null,
        billable: entry.billable ?? true,
        billingRate: entry.billingRate || null,
        invoiceId: entry.invoiceId || null,
        notes: entry.notes || null,
        createdAt: new Date()
      };
      this.timeEntries.set(timeEntry.id, timeEntry);
    });

    // ==== Add Bank Reconciliation Sample Data ====
    const bankAccounts: InsertBankAccount[] = [
      {
        userId,
        accountName: "Business Checking",
        accountNumber: `CHK-${userId}-${Math.floor(1000 + Math.random() * 9000)}`,
        bankName: `FirstBank ${currentUserName}`,
        accountType: "checking",
        balance: `${10000 + (userId * 500)}`,
        lastReconciled: new Date(currentYear, thisMonth - 1, 15),
        notes: "Primary business account"
      },
      {
        userId,
        accountName: "Business Savings",
        accountNumber: `SAV-${userId}-${Math.floor(1000 + Math.random() * 9000)}`,
        bankName: `FirstBank ${currentUserName}`,
        accountType: "savings",
        balance: `${25000 + (userId * 1000)}`,
        lastReconciled: new Date(currentYear, thisMonth - 1, 15),
        notes: "Emergency fund and tax savings"
      },
      {
        userId,
        accountName: "Business Credit Card",
        accountNumber: `CC-${userId}-${Math.floor(1000 + Math.random() * 9000)}`,
        bankName: "Capital Business",
        accountType: "credit",
        balance: `${-2500 - (userId * 150)}`,
        lastReconciled: new Date(currentYear, thisMonth - 1, 10),
        notes: "Company expenses and travel"
      }
    ];
    
    const createdBankAccounts: BankAccount[] = [];
    
    bankAccounts.forEach(account => {
      const bankAccount: BankAccount = {
        id: this.bankAccountCurrentId++,
        userId: account.userId,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        bankName: account.bankName,
        accountType: account.accountType,
        balance: account.balance,
        lastReconciled: account.lastReconciled || null,
        notes: account.notes || null,
        createdAt: new Date()
      };
      this.bankAccounts.set(bankAccount.id, bankAccount);
      createdBankAccounts.push(bankAccount);
    });
    
    // Add bank transactions for the checking account
    if (createdBankAccounts.length > 0) {
      const checkingAccount = createdBankAccounts[0];
      
      const bankTransactions: InsertBankTransaction[] = [
        {
          userId,
          bankAccountId: checkingAccount.id,
          transactionDate: new Date(currentYear, thisMonth, 5),
          description: `${currentUserName} Corp Payment`,
          amount: `${4000 + (userId * 100)}`,
          category: "Sales",
          reconciled: true,
          matchedTransactionId: 1, // Match to first transaction
          notes: "Monthly services payment"
        },
        {
          userId,
          bankAccountId: checkingAccount.id,
          transactionDate: new Date(currentYear, thisMonth, 8),
          description: "Office Supplies Store",
          amount: `${-210 - (userId * 5)}`,
          category: "Office",
          reconciled: true,
          matchedTransactionId: 2
        },
        {
          userId,
          bankAccountId: checkingAccount.id,
          transactionDate: new Date(currentYear, thisMonth, 10),
          description: "Software Monthly Subscription",
          amount: "-49.99",
          category: "Software",
          reconciled: true,
          matchedTransactionId: 3
        },
        {
          userId,
          bankAccountId: checkingAccount.id,
          transactionDate: new Date(currentYear, thisMonth, 15),
          description: "Rent Payment",
          amount: `${-1500 - (userId * 50)}`,
          category: "Rent",
          reconciled: false
        },
        {
          userId,
          bankAccountId: checkingAccount.id,
          transactionDate: new Date(currentYear, thisMonth, 16),
          description: "Payroll Service",
          amount: `${-4500 - (userId * 200)}`,
          category: "Payroll",
          reconciled: false
        }
      ];
      
      bankTransactions.forEach(transaction => {
        const bankTransaction: BankTransaction = {
          id: this.bankTransactionCurrentId++,
          userId: transaction.userId,
          bankAccountId: transaction.bankAccountId,
          transactionDate: transaction.transactionDate,
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category || null,
          reconciled: transaction.reconciled ?? false,
          matchedTransactionId: transaction.matchedTransactionId || null,
          checkNumber: transaction.checkNumber || null,
          notes: transaction.notes || null,
          createdAt: new Date()
        };
        this.bankTransactions.set(bankTransaction.id, bankTransaction);
      });
    }

    // ==== Add Budget Planning Sample Data ====
    const currentQuarter = Math.floor(thisMonth / 3) + 1;
    const quarterStartMonth = (currentQuarter - 1) * 3;
    const quarterStartDate = new Date(currentYear, quarterStartMonth, 1);
    const quarterEndMonth = quarterStartMonth + 2;
    const quarterEndDate = new Date(currentYear, quarterEndMonth + 1, 0); // Last day of quarter end month
    
    // For seed data, we'll create the budget directly rather than using async methods
    const budgetId = this.budgetCurrentId++;
    const newBudget: Budget = {
      id: budgetId,
      userId,
      name: `Q${currentQuarter} ${currentYear} Budget`,
      description: `Operating budget for Q${currentQuarter} ${currentYear}`,
      startDate: quarterStartDate,
      endDate: quarterEndDate,
      totalBudget: `${30000 + (userId * 1000)}`,
      status: "active",
      notes: "Includes planned expansion costs",
      createdAt: new Date()
    };
    this.budgets.set(budgetId, newBudget);
    
    // Add budget categories directly without using async methods
    const budgetCategories = [
      {
        name: "Rent & Utilities",
        allocatedAmount: `${4500 + (userId * 200)}`,
        spentAmount: `${3000 + (userId * 150)}`,
        notes: "Office space and utilities"
      },
      {
        name: "Payroll",
        allocatedAmount: `${15000 + (userId * 500)}`,
        spentAmount: `${10000 + (userId * 400)}`,
        notes: "All employee salaries and benefits"
      },
      {
        name: "Marketing",
        allocatedAmount: `${3500 + (userId * 150)}`,
        spentAmount: `${2200 + (userId * 100)}`,
        notes: "Digital and print marketing"
      },
      {
        name: "Software & Subscriptions",
        allocatedAmount: `${1200 + (userId * 50)}`,
        spentAmount: `${850 + (userId * 30)}`,
        notes: "All software tools and subscriptions"
      },
      {
        name: "Equipment",
        allocatedAmount: `${5000 + (userId * 200)}`,
        spentAmount: `${1500 + (userId * 75)}`,
        notes: "Computer and office equipment upgrades"
      }
    ];
    
    budgetCategories.forEach(categoryData => {
      const categoryId = this.budgetCategoryCurrentId++;
      const category: BudgetCategory = {
        id: categoryId,
        budgetId,
        userId,
        name: categoryData.name,
        allocatedAmount: categoryData.allocatedAmount,
        spentAmount: categoryData.spentAmount,
        notes: categoryData.notes || null,
        createdAt: new Date()
      };
      this.budgetCategories.set(categoryId, category);
    });

    // ==== Add Inventory Cost Analysis Sample Data ====
    // Using previously created inventory items
    const inventoryItems = Array.from(this.inventoryItems.values()).filter(
      (item) => item.userId === userId
    );
    
    if (inventoryItems.length > 0) {
      inventoryItems.forEach(item => {
        // Create multiple purchase records for each item
        for (let i = 0; i < 2; i++) {
          const purchaseDate = new Date();
          purchaseDate.setMonth(purchaseDate.getMonth() - i);
          
          const quantity = 3 + i * 2;
          const purchasePrice = parseFloat(item.price) * 0.7; // Cost at 70% of selling price
          const shippingCost = purchasePrice * 0.05;
          const taxAmount = purchasePrice * 0.08;
          const totalCost = purchasePrice + shippingCost + taxAmount;
          const costPerUnit = totalCost / quantity;
          
          // Create inventory cost entry directly instead of using async method
          const costId = this.inventoryCostCurrentId++;
          const inventoryCost: InventoryCost = {
            id: costId,
            userId,
            inventoryItemId: item.id,
            purchaseDate,
            purchasePrice: purchasePrice.toString(),
            quantity,
            vendorName: `${item.name} Supplier ${i+1}`,
            shippingCost: shippingCost.toString(),
            taxAmount: taxAmount.toString(),
            totalCost: totalCost.toString(),
            costPerUnit: costPerUnit.toString(),
            notes: `Purchase order #PO-${userId}-${item.id}-${i+1}`,
            createdAt: new Date()
          };
          
          this.inventoryCosts.set(costId, inventoryCost);
        }
      });
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    
    // Generate unique sample data for each new user
    this.seedDemoData(id);
    
    return user;
  }

  // Transactions
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    );
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionCurrentId++;
    
    // Ensure date is a Date object
    const date = insertTransaction.date instanceof Date 
      ? insertTransaction.date 
      : new Date();
    
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      date 
    };
    
    console.log("Creating transaction with data:", transaction);
    this.transactions.set(id, transaction);
    return transaction;
  }

  // Inventory
  async getInventoryItems(userId: number): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async getInventoryItemById(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.inventoryItemCurrentId++;
    const item: InventoryItem = { 
      id,
      userId: insertItem.userId,
      name: insertItem.name,
      description: insertItem.description || null,
      category: insertItem.category || null,
      quantity: insertItem.quantity,
      price: insertItem.price,
      lowStockThreshold: insertItem.lowStockThreshold || null,
      createdAt: new Date()
    };
    this.inventoryItems.set(id, item);
    return item;
  }

  async updateInventoryItem(id: number, itemUpdate: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const existingItem = this.inventoryItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...itemUpdate };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  // Contracts
  async getContracts(userId: number): Promise<Contract[]> {
    return Array.from(this.contracts.values()).filter(
      (contract) => contract.userId === userId
    );
  }

  async getContractById(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async createContract(insertContract: InsertContract): Promise<Contract> {
    const id = this.contractCurrentId++;
    const contract: Contract = { 
      id,
      userId: insertContract.userId,
      clientName: insertContract.clientName,
      title: insertContract.title,
      content: insertContract.content,
      status: insertContract.status,
      expiryDate: insertContract.expiryDate || null,
      createdAt: new Date()
    };
    this.contracts.set(id, contract);
    return contract;
  }

  async updateContract(id: number, contractUpdate: Partial<InsertContract>): Promise<Contract | undefined> {
    const existingContract = this.contracts.get(id);
    if (!existingContract) return undefined;
    
    // Process update fields with proper null handling
    const processedUpdate: Partial<Contract> = {};
    
    if (contractUpdate.status !== undefined) {
      processedUpdate.status = contractUpdate.status;
    }
    
    if (contractUpdate.clientName !== undefined) {
      processedUpdate.clientName = contractUpdate.clientName;
    }
    
    if (contractUpdate.title !== undefined) {
      processedUpdate.title = contractUpdate.title;
    }
    
    if (contractUpdate.content !== undefined) {
      processedUpdate.content = contractUpdate.content;
    }
    
    if (contractUpdate.expiryDate !== undefined) {
      processedUpdate.expiryDate = contractUpdate.expiryDate || null;
    }
    
    const updatedContract = { ...existingContract, ...processedUpdate };
    this.contracts.set(id, updatedContract);
    return updatedContract;
  }

  // Receipts
  async getReceipts(userId: number): Promise<Receipt[]> {
    return Array.from(this.receipts.values()).filter(
      (receipt) => receipt.userId === userId
    );
  }

  async getReceiptById(id: number): Promise<Receipt | undefined> {
    return this.receipts.get(id);
  }

  async createReceipt(insertReceipt: InsertReceipt): Promise<Receipt> {
    const id = this.receiptCurrentId++;
    const receipt: Receipt = { 
      id,
      userId: insertReceipt.userId,
      vendor: insertReceipt.vendor, 
      amount: insertReceipt.amount,
      date: insertReceipt.date,
      category: insertReceipt.category,
      notes: insertReceipt.notes || null,
      imageData: insertReceipt.imageData || null,
      createdAt: new Date()
    };
    this.receipts.set(id, receipt);
    return receipt;
  }

  // Invoices
  async getInvoices(userId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (invoice) => invoice.userId === userId
    );
  }

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceCurrentId++;
    
    // Ensure dates are properly parsed from ISO strings if needed
    const issueDate = insertInvoice.issueDate instanceof Date ? 
      insertInvoice.issueDate : 
      new Date(insertInvoice.issueDate);
    
    const dueDate = insertInvoice.dueDate instanceof Date ? 
      insertInvoice.dueDate : 
      new Date(insertInvoice.dueDate);
    
    const invoice: Invoice = { 
      ...insertInvoice, 
      id, 
      createdAt: new Date(),
      issueDate,
      dueDate,
      notes: insertInvoice.notes || null
    };
    
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoice(id: number, invoiceUpdate: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const existingInvoice = this.invoices.get(id);
    if (!existingInvoice) return undefined;
    
    // Process date fields if present
    let processedUpdate: Partial<Invoice> = { ...invoiceUpdate };
    
    if (invoiceUpdate.issueDate) {
      processedUpdate.issueDate = invoiceUpdate.issueDate instanceof Date ? 
        invoiceUpdate.issueDate : 
        new Date(invoiceUpdate.issueDate);
    }
    
    if (invoiceUpdate.dueDate) {
      processedUpdate.dueDate = invoiceUpdate.dueDate instanceof Date ? 
        invoiceUpdate.dueDate : 
        new Date(invoiceUpdate.dueDate);
    }
    
    if (invoiceUpdate.notes !== undefined) {
      processedUpdate.notes = invoiceUpdate.notes || null;
    }
    
    const updatedInvoice = { ...existingInvoice, ...processedUpdate };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  // AI Insights
  async getAiInsights(userId: number): Promise<AiInsight[]> {
    return Array.from(this.aiInsights.values()).filter(
      (insight) => insight.userId === userId
    );
  }

  async createAiInsight(insertInsight: InsertAiInsight): Promise<AiInsight> {
    const id = this.aiInsightCurrentId++;
    const insight: AiInsight = { 
      ...insertInsight, 
      id, 
      createdAt: new Date(),
      isRead: false
    };
    this.aiInsights.set(id, insight);
    return insight;
  }

  async markAiInsightAsRead(id: number): Promise<AiInsight | undefined> {
    const existingInsight = this.aiInsights.get(id);
    if (!existingInsight) return undefined;
    
    const updatedInsight = { ...existingInsight, isRead: true };
    this.aiInsights.set(id, updatedInsight);
    return updatedInsight;
  }

  // ==== Tax Management Implementation ====
  async getTaxItems(userId: number): Promise<TaxItem[]> {
    return Array.from(this.taxItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async getTaxItemById(id: number): Promise<TaxItem | undefined> {
    return this.taxItems.get(id);
  }

  async createTaxItem(item: InsertTaxItem): Promise<TaxItem> {
    const id = this.taxItemCurrentId++;
    const taxItem: TaxItem = {
      id,
      userId: item.userId,
      name: item.name,
      category: item.category,
      amount: item.amount,
      taxYear: item.taxYear,
      quarter: item.quarter || null,
      description: item.description || null,
      dateFiled: item.dateFiled || null,
      status: item.status,
      receiptId: item.receiptId || null,
      createdAt: new Date()
    };
    this.taxItems.set(id, taxItem);
    return taxItem;
  }

  async updateTaxItem(id: number, item: Partial<InsertTaxItem>): Promise<TaxItem | undefined> {
    const existingItem = this.taxItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...item };
    this.taxItems.set(id, updatedItem);
    return updatedItem;
  }

  async getTaxItemsByYear(userId: number, year: number): Promise<TaxItem[]> {
    return Array.from(this.taxItems.values()).filter(
      (item) => item.userId === userId && item.taxYear === year
    );
  }

  // ==== Payroll Processing Implementation ====
  async getPayrollItems(userId: number): Promise<PayrollItem[]> {
    return Array.from(this.payrollItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async getPayrollItemById(id: number): Promise<PayrollItem | undefined> {
    return this.payrollItems.get(id);
  }

  async createPayrollItem(item: InsertPayrollItem): Promise<PayrollItem> {
    const id = this.payrollItemCurrentId++;
    const payrollItem: PayrollItem = {
      id,
      userId: item.userId,
      employeeName: item.employeeName,
      employeeId: item.employeeId,
      payPeriodStart: item.payPeriodStart,
      payPeriodEnd: item.payPeriodEnd,
      paymentDate: item.paymentDate,
      grossAmount: item.grossAmount,
      taxWithholdings: item.taxWithholdings,
      otherDeductions: item.otherDeductions,
      netAmount: item.netAmount,
      paymentMethod: item.paymentMethod,
      status: item.status,
      notes: item.notes || null,
      createdAt: new Date()
    };
    this.payrollItems.set(id, payrollItem);
    return payrollItem;
  }

  async updatePayrollItem(id: number, item: Partial<InsertPayrollItem>): Promise<PayrollItem | undefined> {
    const existingItem = this.payrollItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...item };
    this.payrollItems.set(id, updatedItem);
    return updatedItem;
  }

  async getPayrollItemsByEmployee(userId: number, employeeId: string): Promise<PayrollItem[]> {
    return Array.from(this.payrollItems.values()).filter(
      (item) => item.userId === userId && item.employeeId === employeeId
    );
  }

  async getPayrollItemsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<PayrollItem[]> {
    return Array.from(this.payrollItems.values()).filter(
      (item) => item.userId === userId && 
                item.paymentDate >= startDate && 
                item.paymentDate <= endDate
    );
  }

  // ==== Time Tracking Implementation ====
  async getTimeEntries(userId: number): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(
      (entry) => entry.userId === userId
    );
  }

  async getTimeEntryById(id: number): Promise<TimeEntry | undefined> {
    return this.timeEntries.get(id);
  }

  async createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry> {
    const id = this.timeEntryCurrentId++;
    const timeEntry: TimeEntry = {
      id,
      userId: entry.userId,
      projectId: entry.projectId || null,
      projectName: entry.projectName,
      taskDescription: entry.taskDescription,
      startTime: entry.startTime,
      endTime: entry.endTime || null,
      duration: entry.duration || null,
      billable: entry.billable ?? true,
      billingRate: entry.billingRate || null,
      invoiceId: entry.invoiceId || null,
      notes: entry.notes || null,
      createdAt: new Date()
    };
    this.timeEntries.set(id, timeEntry);
    return timeEntry;
  }

  async updateTimeEntry(id: number, entry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> {
    const existingEntry = this.timeEntries.get(id);
    if (!existingEntry) return undefined;
    
    const updatedEntry = { ...existingEntry, ...entry };
    this.timeEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async getTimeEntriesByProject(userId: number, projectId: string): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(
      (entry) => entry.userId === userId && entry.projectId === projectId
    );
  }

  async getTimeEntriesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(
      (entry) => entry.userId === userId && 
                 entry.startTime >= startDate && 
                 (entry.endTime ? entry.endTime <= endDate : true)
    );
  }

  // ==== Bank Reconciliation Implementation ====
  async getBankAccounts(userId: number): Promise<BankAccount[]> {
    return Array.from(this.bankAccounts.values()).filter(
      (account) => account.userId === userId
    );
  }

  async getBankAccountById(id: number): Promise<BankAccount | undefined> {
    return this.bankAccounts.get(id);
  }

  async createBankAccount(account: InsertBankAccount): Promise<BankAccount> {
    const id = this.bankAccountCurrentId++;
    const bankAccount: BankAccount = {
      id,
      userId: account.userId,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      accountType: account.accountType,
      balance: account.balance,
      lastReconciled: account.lastReconciled || null,
      notes: account.notes || null,
      createdAt: new Date()
    };
    this.bankAccounts.set(id, bankAccount);
    return bankAccount;
  }

  async updateBankAccount(id: number, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined> {
    const existingAccount = this.bankAccounts.get(id);
    if (!existingAccount) return undefined;
    
    const updatedAccount = { ...existingAccount, ...account };
    this.bankAccounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async getBankTransactions(userId: number, bankAccountId: number): Promise<BankTransaction[]> {
    return Array.from(this.bankTransactions.values()).filter(
      (transaction) => transaction.userId === userId && transaction.bankAccountId === bankAccountId
    );
  }

  async getBankTransactionById(id: number): Promise<BankTransaction | undefined> {
    return this.bankTransactions.get(id);
  }

  async createBankTransaction(transaction: InsertBankTransaction): Promise<BankTransaction> {
    const id = this.bankTransactionCurrentId++;
    const bankTransaction: BankTransaction = {
      id,
      userId: transaction.userId,
      bankAccountId: transaction.bankAccountId,
      transactionDate: transaction.transactionDate,
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category || null,
      reconciled: transaction.reconciled ?? false,
      matchedTransactionId: transaction.matchedTransactionId || null,
      checkNumber: transaction.checkNumber || null,
      notes: transaction.notes || null,
      createdAt: new Date()
    };
    this.bankTransactions.set(id, bankTransaction);
    return bankTransaction;
  }

  async updateBankTransaction(id: number, transaction: Partial<InsertBankTransaction>): Promise<BankTransaction | undefined> {
    const existingTransaction = this.bankTransactions.get(id);
    if (!existingTransaction) return undefined;
    
    const updatedTransaction = { ...existingTransaction, ...transaction };
    this.bankTransactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async markTransactionReconciled(id: number, matchedTransactionId?: number): Promise<BankTransaction | undefined> {
    const existingTransaction = this.bankTransactions.get(id);
    if (!existingTransaction) return undefined;
    
    const updatedTransaction = { 
      ...existingTransaction, 
      reconciled: true,
      matchedTransactionId: matchedTransactionId || existingTransaction.matchedTransactionId
    };
    this.bankTransactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // ==== Budget Planning Implementation ====
  async getBudgets(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(
      (budget) => budget.userId === userId
    );
  }

  async getBudgetById(id: number): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const id = this.budgetCurrentId++;
    const newBudget: Budget = {
      id,
      userId: budget.userId,
      name: budget.name,
      description: budget.description || null,
      startDate: budget.startDate,
      endDate: budget.endDate,
      totalBudget: budget.totalBudget,
      status: budget.status,
      notes: budget.notes || null,
      createdAt: new Date()
    };
    this.budgets.set(id, newBudget);
    return newBudget;
  }

  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const existingBudget = this.budgets.get(id);
    if (!existingBudget) return undefined;
    
    const updatedBudget = { ...existingBudget, ...budget };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }

  async getBudgetCategories(budgetId: number): Promise<BudgetCategory[]> {
    return Array.from(this.budgetCategories.values()).filter(
      (category) => category.budgetId === budgetId
    );
  }

  async getBudgetCategoryById(id: number): Promise<BudgetCategory | undefined> {
    return this.budgetCategories.get(id);
  }

  async createBudgetCategory(category: InsertBudgetCategory): Promise<BudgetCategory> {
    const id = this.budgetCategoryCurrentId++;
    const newCategory: BudgetCategory = {
      id,
      budgetId: category.budgetId,
      userId: category.userId,
      name: category.name,
      allocatedAmount: category.allocatedAmount,
      spentAmount: category.spentAmount || "0",
      notes: category.notes || null,
      createdAt: new Date()
    };
    this.budgetCategories.set(id, newCategory);
    return newCategory;
  }

  async updateBudgetCategory(id: number, category: Partial<InsertBudgetCategory>): Promise<BudgetCategory | undefined> {
    const existingCategory = this.budgetCategories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory = { ...existingCategory, ...category };
    this.budgetCategories.set(id, updatedCategory);
    return updatedCategory;
  }

  // ==== Inventory Cost Analysis Implementation ====
  async getInventoryCosts(userId: number): Promise<InventoryCost[]> {
    return Array.from(this.inventoryCosts.values()).filter(
      (cost) => cost.userId === userId
    );
  }

  async getInventoryCostById(id: number): Promise<InventoryCost | undefined> {
    return this.inventoryCosts.get(id);
  }

  async createInventoryCost(cost: InsertInventoryCost): Promise<InventoryCost> {
    const id = this.inventoryCostCurrentId++;
    const newCost: InventoryCost = {
      id,
      userId: cost.userId,
      inventoryItemId: cost.inventoryItemId,
      purchaseDate: cost.purchaseDate,
      purchasePrice: cost.purchasePrice,
      quantity: cost.quantity,
      vendorName: cost.vendorName || null,
      shippingCost: cost.shippingCost || "0",
      taxAmount: cost.taxAmount || "0",
      totalCost: cost.totalCost,
      costPerUnit: cost.costPerUnit,
      notes: cost.notes || null,
      createdAt: new Date()
    };
    this.inventoryCosts.set(id, newCost);
    return newCost;
  }

  async updateInventoryCost(id: number, cost: Partial<InsertInventoryCost>): Promise<InventoryCost | undefined> {
    const existingCost = this.inventoryCosts.get(id);
    if (!existingCost) return undefined;
    
    const updatedCost = { ...existingCost, ...cost };
    this.inventoryCosts.set(id, updatedCost);
    return updatedCost;
  }

  async getInventoryCostsByItem(userId: number, inventoryItemId: number): Promise<InventoryCost[]> {
    return Array.from(this.inventoryCosts.values()).filter(
      (cost) => cost.userId === userId && cost.inventoryItemId === inventoryItemId
    );
  }
}

export const storage = new MemStorage();
