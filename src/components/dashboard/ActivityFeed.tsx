
import React, { useState } from 'react';
import { Activity } from '@/services/ActivityApi';
import { 
  Activity as ActivityIcon,
  Bell, 
  Clock, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  X
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
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  
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
      case 'task':
        return <CheckCircle className="h-4 w-4" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  // Get activity color based on type
  const getActivityColor = (type: string) => {
    switch(type.toLowerCase()) {
      case 'comment':
      case 'message':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'event':
      case 'meeting':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'task':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'alert':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };
  
  // Format activity date
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Format full date
  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  // Helper function to get user initials from activity data
  const getUserInitials = (activity: Activity) => {
    // In a real app, you might extract this from the activity data
    // For demo purposes, using first letter of activity type
    return activity.activity_type.charAt(0).toUpperCase();
  };
  
  // Toggle activity expansion
  const toggleActivityExpansion = (activityId: string) => {
    if (expandedActivity === activityId) {
      setExpandedActivity(null);
    } else {
      setExpandedActivity(activityId);
    }
  };
  
  // Activity animation variants
  const activityVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: i * 0.05,
        duration: 0.3
      }
    }),
    exit: { opacity: 0, y: -10 }
  };
  
  return (
    <Card className="shadow-md border border-border/50">
      <CardHeader className="pb-2 space-y-1.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <ActivityIcon className="h-4 w-4 text-primary" />
            </span>
            <CardTitle className="text-xl font-semibold">Activity Feed</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 relative"
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
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setFilter('all')} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${filter === 'all' ? 'bg-primary' : 'bg-muted'}`}></span>
                  All Activities
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter('comment')} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full bg-blue-500 ${filter === 'comment' ? 'opacity-100' : 'opacity-40'}`}></span>
                  Comments
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('meeting')} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full bg-purple-500 ${filter === 'meeting' ? 'opacity-100' : 'opacity-40'}`}></span>
                  Meetings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('task')} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full bg-green-500 ${filter === 'task' ? 'opacity-100' : 'opacity-40'}`}></span>
                  Tasks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('alert')} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full bg-red-500 ${filter === 'alert' ? 'opacity-100' : 'opacity-40'}`}></span>
                  Alerts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <CardDescription>
          Recent activity and important updates for your animals
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="activities" className="px-4 pb-4">
        <TabsList className="mb-4 bg-muted/50 w-full justify-start">
          <TabsTrigger value="activities" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
            <ActivityIcon className="h-4 w-4" />
            <span>Activities</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
            {notifications.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 flex items-center justify-center rounded-full">
                {notifications.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="activities" className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <ActivityIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium mb-1">No activities yet</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Activities will appear here as they occur. Check back soon.
              </p>
            </div>
          ) : (
            dates.map((date, dateIndex) => (
              <div key={date} className="mb-6 last:mb-0">
                <div className="sticky top-0 bg-background z-10 py-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {new Date(date).toLocaleDateString(undefined, { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <div className="flex-grow h-px bg-border"></div>
                  </div>
                </div>
                
                <AnimatePresence>
                  <div className="space-y-4">
                    {filteredActivities(date).map((activity, index) => (
                      <motion.div 
                        key={activity.id} 
                        className="relative pl-6"
                        custom={index}
                        variants={activityVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <div className="absolute left-0 top-1.5">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center ${getActivityColor(activity.activity_type)}`}>
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          {/* Timeline connector */}
                          {index < filteredActivities(date).length - 1 && (
                            <div className="absolute top-6 left-3 w-px h-full bg-border"></div>
                          )}
                        </div>
                        
                        <div className="ml-4 bg-card/50 rounded-lg border border-border/50 p-3 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarFallback className="text-xs bg-primary/20 text-primary">
                                  {getUserInitials(activity)}
                                </AvatarFallback>
                              </Avatar>
                              <Badge variant="outline" className={`${getActivityColor(activity.activity_type)} text-xs`}>
                                {activity.activity_type.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground ml-2">
                                {formatTime(activity.activity_date)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 rounded-full"
                                onClick={() => toggleActivityExpansion(activity.id)}
                              >
                                {expandedActivity === activity.id ? (
                                  <X className="h-3.5 w-3.5" />
                                ) : (
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <p className="text-sm">{activity.description}</p>
                            
                            <Collapsible open={expandedActivity === activity.id}>
                              <CollapsibleContent className="mt-3 space-y-3">
                                {activity.notes && (
                                  <div className="p-3 bg-muted rounded-md">
                                    <p className="text-xs text-muted-foreground">
                                      {activity.notes}
                                    </p>
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between text-xs">
                                  <time className="text-muted-foreground">{formatFullDate(activity.activity_date)}</time>
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                                      View Details
                                    </Button>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="notifications">
          <div className="max-h-[500px] overflow-y-auto pr-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium mb-1">No notifications</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  You're all caught up! New notifications will appear here.
                </p>
              </div>
            ) : (
              <motion.div className="space-y-3">
                {notifications.map((notification, index) => (
                  <motion.div 
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 bg-muted/50 rounded-lg border border-border/50 flex items-start gap-3"
                  >
                    <div className="mt-1">
                      {notification.type === 'alert' ? (
                        <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      ) : notification.type === 'info' ? (
                        <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <MessageCircle className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.date).toLocaleString()}
                        </p>
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          View
                        </Button>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </Button>
              </motion.div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ActivityFeed;
