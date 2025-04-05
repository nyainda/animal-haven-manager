import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, Plus, FileText, Calendar, Edit, Trash2, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { fetchAnimal } from '@/services/animalService';
import { fetchHealthRecords, deleteHealthRecord, Health } from '@/services/healthservice'; 
import { Animal } from '@/types/AnimalTypes';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow, isValid } from 'date-fns';

const AnimalHealth: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [healthRecords, setHealthRecords] = useState<Health[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [healthToDelete, setHealthToDelete] = useState<Health | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/animals');
      return;
    }

    const loadData = async () => {
      setIsFetching(true);
      try {
        const [animalData, healthData] = await Promise.all([
          fetchAnimal(id),
          fetchHealthRecords(id)
        ]);
        setAnimal(animalData);
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
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!healthToDelete || !id) return;

    try {
      await deleteHealthRecord(id, healthToDelete.Health_id);
      setHealthRecords(prev => prev.filter(h => h.Health_id !== healthToDelete.Health_id));
      toast.success('Health record deleted successfully');
    } catch (error) {
      console.error('Error deleting health record:', error);
      toast.error('Failed to delete health record');
    } finally {
      setDeleteDialogOpen(false);
      setHealthToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (!isValid(date)) throw new Error('Invalid date');
      return format(date, 'MMMM d, yyyy');
    } catch {
      return 'Not specified';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sick':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'recovering':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const HealthRecordSkeleton = () => (
    <Card className="shadow-sm border border-border animate-pulse">
      <CardHeader className="bg-muted/20 p-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-muted rounded" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-4 w-1/2 bg-muted rounded" />
        <div className="h-4 w-2/3 bg-muted rounded" />
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/animals/${id}`)}
              className="rounded-full border-border hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              {animal?.name || 'Loading...'}'s Health Records
            </h1>
          </div>
          <Button
            onClick={() => navigate(`/animals/${id}/health/new`)}
            className="bg-primary hover:bg-primary/90 transition-colors"
            disabled={isFetching}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Health Record
          </Button>
        </div>

        {/* Main Content */}
        {isFetching ? (
          <div className="space-y-6">
            <HealthRecordSkeleton />
            <HealthRecordSkeleton />
          </div>
        ) : !animal ? (
          <Card className="shadow-lg border-border">
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Animal Not Found</h3>
              <p className="text-muted-foreground mb-6">The requested animal could not be found.</p>
              <Button
                variant="outline"
                onClick={() => navigate('/animals')}
                className="border-primary text-primary hover:bg-primary/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Animals
              </Button>
            </CardContent>
          </Card>
        ) : healthRecords.length === 0 ? (
          <Card className="shadow-lg border-border">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Health Records</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start tracking {animal.name}'s health by adding a new record.
              </p>
              <Button
                onClick={() => navigate(`/animals/${id}/health/new`)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Health Record
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {healthRecords.map((health) => (
              <Card key={health.Health_id} className="shadow-md border-border hover:shadow-lg transition-shadow">
                <CardHeader className="bg-muted/20 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${getStatusColor(health.health_status)}`}>
                      <Heart className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge 
                          className={`text-sm font-medium ${getStatusColor(health.health_status)}`}
                        >
                          {health.health_status}
                        </Badge>
                        {health.vaccination_status && (
                          <Badge variant="outline" className="text-xs border-muted-foreground">
                            {health.vaccination_status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Created {formatDistanceToNow(new Date(health.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/animals/${id}/health/${health.Health_id}/edit`)}
                      className="border-primary text-primary hover:bg-primary/10"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(health)}
                      className="border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Basic Information</h4>
                      <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                        <li>
                          <span className="font-medium">Neutered/Spayed:</span> {health.neutered_spayed ? 'Yes' : 'No'}
                        </li>
                        {health.last_vet_visit && (
                          <li>
                            <span className="font-medium">Last Vet Visit:</span> {formatDate(health.last_vet_visit)}
                          </li>
                        )}
                      </ul>
                    </div>
                    {health.dietary_restrictions && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Dietary Restrictions</h4>
                        <p className="mt-2 text-sm text-muted-foreground">{health.dietary_restrictions}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {health.medical_history && Object.keys(health.medical_history).length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Medical History</h4>
                        <ul className="mt-2 text-sm text-muted-foreground space-y-1 list-disc pl-4">
                          {Object.entries(health.medical_history).map(([date, note]) => (
                            <li key={date}>{formatDate(date)}: {note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {health.regular_medication?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Regular Medication</h4>
                        <p className="mt-2 text-sm text-muted-foreground">{health.regular_medication.join(', ')}</p>
                      </div>
                    )}
                    {health.notes?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Notes</h4>
                        <p className="mt-2 text-sm text-muted-foreground">{health.notes.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Are you sure you want to delete this health record? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                className="w-full sm:w-auto"
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