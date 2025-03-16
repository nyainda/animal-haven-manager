import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, Plus, CheckSquare, Loader2, Calendar, Edit, Trash2,
  AlertTriangle, Clock, Tag, BarChart3, CheckCircle2, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAnimal } from '@/services/animalService';
import { fetchTasks, deleteTask, Task } from '@/services/taskApi';
import { Animal } from '@/types/AnimalTypes';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { formatDistanceToNow, format, isPast } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const AnimalTasks: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    if (!id) {
      navigate('/animals');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const animalData = await fetchAnimal(id);
        setAnimal(animalData);
        const tasksData = await fetchTasks(id);
        setTasks(tasksData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load animal data or tasks');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete || !id) return;
    try {
      await deleteTask(id, taskToDelete.task_id);
      setTasks(tasks.filter(task => task.task_id !== taskToDelete.task_id));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
    }
  };

  const getFormattedDateTime = (date: string, time: string) => {
    try {
      return format(new Date(`${date}T${time}`), 'PPP hh:mm a');
    } catch {
      return `${date} ${time}`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/20';
      case 'low': return 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300 border-green-500/20';
      default: return 'bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground border-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300 border-green-500/20';
      case 'in progress': return 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-500/20';
      default: return 'bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground border-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case 'in progress': return <Clock className="h-4 w-4 mr-1" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 mr-1" />;
      case 'cancelled': return <XCircle className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  const isPastDue = (date: string, time: string) => {
    try {
      return isPast(new Date(`${date}T${time}`));
    } catch {
      return false;
    }
  };

  const filteredTasks = () => {
    if (activeTab === 'all') return tasks;
    if (activeTab === 'completed') return tasks.filter(task => task.status?.toLowerCase() === 'completed');
    if (activeTab === 'pending') return tasks.filter(task => task.status?.toLowerCase() === 'pending');
    if (activeTab === 'overdue') return tasks.filter(task => 
      isPastDue(task.start_date, task.start_time) && task.status?.toLowerCase() !== 'completed'
    );
    return tasks;
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center py-6 px-4">
        <Card className="border-border shadow-md w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary sm:h-8 sm:w-8" />
            <p className="text-base font-sans text-foreground dark:text-foreground sm:text-lg">
              Loading tasks...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center py-6 px-4">
        <Card className="border-border shadow-md w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-destructive dark:text-destructive sm:text-xl">
              Oops!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground sm:text-base">
              Animal not found.
            </p>
            <Button
              variant="outline"
              className="w-full font-serif text-primary dark:text-primary border-primary dark:border-primary hover:bg-primary/10 dark:hover:bg-primary/20 h-10 sm:h-12"
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
    <div className="bg-background min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/animals/${id}`)}
              className="text-primary dark:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-full h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                <AvatarFallback className="bg-muted text-foreground dark:bg-muted dark:text-foreground">
                  {animal.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-xl font-serif font-semibold text-foreground dark:text-foreground sm:text-2xl">
                <span className="text-primary dark:text-primary">{animal.name}</span>’s Tasks
              </h1>
            </div>
          </div>
          <Button
            onClick={() => navigate(`/animals/${id}/tasks/new`)}
            className="font-serif bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80 h-10 w-full sm:w-auto sm:h-12"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </header>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-2 gap-2 sm:grid-cols-4 bg-muted p-1 rounded-lg">
            <TabsTrigger value="all" className="text-xs sm:text-sm font-sans">All</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm font-sans">Pending</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm font-sans">Completed</TabsTrigger>
            <TabsTrigger value="overdue" className="text-xs sm:text-sm font-sans">Overdue</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            {filteredTasks().length === 0 ? (
              <Card className="border-border shadow-md">
                <CardContent className="py-8 text-center">
                  <CheckSquare className="h-8 w-8 text-muted-foreground dark:text-muted-foreground mx-auto mb-4 sm:h-10 sm:w-10" />
                  <h3 className="text-base font-sans font-medium text-foreground dark:text-foreground mb-2 sm:text-lg">
                    No {activeTab !== 'all' ? activeTab : ''} Tasks
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-6 max-w-md mx-auto">
                    {activeTab === 'all' ? `No tasks recorded for ${animal.name} yet.` : `No ${activeTab} tasks found.`}
                  </p>
                  <Button
                    onClick={() => navigate(`/animals/${id}/tasks/new`)}
                    className="font-serif bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80 h-10 w-full max-w-xs mx-auto sm:h-12"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredTasks().map((task) => {
                  const isPastDueTask = isPastDue(task.start_date, task.start_time) && task.status?.toLowerCase() !== 'completed';
                  return (
                    <Card
                      key={task.task_id}
                      className={`border-border shadow-md ${isPastDueTask ? 'border-destructive/50' : ''}`}
                    >
                      {isPastDueTask && (
                        <div className="bg-destructive/10 dark:bg-destructive/20 border-b border-destructive/50 px-4 py-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 text-destructive dark:text-destructive mr-2" />
                          <span className="text-sm font-sans text-destructive dark:text-destructive">Past Due</span>
                        </div>
                      )}
                      <CardHeader className="flex flex-col gap-3 pb-4 border-b border-border sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base font-serif text-foreground dark:text-foreground sm:text-lg">
                            {task.title}
                          </CardTitle>
                          <div className="flex flex-col gap-1 text-xs text-muted-foreground dark:text-muted-foreground sm:text-sm sm:flex-row sm:gap-4">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 sm:h-4 sm:w-4" />
                              Created {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1 sm:h-4 sm:w-4" />
                              Due: {getFormattedDateTime(task.start_date, task.start_time)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => task.task_id ? navigate(`/animals/${id}/tasks/${task.task_id}/edit`) : toast.error('Task ID missing')}
                            className="font-sans text-primary dark:text-primary border-primary dark:border-primary hover:bg-primary/10 dark:hover:bg-primary/20 h-9 w-full sm:w-auto sm:h-10"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(task)}
                            className="font-sans text-destructive dark:text-destructive border-destructive dark:border-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 h-9 w-full sm:w-auto sm:h-10"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-sm text-foreground dark:text-foreground font-sans mb-4 whitespace-pre-line">
                          {task.description || 'No description provided'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {task.task_type && (
                            <Badge variant="outline" className="text-xs font-sans flex items-center">
                              <Tag className="h-3 w-3 mr-1" />
                              {task.task_type}
                            </Badge>
                          )}
                          {task.priority && (
                            <Badge variant="outline" className={`text-xs font-sans flex items-center ${getPriorityColor(task.priority)}`}>
                              <BarChart3 className="h-3 w-3 mr-1" />
                              {task.priority}
                            </Badge>
                          )}
                          {task.status && (
                            <Badge variant="outline" className={`text-xs font-sans flex items-center ${getStatusColor(task.status)}`}>
                              {getStatusIcon(task.status)}
                              {task.status}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="bg-background border-border shadow-md w-[90vw] max-w-md sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-serif text-foreground dark:text-foreground sm:text-xl">
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
                Are you sure you want to delete <span className="font-medium">{taskToDelete?.title}</span>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                className="font-serif w-full text-foreground dark:text-foreground border-muted-foreground dark:border-muted-foreground hover:bg-muted/10 dark:hover:bg-muted/20 h-10 sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                className="font-serif w-full bg-destructive text-destructive-foreground dark:bg-destructive dark:text-destructive-foreground hover:bg-destructive/90 dark:hover:bg-destructive/80 h-10 sm:w-auto"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AnimalTasks;