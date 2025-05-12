import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string | Date;
  isRead: boolean;
  type: NotificationType;
  priority: NotificationPriority;
  module: string;
  entityType: string;
  entityId: string;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [refreshFlag, setRefreshFlag] = useState(0);

  // Query to fetch notifications
  const {
    data: notificationsData,
    error,
    isLoading,
    refetch
  } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', refreshFlag],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    // Only fetch notifications if we're authenticated
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Ensure notifications is always an array, even if API returns null
  const notifications = notificationsData || [];

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Function to mark a notification as read
  const markAsRead = async (id: number) => {
    try {
      await apiRequest('POST', `/api/notifications/${id}/read`);
      setRefreshFlag(prev => prev + 1); // Trigger a refetch
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read.',
        variant: 'destructive',
      });
    }
  };

  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await apiRequest('POST', '/api/notifications/read-all');
      setRefreshFlag(prev => prev + 1); // Trigger a refetch
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read.',
        variant: 'destructive',
      });
    }
  };

  const refreshNotifications = () => {
    setRefreshFlag(prev => prev + 1);
  };

  // Poll for new notifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshFlag(prev => prev + 1);
    }, 60000); // Poll every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};