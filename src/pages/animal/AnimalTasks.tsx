import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, TimerOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { fetchAnimal } from '@/services/animalService';
import { fetchTasks, deleteTask, Task } from '@/services/taskApi';
import { Animal } from '@/types/AnimalTypes';
import { parseISO } from 'date-fns';
import { TaskCard } from '@/components/Task/TaskCard';
import { TasksHeader } from '@/components/Task/TasksHeader';
import { TasksSkeleton } from '@/components/Task/TasksSkeleton';
import { TaskCardHeader } from '@/components/Task/TaskCardHeader';
import { EmptyTasksState } from '@/components/Task/EmptyTasksState';
import { DeleteTaskDialog } from '@/components/Task/DeleteTaskDialog';
import { useTaskCounts } from '@/hooks/useTaskCounts';
import { useFilteredTasks } from '@/hooks/useFilteredTasks';

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

  const taskCounts = useTaskCounts(tasks);
  const filteredTasks = useFilteredTasks(tasks, activeTab);

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
              return parseISO(`${b.start_date}T${b.start_time}`).getTime() - 
                     parseISO(`${a.start_date}T${a.start_time}`).getTime();
            } catch { 
              return 0; 
            }
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
      await deleteTask(id, taskToDelete.task_id);
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

  const handleEditTask = useCallback((taskId: string) => {
    if (!id || !taskId) return;
    navigate(`/animals/${id}/tasks/${taskId}/edit`);
  }, [id, navigate]);

  const handleBack = useCallback(() => {
    navigate(`/animals/${id}`);
  }, [navigate, id]);

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
            <Button variant="outline" onClick={() => navigate('/animals')}>
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
        <TasksHeader 
          animal={animal}
          loading={loading}
          onBack={handleBack}
          onAddTask={handleAddTask}
        />

        <Separator className="mb-6" />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto mb-6 h-auto p-1.5">
            <TabsTrigger value="all" className="py-1.5 text-xs sm:text-sm">
              All <Badge variant="secondary" className="ml-1.5 px-1.5">{taskCounts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="py-1.5 text-xs sm:text-sm">
              Pending <Badge variant="secondary" className="ml-1.5 px-1.5">{taskCounts.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="py-1.5 text-xs sm:text-sm">
              Completed <Badge variant="secondary" className="ml-1.5 px-1.5">{taskCounts.completed}</Badge>
            </TabsTrigger>
            <TabsTrigger value="overdue" className="py-1.5 text-xs sm:text-sm flex items-center gap-1">
              <TimerOff className="h-4 w-4"/> Overdue 
              <Badge variant={taskCounts.overdue > 0 ? "destructive" : "secondary"} className="ml-1.5 px-1.5">
                {taskCounts.overdue}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isInitialLoad ? (
              <TasksSkeleton />
            ) : filteredTasks.length === 0 ? (
              <EmptyTasksState 
                activeTab={activeTab}
                animalName={animal?.name}
                onAddTask={handleAddTask}
              />
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

        <DeleteTaskDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          task={taskToDelete}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </TooltipProvider>
  );
};

export default AnimalTasks;