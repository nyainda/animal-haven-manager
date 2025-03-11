import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, Plus, CheckSquare, Loader2, Calendar, Edit, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAnimal } from '@/services/animalService';
import { fetchTasks, deleteTask, Task } from '@/services/taskApi';
import { Animal } from '@/types/AnimalTypes';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDistanceToNow, format } from 'date-fns';

const AnimalTasks: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

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
        
        // Fetch tasks from the API
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

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading animal data...</span>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          <h2 className="text-lg font-medium">Error</h2>
          <p>Animal not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/animals')}>
            Back to Animals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(`/animals/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Animal Details
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks for {animal.name}</h1>
        <Button onClick={() => navigate(`/animals/${id}/tasks/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
      
      {tasks.length === 0 ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tasks History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed p-8 text-center">
              <CheckSquare className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Tasks</h3>
              <p className="text-muted-foreground mb-4">
                No tasks have been recorded for this animal yet.
              </p>
              <Button onClick={() => navigate(`/animals/${id}/tasks/new`)}>
                Add Task
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {tasks.map((task) => (
            <Card key={task.task_id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-xl">{task.title}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                    <span className="ml-2">• Due: {getFormattedDateTime(task.start_date, task.start_time)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/animals/${id}/tasks/${task.task_id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(task)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="whitespace-pre-line">{task.description || 'No description provided'}</p>
                {task.task_type && (
                  <p className="text-sm text-muted-foreground mt-2">Type: {task.task_type}</p>
                )}
                {task.priority && (
                  <p className="text-sm text-muted-foreground mt-1">Priority: {task.priority}</p>
                )}
                {task.status && (
                  <p className="text-sm text-muted-foreground mt-1">Status: {task.status}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnimalTasks;