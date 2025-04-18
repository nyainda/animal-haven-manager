import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  ArrowLeft,
  BarChart2,
  List,
  Pencil,
  Trash2,
  LayoutDashboard,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  Copy,
  Edit,
  FileText,
  Notebook,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'; // Added explicit import for Dialog components
import { Activity, fetchActivities, deleteActivity } from '@/services/ActivityApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface ActivityManagementProps {
  animalId: string;
}

type ViewMode = 'list' | 'summary';

// Reusable Dialog Component
interface ActivityDialogProps {
  open: boolean;
  onClose: () => void;
  activityId: string;
  field: 'description' | 'notes';
  content: string;
  activityType: string;
  activityDate: string;
  animalId: string;
}

function ActivityDialog({
  open,
  onClose,
  activityId,
  field,
  content,
  activityType,
  activityDate,
  animalId,
}: ActivityDialogProps) {
  const navigate = useNavigate();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optionally, add a toast notification here to confirm copy
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg transition-all duration-200 ease-in-out">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            {field === 'description' ? (
              <FileText className="h-5 w-5 text-primary" />
            ) : (
              <Notebook className="h-5 w-5 text-primary" />
            )}
            {activityType.replace('_', ' ').toUpperCase()} -{' '}
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Recorded on {format(parseISO(activityDate), 'PP')}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-foreground whitespace-pre-wrap">{content}</p>
        </div>
       
          <Button
            variant="outline"
            onClick={() => copyToClipboard(content)}
            aria-label={`Copy ${field} to clipboard`}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/animals/${animalId}/activities/${activityId}/edit`)}
              aria-label={`Edit ${activityType} activity`}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="default" onClick={onClose} aria-label="Close dialog">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  
  );
}

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
      setActivities((prev) => prev.filter((a) => a.id !== activityId));
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

  const activityActions = useMemo(
    () => ({
      onEdit: (activity: Activity) => {
        navigate(`/animals/${animalId}/activities/${activity.id}/edit`);
      },
      onDelete: (activityId: string) => handleDelete(activityId),
    }),
    [handleDelete, navigate, animalId]
  );

  const renderSkeletons = (count = 6) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="flex flex-col border-l-4 border-border shadow-sm min-h-[200px]"
        >
          <CardHeader className="p-4 pb-3">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardContent className="p-4 pt-2 pb-3 flex-grow">
            <div className="flex gap-2 mb-3">
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full w-10 h-10 flex items-center justify-center"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Activity Dashboard
              </h1>
              <p className="text-muted-foreground ml-1">
                Track and manage all activities for this animal
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={() => navigate(`/animals/${animalId}/activities/new`)}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-5 w-5" />
            New Activity
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            disabled={isLoading}
          >
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
        </div>

        {/* View Toggle */}
        <div className="mb-6">
          <div className="flex justify-start sm:justify-end">
            <div className="inline-flex p-1 rounded-lg bg-muted">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`rounded-lg px-4 py-2 ${
                  viewMode === 'list'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
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
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
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
          renderSkeletons()
        ) : viewMode === 'list' ? (
          <ActivityListView
            activities={activities}
            formatDate={formatDate}
            actions={activityActions}
            animalId={animalId}
          />
        ) : (
          <ActivitySummaryView
            activities={activities}
            formatDate={formatDate}
            animalId={animalId}
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
  animalId: string;
}

function ActivityListView({ activities, formatDate, actions, animalId }: ActivityListViewProps) {
  const [modalContent, setModalContent] = useState<{
    activityId: string;
    field: 'description' | 'notes';
    content: string;
    activityType: string;
    activityDate: string;
  } | null>(null);

  const openModal = (
    activityId: string,
    field: 'description' | 'notes',
    content: string,
    activityType: string,
    activityDate: string
  ) => {
    setModalContent({ activityId, field, content, activityType, activityDate });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  if (activities.length === 0) {
    return (
      <Card className="border-dashed border-border shadow-sm p-8 text-center">
        <CardContent className="pt-6">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <List className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-3">
            No Activities Recorded
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start tracking activities by adding your first entry. This will help you monitor care and treatment over time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {activities.map((activity) => {
          const isDescriptionLong = (activity.description?.length || 0) > 50;
          const isNotesLong = (activity.notes?.length || 0) > 50;
          const truncatedDescription = isDescriptionLong
            ? `${activity.description?.slice(0, 50)}...`
            : activity.description;
          const truncatedNotes = isNotesLong
            ? `${activity.notes?.slice(0, 50)}...`
            : activity.notes;

          return (
            <Card
              key={activity.id}
              className="flex flex-col border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow duration-200 min-h-[250px] max-h-[250px]"
            >
              <CardHeader className="p-4 pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {activity.activity_type.replace('_', ' ').toUpperCase()}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => actions.onEdit(activity)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => actions.onDelete(activity.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {formatDate(activity.activity_date)}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 flex-grow flex flex-col space-y-3 overflow-hidden">
                <div className="flex-1 min-h-0">
                  <p className="text-sm font-medium text-foreground">Description</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {truncatedDescription || 'No description provided.'}
                  </p>
                  {isDescriptionLong && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 mt-1 text-primary"
                      onClick={() =>
                        openModal(
                          activity.id,
                          'description',
                          activity.description || '',
                          activity.activity_type,
                          activity.activity_date
                        )
                      }
                    >
                      Read More
                    </Button>
                  )}
                </div>
                {activity.notes && (
                  <div className="flex-1 min-h-0">
                    <p className="text-sm font-medium text-foreground">Notes</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {truncatedNotes}
                    </p>
                    {isNotesLong && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 mt-1 text-primary"
                        onClick={() =>
                          openModal(
                            activity.id,
                            'notes',
                            activity.notes || '',
                            activity.activity_type,
                            activity.activity_date
                          )
                        }
                      >
                        Read More
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {modalContent && (
        <ActivityDialog
          open={!!modalContent}
          onClose={closeModal}
          activityId={modalContent.activityId}
          field={modalContent.field}
          content={modalContent.content}
          activityType={modalContent.activityType}
          activityDate={modalContent.activityDate}
          animalId={animalId}
        />
      )}
    </>
  );
}

// ActivitySummaryView Component
interface ActivitySummaryViewProps {
  activities: Activity[];
  formatDate: (date: string) => string;
  animalId: string;
}

function ActivitySummaryView({ activities, formatDate, animalId }: ActivitySummaryViewProps) {
  const [modalContent, setModalContent] = useState<{
    activityId: string;
    field: 'description' | 'notes';
    content: string;
    activityType: string;
    activityDate: string;
  } | null>(null);

  const openModal = (
    activityId: string,
    field: 'description' | 'notes',
    content: string,
    activityType: string,
    activityDate: string
  ) => {
    setModalContent({ activityId, field, content, activityType, activityDate });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const summary = useMemo(() => {
    if (activities.length === 0) return [];

    const counts = activities.reduce(
      (acc, curr) => {
        acc[curr.activity_type] = (acc[curr.activity_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(counts)
      .map(([type, count]) => ({
        type: type.replace('_', ' ').toUpperCase(),
        count,
        percentage: ((count / activities.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);
  }, [activities]);

  const chartData = useMemo(
    () =>
      summary.map((item) => ({
        name: item.type,
        value: item.count,
      })),
    [summary]
  );

  const recent = activities.slice(0, 5);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (activities.length === 0) {
    return (
      <Card className="border-dashed border-border shadow-sm p-8 text-center">
        <CardContent className="pt-6">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-3">
            No Data to Summarize
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Add activities to generate insights and visualize patterns over time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Activity Overview
          </CardTitle>
          <CardDescription>
            Key metrics about your animal's activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center transition-transform hover:scale-105">
              <div className="text-2xl font-semibold text-foreground mb-1">
                {activities.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Activities</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center transition-transform hover:scale-105">
              <div className="text-2xl font-semibold text-foreground mb-1">
                {summary.length}
              </div>
              <div className="text-sm text-muted-foreground">Activity Types</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center transition-transform hover:scale-105">
              <div className="text-2xl font-semibold text-foreground mb-1">
                {summary.length > 0 ? summary[0].type : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Most Common</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Distribution */}
        <Card className="shadow-sm border-border flex flex-col min-h-[400px] max-h-[400px] overflow-hidden">
          <CardHeader className="p-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Activity Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of activities by type
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-4 pt-0 flex flex-col overflow-hidden">
            <div className="h-[220px] mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value, name) => [`${value} activities`, name]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-2">
                {summary.map((item, index) => (
                  <div key={item.type} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-foreground truncate flex-1 min-w-0">
                      {item.type}
                    </span>
                    <span className="text-muted-foreground flex-shrink-0">
                      ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="shadow-sm border-border flex flex-col min-h-[400px] max-h-[400px]">
          <CardHeader className="p-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Latest activity entries
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-4 pt-0 overflow-y-auto">
            {recent.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                <p>No recent activities to display</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map((activity, index) => {
                  const isDescriptionLong = (activity.description?.length || 0) > 50;
                  const isNotesLong = (activity.notes?.length || 0) > 50;
                  const truncatedDescription = isDescriptionLong
                    ? `${activity.description?.slice(0, 50)}...`
                    : activity.description;
                  const truncatedNotes = isNotesLong
                    ? `${activity.notes?.slice(0, 50)}...`
                    : activity.notes;

                  return (
                    <div
                      key={activity.id}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors min-h-[120px] max-h-[120px] flex items-start gap-3 overflow-hidden"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 flex flex-col space-y-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-foreground truncate">
                            {activity.activity_type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatDate(activity.activity_date)}
                          </span>
                        </div>
                        <div className="flex-1 flex flex-col space-y-1 overflow-hidden">
                          <div className="flex-1 min-h-0">
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {truncatedDescription || 'No description provided.'}
                            </p>
                            {isDescriptionLong && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-primary text-xs"
                                onClick={() =>
                                  openModal(
                                    activity.id,
                                    'description',
                                    activity.description || '',
                                    activity.activity_type,
                                    activity.activity_date
                                  )
                                }
                              >
                                Read More
                              </Button>
                            )}
                          </div>
                          {activity.notes && (
                            <div className="flex-1 min-h-0">
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                <span className="font-medium">Notes: </span>
                                {truncatedNotes}
                              </p>
                              {isNotesLong && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-primary text-xs"
                                  onClick={() =>
                                    openModal(
                                      activity.id,
                                      'notes',
                                      activity.notes || '',
                                      activity.activity_type,
                                      activity.activity_date
                                    )
                                  }
                                >
                                  Read More
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {modalContent && (
        <ActivityDialog
          open={!!modalContent}
          onClose={closeModal}
          activityId={modalContent.activityId}
          field={modalContent.field}
          content={modalContent.content}
          activityType={modalContent.activityType}
          activityDate={modalContent.activityDate}
          animalId={animalId}
        />
      )}
    </div>
  );
}