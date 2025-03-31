import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, Plus, FileText, Calendar, Edit, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAnimal } from '@/services/animalService';
import { fetchHealthRecords, deleteHealthRecord, Health } from '@/services/healthservice'; 
import { Animal } from '@/types/AnimalTypes';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const AnimalHealth: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [healthRecords, setHealthRecords] = useState<Health[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true); // Changed from 'loading' to 'isFetching'
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [healthToDelete, setHealthToDelete] = useState<Health | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/animals');
      return;
    }

    const loadData = async () => {
      setIsFetching(true);
      try {
        const animalData = await fetchAnimal(id);
        setAnimal(animalData);
        const healthData = await fetchHealthRecords(id);
        setHealthRecords(healthData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load animal health data');
      } finally {
        setIsFetching(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const handleDeleteClick = (health: Health) => {
    setHealthToDelete(health);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!healthToDelete || !id) return;

    try {
      await deleteHealthRecord(id, healthToDelete.Health_id);
      setHealthRecords(healthRecords.filter(h => h.Health_id !== healthToDelete.Health_id));
      toast.success('Health record deleted successfully');
    } catch (error) {
      console.error('Error deleting health record:', error);
      toast.error('Failed to delete health record');
    } finally {
      setDeleteConfirmOpen(false);
      setHealthToDelete(null);
    }
  };

  // Skeleton component for health records
  const HealthRecordSkeleton = () => (
    <Card className="border-border shadow-md animate-pulse">
      <CardHeader className="flex flex-col gap-3 pb-4 border-b border-border sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-5 w-24 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
          <div className="flex items-center text-xs text-muted-foreground dark:text-muted-foreground sm:text-sm">
            <Calendar className="h-3 w-3 mr-1 sm:h-4 sm:w-4" />
            <div className="h-3 w-32 bg-muted rounded" />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="h-9 w-20 bg-muted rounded" />
          <div className="h-9 w-20 bg-muted rounded" />
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-2">
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-4 w-1/2 bg-muted rounded" />
        <div className="h-4 w-2/3 bg-muted rounded" />
      </CardContent>
    </Card>
  );

  // Render immediately without waiting for loading
  return (
    <div className="bg-background min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/animals/${id}`)}
              className="text-primary dark:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-full h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-serif font-semibold text-foreground dark:text-foreground sm:text-2xl">
              Health Records for{' '}
              <span className="text-primary dark:text-primary">
                {animal ? animal.name : 'Loading...'}
              </span>
            </h1>
          </div>
          <Button
            onClick={() => navigate(`/animals/${id}/health/new`)}
            className="font-serif bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80 h-10 w-full sm:w-auto sm:h-12"
            disabled={isFetching}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Health Record
          </Button>
        </div>

        {/* Health Records Section */}
        {!animal && !isFetching ? (
          <Card className="border-border shadow-md w-full max-w-md mx-auto">
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
        ) : healthRecords.length === 0 && !isFetching ? (
          <Card className="border-border shadow-md">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg font-serif text-foreground dark:text-foreground sm:text-xl">
                Health Records
              </CardTitle>
            </CardHeader>
            <CardContent className="py-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground dark:text-muted-foreground mx-auto mb-4 sm:h-10 sm:w-10" />
              <h3 className="text-base font-sans font-medium text-foreground dark:text-foreground mb-2 sm:text-lg">
                No Health Records Found
              </h3>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-6 max-w-md mx-auto">
                Start tracking {animal?.name || 'this animal'}’s health by adding a record.
              </p>
              <Button
                onClick={() => navigate(`/animals/${id}/health/new`)}
                className="font-serif bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80 h-10 w-full max-w-xs mx-auto sm:h-12"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add a Health Record
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {isFetching ? (
              // Show skeleton while fetching
              <>
                <HealthRecordSkeleton />
                <HealthRecordSkeleton />
              </>
            ) : (
              healthRecords.map((health) => (
                <Card key={health.Health_id} className="border-border shadow-md">
                  <CardHeader className="flex flex-col gap-3 pb-4 border-b border-border sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base font-serif text-foreground dark:text-foreground sm:text-lg">
                          Health Record
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs font-sans bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground">
                          {health.health_status}
                        </Badge>
                        {health.vaccination_status && (
                          <Badge variant="outline" className="text-xs font-sans">
                            {health.vaccination_status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground dark:text-muted-foreground sm:text-sm">
                        <Calendar className="h-3 w-3 mr-1 sm:h-4 sm:w-4" />
                        {formatDistanceToNow(new Date(health.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/animals/${id}/health/${health.Health_id}/edit`)}
                        className="font-sans text-primary dark:text-primary border-primary dark:border-primary hover:bg-primary/10 dark:hover:bg-primary/20 h-9 w-full sm:w-auto sm:h-10"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(health)}
                        className="font-sans text-destructive dark:text-destructive border-destructive dark:border-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 h-9 w-full sm:w-auto sm:h-10"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2 text-sm text-foreground font-sans dark:text-foreground">
                      <p><strong>Neutered/Spayed:</strong> {health.neutered_spayed ? 'Yes' : 'No'}</p>
                      {health.medical_history && Object.keys(health.medical_history).length > 0 && (
                        <div>
                          <strong>Medical History:</strong>
                          <ul className="list-disc pl-5">
                            {Object.entries(health.medical_history).map(([date, note]) => (
                              <li key={date}>{date}: {note}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {health.dietary_restrictions && (
                        <p><strong>Dietary Restrictions:</strong> {health.dietary_restrictions}</p>
                      )}
                      {health.regular_medication && (
                        <p><strong>Regular Medication:</strong> {health.regular_medication}</p>
                      )}
                      {health.last_vet_visit && (
                        <p><strong>Last Vet Visit:</strong> {health.last_vet_visit}</p>
                      )}
                      {health.notes && (
                        <p><strong>Notes:</strong> {health.notes}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="bg-background border-border shadow-md w-[90vw] max-w-md sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-serif text-foreground dark:text-foreground sm:text-xl">
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
                Are you sure you want to delete this health record? This action cannot be undone.
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

export default AnimalHealth;