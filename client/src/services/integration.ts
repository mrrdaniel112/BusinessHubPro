/**
 * Integration Service
 * 
 * This service helps connect various modules of the application, ensuring data flows smoothly
 * between different features and providing a cohesive user experience.
 */

import { queryClient } from "@/lib/queryClient";

/**
 * Synchronizes data between different modules when changes occur
 * @param sourceModule The module where the change originated
 * @param data The data that was changed
 */
export function syncModuleData(sourceModule: string, data: any): void {
  // Invalidate relevant queries based on the source module
  const moduleMappings: Record<string, string[]> = {
    // When financial data changes, update these related modules
    'finances': ['/api/dashboard', '/api/financials', '/api/cash-flow', '/api/tax-management'],
    
    // When invoice data changes, update these related modules
    'invoices': ['/api/dashboard', '/api/financials', '/api/cash-flow', '/api/client-management'],
    
    // When expense data changes, update these related modules
    'expenses': ['/api/dashboard', '/api/financials', '/api/cash-flow', '/api/tax-management'],
    
    // When inventory data changes, update these related modules
    'inventory': ['/api/dashboard', '/api/inventory-cost-analysis', '/api/financials'],
    
    // When client data changes, update these related modules
    'clients': ['/api/dashboard', '/api/invoices', '/api/contracts', '/api/client-management'],
    
    // When employee data changes, update these related modules
    'employees': ['/api/dashboard', '/api/payroll-processing', '/api/time-tracking', '/api/employee-management'],
    
    // When contract data changes, update these related modules
    'contracts': ['/api/dashboard', '/api/invoices', '/api/client-management'],
    
    // When bank data changes, update these related modules
    'banking': ['/api/dashboard', '/api/financials', '/api/bank-reconciliation', '/api/cash-flow'],
    
    // When tax data changes, update these related modules
    'taxes': ['/api/dashboard', '/api/financials', '/api/tax-management'],
    
    // When calendar data changes, update these related modules
    'calendar': ['/api/dashboard', '/api/time-tracking', '/api/client-management'],
    
    // When time tracking data changes, update these related modules
    'timeTracking': ['/api/dashboard', '/api/payroll-processing', '/api/employee-management'],
    
    // When payroll data changes, update these related modules
    'payroll': ['/api/dashboard', '/api/financials', '/api/employee-management'],
    
    // When budget data changes, update these related modules
    'budget': ['/api/dashboard', '/api/financials', '/api/cash-flow', '/api/budget-planning'],
  };

  // Find queries to invalidate
  const queriesToInvalidate = moduleMappings[sourceModule] || [];
  
  // Invalidate all affected queries
  queriesToInvalidate.forEach(queryKey => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  });
}

/**
 * Updates AI insights when relevant data changes occur
 * @param dataType The type of data that changed
 */
export function updateAIInsights(dataType: string): void {
  // Force refresh of AI insights based on data type
  queryClient.invalidateQueries({ queryKey: ['/api/ai-insights'] });
  
  // Update specific insight types based on the data change
  const insightMappings: Record<string, string[]> = {
    'financial': ['financial-health', 'cash-flow-forecast'],
    'inventory': ['inventory-optimization', 'supply-chain'],
    'clients': ['client-relationships', 'sales-forecast'],
    'expenses': ['expense-patterns', 'cost-saving-opportunities'],
    'time': ['productivity-analysis', 'resource-allocation'],
  };
  
  // Find specific insights to update
  const insightsToUpdate = insightMappings[dataType] || [];
  
  // Invalidate specific insight queries
  insightsToUpdate.forEach(insightType => {
    queryClient.invalidateQueries({ queryKey: [`/api/ai-insights/${insightType}`] });
  });
}

/**
 * Connect events from one module to actions in another
 * @param event The event that occurred
 * @param payload The data associated with the event
 */
export function handleCrossModuleEvent(event: string, payload: any): void {
  // Map events to actions in other modules
  switch (event) {
    case 'invoice.created':
      // When an invoice is created, update financial forecasts and client information
      syncModuleData('finances', payload);
      syncModuleData('clients', payload);
      updateAIInsights('financial');
      break;
    
    case 'expense.recorded':
      // When an expense is recorded, update financial data and tax information
      syncModuleData('finances', payload);
      syncModuleData('taxes', payload);
      updateAIInsights('expenses');
      break;
    
    case 'client.added':
      // When a client is added, update related modules
      syncModuleData('clients', payload);
      updateAIInsights('clients');
      break;
    
    case 'inventory.updated':
      // When inventory changes, update cost analysis and supply chain insights
      syncModuleData('inventory', payload);
      updateAIInsights('inventory');
      break;
    
    case 'time.tracked':
      // When time entries are recorded, update payroll and project tracking
      syncModuleData('timeTracking', payload);
      syncModuleData('payroll', payload);
      updateAIInsights('time');
      break;
    
    case 'transaction.imported':
      // When bank transactions are imported, update financial data
      syncModuleData('banking', payload);
      syncModuleData('finances', payload);
      updateAIInsights('financial');
      break;
    
    case 'contract.signed':
      // When a contract is signed, update invoicing and client management
      syncModuleData('contracts', payload);
      syncModuleData('clients', payload);
      updateAIInsights('clients');
      break;
    
    default:
      console.log('Unhandled cross-module event:', event);
  }
}

// Data integration helpers

/**
 * Gets related data for a specific entity across modules
 * @param entityType The type of entity (client, invoice, etc.)
 * @param entityId The ID of the entity
 */
export async function getIntegratedEntityData(entityType: string, entityId: string | number) {
  // Define the data sources based on entity type
  const dataSources: Record<string, string[]> = {
    'client': ['/api/clients', '/api/invoices', '/api/contracts'],
    'invoice': ['/api/invoices', '/api/clients', '/api/finances'],
    'expense': ['/api/expenses', '/api/taxes', '/api/finances'],
    'employee': ['/api/employees', '/api/time-tracking', '/api/payroll-processing'],
    'inventory': ['/api/inventory', '/api/inventory-cost-analysis', '/api/finances'],
  };
  
  const sources = dataSources[entityType] || [];
  
  // Collect data from all relevant sources
  const results = await Promise.all(
    sources.map(async (source) => {
      try {
        // Use query client to fetch data with existing cached data when available
        const data = await queryClient.fetchQuery({
          queryKey: [`${source}/${entityId}`],
          queryFn: () => fetch(`${source}/${entityId}`).then(res => res.json())
        });
        return { source, data, success: true };
      } catch (error) {
        console.error(`Error fetching data from ${source}:`, error);
        return { source, data: null, success: false };
      }
    })
  );
  
  // Combine results into a single object
  return results.reduce((combined, result) => {
    if (result.success) {
      const moduleName = result.source.split('/')[2]; // Extract module name from path
      combined[moduleName] = result.data;
    }
    return combined;
  }, {} as Record<string, any>);
}

/**
 * Updates data across multiple modules
 * @param entityType The type of entity being updated
 * @param entityId The ID of the entity
 * @param updates The updates to apply
 */
export async function updateAcrossModules(
  entityType: string, 
  entityId: string | number, 
  updates: Record<string, any>
): Promise<void> {
  // Get a list of APIs to update based on entity type and the updates provided
  const updateEndpoints: Record<string, string[]> = {
    'client': ['/api/clients', '/api/client-management'],
    'invoice': ['/api/invoices', '/api/finances'],
    'expense': ['/api/expenses', '/api/finances', '/api/tax-management'],
    'employee': ['/api/employees', '/api/payroll-processing'],
    'inventory': ['/api/inventory', '/api/inventory-cost-analysis'],
  };
  
  const endpoints = updateEndpoints[entityType] || [];
  
  // Send updates to all relevant endpoints
  await Promise.all(
    endpoints.map(async (endpoint) => {
      try {
        const response = await fetch(`${endpoint}/${entityId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update ${endpoint}`);
        }
      } catch (error) {
        console.error(`Error updating ${endpoint}:`, error);
        // Continue with other updates even if one fails
      }
    })
  );
  
  // Determine which modules were affected and sync their data
  const moduleMapping: Record<string, string> = {
    '/api/clients': 'clients',
    '/api/client-management': 'clients',
    '/api/invoices': 'invoices',
    '/api/finances': 'finances',
    '/api/expenses': 'expenses',
    '/api/tax-management': 'taxes',
    '/api/employees': 'employees',
    '/api/payroll-processing': 'payroll',
    '/api/inventory': 'inventory',
    '/api/inventory-cost-analysis': 'inventory',
  };
  
  // Sync data for all affected modules
  const affectedModules = new Set(endpoints.map(endpoint => moduleMapping[endpoint]));
  affectedModules.forEach(module => {
    if (module) {
      syncModuleData(module, { entityType, entityId, updates });
    }
  });
  
  // Update AI insights based on the entity type
  const insightMapping: Record<string, string> = {
    'client': 'clients',
    'invoice': 'financial',
    'expense': 'expenses',
    'employee': 'time',
    'inventory': 'inventory',
  };
  
  const insightType = insightMapping[entityType];
  if (insightType) {
    updateAIInsights(insightType);
  }
}