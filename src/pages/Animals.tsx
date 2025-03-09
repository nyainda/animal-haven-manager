
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Download, Edit, Trash2, Eye, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { fetchAnimals, deleteAnimal, exportAnimalsToCSV } from '@/services/animalService';
import { Animal } from '@/types/AnimalTypes';

const Animals: React.FC = () => {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAnimals();
      setAnimals(data);
    } catch (error) {
      console.error('Error loading animals:', error);
      setError('Failed to load animals. Please try again later.');
      toast.error('Failed to load animals');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (animal: Animal) => {
    setAnimalToDelete(animal);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!animalToDelete) return;
    
    try {
      await deleteAnimal(animalToDelete.id);
      setAnimals(animals.filter(a => a.id !== animalToDelete.id));
      toast.success(`${animalToDelete.name} has been deleted`);
    } catch (error) {
      console.error('Error deleting animal:', error);
      toast.error('Failed to delete animal');
    } finally {
      setDeleteConfirmOpen(false);
      setAnimalToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'Sold':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'Deceased':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'Transferred':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const filteredAnimals = animals.filter(animal => 
    animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.tag_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.internal_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Animals</h1>
          <p className="text-muted-foreground">
            Manage your animals and livestock
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportAnimalsToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => navigate('/animals/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Animal
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Animal Inventory</CardTitle>
          <CardDescription>
            View and manage all your animals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex md:items-center justify-between flex-col md:flex-row gap-4 mb-6">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search animals..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading animals...</span>
            </div>
          ) : error ? (
            <div className="bg-destructive/15 text-destructive p-4 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
              <Button variant="outline" className="mt-4" onClick={loadAnimals}>
                Try Again
              </Button>
            </div>
          ) : filteredAnimals.length === 0 ? (
            <div className="text-center py-12">
              {searchTerm ? (
                <>
                  <h3 className="text-lg font-medium mb-2">No animals found</h3>
                  <p className="text-muted-foreground mb-4">
                    No animals match your search criteria
                  </p>
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-2">No animals yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first animal to get started
                  </p>
                  <Button onClick={() => navigate('/animals/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Animal
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnimals.map((animal) => (
                    <TableRow key={animal.id}>
                      <TableCell>
                        <div className="font-medium">{animal.name}</div>
                        <div className="text-sm text-muted-foreground">{animal.internal_id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="capitalize">{animal.type}</div>
                        <div className="text-sm text-muted-foreground">{animal.breed}</div>
                      </TableCell>
                      <TableCell>{animal.tag_number || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(animal.status)}>
                          {animal.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/animals/${animal.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/animals/${animal.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(animal)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {animalToDelete?.name}? This action cannot be undone.
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

export default Animals;
