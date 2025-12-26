import React, { useState } from 'react';
import { Bell, CheckCheck, X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEduFlare } from '@/contexts/EduFlareContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { effectiveUser, isImpersonating } = useEffectiveUser();
  const { 
    notifications, 
    getUnreadNotificationCount, 
    markNotificationRead, 
    markAllNotificationsRead 
  } = useEduFlare();

  const userId = (isImpersonating ? effectiveUser?.id : user?.id) || 'demo-user';
  const unreadCount = getUnreadNotificationCount(userId);
  const userNotifications = notifications.slice(0, 10); // Show last 10

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'error': return <XCircle className="w-4 h-4 text-error" />;
      default: return <Info className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-error text-white text-[10px] font-bold px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-card rounded-xl border border-border shadow-elevated overflow-hidden z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead(userId)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {userNotifications.length > 0 ? (
                  userNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markNotificationRead(notification.id)}
                      className={cn(
                        'p-4 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors cursor-pointer',
                        !notification.read && 'bg-primary/5'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {userNotifications.length > 0 && (
                <div className="p-3 border-t border-border bg-muted/30">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center text-xs text-primary hover:underline"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
