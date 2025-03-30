/**
 * Data Relationship Mapping Service
 * 
 * This service helps define and navigate relationships between different entity types
 * throughout the business platform, enabling cohesive cross-module functionality.
 */

import { apiRequest } from "@/lib/queryClient";

// Types of relationships between entities
export enum RelationshipType {
  OneToOne = 'oneToOne',
  OneToMany = 'oneToMany',
  ManyToOne = 'manyToOne',
  ManyToMany = 'manyToMany'
}

// Structure defining relationships between entities
export interface EntityRelationship {
  sourceEntity: string;
  targetEntity: string;
  type: RelationshipType;
  sourceField: string;
  targetField: string;
  description: string;
}

// Define all entity relationships in the system
export const entityRelationships: EntityRelationship[] = [
  // Client relationships
  {
    sourceEntity: 'client',
    targetEntity: 'invoice',
    type: RelationshipType.OneToMany,
    sourceField: 'id',
    targetField: 'clientId',
    description: 'A client can have multiple invoices'
  },
  {
    sourceEntity: 'client',
    targetEntity: 'contract',
    type: RelationshipType.OneToMany,
    sourceField: 'id',
    targetField: 'clientId',
    description: 'A client can have multiple contracts'
  },
  
  // Invoice relationships
  {
    sourceEntity: 'invoice',
    targetEntity: 'client',
    type: RelationshipType.ManyToOne,
    sourceField: 'clientId',
    targetField: 'id',
    description: 'An invoice belongs to a client'
  },
  {
    sourceEntity: 'invoice',
    targetEntity: 'payment',
    type: RelationshipType.OneToMany,
    sourceField: 'id',
    targetField: 'invoiceId',
    description: 'An invoice can have multiple payments'
  },
  {
    sourceEntity: 'invoice',
    targetEntity: 'contract',
    type: RelationshipType.ManyToOne,
    sourceField: 'contractId',
    targetField: 'id',
    description: 'An invoice can be associated with a contract'
  },
  
  // Contract relationships
  {
    sourceEntity: 'contract',
    targetEntity: 'client',
    type: RelationshipType.ManyToOne,
    sourceField: 'clientId',
    targetField: 'id',
    description: 'A contract belongs to a client'
  },
  {
    sourceEntity: 'contract',
    targetEntity: 'invoice',
    type: RelationshipType.OneToMany,
    sourceField: 'id',
    targetField: 'contractId',
    description: 'A contract can have multiple invoices'
  },
  
  // Expense relationships
  {
    sourceEntity: 'expense',
    targetEntity: 'expenseCategory',
    type: RelationshipType.ManyToOne,
    sourceField: 'categoryId',
    targetField: 'id',
    description: 'An expense belongs to a category'
  },
  {
    sourceEntity: 'expense',
    targetEntity: 'project',
    type: RelationshipType.ManyToOne,
    sourceField: 'projectId',
    targetField: 'id',
    description: 'An expense can be associated with a project'
  },
  {
    sourceEntity: 'expense',
    targetEntity: 'user',
    type: RelationshipType.ManyToOne,
    sourceField: 'submittedBy',
    targetField: 'id',
    description: 'An expense is submitted by a user'
  },
  
  // Product/Inventory relationships
  {
    sourceEntity: 'product',
    targetEntity: 'productCategory',
    type: RelationshipType.ManyToOne,
    sourceField: 'categoryId',
    targetField: 'id',
    description: 'A product belongs to a category'
  },
  {
    sourceEntity: 'product',
    targetEntity: 'inventory',
    type: RelationshipType.OneToOne,
    sourceField: 'id',
    targetField: 'productId',
    description: 'A product has inventory information'
  },
  {
    sourceEntity: 'product',
    targetEntity: 'supplier',
    type: RelationshipType.ManyToOne,
    sourceField: 'supplierId',
    targetField: 'id',
    description: 'A product comes from a supplier'
  },
  
  // Project relationships
  {
    sourceEntity: 'project',
    targetEntity: 'client',
    type: RelationshipType.ManyToOne,
    sourceField: 'clientId',
    targetField: 'id',
    description: 'A project belongs to a client'
  },
  {
    sourceEntity: 'project',
    targetEntity: 'task',
    type: RelationshipType.OneToMany,
    sourceField: 'id',
    targetField: 'projectId',
    description: 'A project can have multiple tasks'
  },
  {
    sourceEntity: 'project',
    targetEntity: 'expense',
    type: RelationshipType.OneToMany,
    sourceField: 'id',
    targetField: 'projectId',
    description: 'A project can have multiple expenses'
  },
  
  // Time tracking relationships
  {
    sourceEntity: 'timeEntry',
    targetEntity: 'project',
    type: RelationshipType.ManyToOne,
    sourceField: 'projectId',
    targetField: 'id',
    description: 'A time entry is associated with a project'
  },
  {
    sourceEntity: 'timeEntry',
    targetEntity: 'task',
    type: RelationshipType.ManyToOne,
    sourceField: 'taskId',
    targetField: 'id',
    description: 'A time entry can be for a specific task'
  },
  {
    sourceEntity: 'timeEntry',
    targetEntity: 'user',
    type: RelationshipType.ManyToOne,
    sourceField: 'userId',
    targetField: 'id',
    description: 'A time entry belongs to a user'
  },
  
  // User relationships
  {
    sourceEntity: 'user',
    targetEntity: 'role',
    type: RelationshipType.ManyToOne,
    sourceField: 'roleId',
    targetField: 'id',
    description: 'A user has a role'
  },
  {
    sourceEntity: 'user',
    targetEntity: 'timeEntry',
    type: RelationshipType.OneToMany,
    sourceField: 'id',
    targetField: 'userId',
    description: 'A user can have multiple time entries'
  },
  {
    sourceEntity: 'user',
    targetEntity: 'expense',
    type: RelationshipType.OneToMany,
    sourceField: 'id',
    targetField: 'submittedBy',
    description: 'A user can submit multiple expenses'
  }
];

/**
 * Gets all relationships for a specific entity type
 * @param entityType Type of entity to get relationships for
 * @returns Array of related entity relationships
 */
export function getEntityRelationships(entityType: string): EntityRelationship[] {
  // Return all relationships where this entity is either the source or target
  return entityRelationships.filter(
    rel => rel.sourceEntity === entityType || rel.targetEntity === entityType
  );
}

/**
 * Gets related entities for a specific entity
 * @param entityType Type of entity (client, invoice, etc.)
 * @param entityId ID of the entity
 * @param relatedEntityType Type of related entity to find
 * @returns Promise with array of related entities
 */
export async function getRelatedEntities(
  entityType: string,
  entityId: number | string,
  relatedEntityType: string
): Promise<any[]> {
  try {
    // First find the relationship between these entity types
    const relationship = entityRelationships.find(
      rel => (rel.sourceEntity === entityType && rel.targetEntity === relatedEntityType) ||
             (rel.sourceEntity === relatedEntityType && rel.targetEntity === entityType)
    );
    
    if (!relationship) {
      throw new Error(`No relationship defined between ${entityType} and ${relatedEntityType}`);
    }
    
    // Determine the correct API endpoint and query parameter based on the relationship
    let endpoint: string;
    let queryParams: Record<string, string> = {};
    
    if (relationship.sourceEntity === entityType && relationship.targetEntity === relatedEntityType) {
      // Query from source to target (e.g., get all invoices for a client)
      endpoint = `/api/${relatedEntityType}s`;
      queryParams[relationship.targetField] = entityId.toString();
    } else {
      // Query from target to source (e.g., get the client for an invoice)
      endpoint = `/api/${relatedEntityType}s/${entityId}/related/${entityType}`;
    }
    
    // Make the API request
    // For GET requests, pass query params as the third parameter
    const response = await apiRequest('GET', endpoint, undefined, { params: queryParams });
    return await response.json();
  } catch (error) {
    console.error('Error fetching related entities:', error);
    return [];
  }
}

/**
 * Updates related entities when a primary entity changes
 * @param entityType Type of entity that changed
 * @param entityId ID of the entity
 * @param updates Updates that were applied
 */
export async function updateRelatedEntities(
  entityType: string,
  entityId: number | string,
  updates: Record<string, any>
): Promise<void> {
  try {
    // Get all relationships for this entity type
    const relationships = getEntityRelationships(entityType);
    
    // Check each relationship to see if updates affect related entities
    for (const relationship of relationships) {
      // Only process if this entity is the source
      if (relationship.sourceEntity === entityType) {
        // Check if any updated field is the sourceField for a relationship
        if (relationship.sourceField in updates) {
          // Update the related entity
          await apiRequest('POST', `/api/integration/update-related`, {
            sourceEntity: entityType,
            sourceId: entityId,
            targetEntity: relationship.targetEntity,
            relationship,
            updates
          });
        }
      }
    }
  } catch (error) {
    console.error('Error updating related entities:', error);
  }
}