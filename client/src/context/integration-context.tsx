import React, { createContext, useContext, useEffect } from 'react';
import integrationService, { 
  IntegrationEvent,
  IntegrationEventPayload, 
  ModuleType,
  EntityType 
} from '@/services/integration';
import { useAuth } from './auth-context';
import { useNotifications } from './notification-context';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface IntegrationContextType {
  // Emit an integration event
  emitEvent: (event: IntegrationEvent, payload: Omit<IntegrationEventPayload, 'timestamp'>) => void;
  
  // Register an event listener
  onEvent: (event: IntegrationEvent, listener: (payload: IntegrationEventPayload) => void) => void;
  
  // Unregister an event listener
  offEvent: (event: IntegrationEvent, listener: (payload: IntegrationEventPayload) => void) => void;
  
  // Register a data relationship between modules
  registerRelationship: (sourceModule: ModuleType, targetModule: ModuleType, relationshipType: string) => void;
  
  // Create an entity
  createEntity: (module: ModuleType, entityType: EntityType, data: any) => Promise<any>;
  
  // Update an entity
  updateEntity: (module: ModuleType, entityType: EntityType, entityId: string | number, data: any) => Promise<any>;
  
  // Delete an entity
  deleteEntity: (module: ModuleType, entityType: EntityType, entityId: string | number) => Promise<void>;
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

export const IntegrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();
  
  // Set up mutations for CRUD operations
  const createEntityMutation = useMutation({
    mutationFn: async ({ module, entityType, data }: { 
      module: ModuleType; 
      entityType: EntityType; 
      data: any;
    }) => {
      // Map module and entity types to API endpoints
      const endpoint = getEndpointForModuleAndEntity(module, entityType);
      
      // Make API request
      const response = await apiRequest('POST', endpoint, data);
      
      // Parse response
      const result = await response.json();
      
      return result;
    }
  });
  
  const updateEntityMutation = useMutation({
    mutationFn: async ({ module, entityType, entityId, data }: { 
      module: ModuleType; 
      entityType: EntityType; 
      entityId: string | number;
      data: any;
    }) => {
      // Map module and entity types to API endpoints
      const endpoint = `${getEndpointForModuleAndEntity(module, entityType)}/${entityId}`;
      
      // Make API request
      const response = await apiRequest('PATCH', endpoint, data);
      
      // Parse response
      const result = await response.json();
      
      return result;
    }
  });
  
  const deleteEntityMutation = useMutation({
    mutationFn: async ({ module, entityType, entityId }: { 
      module: ModuleType; 
      entityType: EntityType; 
      entityId: string | number;
    }) => {
      // Map module and entity types to API endpoints
      const endpoint = `${getEndpointForModuleAndEntity(module, entityType)}/${entityId}`;
      
      // Make API request
      await apiRequest('DELETE', endpoint);
    }
  });
  
  // Helper function to map module and entity types to API endpoints
  const getEndpointForModuleAndEntity = (module: ModuleType, entityType: EntityType): string => {
    // Simple mapping for now - can be expanded as needed
    const endpointMap: Record<EntityType, string> = {
      transaction: '/api/transactions',
      invoice: '/api/invoices',
      contract: '/api/contracts',
      expense: '/api/expenses',
      inventory: '/api/inventory',
      client: '/api/clients',
      employee: '/api/employees',
      payroll: '/api/payroll',
      taxDocument: '/api/tax-documents',
      timeEntry: '/api/time-entries',
      bankTransaction: '/api/bank-transactions'
    };
    
    return endpointMap[entityType];
  };
  
  // Set up listener for notification events
  useEffect(() => {
    if (!user) return;
    
    // Listen for notification events
    const handleNotificationCreated = (payload: IntegrationEventPayload) => {
      console.log('Notification created:', payload);
      
      // Refresh notifications when a new one is created
      refreshNotifications();
    };
    
    // Register the listener
    integrationService.on('notification:created', handleNotificationCreated);
    
    // Clean up when unmounting
    return () => {
      integrationService.off('notification:created', handleNotificationCreated);
    };
  }, [user, refreshNotifications]);
  
  // Wrap the integration service methods
  const emitEvent = (event: IntegrationEvent, payload: Omit<IntegrationEventPayload, 'timestamp'>) => {
    // Add userId from auth context if available
    const fullPayload = {
      ...payload,
      timestamp: new Date(),
      userId: user?.id
    };
    
    console.log('IntegrationContext: Emitting event', event, fullPayload);
    integrationService.emit(event, fullPayload as IntegrationEventPayload);
  };
  
  const onEvent = (event: IntegrationEvent, listener: (payload: IntegrationEventPayload) => void) => {
    integrationService.on(event, listener);
  };
  
  const offEvent = (event: IntegrationEvent, listener: (payload: IntegrationEventPayload) => void) => {
    integrationService.off(event, listener);
  };
  
  const registerRelationship = (sourceModule: ModuleType, targetModule: ModuleType, relationshipType: string) => {
    integrationService.registerRelationship(sourceModule, targetModule, relationshipType);
  };
  
  // CRUD operations with event emission
  const createEntity = async (module: ModuleType, entityType: EntityType, data: any) => {
    try {
      // Create the entity via API
      const result = await createEntityMutation.mutateAsync({ module, entityType, data });
      
      // Emit created event
      emitEvent('entity:created', {
        module,
        entityType,
        entityId: result.id,
        data: result
      });
      
      return result;
    } catch (error) {
      console.error(`Error creating ${entityType} in ${module}:`, error);
      throw error;
    }
  };
  
  const updateEntity = async (module: ModuleType, entityType: EntityType, entityId: string | number, data: any) => {
    try {
      // Update the entity via API
      const result = await updateEntityMutation.mutateAsync({ module, entityType, entityId, data });
      
      // Emit updated event
      emitEvent('entity:updated', {
        module,
        entityType,
        entityId,
        data: result
      });
      
      return result;
    } catch (error) {
      console.error(`Error updating ${entityType} ${entityId} in ${module}:`, error);
      throw error;
    }
  };
  
  const deleteEntity = async (module: ModuleType, entityType: EntityType, entityId: string | number) => {
    try {
      // Delete the entity via API
      await deleteEntityMutation.mutateAsync({ module, entityType, entityId });
      
      // Emit deleted event
      emitEvent('entity:deleted', {
        module,
        entityType,
        entityId
      });
    } catch (error) {
      console.error(`Error deleting ${entityType} ${entityId} in ${module}:`, error);
      throw error;
    }
  };
  
  return (
    <IntegrationContext.Provider
      value={{
        emitEvent,
        onEvent,
        offEvent,
        registerRelationship,
        createEntity,
        updateEntity,
        deleteEntity
      }}
    >
      {children}
    </IntegrationContext.Provider>
  );
};

export const useIntegration = () => {
  const context = useContext(IntegrationContext);
  
  if (context === undefined) {
    throw new Error('useIntegration must be used within an IntegrationProvider');
  }
  
  return context;
};