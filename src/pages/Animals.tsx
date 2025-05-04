import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Search, LayoutDashboard, Beef } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fetchAnimals, deleteAnimal } from '@/services/animalService';
import { Animal } from '@/types/AnimalTypes';

const Animals: React.FC = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const loadAnimals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAnimals();
      setAnimals(data);
    } catch (error) {
      console.error('Failed to load animals:', error);
      toast.error('Failed to load animals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnimals();
  }, [loadAnimals, refreshKey]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredAnimals = animals.filter((animal) =>
    animal.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteClick = (animal: Animal) => {
    setAnimalToDelete(animal);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!animalToDelete) return;

    try {
      await deleteAnimal(animalToDelete.id);
      setAnimals((prev) => prev.filter((a) => a.id !== animalToDelete.id));
      toast.success('Animal deleted successfully');
    } catch (error) {
      console.error('Failed to delete animal:', error);
      toast.error('Failed to delete animal');
    } finally {
      setDeleteConfirmOpen(false);
      setAnimalToDelete(null);
    }
  };

  const renderSkeletons = (count = 6) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="flex flex-col border-l-4 border-border shadow-sm"
        >
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

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Animals</h1>
              <p className="text-muted-foreground ml-1">
                Manage and view animal details
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => navigate('/animals/new')} disabled={loading}>
                <Plus className="mr-2 h-5 w-5" />
                Add Animal
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search animals..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* Main Content */}
        {loading ? (
          renderSkeletons()
        ) : filteredAnimals.length === 0 ? (
          <Card className="border-dashed border-border shadow-sm p-8 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Beef className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                No Animals Found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Add animals to start managing your livestock.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAnimals.map((animal) => (
              <Card
                key={animal.id}
                className="flex flex-col border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="p-4 pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {animal.name}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-more-vertical"
                          >
                            <circle cx="12" cy="2" r="1" />
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="22" r="1" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/animals/${animal.id}/edit`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(animal)}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground">
                    Type: {animal.animal_type}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2 pb-3 flex-grow">
                  <div className="flex gap-2 mb-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/animals/${animal.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/animals/${animal.id}/health`)}
                    >
                      Health Records
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Breed: {animal.breed}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Age: {animal.age} years
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {animalToDelete?.name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="default"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Animals;
