// Integration service to connect all aspects of the platform

/**
 * Main integration service that connects different modules of the platform.
 * This service is responsible for handling cross-module events and data relationships.
 */

// Simple browser-compatible event emitter
class BrowserEventEmitter {
  private events: Record<string, Function[]> = {};
  private maxListeners: number = 10;

  on(event: string, listener: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    if (this.events[event].length >= this.maxListeners) {
      console.warn(`Warning: event '${event}' has exceeded max listeners (${this.maxListeners})`);
    }
    
    this.events[event].push(listener);
  }

  off(event: string, listener: Function): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  setMaxListeners(n: number): void {
    this.maxListeners = n;
  }
}

// Define the module types in our system
export type ModuleType = 
  | 'financials' 
  | 'inventory' 
  | 'contracts' 
  | 'expenses' 
  | 'invoices' 
  | 'clients'
  | 'employees'
  | 'payroll'
  | 'budget'
  | 'tax'
  | 'timeTracking'
  | 'banking';

// Define the entity types in our system
export type EntityType =
  | 'transaction'
  | 'invoice'
  | 'contract'
  | 'expense'
  | 'inventory'
  | 'client'
  | 'employee'
  | 'payroll'
  | 'taxDocument'
  | 'timeEntry'
  | 'bankTransaction';

// Define the events that can be emitted in our system
export type IntegrationEvent = 
  | 'entity:created'
  | 'entity:updated'
  | 'entity:deleted'
  | 'module:interaction'
  | 'data:relationship:created'
  | 'data:relationship:updated'
  | 'data:relationship:deleted'
  | 'notification:created';

// Define the payload for integration events
export interface IntegrationEventPayload {
  module: ModuleType;
  entityType: EntityType;
  entityId: string | number;
  action?: string;
  timestamp: Date;
  data?: Record<string, any>;
  relationshipType?: string;
  relationshipId?: string | number;
  userId?: number;
}

class IntegrationService {
  private eventEmitter: BrowserEventEmitter;
  private dataRelationships: Map<string, any[]>;
  private isInitialized: boolean = false;

  constructor() {
    this.eventEmitter = new BrowserEventEmitter();
    this.dataRelationships = new Map();
    
    // Set higher limit for event listeners
    this.eventEmitter.setMaxListeners(50);
  }

  /**
   * Initialize the integration service and establish initial connections
   */
  public initialize(): void {
    if (this.isInitialized) return;
    
    console.log('IntegrationService: Initializing');
    
    // Register default relationships
    this.registerDefaultRelationships();
    
    this.isInitialized = true;
  }

  /**
   * Register default relationships between different modules and entities
   */
  private registerDefaultRelationships(): void {
    // Define relationships between modules
    this.registerRelationship('invoices', 'clients', 'invoices_to_clients');
    this.registerRelationship('expenses', 'inventory', 'expenses_to_inventory');
    this.registerRelationship('contracts', 'clients', 'contracts_to_clients');
    this.registerRelationship('payroll', 'employees', 'payroll_to_employees');
    this.registerRelationship('timeTracking', 'employees', 'timeTracking_to_employees');
    this.registerRelationship('timeTracking', 'clients', 'timeTracking_to_clients');
    this.registerRelationship('banking', 'financials', 'banking_to_financials');
    this.registerRelationship('inventory', 'financials', 'inventory_to_financials');
  }

  /**
   * Register an event listener
   */
  public on(event: IntegrationEvent, listener: (payload: IntegrationEventPayload) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove an event listener
   */
  public off(event: IntegrationEvent, listener: (payload: IntegrationEventPayload) => void): void {
    this.eventEmitter.off(event, listener);
  }

  /**
   * Emit an event
   */
  public emit(event: IntegrationEvent, payload: IntegrationEventPayload): void {
    // Add timestamp if not present
    if (!payload.timestamp) {
      payload.timestamp = new Date();
    }
    
    console.log(`IntegrationService: Emitting ${event}`, payload);
    
    this.eventEmitter.emit(event, payload);

    // If this is an entity update, check for relationships and propagate
    if (event.startsWith('entity:')) {
      this.propagateRelationships(payload);
    }

    // Check if notification should be created
    if (event !== 'notification:created') {
      this.checkNotificationTrigger(event, payload);
    }
  }

  /**
   * Register a relationship between two modules
   */
  public registerRelationship(
    sourceModule: ModuleType, 
    targetModule: ModuleType, 
    relationshipType: string
  ): void {
    const key = `${sourceModule}:${targetModule}`;
    
    if (!this.dataRelationships.has(key)) {
      this.dataRelationships.set(key, []);
    }
    
    const relationships = this.dataRelationships.get(key) || [];
    
    if (!relationships.includes(relationshipType)) {
      relationships.push(relationshipType);
      console.log(`IntegrationService: Registered relationship ${relationshipType} between ${sourceModule} and ${targetModule}`);
    }
  }

  /**
   * Propagate changes across registered relationships
   */
  private propagateRelationships(payload: IntegrationEventPayload): void {
    const { module, entityType, entityId } = payload;
    
    // Find all potential target modules that have a relationship with this module
    // Use Array.from to convert Map iterator to array to avoid downlevelIteration issues
    for (const [key, relationshipTypes] of Array.from(this.dataRelationships.entries())) {
      const [sourceModule, targetModule] = key.split(':');
      
      if (sourceModule === module) {
        // Emit module interaction event for each relationship
        relationshipTypes.forEach((relationshipType: string) => {
          this.emit('module:interaction', {
            module: targetModule as ModuleType,
            entityType: 'transaction', // Generic transaction type for module interactions
            entityId: 'system',
            timestamp: new Date(),
            data: {
              sourceModule: module,
              sourceEntityType: entityType,
              sourceEntityId: entityId,
              relationshipType
            }
          });
        });
      }
    }
  }

  /**
   * Determine if an event should trigger a notification
   */
  private checkNotificationTrigger(event: IntegrationEvent, payload: IntegrationEventPayload): void {
    // Define events that should trigger notifications
    const notificationTriggers = [
      { event: 'entity:created', entityType: 'invoice' },
      { event: 'entity:updated', entityType: 'invoice' },
      { event: 'entity:created', entityType: 'contract' },
      { event: 'entity:updated', entityType: 'inventory', action: 'lowStock' },
      { event: 'entity:created', entityType: 'expense' },
      { event: 'entity:created', entityType: 'client' },
      { event: 'entity:created', entityType: 'employee' },
      { event: 'entity:updated', entityType: 'taxDocument' },
    ];
    
    // Check if this event should trigger a notification
    const shouldTrigger = notificationTriggers.some(trigger => {
      if (trigger.event === event && trigger.entityType === payload.entityType) {
        if (trigger.action && trigger.action !== payload.action) {
          return false;
        }
        return true;
      }
      return false;
    });
    
    if (shouldTrigger) {
      // Create a notification payload based on the event
      this.createNotificationFromEvent(event, payload);
    }
  }

  /**
   * Create a notification from an event
   */
  private createNotificationFromEvent(event: IntegrationEvent, payload: IntegrationEventPayload): void {
    // Define a mapping from events to notification content
    let notificationData: {
      title: string;
      message: string;
      type: 'success' | 'error' | 'warning' | 'info';
      priority: 'low' | 'medium' | 'high';
    } | null = null;
    
    const { module, entityType, entityId, action, data } = payload;
    
    // Determine notification content based on event and entity type
    if (event === 'entity:created' && entityType === 'invoice') {
      notificationData = {
        title: 'New Invoice Created',
        message: `Invoice ${data?.invoiceNumber || `#${entityId}`} has been created.`,
        type: 'success',
        priority: 'medium'
      };
    } else if (event === 'entity:updated' && entityType === 'invoice') {
      notificationData = {
        title: 'Invoice Updated',
        message: `Invoice ${data?.invoiceNumber || `#${entityId}`} has been updated.`,
        type: 'info',
        priority: 'low'
      };
    } else if (event === 'entity:created' && entityType === 'contract') {
      notificationData = {
        title: 'New Contract Created',
        message: `Contract with ${data?.clientName || 'a client'} has been created.`,
        type: 'success',
        priority: 'medium'
      };
    } else if (event === 'entity:updated' && entityType === 'inventory' && action === 'lowStock') {
      notificationData = {
        title: 'Low Inventory Alert',
        message: `${data?.itemName || 'An item'} is running low with only ${data?.quantity || 'few'} units remaining.`,
        type: 'warning',
        priority: 'high'
      };
    } else if (event === 'entity:created' && entityType === 'expense') {
      notificationData = {
        title: 'New Expense Recorded',
        message: `A ${data?.category || ''} expense for ${data?.amount || '$0.00'} has been recorded.`,
        type: 'info',
        priority: 'low'
      };
    } else if (event === 'entity:created' && entityType === 'client') {
      notificationData = {
        title: 'New Client Added',
        message: `${data?.clientName || 'A new client'} has been added to your client list.`,
        type: 'success',
        priority: 'medium'
      };
    } else if (event === 'entity:updated' && entityType === 'taxDocument') {
      notificationData = {
        title: 'Tax Document Updated',
        message: `Tax document for ${data?.period || 'a period'} has been updated.`,
        type: 'warning',
        priority: 'high'
      };
    }
    
    if (notificationData) {
      // Emit a notification:created event
      this.emit('notification:created', {
        module,
        entityType,
        entityId,
        timestamp: new Date(),
        data: {
          ...notificationData,
          actionUrl: this.determineActionUrl(module, entityType, entityId)
        }
      });
    }
  }

  /**
   * Determine the appropriate URL for an action link in a notification
   */
  private determineActionUrl(module: ModuleType, entityType: EntityType, entityId: string | number): string {
    // Map module types to their respective routes
    const moduleRoutes: Record<ModuleType, string> = {
      financials: '/financials',
      inventory: '/inventory',
      contracts: '/contracts',
      expenses: '/expenses',
      invoices: '/invoices',
      clients: '/client-management',
      employees: '/employee-management',
      payroll: '/payroll-processing',
      budget: '/budget-planning',
      tax: '/tax-management',
      timeTracking: '/time-tracking',
      banking: '/bank-reconciliation'
    };
    
    // Generate the action URL based on module and entity type
    return `${moduleRoutes[module]}/${entityId}`;
  }
}

// Create a singleton instance
export const integrationService = new IntegrationService();

// Initialize on import
integrationService.initialize();

export default integrationService;