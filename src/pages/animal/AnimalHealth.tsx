
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, Plus, Activity, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAnimal } from '@/services/animalService';
import { Animal } from '@/types/AnimalTypes';

const AnimalHealth: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    if (!id) {
      navigate('/animals');
      return;
    }

    const loadAnimal = async () => {
      setLoading(true);
      try {
        const data = await fetchAnimal(id);
        setAnimal(data);
      } catch (error) {
        console.error('Error loading animal:', error);
        toast.error('Failed to load animal data');
      } finally {
        setLoading(false);
      }
    };

    loadAnimal();
  }, [id, navigate]);

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
        <h1 className="text-2xl font-bold">Health Records for {animal.name}</h1>
        <Button onClick={() => navigate(`/animals/${id}/health/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Health Record
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Health History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Health Records</h3>
            <p className="text-muted-foreground mb-4">
              No health records have been recorded for this animal yet.
            </p>
            <Button onClick={() => navigate(`/animals/${id}/health/new`)}>
              Add Health Record
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimalHealth;
