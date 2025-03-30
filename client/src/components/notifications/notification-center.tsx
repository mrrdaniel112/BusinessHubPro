import React, { useState } from 'react';
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';
import { useNotifications, Notification } from '@/context/notification-context';
import { useAuth } from '@/context/auth-context';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

// NotificationItem component
const NotificationItem = ({ notification, onRead }: { notification: Notification; onRead: () => void }) => {
  // Handle timestamp formatting
  const timestamp = typeof notification.timestamp === 'string' 
    ? new Date(notification.timestamp) 
    : notification.timestamp;
  
  const formattedTime = formatDistanceToNow(timestamp, { addSuffix: true });
  
  // Determine icon and style based on notification type
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-amber-100 text-amber-800';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Determine priority badge styles
  const getPriorityStyles = () => {
    switch (notification.priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const handleClick = () => {
    if (!notification.isRead) {
      onRead();
    }
  };
  
  return (
    <div 
      className={`p-4 border-b border-gray-200 transition-colors 
        ${notification.isRead ? 'bg-white' : 'bg-blue-50'} hover:bg-gray-50`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${getTypeStyles()}`}>
          {!notification.isRead && <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-sm text-gray-900 truncate">{notification.title}</h4>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{formattedTime}</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{notification.message}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{notification.module}</span>
              {notification.priority !== 'low' && (
                <Badge variant="outline" className={`text-xs px-1.5 py-0 h-5 ${getPriorityStyles()}`}>
                  {notification.priority}
                </Badge>
              )}
            </div>
            
            {notification.actionUrl && (
              <Link to={notification.actionUrl}>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">View</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { 
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  } = useNotifications();
  
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return !notification.isRead;
    return true;
  });
  
  // Sort notifications by date (newest first)
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Group notifications by date (today, yesterday, earlier)
  const groupedNotifications = sortedNotifications.reduce((groups, notification) => {
    const date = new Date(notification.timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    let group = 'Earlier';
    
    if (date.toDateString() === today.toDateString()) {
      group = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      group = 'Yesterday';
    }
    
    if (!groups[group]) {
      groups[group] = [];
    }
    
    groups[group].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);
  
  if (!user) {
    return null; // Don't show notifications if user is not logged in
  }
  
  return (
    <>
      {/* Mobile version - Sheet slide-in panel */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          
          <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col h-dvh">
            <SheetHeader className="px-4 py-3 border-b">
              <div className="flex justify-between items-center">
                <SheetTitle>Notifications</SheetTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={() => markAllAsRead()}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all as read
                </Button>
              </div>
              
              <Tabs 
                defaultValue="all" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger 
                    value="unread" 
                    className="flex-1"
                    disabled={unreadCount === 0}
                  >
                    Unread {unreadCount > 0 && `(${unreadCount})`}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </SheetHeader>
            
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              ) : sortedNotifications.length > 0 ? (
                <div>
                  {Object.entries(groupedNotifications).map(([date, notifications]) => (
                    <div key={date}>
                      <div className="sticky top-0 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-500">
                        {date}
                      </div>
                      
                      {notifications.map(notification => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={() => markAsRead(notification.id)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  No notifications to display
                </div>
              )}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Desktop version - Popover dropdown */}
      <div className="hidden md:block">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80 md:w-96 p-0" align="end">
            <div className="px-4 py-3 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => markAllAsRead()}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                <span className="text-xs">Mark all as read</span>
              </Button>
            </div>
            
            <Tabs 
              defaultValue="all" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full rounded-none px-4 py-2 border-b">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger 
                  value="unread" 
                  className="flex-1"
                  disabled={unreadCount === 0}
                >
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="m-0">
                <ScrollArea className="h-80">
                  {isLoading ? (
                    <div className="p-4 space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : sortedNotifications.length > 0 ? (
                    <div>
                      {Object.entries(groupedNotifications).map(([date, notifications]) => (
                        <div key={date}>
                          <div className="sticky top-0 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-500">
                            {date}
                          </div>
                          
                          {notifications.map(notification => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              onRead={() => markAsRead(notification.id)}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                      No notifications to display
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="unread" className="m-0">
                <ScrollArea className="h-80">
                  {isLoading ? (
                    <div className="p-4 space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : filteredNotifications.length > 0 ? (
                    <div>
                      {Object.entries(groupedNotifications).map(([date, notifications]) => (
                        <div key={date}>
                          <div className="sticky top-0 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-500">
                            {date}
                          </div>
                          
                          {notifications.map(notification => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              onRead={() => markAsRead(notification.id)}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-500 p-4">
                      <Check className="h-8 w-8 text-green-500 mb-2" />
                      <p>You're all caught up!</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};