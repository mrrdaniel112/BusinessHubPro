import React, { createContext, useContext, ReactNode } from 'react';
import { 
  syncModuleData, 
  updateAIInsights, 
  handleCrossModuleEvent,
  getIntegratedEntityData,
  updateAcrossModules
} from '@/services/integration';

// Define the context type
interface IntegrationContextType {
  // Cross-module event handling
  syncData: (sourceModule: string, data: any) => void;
  updateInsights: (dataType: string) => void;
  handleEvent: (event: string, payload: any) => void;
  
  // Integrated data functions
  getEntityData: (entityType: string, entityId: string | number) => Promise<Record<string, any>>;
  updateEntity: (entityType: string, entityId: string | number, updates: Record<string, any>) => Promise<void>;
  
  // Entity relationships functions
  getRelatedEntities: (entityType: string, entityId: string | number, relationType: string) => Promise<any[]>;
}

// Create the context with a default value
const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

// Provider component
export function IntegrationProvider({ children }: { children: ReactNode }) {
  // Implement the sync data function
  const syncData = (sourceModule: string, data: any) => {
    syncModuleData(sourceModule, data);
  };
  
  // Implement the update insights function
  const updateInsights = (dataType: string) => {
    updateAIInsights(dataType);
  };
  
  // Implement the handle event function
  const handleEvent = (event: string, payload: any) => {
    handleCrossModuleEvent(event, payload);
  };
  
  // Implement the get entity data function
  const getEntityData = async (entityType: string, entityId: string | number) => {
    return await getIntegratedEntityData(entityType, entityId);
  };
  
  // Implement the update entity function
  const updateEntity = async (entityType: string, entityId: string | number, updates: Record<string, any>) => {
    await updateAcrossModules(entityType, entityId, updates);
  };
  
  // Additional function to get related entities
  const getRelatedEntities = async (entityType: string, entityId: string | number, relationType: string) => {
    // Map of relationships between entity types
    const relationMappings: Record<string, Record<string, string>> = {
      'client': {
        'invoices': '/api/clients/${id}/invoices',
        'contracts': '/api/clients/${id}/contracts',
        'appointments': '/api/clients/${id}/appointments',
      },
      'invoice': {
        'client': '/api/invoices/${id}/client',
        'payments': '/api/invoices/${id}/payments',
        'items': '/api/invoices/${id}/items',
      },
      'inventory': {
        'suppliers': '/api/inventory/${id}/suppliers',
        'transactions': '/api/inventory/${id}/transactions',
        'finances': '/api/inventory/${id}/finances',
      },
      'employee': {
        'timeEntries': '/api/employees/${id}/time-entries',
        'payroll': '/api/employees/${id}/payroll',
        'projects': '/api/employees/${id}/projects',
      },
    };
    
    // Get the appropriate endpoint
    const endpoints = relationMappings[entityType] || {};
    const endpoint = endpoints[relationType];
    
    if (!endpoint) {
      console.error(`No relation found for ${entityType} to ${relationType}`);
      return [];
    }
    
    // Replace the ID placeholder with the actual ID
    const url = endpoint.replace('${id}', entityId.toString());
    
    try {
      // Fetch the related entities
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch related ${relationType} for ${entityType} ${entityId}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching related entities:', error);
      return [];
    }
  };
  
  // Create the context value object
  const contextValue: IntegrationContextType = {
    syncData,
    updateInsights,
    handleEvent,
    getEntityData,
    updateEntity,
    getRelatedEntities
  };
  
  return (
    <IntegrationContext.Provider value={contextValue}>
      {children}
    </IntegrationContext.Provider>
  );
}

// Custom hook to use the integration context
export function useIntegration() {
  const context = useContext(IntegrationContext);
  
  if (context === undefined) {
    throw new Error('useIntegration must be used within an IntegrationProvider');
  }
  
  return context;
}