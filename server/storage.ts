import {
  users, User, InsertUser,
  transactions, Transaction, InsertTransaction,
  inventoryItems, InventoryItem, InsertInventoryItem,
  contracts, Contract, InsertContract,
  receipts, Receipt, InsertReceipt,
  invoices, Invoice, InsertInvoice,
  aiInsights, AiInsight, InsertAiInsight
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private inventoryItems: Map<number, InventoryItem>;
  private contracts: Map<number, Contract>;
  private receipts: Map<number, Receipt>;
  private invoices: Map<number, Invoice>;
  private aiInsights: Map<number, AiInsight>;
  
  private userCurrentId: number;
  private transactionCurrentId: number;
  private inventoryItemCurrentId: number;
  private contractCurrentId: number;
  private receiptCurrentId: number;
  private invoiceCurrentId: number;
  private aiInsightCurrentId: number;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.transactions = new Map();
    this.inventoryItems = new Map();
    this.contracts = new Map();
    this.receipts = new Map();
    this.invoices = new Map();
    this.aiInsights = new Map();
    
    // Initialize IDs
    this.userCurrentId = 1;
    this.transactionCurrentId = 1;
    this.inventoryItemCurrentId = 1;
    this.contractCurrentId = 1;
    this.receiptCurrentId = 1;
    this.invoiceCurrentId = 1;
    this.aiInsightCurrentId = 1;
    
    // No demo user or pre-seeded data - each user will get their own data when created
  }

  private seedDemoData(userId: number) {
    const currentUserName = `User-${userId}`;
    
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
}

export const storage = new MemStorage();
