/**
 * Notification Service
 * 
 * This service provides real-time notifications for cross-module events
 * in the business platform, keeping users informed of important changes.
 */

import { apiRequest, queryClient } from '@/lib/queryClient';

// Notification priority levels
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Notification types for visual distinction
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

// Notification structure
export interface Notification {
  id?: number;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: NotificationType;
  priority: NotificationPriority;
  module: string;
  entityType?: string;
  entityId?: number | string;
  actionUrl?: string;
  userId?: number;
}

// Mapping from event names to notification creators
type EventNotificationMap = Record<string, (payload: any) => Notification>;

// This maps system events to specific notification formats
const eventNotificationMap: EventNotificationMap = {
  // Invoice events
  'invoice.created': (payload) => ({
    title: 'New Invoice Created',
    message: `Invoice #${payload.invoiceNumber} for ${formatCurrency(payload.total)} has been created.`,
    timestamp: new Date(),
    isRead: false,
    type: NotificationType.SUCCESS,
    priority: NotificationPriority.MEDIUM,
    module: 'Invoices',
    entityType: 'invoice',
    entityId: payload.id,
    actionUrl: `/invoices/${payload.id}`
  }),
  
  'invoice.sent': (payload) => ({
    title: 'Invoice Sent',
    message: `Invoice #${payload.invoiceNumber} was sent to ${payload.clientName}.`,
    timestamp: new Date(),
    isRead: false,
    type: NotificationType.INFO,
    priority: NotificationPriority.MEDIUM,
    module: 'Invoices',
    entityType: 'invoice',
    entityId: payload.id,
    actionUrl: `/invoices/${payload.id}`
  }),
  
  'invoice.paid': (payload) => ({
    title: 'Payment Received',
    message: `Payment of ${formatCurrency(payload.amount)} received for Invoice #${payload.invoiceNumber}.`,
    timestamp: new Date(),
    isRead: false,
    type: NotificationType.SUCCESS,
    priority: NotificationPriority.HIGH,
    module: 'Invoices',
    entityType: 'invoice',
    entityId: payload.id,
    actionUrl: `/invoices/${payload.id}`
  }),
  
  'invoice.overdue': (payload) => ({
    title: 'Invoice Overdue',
    message: `Invoice #${payload.invoiceNumber} for ${payload.clientName} is overdue by ${payload.daysOverdue} days.`,
    timestamp: new Date(),
    isRead: false,
    type: NotificationType.WARNING,
    priority: NotificationPriority.HIGH,
    module: 'Invoices',
    entityType: 'invoice',
    entityId: payload.id,
    actionUrl: `/invoices/${payload.id}`
  }),

  // Client events
  'client.created': (payload) => ({
    title: 'New Client Added',
    message: `${payload.name} has been added as a new client.`,
    timestamp: new Date(),
    isRead: false,
    type: NotificationType.INFO,
    priority: NotificationPriority.MEDIUM,
    module: 'Clients',
    entityType: 'client',
    entityId: payload.id,
    actionUrl: `/client-management/${payload.id}`
  }),
  
  'client.updated': (payload) => ({
    title: 'Client Information Updated',
    message: `${payload.name}'s information has been updated.`,
    timestamp: new Date(),
    isRead: false,
    type: NotificationType.INFO,
    priority: NotificationPriority.LOW,
    module: 'Clients',
    entityType: 'client',
    entityId: payload.id,
    actionUrl: `/client-management/${payload.id}`
  }),
  
  // Expense events
  'expense.created': (payload) => ({
    title: 'New Expense Recorded',
    message: `A new expense of ${formatCurrency(payload.amount)} has been recorded for ${payload.category}.`,
    timestamp: new Date(),
    isRead: false,
    type: NotificationType.INFO,
    priority: NotificationPriority.MEDIUM,
    module: 'Expenses',
    entityType: 'expense',
    entityId: payload.id,
    actionUrl: `/expenses/${payload.id}`
  }),
  
  'expense.approved': (payload) => ({
    title: 'Expense Approved',
    message: `The ${payload.category} expense for ${formatCurrency(payload.amount)} has been approved.`,
    timestamp: new Date(),
    isRead: false,
    type: NotificationType.SUCCESS,
    priority: NotificationPriority.MEDIUM,
    module: 'Expenses',
    entityType: 'expense',
    entityId: payload.id,
    actionUrl: `/expenses/${payload.id}`
  }),
  
  'expense.rejected': (payload) => ({
    title: 'Expense Rejected',
    message: `The ${payload.category} expense for ${formatCurrency(payload.amount)} has been rejected.`,
    timestamp: new Date(),
    isRead: false,
    type: NotificationType.WARNING,
    priority: NotificationPriority.MEDIUM,
    module: 'Expenses',
    entityType: 'expense',
    entityId: payload.id,
    actionUrl: `/expenses/${payload.id}`
  }),
  
  // Inventory events
  'inventory.low_stock': (payload) => ({
    title: 'Low Inventory Alert',
    message: `${payload.itemName} is running low with only ${payload.quantityRemaining} units remaining.`,
    timestamp: new Date(),
    isRead: false,
    type: NotificationType.WARNING,
    priority: NotificationPriority.HIGH,
    module: 'Inventory',
    entityType: 'inventory',
    entityId: payload.id,
    actionUrl: `/inventory/${payload.id}`
  }),
  
  'inventory.out_of_stock': (payload) => ({
    title: 'Out of Stock Alert',
    message: `${payload.itemName} is now out of stock.`,
    timestamp: new Date(),
    isRead: false,
    type: NotificationType.ERROR,
    priority: NotificationPriority.URGENT,
    module: 'Inventory',
    entityType: 'inventory',
    entityId: payload.id,
    actionUrl: `/inventory/${payload.id}`
  }),
  
  // Integration events
  'integration.error': (payload) => ({
    title: 'Integration Error',
    message: payload.message || `An error occurred while syncing data between ${payload.sourceModule} and ${payload.targetModule}.`,
    timestamp: new Date(),
    isRead: false,
    type: NotificationType.ERROR,
    priority: NotificationPriority.HIGH,
    module: 'System',
    entityType: 'integration',
    entityId: payload.transactionId
  }),
  
  'integration.conflict': (payload) => ({
    title: 'Data Conflict Detected',
    message: payload.message || `A data conflict was detected between ${payload.sourceModule} and ${payload.targetModule}.`,
    timestamp: new Date(),
    isRead: false,
    type: NotificationType.WARNING,
    priority: NotificationPriority.HIGH,
    module: 'System',
    entityType: 'integration',
    entityId: payload.entityId,
    actionUrl: `/${payload.entityType}s/${payload.entityId}`
  }),
  
  // Account and system events
  'system.maintenance': (payload) => ({
    title: 'Scheduled Maintenance',
    message: `System maintenance is scheduled for ${new Date(payload.date).toLocaleString()}. The platform may be unavailable for ${payload.duration} minutes.`,
    timestamp: new Date(),
    isRead: false,
    type: NotificationType.INFO,
    priority: NotificationPriority.MEDIUM,
    module: 'System'
  }),
  
  'system.update': (payload) => ({
    title: 'System Update Available',
    message: `A new update (v${payload.version}) is available with new features and improvements.`,
    timestamp: new Date(),
    isRead: false,
    type: NotificationType.INFO,
    priority: NotificationPriority.MEDIUM,
    module: 'System',
    actionUrl: '/updates'
  }),
  
  'account.subscription': (payload) => ({
    title: 'Subscription Update',
    message: `Your subscription will ${payload.action} on ${new Date(payload.date).toLocaleDateString()}.`,
    timestamp: new Date(),
    isRead: false,
    type: NotificationType.INFO,
    priority: NotificationPriority.HIGH,
    module: 'Billing',
    actionUrl: '/billing'
  })
};

// Utility function to format currency values
function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numValue);
}

/**
 * Create a notification from a system event
 * @param event The event name
 * @param payload The data associated with the event
 * @returns The created notification or null if no mapping exists
 */
export function createNotificationFromEvent(event: string, payload: any): Notification | null {
  // Check if we have a notification mapper for this event
  if (event in eventNotificationMap) {
    return eventNotificationMap[event](payload);
  }
  return null;
}

/**
 * Save a notification to the server
 * @param notification The notification to save
 * @returns Promise with the saved notification
 */
export async function saveNotification(notification: Notification): Promise<Notification> {
  try {
    const response = await apiRequest('POST', '/api/notifications', notification);
    return await response.json();
  } catch (error) {
    console.error('Failed to save notification:', error);
    // Return original notification with temporary ID
    return {
      ...notification,
      id: notification.id || Math.floor(Math.random() * -1000) // Use negative IDs for unsaved notifications
    };
  }
}

/**
 * Mark a notification as read
 * @param notificationId ID of the notification to mark as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  try {
    await apiRequest('PATCH', `/api/notifications/${notificationId}`, { isRead: true });
    // Invalidate the notifications cache
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await apiRequest('POST', '/api/notifications/mark-all-read', {});
    // Invalidate the notifications cache
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
}

/**
 * Delete a notification
 * @param notificationId ID of the notification to delete
 */
export async function deleteNotification(notificationId: number): Promise<void> {
  try {
    await apiRequest('DELETE', `/api/notifications/${notificationId}`);
    // Invalidate the notifications cache
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    throw error;
  }
}

/**
 * Process an event and create a notification if applicable
 * @param event The event name
 * @param payload The data associated with the event
 */
export async function processEventForNotification(event: string, payload: any): Promise<void> {
  // Create a notification from the event
  const notification = createNotificationFromEvent(event, payload);
  
  // If we have a notification mapping, save it
  if (notification) {
    await saveNotification(notification);
    
    // Invalidate the notifications cache to show the new notification
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  }
}