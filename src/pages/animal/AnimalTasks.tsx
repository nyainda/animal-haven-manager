import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ArrowLeft, Plus, CheckSquare, Loader2, Calendar, Edit, Trash2,
    AlertTriangle, Clock, Tag, BarChart3, CheckCircle2, XCircle, Inbox, TimerOff, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAnimal } from '@/services/animalService';
import { fetchTasks, deleteTask, Task } from '@/services/taskApi';
import { Animal } from '@/types/AnimalTypes';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose,
} from '@/components/ui/dialog';
import { formatDistanceToNowStrict, format, isPast, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Helper Functions ---

interface BadgeStyleProps { bgClass: string; textClass: string; borderClass: string; }

const getPriorityStyles = (priority?: string): { borderClass: string; iconColorClass: string; badgeStyle: BadgeStyleProps } => {
    const baseStyle: BadgeStyleProps = { bgClass: '', textClass: '', borderClass: '' };
    switch (priority?.toLowerCase()) {
        case 'high':
            return { borderClass: 'border-l-4 border-red-500', iconColorClass: 'text-red-500', badgeStyle: { ...baseStyle, bgClass: 'bg-red-100', textClass: 'text-red-800', borderClass: 'border-red-500' } };
        case 'medium':
            return { borderClass: 'border-l-4 border-amber-500', iconColorClass: 'text-amber-500', badgeStyle: { ...baseStyle, bgClass: 'bg-amber-100', textClass: 'text-amber-800', borderClass: 'border-amber-500' } };
        case 'low':
            return { borderClass: 'border-l-4 border-green-500', iconColorClass: 'text-green-500', badgeStyle: { ...baseStyle, bgClass: 'bg-green-100', textClass: 'text-green-800', borderClass: 'border-green-500' } };
        default:
            return { borderClass: 'border-l-4 border-gray-300 dark:border-gray-600', iconColorClass: 'text-gray-500', badgeStyle: { ...baseStyle, bgClass: 'bg-gray-100', textClass: 'text-gray-800', borderClass: 'border-gray-500' } };
    }
};

const getStatusBadgeStyle = (status?: string): BadgeStyleProps => {
    switch (status?.toLowerCase()) {
        case 'completed':
            return { bgClass: 'bg-green-100', textClass: 'text-green-800', borderClass: 'border-green-500' };
        case 'pending':
            return { bgClass: 'bg-amber-100', textClass: 'text-amber-800', borderClass: 'border-amber-500' };
        case 'in progress':
            return { bgClass: 'bg-blue-100', textClass: 'text-blue-800', borderClass: 'border-blue-500' };
        default:
            return { bgClass: 'bg-gray-100', textClass: 'text-gray-800', borderClass: 'border-gray-500' };
    }
};

const getStatusIcon = (status?: string): React.ReactNode => {
    switch (status?.toLowerCase()) {
        case 'completed': return <CheckCircle2 className="h-3 w-3 mr-1" />;
        case 'pending': return <Clock className="h-3 w-3 mr-1" />;
        case 'in progress': return <Loader2 className="h-3 w-3 mr-1 animate-spin" />;
        default: return <XCircle className="h-3 w-3 mr-1" />;
    }
};

const formatDateTime = (dateStr: string, timeStr: string): string => {
    try {
        const dateTime = parseISO(`${dateStr}T${timeStr || '00:00'}`);
        return format(dateTime, 'MMM d, yyyy h:mm a');
    } catch {
        return 'Invalid Date';
    }
};

const formatRelativeTime = (dateStr: string): string => {
    try {
        return formatDistanceToNowStrict(parseISO(dateStr), { addSuffix: true });
    } catch {
        return 'Unknown time';
    }
};

const isTaskOverdue = (task: Task): boolean => {
    if (!task.start_date || !task.start_time || task.status?.toLowerCase() === 'completed') return false;
    try {
        const dueDate = parseISO(`${task.start_date}T${task.start_time}`);
        return isPast(dueDate);
    } catch {
        return false;
    }
};

// --- TaskCard Sub-Component ---

interface TaskCardProps {
    task: Task;
    animalId: string;
    onEdit: (taskId: number) => void;
    onDelete: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, animalId, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isOverdue = isTaskOverdue(task);
    const { borderClass: priorityBorderClass, iconColorClass: priorityIconColor, badgeStyle: priorityBadgeStyle } = getPriorityStyles(task.priority);
    const statusStyle = getStatusBadgeStyle(task.status);

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (task.task_id) onEdit(parseInt(task.task_id.toString()));
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(task);
    };

    const getTaskId = (): number => {
        if (typeof task.task_id !== 'number') {
            console.error("Task ID is missing or invalid:", task);
            toast.error("Action failed: Task identifier is missing.");
            throw new Error("Task ID is required for this action.");
        }
        return task.task_id;
    };

    const description = task.description || 'No description provided.';
    const isLongDescription = description.length > 150;

    return (
        <Card
            className={`group relative overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out flex flex-col h-full ${priorityBorderClass} ${isOverdue ? 'border-t-destructive/60 border-r-destructive/60 border-b-destructive/60 bg-destructive/5 dark:bg-destructive/10' : 'border-border'}`}
        >
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-background/70 backdrop-blur-sm">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="sr-only">Task Actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleEditClick}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <CardHeader className="p-4 pb-3">
                <div className="flex justify-between items-start gap-2 mb-1">
                    <CardTitle className="text-base font-semibold leading-tight pr-8 group-hover:text-primary transition-colors">
                        {task.title || "Untitled Task"}
                    </CardTitle>
                    {task.priority && (
                        <Tooltip>
                            <TooltipTrigger>
                                <BarChart3 className={`h-4 w-4 flex-shrink-0 ${priorityIconColor} transform rotate-90`} />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{task.priority} Priority</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
                <CardDescription className="text-xs text-muted-foreground flex items-center gap-x-3 gap-y-1 flex-wrap">
                    <Tooltip>
                        <TooltipTrigger className="flex items-center cursor-default">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                            <span>{formatDateTime(task.start_date, task.start_time)}</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            Due Date & Time
                        </TooltipContent>
                    </Tooltip>
                    <span className="text-muted-foreground/50 hidden sm:inline">•</span>
                    <Tooltip>
                        <TooltipTrigger className="flex items-center cursor-default">
                            <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                            <span>Created {formatRelativeTime(task.created_at)}</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            Creation Date
                        </TooltipContent>
                    </Tooltip>
                </CardDescription>
                {isOverdue && (
                    <Badge variant="destructive" className="mt-2 text-xs w-fit">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Past Due
                    </Badge>
                )}
            </CardHeader>

            <CardContent className="p-4 pt-2 pb-3 flex-grow">
                <div className="flex flex-wrap gap-2 mb-3">
                    {task.task_type && (
                        <Badge variant="secondary" className="text-xs font-medium">
                            <Tag className="h-3 w-3 mr-1.5" />
                            {task.task_type}
                        </Badge>
                    )}
                    {task.status && (
                        <Badge
                            variant="outline"
                            className={`text-xs font-medium flex items-center ${statusStyle.bgClass} ${statusStyle.textClass} ${statusStyle.borderClass}`}
                        >
                            {getStatusIcon(task.status)}
                            {task.status}
                        </Badge>
                    )}
                </div>

                <div>
                    <p
                        className={`text-sm text-foreground/90 whitespace-pre-wrap ${!task.description ? 'text-muted-foreground italic' : ''} ${!isExpanded && isLongDescription ? 'line-clamp-3' : ''}`}
                    >
                        {description}
                    </p>
                    {isLongDescription && (
                        <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 mt-1 text-primary"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? 'Show Less' : 'Read More'}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

// --- Main AnimalTasks Component ---

const AnimalTasks: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [activeTab, setActiveTab] = useState<string>('all');

    useEffect(() => {
        if (!id) {
            toast.error('Animal ID is missing.');
            navigate('/animals');
            return;
        }
        let isMounted = true;
        const loadData = async () => {
            try {
                const [animalData, tasksData] = await Promise.all([
                    fetchAnimal(id),
                    fetchTasks(id)
                ]);
                if (isMounted) {
                    setAnimal(animalData);
                    setTasks(tasksData.sort((a, b) => {
                        try {
                            return parseISO(`${b.start_date}T${b.start_time}`).getTime() - parseISO(`${a.start_date}T${a.start_time}`).getTime();
                        } catch { return 0; }
                    }));
                }
            } catch (error) {
                console.error('Error loading data:', error);
                if (isMounted) {
                    toast.error('Failed to load animal data or tasks.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setIsInitialLoad(false);
                }
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, [id, navigate]);

    const handleDeleteClick = useCallback((task: Task) => {
        setTaskToDelete(task);
        setDeleteConfirmOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!taskToDelete?.task_id || !id) return;
        const originalTasks = tasks;
        setTasks(prevTasks => prevTasks.filter(task => task.task_id !== taskToDelete.task_id));
        setDeleteConfirmOpen(false);

        try {
            await deleteTask(id, taskToDelete.task_id.toString());
            toast.success(`Task "${taskToDelete.title}" deleted.`);
            setTaskToDelete(null);
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error(`Failed to delete "${taskToDelete.title}". Restoring task.`);
            setTasks(originalTasks);
        }
    }, [id, taskToDelete, tasks]);

    const handleAddTask = useCallback(() => {
        if (!id) return;
        navigate(`/animals/${id}/tasks/new`);
    }, [id, navigate]);

    const handleEditTask = useCallback((taskId: number) => {
        if (!id || !taskId) return;
        navigate(`/animals/${id}/tasks/${taskId}/edit`);
    }, [id, navigate]);

    const taskCounts = useMemo(() => {
        const counts = { all: tasks.length, pending: 0, completed: 0, overdue: 0 };
        tasks.forEach(task => {
            const status = task.status?.toLowerCase();
            if (status === 'pending') counts.pending++;
            if (status === 'completed') counts.completed++;
            if (isTaskOverdue(task)) counts.overdue++;
        });
        return counts;
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        const lowerCaseTab = activeTab.toLowerCase();
        if (lowerCaseTab === 'all') return tasks;
        if (lowerCaseTab === 'overdue') return tasks.filter(task => isTaskOverdue(task));
        return tasks.filter(task => task.status?.toLowerCase() === lowerCaseTab);
    }, [tasks, activeTab]);

    const renderSkeletons = (count = 6) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <Card key={index} className="flex flex-col border-l-4 border-gray-200 dark:border-gray-700">
                    <CardHeader className="p-4 pb-3">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                    </CardHeader>
                    <CardContent className="p-4 pt-2 pb-3 flex-grow">
                        <div className="flex gap-2 mb-3">
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    if (!loading && !animal) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-150px)] px-4">
                <Card className="w-full max-w-md text-center shadow-lg border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-2xl text-destructive flex items-center justify-center gap-2">
                            <AlertTriangle className="h-6 w-6" />
                            Animal Not Found
                        </CardTitle>
                        <CardDescription>
                            We couldn't find the animal associated with this ID.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-6">
                            Please check the ID or navigate back to the animals list.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/animals')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Animals
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <TooltipProvider delayDuration={150}>
            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-full flex-shrink-0 h-10 w-10" onClick={() => navigate(`/animals/${id}`)} disabled={!animal}>
                                    <ArrowLeft className="h-5 w-5" />
                                    <span className="sr-only">Back</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Back to {animal?.name || 'Animal'}'s Details</p></TooltipContent>
                        </Tooltip>
                        <div className="flex items-center gap-3">
                            {loading && !animal ? (
                                <Skeleton className="h-12 w-12 rounded-full" />
                            ) : (
                                <Avatar className="h-12 w-12 border">
                                    <AvatarFallback className="text-lg bg-muted">{animal?.name?.charAt(0)?.toUpperCase() ?? '?'}</AvatarFallback>
                                </Avatar>
                            )}
                            <div>
                                {loading && !animal ? (
                                    <>
                                        <Skeleton className="h-6 w-40 mb-1.5" />
                                        <Skeleton className="h-4 w-60" />
                                    </>
                                ) : (
                                    <>
                                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                            {animal?.name}'s Tasks
                                        </h1>
                                        <p className="text-sm text-muted-foreground">
                                            View and manage tasks for {animal?.name}.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button onClick={handleAddTask} disabled={loading || !animal} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Task
                    </Button>
                </header>

                <Separator className="mb-6" />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto mb-6 h-auto p-1.5">
                        <TabsTrigger value="all" className="py-1.5 text-xs sm:text-sm">All <Badge variant="secondary" className="ml-1.5 px-1.5">{taskCounts.all}</Badge></TabsTrigger>
                        <TabsTrigger value="pending" className="py-1.5 text-xs sm:text-sm">Pending <Badge variant="secondary" className="ml-1.5 px-1.5">{taskCounts.pending}</Badge></TabsTrigger>
                        <TabsTrigger value="completed" className="py-1.5 text-xs sm:text-sm">Completed <Badge variant="secondary" className="ml-1.5 px-1.5">{taskCounts.completed}</Badge></TabsTrigger>
                        <TabsTrigger value="overdue" className="py-1.5 text-xs sm:text-sm flex items-center gap-1">
                            <TimerOff className="h-4 w-4"/> Overdue <Badge variant={taskCounts.overdue > 0 ? "destructive" : "secondary"} className="ml-1.5 px-1.5">{taskCounts.overdue}</Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab}>
                        {isInitialLoad ? (
                            renderSkeletons()
                        ) : filteredTasks.length === 0 ? (
                            <Card className="border-dashed border-border shadow-none mt-8">
                                <CardContent className="py-12 flex flex-col items-center text-center">
                                    <div className="p-3 rounded-full bg-muted mb-4">
                                        {activeTab === 'all' && <Inbox className="h-10 w-10 text-muted-foreground" />}
                                        {activeTab === 'pending' && <AlertTriangle className="h-10 w-10 text-amber-500" />}
                                        {activeTab === 'completed' && <CheckSquare className="h-10 w-10 text-green-500" />}
                                        {activeTab === 'overdue' && <TimerOff className="h-10 w-10 text-red-500" />}
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground mb-1">
                                        No {activeTab !== 'all' ? `${activeTab} ` : ''}Tasks Found
                                    </h3>
                                    <p className="text-muted-foreground mb-6 max-w-sm">
                                        {activeTab === 'all'
                                            ? `There are currently no tasks scheduled for ${animal?.name ?? 'this animal'}. Add one!`
                                            : `No tasks match the filter "${activeTab}".`}
                                    </p>
                                    {activeTab === 'all' && (
                                        <Button onClick={handleAddTask} disabled={!animal}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add First Task
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {filteredTasks.map((task) => (
                                    <TaskCard
                                        key={task.task_id}
                                        task={task}
                                        animalId={id!}
                                        onEdit={handleEditTask}
                                        onDelete={handleDeleteClick}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" /> Confirm Deletion
                            </DialogTitle>
                            <DialogDescription className="pt-2">
                                Are you sure you want to permanently delete the task: <br />
                                <strong className="px-1 text-foreground">{taskToDelete?.title || 'this task'}</strong>?
                                <br /> This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 gap-2 flex-col-reverse sm:flex-row sm:justify-end">
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={handleConfirmDelete}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Task
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
};

export default AnimalTasks;
