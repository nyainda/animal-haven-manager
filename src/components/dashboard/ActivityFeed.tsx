import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivityIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Activity {
  id: string;
  type: 'add' | 'update' | 'adoption' | 'medical' | 'production';
  content: string;
  time: string;
  user: string;
}

interface Notification {
  id: string;
  content: string;
  time: string;
  read: boolean;
}

interface ActivityFeedProps {
  activities: Activity[];
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, notifications, setNotifications }) => {
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleNotificationClick = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent activity to display.</p>
          ) : (
            activities.map(activity => (
              <div
                key={activity.id}
                className="flex items-start p-3 rounded-lg border hover:bg-muted/30 transition-colors"
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center mr-3',
                    activity.type === 'production' && 'bg-purple-100 text-purple-600',
                    activity.type === 'medical' && 'bg-amber-100 text-amber-600'
                  )}
                >
                  <ActivityIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">{activity.content}</p>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">By {activity.user}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No notifications yet.</p>
          ) : (
            <>
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-3 rounded-lg border relative cursor-pointer hover:bg-muted/30',
                    !notification.read && 'bg-primary/5 border-primary/30'
                  )}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  {!notification.read && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />
                  )}
                  <p className="font-medium">{notification.content}</p>
                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                </div>
              ))}
              <Button variant="ghost" className="mt-4" onClick={markAllNotificationsAsRead}>
                Mark All as Read
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityFeed;