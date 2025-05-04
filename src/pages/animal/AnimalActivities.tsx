import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter, // Added for potential use
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
  Eye, 
  Activity as ActivityIcon, 
  Utensils, 
  Syringe, 
  CheckCircle, 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter, 
  DialogClose, 
} from '@/components/ui/dialog';
import { Activity, fetchActivities, deleteActivity } from '@/services/ActivityApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils'; 

interface ActivityManagementProps {
  animalId: string;
}

type ViewMode = 'list' | 'summary';


const getActivityStyling = (activityType: string) => {
  const normalizedType = activityType.toUpperCase().replace('_', ' ');
  switch (normalizedType) {
    case 'FEEDING':
      return { color: 'border-blue-500', icon: Utensils, bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
    case 'MEDICATION':
      return { color: 'border-red-500', icon: Syringe, bgColor: 'bg-red-100', textColor: 'text-red-700' };
    case 'HEALTH CHECK':
      return { color: 'border-green-500', icon: CheckCircle, bgColor: 'bg-green-100', textColor: 'text-green-700' };
    case 'GENERAL OBSERVATION':
      return { color: 'border-yellow-500', icon: Eye, bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' };
    default:
      return { color: 'border-gray-400', icon: ActivityIcon, bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
  }
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];


interface ActivityDialogProps {
  open: boolean;
  onClose: () => void;
  activity: Activity | null; 
  fieldToShow: 'description' | 'notes';
  animalId: string;
}

function ActivityDialog({
  open,
  onClose,
  activity,
  fieldToShow,
  animalId,
}: ActivityDialogProps) {
  const navigate = useNavigate();

  if (!activity) return null; 

  const content = fieldToShow === 'description' ? activity.description : activity.notes;
  const { icon: ActivityTypeIcon } = getActivityStyling(activity.activity_type);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
   
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg data-[state=open]:animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10 sm:data-[state=open]:slide-in-from-bottom-0">
        <DialogHeader className="pb-4 pr-6"> 
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ActivityTypeIcon className="h-5 w-5 text-primary" />
            {activity.activity_type.replace('_', ' ')} -{' '}
            {fieldToShow.charAt(0).toUpperCase() + fieldToShow.slice(1)}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5 text-sm">
            <Calendar className="h-4 w-4" />
            Recorded on {format(parseISO(activity.activity_date), 'PPP')} 
          </DialogDescription>
        </DialogHeader>
        {/* Scrollable Content Area */}
        <div className="mt-2 mb-4 max-h-[50vh] overflow-y-auto rounded-md border bg-muted/30 p-4 ">
          <p className="text-sm text-foreground whitespace-pre-wrap break-words">
            {content || `No ${fieldToShow} provided.`}
          </p>
        </div>
        <DialogFooter className="sm:justify-between gap-2 flex-col-reverse sm:flex-row"> {/* Better button layout */}
           <Button
              variant="outline"
              onClick={() => copyToClipboard(content || '')}
              aria-label={`Copy ${fieldToShow} to clipboard`}
              className="w-full sm:w-auto"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <DialogClose asChild>
              <Button variant="ghost" className="w-full sm:w-auto">
                Close
              </Button>
            </DialogClose>
            <Button
              variant="default" 
              onClick={() => navigate(`/animals/${animalId}/activities/${activity.id}/edit`)}
              aria-label={`Edit ${activity.activity_type} activity`}
               className="w-full sm:w-auto"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Activity
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Activity Management Component ---
export function ActivityManagement({ animalId }: ActivityManagementProps) {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [error, setError] = useState<string | null>(null);

  // State for the hoisted dialog
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    activity: Activity | null;
    fieldToShow: 'description' | 'notes';
  }>({ isOpen: false, activity: null, fieldToShow: 'description' });

  const openActivityDialog = useCallback(
    (activity: Activity, field: 'description' | 'notes') => {
      setDialogState({ isOpen: true, activity, fieldToShow: field });
    },
    []
  );

  const closeActivityDialog = useCallback(() => {
    setDialogState({ isOpen: false, activity: null, fieldToShow: 'description' });
  }, []);

  
  const loadActivities = useCallback(async () => {
    
    setError(null);
    try {
      const data = await fetchActivities(animalId);
      setActivities(data.sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())); 
    } catch (err) {
      console.error('Failed to load activities:', err);
      setError('Failed to load activities. Please try again.');
      setActivities([]); 
    } finally {
      setIsLoading(false);
    }
  }, [animalId]);

  useEffect(() => {
    setIsLoading(true); 
    loadActivities();
  }, [loadActivities]); 

  const handleDelete = useCallback(
    async (activityId: string) => {
      
      const originalActivities = [...activities];
      
      setActivities((prev) => prev.filter((a) => a.id !== activityId));
      setError(null);
      try {
        await deleteActivity(animalId, activityId);
        
      } catch (err) {
        console.error('Failed to delete activity:', err);
        setError('Failed to delete activity. Please try again.');
        setActivities(originalActivities); 
      }
    },
    [animalId, activities] 
  );

  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'PP'); 
    } catch {
      return 'Invalid Date'; 
    }
  };

  
  const activityActions = useMemo(
    () => ({
      onEdit: (activity: Activity) => {
        navigate(`/animals/${animalId}/activities/${activity.id}/edit`);
      },
      onDelete: handleDelete,
      onViewDetails: openActivityDialog, // Pass the dialog opener
    }),
    [handleDelete, navigate, animalId, openActivityDialog]
  );

   // --- Render Logic ---

  // Improved Skeleton Loader
  const renderSkeletons = (count = 6) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="flex flex-col border-l-4 border-gray-300 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start mb-1">
              <Skeleton className="h-5 w-3/5" />
              <div className="flex gap-1">
                 <Skeleton className="h-7 w-7 rounded-md" />
                 <Skeleton className="h-7 w-7 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="p-4 pt-2 flex-grow space-y-3">
             <div>
                <Skeleton className="h-4 w-1/4 mb-1.5" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6 mt-1" />
             </div>
              <div>
                <Skeleton className="h-4 w-1/4 mb-1.5" />
                <Skeleton className="h-3 w-full" />
             </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* --- Header Section --- */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full h-9 w-9 flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Activity Dashboard
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Manage and view activities for this animal.
              </p>
            </div>
          </div>
        </div>

        {/* --- Action Buttons & View Toggle --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
           {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
             <Button
                onClick={() => navigate(`/animals/${animalId}/activities/new`)}
                disabled={isLoading} // Disable while initially loading
              >
                <Plus className="mr-2 h-4 w-4" />
                Log New Activity
              </Button>
              <Button
                variant="secondary" // Use secondary for less emphasis
                onClick={() => navigate('/dashboard')} // Adjust route if needed
                disabled={isLoading}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
          </div>

          {/* View Toggle */}
          <div className="inline-flex p-1 rounded-lg bg-muted self-end sm:self-center">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(
                "rounded-md px-3 py-1.5 transition-colors duration-150",
                viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={viewMode === 'list'}
            >
              <List className="h-4 w-4 mr-1.5" />
              List
            </Button>
            <Button
              variant={viewMode === 'summary' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('summary')}
              className={cn(
                "rounded-md px-3 py-1.5 transition-colors duration-150",
                viewMode === 'summary' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={viewMode === 'summary'}
            >
              <BarChart2 className="h-4 w-4 mr-1.5" />
              Summary
            </Button>
          </div>
        </div>

        {/* --- Error Message --- */}
         {error && (
          <Card className="mb-6 bg-destructive/10 border-destructive text-destructive-foreground p-4">
            <CardContent className="flex items-center gap-3 p-0">
              <AlertCircle className="h-5 w-5"/>
              <p className="text-sm font-medium">{error}</p>
              <Button variant="ghost" size="sm" onClick={loadActivities} className="ml-auto text-destructive-foreground hover:bg-destructive/20">Retry</Button>
            </CardContent>
          </Card>
        )}


        {/* --- Main Content Area --- */}
        {isLoading ? (
          renderSkeletons()
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
            actions={activityActions} // Pass actions to Summary view too
          />
        )}
      </div>

       {/* --- Render Hoisted Dialog --- */}
      <ActivityDialog
        open={dialogState.isOpen}
        onClose={closeActivityDialog}
        activity={dialogState.activity}
        fieldToShow={dialogState.fieldToShow}
        animalId={animalId}
      />
    </div>
  );
}

// --- Activity List View Component ---
interface ActivityListViewProps {
  activities: Activity[];
  formatDate: (date: string) => string;
  actions: {
    onEdit: (activity: Activity) => void;
    onDelete: (activityId: string) => void;
    onViewDetails: (activity: Activity, field: 'description' | 'notes') => void;
  };
}

function ActivityListView({ activities, formatDate, actions }: ActivityListViewProps) {
  // Removed local dialog state - handled by parent

  if (activities.length === 0) {
    return (
      <Card className="border-dashed border-border/80 shadow-sm p-8 text-center bg-muted/20">
        <CardContent className="pt-6 flex flex-col items-center">
          <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 border">
            <List className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Activities Logged Yet
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Keep track of feeding, medication, health checks, and observations by adding the first activity record.
          </p>
           {/* Optional: Direct add button */}
          {/* <Button onClick={() => navigate(`/animals/${animalId}/activities/new`)}>
             <Plus className="mr-2 h-4 w-4" /> Add First Activity
          </Button> */}
        </CardContent>
      </Card>
    );
  }

  // Truncation limit
  const TRUNCATE_LENGTH = 70;

  return (
    // Added group class for hover effects on children
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {activities.map((activity) => {
        const { color: borderColor, icon: ActivityTypeIcon } = getActivityStyling(activity.activity_type);
        const isDescriptionLong = (activity.description?.length || 0) > TRUNCATE_LENGTH;
        const isNotesLong = (activity.notes?.length || 0) > TRUNCATE_LENGTH;
        const truncatedDescription = isDescriptionLong
          ? `${activity.description?.slice(0, TRUNCATE_LENGTH)}...`
          : activity.description;
        const truncatedNotes = isNotesLong
          ? `${activity.notes?.slice(0, TRUNCATE_LENGTH)}...`
          : activity.notes;

        return (
          <Card
            key={activity.id}
            className={cn(
              "flex flex-col border-l-4 shadow-sm hover:shadow-lg transition-shadow duration-200 ease-in-out group bg-card",
              borderColor
            )}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start gap-2">
                 {/* Title and Icon */}
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                   <ActivityTypeIcon className={cn("h-4 w-4 flex-shrink-0", getActivityStyling(activity.activity_type).textColor)} />
                   {activity.activity_type.replace('_', ' ')}
                </CardTitle>
                {/* Action Buttons */}
                <div className="flex gap-1 flex-shrink-0 -mt-1 -mr-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => actions.onEdit(activity)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    aria-label="Edit activity"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => actions.onDelete(activity.id)}
                    className="h-7 w-7 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                    aria-label="Delete activity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
               {/* Date */}
              <CardDescription className="text-xs flex items-center gap-1.5 pt-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(activity.activity_date)}
              </CardDescription>
            </CardHeader>
             {/* Content */}
            <CardContent className="p-4 pt-2 flex-grow flex flex-col space-y-3">
              {/* Description Section */}
              {(activity.description || !activity.notes) && ( // Show if description exists OR if notes don't exist
                 <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground"/> Description
                    </p>
                    <p className="text-sm text-muted-foreground pl-5">
                        {truncatedDescription || <span className="italic">No description.</span>}
                    </p>
                    {isDescriptionLong && (
                        <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 pl-5 text-primary text-xs font-normal"
                        onClick={() => actions.onViewDetails(activity, 'description')}
                        >
                        View Full Description
                        </Button>
                    )}
                 </div>
              )}
               {/* Notes Section */}
              {activity.notes && (
                 <div className="space-y-1">
                   <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Notebook className="w-3.5 h-3.5 text-muted-foreground"/> Notes
                    </p>
                    <p className="text-sm text-muted-foreground pl-5">
                        {truncatedNotes}
                    </p>
                    {isNotesLong && (
                        <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 pl-5 text-primary text-xs font-normal"
                        onClick={() => actions.onViewDetails(activity, 'notes')}
                        >
                        View Full Notes
                        </Button>
                    )}
                 </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// --- Activity Summary View Component ---
interface ActivitySummaryViewProps {
  activities: Activity[];
  formatDate: (date: string) => string;
  actions: { // Receive actions for potential use (e.g., viewing details from recent list)
    onEdit: (activity: Activity) => void;
    onDelete: (activityId: string) => void;
    onViewDetails: (activity: Activity, field: 'description' | 'notes') => void;
  };
}

function ActivitySummaryView({ activities, formatDate, actions }: ActivitySummaryViewProps) {
 // Removed local dialog state

  const summaryData = useMemo(() => {
    if (!activities || activities.length === 0) {
        return { counts: {}, total: 0, types: 0, mostCommon: 'N/A', summaryList: [], chartData: [] };
    }

    const counts = activities.reduce(
      (acc, curr) => {
        acc[curr.activity_type] = (acc[curr.activity_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const summaryList = Object.entries(counts)
      .map(([type, count]) => ({
        type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Title Case Type
        count,
        percentage: ((count / activities.length) * 100).toFixed(1),
        color: getActivityStyling(type).color, // Get border color class
        rawType: type, // Store raw type if needed
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

     const chartData = summaryList.map((item, index) => ({
        name: item.type,
        value: item.count,
        fill: COLORS[index % COLORS.length], // Assign color for chart
      }));


    return {
        counts,
        total: activities.length,
        types: summaryList.length,
        mostCommon: summaryList.length > 0 ? summaryList[0].type : 'N/A',
        summaryList,
        chartData,
    };
  }, [activities]);

  const recentActivities = useMemo(() => activities.slice(0, 5), [activities]); // Already sorted by parent

  // Empty State
  if (activities.length === 0) {
    return (
      <Card className="border-dashed border-border/80 shadow-sm p-8 text-center bg-muted/20">
        <CardContent className="pt-6 flex flex-col items-center">
           <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 border">
            <BarChart2 className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Activity Data to Summarize
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Add activities to see trends, distributions, and recent logs here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const TRUNCATE_RECENT_LENGTH = 45;

  return (
    <div className="space-y-6">
      {/* --- Overview Stats --- */}
      <Card className="shadow-sm border-border/80 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             {/* Stat Card */}
            <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ActivityIcon className="h-5 w-5" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-foreground">
                        {summaryData.total}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Activities</div>
                </div>
            </div>
             {/* Stat Card */}
             <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
                 <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <List className="h-5 w-5" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-foreground">
                        {summaryData.types}
                    </div>
                    <div className="text-xs text-muted-foreground">Distinct Activity Types</div>
                </div>
            </div>
             {/* Stat Card */}
             <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
                 <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BarChart2 className="h-5 w-5"/>
                </div>
                <div>
                    <div className="text-lg font-semibold text-foreground truncate" title={summaryData.mostCommon}>
                       {summaryData.mostCommon}
                    </div>
                    <div className="text-xs text-muted-foreground">Most Frequent Type</div>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- Distribution and Recent Activities --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Activity Distribution (Chart and Legend) - Takes 2/5 width */}
        <Card className="shadow-sm border-border/80 lg:col-span-2 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Distribution by Type
            </CardTitle>
            <CardDescription className="text-xs">Percentage breakdown of activities</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center p-4 pt-0">
             {/* Chart */}
            <div className="w-full h-[200px] sm:h-[250px] mb-4"> {/* Responsive height */}
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summaryData.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55} 
                    outerRadius={80} 
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2} 
                  >
                    {summaryData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number, name: string) => [`${value} (${((value / summaryData.total) * 100).toFixed(1)}%)`, name]}
                    cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--popover-foreground))',
                      borderRadius: 'var(--radius)', // Use CSS vars
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem', // text-sm
                      boxShadow: 'var(--shadow-md)',
                    }}
                    itemStyle={{ padding: '0.1rem 0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="w-full max-w-xs space-y-1.5 overflow-y-auto max-h-[100px] px-2"> {/* Added scroll */}
              {summaryData.chartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                      <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                      <span className="text-foreground truncate flex-1 min-w-0" title={item.name}>{item.name}</span>
                  </div>
                  <span className="text-muted-foreground font-medium flex-shrink-0">
                     {((item.value / summaryData.total) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities - Takes 3/5 width */}
        <Card className="shadow-sm border-border/80 lg:col-span-3 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activities
            </CardTitle>
             <CardDescription className="text-xs">Last 5 activities recorded</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-4 pt-2">
            {recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
                <ActivityIcon className="w-10 h-10 mb-3 text-gray-400" />
                <p className="text-sm">No recent activities found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                   const { icon: ActivityTypeIcon } = getActivityStyling(activity.activity_type);
                   const isDescriptionLong = (activity.description?.length || 0) > TRUNCATE_RECENT_LENGTH;
                   const isNotesLong = (activity.notes?.length || 0) > TRUNCATE_RECENT_LENGTH;
                   const textToShow = activity.description || activity.notes || '';
                   const fieldToShow = activity.description ? 'description' : 'notes';
                   const isTextLong = textToShow.length > TRUNCATE_RECENT_LENGTH;
                   const truncatedText = isTextLong ? `${textToShow.slice(0, TRUNCATE_RECENT_LENGTH)}...` : textToShow;

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50"
                    >
                       {/* Icon */}
                       <div className={cn("flex h-8 w-8 mt-0.5 flex-shrink-0 items-center justify-center rounded-full",
                         getActivityStyling(activity.activity_type).bgColor,
                         getActivityStyling(activity.activity_type).textColor)}
                        >
                            <ActivityTypeIcon className="h-4 w-4" />
                        </div>
                        {/* Content */}
                      <div className="flex-1 flex flex-col space-y-0.5 overflow-hidden">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {activity.activity_type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-auto whitespace-nowrap">
                            {formatDate(activity.activity_date)}
                          </span>
                        </div>
                        {/* Text Preview */}
                         <p className="text-xs text-muted-foreground">
                           {truncatedText || <span className="italic">No details provided.</span>}
                         </p>
                         {isTextLong && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-primary text-xs font-normal self-start"
                                onClick={() => actions.onViewDetails(activity, fieldToShow)}
                              >
                                Read More
                              </Button>
                            )}
                      </div>
                         {/* Optional: Add Edit/Delete directly here if needed */}
                         {/* <div className="flex gap-1 flex-shrink-0"> ... </div> */}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog is now rendered in the parent component */}
    </div>
  );
}