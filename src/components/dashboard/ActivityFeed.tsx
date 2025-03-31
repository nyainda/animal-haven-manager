import React, { useState } from 'react';
import { Activity } from '@/services/ActivityApi';
import { 
  Bell, 
  Clock, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  MessageCircle 
} from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ActivityFeedProps {
  activities: Activity[];
  notifications: any[]; // Adjust type as needed
  setNotifications: (notifications: any[]) => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  notifications, 
  setNotifications 
}) => {
  const [filter, setFilter] = useState('all');
  
  // Group activities by date for better organization
  const groupActivitiesByDate = () => {
    const grouped = activities.reduce((acc, activity) => {
      const date = new Date(activity.activity_date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    }, {} as Record<string, Activity[]>);
    
    return grouped;
  };
  
  const groupedActivities = groupActivitiesByDate();
  const dates = Object.keys(groupedActivities).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'comment':
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      case 'event':
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  // Get activity color based on type
  const getActivityColor = (type: string) => {
    switch(type.toLowerCase()) {
      case 'comment':
      case 'message':
        return 'bg-blue-100 text-blue-800';
      case 'event':
      case 'meeting':
        return 'bg-purple-100 text-purple-800';
      case 'task':
        return 'bg-green-100 text-green-800';
      case 'alert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format activity date
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Filter activities
  const filteredActivities = (date: string) => {
    if (filter === 'all') return groupedActivities[date];
    return groupedActivities[date].filter(activity => 
      activity.activity_type.toLowerCase().includes(filter)
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications([]);
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Activity Feed</CardTitle>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={markAllAsRead}
                  >
                    <Bell className="h-4 w-4" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filter activities</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Activities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('comment')}>
                  Comments Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('meeting')}>
                  Meetings Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('task')}>
                  Tasks Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="activities" className="px-4 pb-4">
        <TabsList className="mb-4">
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
            {notifications.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {notifications.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="activities">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No activities yet.
            </p>
          ) : (
            dates.map(date => (
              <div key={date} className="mb-4">
                <div className="sticky top-0 bg-background z-10">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    {new Date(date).toLocaleDateString(undefined, { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <div className="h-px bg-border mb-4"></div>
                </div>
                
                <div className="space-y-4">
                  {filteredActivities(date).map((activity) => (
                    <div 
                      key={activity.id} 
                      className="relative pl-6 pb-4"
                    >
                      <div className="absolute left-0 top-1">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${getActivityColor(activity.activity_type)}`}>
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        {/* Timeline connector */}
                        <div className="absolute top-6 left-3 w-px h-full bg-border"></div>
                      </div>
                      
                      <div className="ml-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge variant="outline" className={getActivityColor(activity.activity_type)}>
                              {activity.activity_type.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatTime(activity.activity_date)}
                            </span>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Copy Link
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <p className="mt-1 text-sm">{activity.description}</p>
                        {activity.notes && (
                          <div className="mt-2 p-2 bg-muted rounded-md">
                            <p className="text-xs text-muted-foreground">
                              {activity.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="notifications">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No unread notifications.
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-3 bg-muted rounded-md">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.date).toLocaleString()}
                  </p>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ActivityFeed;