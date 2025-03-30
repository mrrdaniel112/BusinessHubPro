/**
 * Error Handling Service
 * 
 * This service provides robust error handling for the entire application,
 * with special focus on integration operations between modules.
 */

import { queryClient } from "@/lib/queryClient";
import { processEventForNotification } from "./notification";

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error types
export enum ErrorType {
  NETWORK = 'network',
  API = 'api',
  DATABASE = 'database',
  VALIDATION = 'validation',
  AUTHORIZATION = 'authorization',
  INTEGRATION = 'integration',
  BUSINESS_LOGIC = 'business_logic',
  UNKNOWN = 'unknown'
}

// Error information structure
export interface ErrorInfo {
  message: string;
  code?: string;
  severity: ErrorSeverity;
  type: ErrorType;
  module?: string;
  timestamp: Date;
  details?: Record<string, any>;
  transactionId?: string;
  userId?: number;
  handled: boolean;
}

// Define module-specific error messages
const moduleErrorMessages: Record<string, Record<string, string>> = {
  invoices: {
    creation_failed: "Failed to create invoice. Please check the provided information and try again.",
    update_failed: "Failed to update invoice status.",
    not_found: "The requested invoice could not be found.",
    duplicate: "An invoice with this number already exists.",
    invalid_status: "The requested status change is not allowed.",
  },
  finances: {
    sync_failed: "Failed to synchronize financial data.",
    calculation_failed: "Failed to calculate financial metrics.",
    tax_error: "Error processing tax information.",
  },
  clients: {
    creation_failed: "Failed to create client record.",
    update_failed: "Failed to update client information.",
    duplicate_email: "A client with this email already exists.",
    invalid_data: "The client data provided is invalid.",
  },
  inventory: {
    stock_update_failed: "Failed to update inventory stock levels.",
    low_stock: "Low stock levels detected.",
    out_of_stock: "Item is out of stock.",
    data_sync_failed: "Failed to synchronize inventory data.",
  },
  integration: {
    sync_failed: "Failed to synchronize data between modules.",
    relationship_error: "Error establishing entity relationship.",
    event_handler_failed: "Failed to process cross-module event.",
    data_consistency_error: "Data consistency error detected across modules.",
  }
};

// Error record for logging
const errorLog: ErrorInfo[] = [];

/**
 * Generate a transaction ID for tracking related errors
 * @returns A unique transaction ID
 */
export function generateTransactionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Log an error to the console and error log
 * @param error The error that occurred
 * @param errorInfo Additional information about the error
 */
export function logError(error: Error, errorInfo: Partial<ErrorInfo>): ErrorInfo {
  // Create a complete error info object
  const completeErrorInfo: ErrorInfo = {
    message: error.message,
    code: errorInfo.code,
    severity: errorInfo.severity || ErrorSeverity.ERROR,
    type: errorInfo.type || ErrorType.UNKNOWN,
    module: errorInfo.module,
    timestamp: new Date(),
    details: {
      ...errorInfo.details,
      stack: error.stack
    },
    transactionId: errorInfo.transactionId || generateTransactionId(),
    userId: errorInfo.userId,
    handled: false
  };
  
  // Log to console with appropriate styling
  console.group(`%c[${completeErrorInfo.severity.toUpperCase()}] ${completeErrorInfo.type}`, 
    completeErrorInfo.severity === ErrorSeverity.CRITICAL 
      ? 'color: red; font-weight: bold' 
      : completeErrorInfo.severity === ErrorSeverity.ERROR
        ? 'color: red'
        : completeErrorInfo.severity === ErrorSeverity.WARNING
          ? 'color: orange'
          : 'color: blue'
  );
  console.log('Error:', error);
  console.log('Module:', completeErrorInfo.module || 'Not specified');
  console.log('Time:', completeErrorInfo.timestamp.toLocaleString());
  console.log('Transaction ID:', completeErrorInfo.transactionId);
  console.log('Details:', completeErrorInfo.details);
  console.groupEnd();
  
  // Add to error log
  errorLog.push(completeErrorInfo);
  
  // If we have too many errors, remove the oldest ones
  if (errorLog.length > 100) {
    errorLog.splice(0, 20); // Remove oldest 20 errors
  }
  
  return completeErrorInfo;
}

/**
 * Get a user-friendly error message based on the module and error code
 * @param module The module where the error occurred
 * @param code The error code
 * @param defaultMessage A default message if no specific message is found
 * @returns A user-friendly error message
 */
export function getErrorMessage(module: string, code: string, defaultMessage: string): string {
  if (module in moduleErrorMessages && code in moduleErrorMessages[module]) {
    return moduleErrorMessages[module][code];
  }
  return defaultMessage;
}

/**
 * Handle an integration error between modules
 * @param error The error that occurred
 * @param sourceModule The module where the error originated
 * @param targetModule The module that was affected
 * @param operation The operation that failed
 * @param entityId The ID of the entity involved
 */
export async function handleIntegrationError(
  error: Error,
  sourceModule: string,
  targetModule: string,
  operation: string,
  entityId?: number | string
): Promise<void> {
  // Generate a transaction ID for tracking this error chain
  const transactionId = generateTransactionId();
  
  // Log the error with integration-specific details
  const errorInfo = logError(error, {
    code: 'integration_failure',
    severity: ErrorSeverity.ERROR,
    type: ErrorType.INTEGRATION,
    module: sourceModule,
    transactionId,
    details: {
      sourceModule,
      targetModule,
      operation,
      entityId
    }
  });
  
  // Create a user-friendly error message
  const message = getErrorMessage(
    'integration',
    'sync_failed',
    `Failed to synchronize data between ${sourceModule} and ${targetModule}`
  );
  
  // Notify user of the error
  await processEventForNotification('integration.error', {
    sourceModule,
    targetModule,
    message,
    details: errorInfo.details
  });
  
  // Mark error as handled
  errorInfo.handled = true;
}

/**
 * Retry a failed integration operation
 * @param operation The function to retry
 * @param maxRetries Maximum number of retry attempts
 * @param delay Delay between retries in milliseconds
 * @returns The result of the operation, or throws an error if all retries fail
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Attempt the operation
      return await operation();
    } catch (error) {
      // Store the last error
      lastError = error as Error;
      
      // Log retry attempt
      console.warn(`Retry attempt ${attempt + 1}/${maxRetries} failed:`, error);
      
      // Wait before next retry
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        // Increase delay for next attempt (exponential backoff)
        delay *= 2;
      }
    }
  }
  
  // If we get here, all retries failed
  throw lastError || new Error('Operation failed after maximum retry attempts');
}

/**
 * Rollback changes when an integration operation fails
 * @param transactionId ID of the transaction to rollback
 * @param operations List of operations to undo
 */
export async function rollbackChanges(
  transactionId: string,
  operations: { module: string, endpoint: string, id: number | string }[]
): Promise<void> {
  console.group(`Rollback for transaction: ${transactionId}`);
  
  for (const op of operations) {
    try {
      // Call the API to rollback the change
      await fetch(`/api/${op.module}/${op.endpoint}/${op.id}/rollback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId })
      });
      
      console.log(`Rolled back ${op.module}/${op.endpoint}/${op.id}`);
      
      // Invalidate queries for this module
      queryClient.invalidateQueries({ queryKey: [`/api/${op.module}`] });
    } catch (error) {
      console.error(`Failed to rollback ${op.module}/${op.endpoint}/${op.id}:`, error);
    }
  }
  
  console.groupEnd();
}

/**
 * Check if an error is due to a network issue
 * @param error The error to check
 * @returns True if the error is a network error
 */
export function isNetworkError(error: Error): boolean {
  // Check if the error message indicates a network issue
  return error.message.includes('network') || 
         error.message.includes('Failed to fetch') ||
         error.message.includes('Network request failed') ||
         error.message.includes('timeout') ||
         error.message.includes('abort');
}

/**
 * Handle conflicts when multiple modules try to update the same data
 * @param sourceModule First module involved in the conflict
 * @param targetModule Second module involved in the conflict
 * @param entityType Type of entity with the conflict
 * @param entityId ID of the entity
 * @param conflictingField Field with the conflict
 * @param sourceValue Value from the source module
 * @param targetValue Value from the target module
 */
export async function handleDataConflict(
  sourceModule: string,
  targetModule: string,
  entityType: string,
  entityId: number | string,
  conflictingField: string,
  sourceValue: any,
  targetValue: any
): Promise<void> {
  // Log the conflict
  console.warn(`Data conflict detected:`, {
    sourceModule,
    targetModule,
    entityType,
    entityId,
    conflictingField,
    sourceValue,
    targetValue
  });
  
  // Create an error notification for the user
  await processEventForNotification('integration.conflict', {
    sourceModule,
    targetModule,
    entityType,
    entityId,
    conflictingField,
    message: `Data conflict detected between ${sourceModule} and ${targetModule}.`
  });
  
  // In this implementation, we'll use "last write wins" strategy
  // Ideally, this would be configurable or use more sophisticated conflict resolution
  
  // Resolve by using the most recent value (in this case, the target value)
  try {
    await fetch(`/api/${entityType}s/${entityId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        [conflictingField]: targetValue,
        _conflict_resolution: true // Flag to indicate this is a conflict resolution
      })
    });
    
    // Invalidate queries for both modules
    queryClient.invalidateQueries({ queryKey: [`/api/${sourceModule}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/${targetModule}`] });
  } catch (error) {
    console.error(`Failed to resolve conflict:`, error);
  }
}

/**
 * Get error statistics by type and module
 * @returns Statistics about errors in the system
 */
export function getErrorStatistics(): { byType: Record<string, number>, byModule: Record<string, number> } {
  const byType: Record<string, number> = {};
  const byModule: Record<string, number> = {};
  
  // Count errors by type and module
  errorLog.forEach(err => {
    // Count by type
    byType[err.type] = (byType[err.type] || 0) + 1;
    
    // Count by module if available
    if (err.module) {
      byModule[err.module] = (byModule[err.module] || 0) + 1;
    }
  });
  
  return { byType, byModule };
}

/**
 * Clear the error log
 */
export function clearErrorLog(): void {
  errorLog.length = 0;
}