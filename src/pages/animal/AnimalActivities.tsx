import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  ChevronLeft, 
  BarChart2,
  List,
  Pencil,
  Trash2,
  LayoutDashboard,
  Calendar,
  Clock,
  Tag,
  AlertCircle
} from 'lucide-react';
import { 
  Activity, 
  fetchActivities, 
  deleteActivity 
} from '@/services/ActivityApi';

interface ActivityManagementProps {
  animalId: string;
}

type ViewMode = 'list' | 'summary';

export function ActivityManagement({ animalId }: ActivityManagementProps) {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isLoading, setIsLoading] = useState(false);

  const loadActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchActivities(animalId);
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [animalId]);

  React.useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleDelete = useCallback(async (activityId: string) => {
    try {
      setIsLoading(true);
      await deleteActivity(animalId, activityId);
      setActivities(prev => prev.filter(a => a.id !== activityId));
    } catch (error) {
      console.error('Failed to delete activity:', error);
    } finally {
      setIsLoading(false);
    }
  }, [animalId]);

  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'PP');
    } catch {
      return dateString;
    }
  };

  const activityActions = useMemo(() => ({
    onEdit: (activity: Activity) => {
      navigate(`/animals/${animalId}/activities/${activity.id}/edit`);
    },
    onDelete: (activityId: string) => handleDelete(activityId)
  }), [handleDelete, navigate, animalId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300">
              Activity Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 ml-14">
            Track and manage all activities for this animal
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() => navigate(`/animals/${animalId}/activities/new`)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-4 py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={isLoading}
          >
            <Plus className="mr-2 h-5 w-5" />
            New Activity
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl px-4 py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={isLoading}
          >
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
        </div>

        {/* View Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex justify-center">
            <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg inline-flex">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`rounded-lg px-4 py-2 ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-300 shadow-md' 
                    : 'bg-transparent text-gray-600 dark:text-gray-300'
                }`}
              >
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
              <Button
                variant={viewMode === 'summary' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('summary')}
                className={`rounded-lg px-4 py-2 ${
                  viewMode === 'summary' 
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-300 shadow-md' 
                    : 'bg-transparent text-gray-600 dark:text-gray-300'
                }`}
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Summary View
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-400 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading activities...</p>
          </div>
        ) : viewMode === 'list' ? (
          <ActivityListView 
            activities={activities}
            formatDate={formatDate}
            actions={activityActions}
          />
        ) : (
          <ActivitySummaryView 
            activities={activities}
            formatDate={formatDate}
          />
        )}
      </div>
    </div>
  );
}

// ActivityListView Component
interface ActivityListViewProps {
  activities: Activity[];
  formatDate: (date: string) => string;
  actions: {
    onEdit: (activity: Activity) => void;
    onDelete: (activityId: string) => void;
  };
}

function ActivityListView({ activities, formatDate, actions }: ActivityListViewProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <List className="h-10 w-10 text-indigo-600 dark:text-indigo-300" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
          No Activities Recorded
        </h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6">
          Start tracking activities by adding your first entry. This will help you monitor care and treatment over time.
        </p>
        <div className="inline-flex items-center text-indigo-600 dark:text-indigo-300">
          <Plus className="h-5 w-5 mr-2" />
          <span>Add your first activity</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {activities.map(activity => (
        <div 
          key={activity.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border-l-4 border-indigo-500 dark:border-indigo-400"
        >
          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    {activity.activity_type.replace('_', ' ').toUpperCase()}
                  </h3>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(activity.activity_date)}</span>
                </div>
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => actions.onEdit(activity)}
                    className="text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => actions.onDelete(activity.id)}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {activity.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ActivitySummaryView Component
interface ActivitySummaryViewProps {
  activities: Activity[];
  formatDate: (date: string) => string;
}

function ActivitySummaryView({ activities, formatDate }: ActivitySummaryViewProps) {
  const summary = useMemo(() => {
    if (activities.length === 0) return [];
    
    const counts = activities.reduce((acc, curr) => {
      acc[curr.activity_type] = (acc[curr.activity_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .map(([type, count]) => ({
        type: type.replace('_', ' ').toUpperCase(),
        count,
        percentage: ((count / activities.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
  }, [activities]);

  const recent = activities.slice(0, 5);
  
  // Determine the max count for visualization
  const maxCount = summary.length > 0 ? Math.max(...summary.map(item => item.count)) : 0;

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart2 className="h-10 w-10 text-indigo-600 dark:text-indigo-300" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
          No Data to Summarize
        </h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          Add activities to generate insights and visualize patterns over time.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Activity Distribution */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-700 dark:to-purple-700 text-white p-5">
          <CardTitle className="text-xl font-bold">Activity Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-4">
            {summary.map(item => (
              <div key={item.type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.type}</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full" 
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  {item.percentage}% of total
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-700 dark:to-purple-700 text-white p-5">
          <CardTitle className="text-xl font-bold">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-3 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:to-purple-500 dark:before:from-indigo-400 dark:before:to-purple-400">
            {recent.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No recent activities to display</p>
              </div>
            ) : (
              recent.map((activity, index) => (
                <div key={activity.id} className="relative pl-10">
                  <div className="absolute left-0 top-1.5 w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{index + 1}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 shadow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-300">
                        {activity.activity_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(activity.activity_date)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats Card */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden lg:col-span-2">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-700 dark:to-purple-700 text-white p-5">
          <CardTitle className="text-xl font-bold">Activity Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Tag className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                {activities.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Activities
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                {summary.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Activity Types
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart2 className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                {summary.length > 0 ? summary[0].type : "N/A"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Most Common Type
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}