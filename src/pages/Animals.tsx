
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { 
  Calendar, ChevronDown, Download, Edit, Eye, Filter, MoreHorizontal, 
  Plus, Search, Trash2, Upload 
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

import { Animal } from '@/types/AnimalTypes';
import { fetchAnimals, deleteAnimal } from '@/services/animalService';

const AnimalStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusStyles = (status: string) => {
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

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyles(status)}`}>
      {status}
    </span>
  );
};

const animalTypeIcons: { [key: string]: React.ReactNode } = {
  cattle: '🐄',
  sheep: '🐑',
  goat: '🐐',
  pig: '🐖',
  horse: '🐎',
  chicken: '🐔',
  duck: '🦆',
  rabbit: '🐇',
  other: '🐾',
};

const Animals: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeView, setActiveView] = useState<string>('all');
  const [animalCounts, setAnimalCounts] = useState<{
    total: number;
    active: number;
    breeding: number;
    deceased: number;
  }>({
    total: 0,
    active: 0,
    breeding: 0,
    deceased: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadAnimals();
  }, [isAuthenticated, navigate]);

  const loadAnimals = async () => {
    setLoading(true);
    try {
      const data = await fetchAnimals();
      setAnimals(data);
      updateAnimalCounts(data);
    } catch (error) {
      console.error('Error loading animals:', error);
      toast.error('Failed to load animals');
    } finally {
      setLoading(false);
    }
  };

  const updateAnimalCounts = (animalData: Animal[]) => {
    const counts = {
      total: animalData.length,
      active: animalData.filter(a => a.status === 'Active').length,
      breeding: animalData.filter(a => a.is_breeding_stock).length,
      deceased: animalData.filter(a => a.is_deceased).length
    };
    setAnimalCounts(counts);
  };

  const handleDeleteAnimal = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this animal?')) {
      try {
        await deleteAnimal(id);
        toast.success('Animal deleted successfully');
        loadAnimals();
      } catch (error) {
        console.error('Error deleting animal:', error);
        toast.error('Failed to delete animal');
      }
    }
  };

  const filteredAnimals = animals.filter(animal => {
    // First apply view filter
    if (activeView === 'active' && animal.status !== 'Active') return false;
    if (activeView === 'breeding' && !animal.is_breeding_stock) return false;
    if (activeView === 'deceased' && !animal.is_deceased) return false;
    
    // Then apply search term
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      animal.name.toLowerCase().includes(term) ||
      animal.breed.toLowerCase().includes(term) ||
      animal.type.toLowerCase().includes(term) ||
      animal.tag_number?.toLowerCase().includes(term) ||
      animal.internal_id.toLowerCase().includes(term)
    );
  });

  const getAnimalTypeIcon = (type: string) => {
    return animalTypeIcons[type] || animalTypeIcons.other;
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Animals</h1>
          <p className="text-muted-foreground">Manage your animal inventory</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toast.info('Export functionality coming soon')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate('/animals/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Animal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card hover:shadow-md transition-all cursor-pointer" onClick={() => setActiveView('all')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{animalCounts.total}</div>
            <p className="text-muted-foreground">Total Animals</p>
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-md transition-all cursor-pointer" onClick={() => setActiveView('active')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{animalCounts.active}</div>
            <p className="text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-md transition-all cursor-pointer" onClick={() => setActiveView('breeding')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{animalCounts.breeding}</div>
            <p className="text-muted-foreground">Breeding Stock</p>
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-md transition-all cursor-pointer" onClick={() => setActiveView('deceased')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{animalCounts.deceased}</div>
            <p className="text-muted-foreground">Deceased</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Animal Inventory</CardTitle>
            <div className="w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search animals..."
                  className="pl-8 w-full md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList>
              <TabsTrigger value="all">All Animals</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="breeding">Breeding Stock</TabsTrigger>
              <TabsTrigger value="deceased">Deceased</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-2">Loading animals...</span>
            </div>
          ) : filteredAnimals.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No animals found</p>
              <Button onClick={() => navigate('/animals/new')}>Add your first animal</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Tag Number</TableHead>
                    <TableHead>Breed</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Birth Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnimals.map((animal) => (
                    <TableRow key={animal.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getAnimalTypeIcon(animal.type)}</span>
                          <div>
                            <div className="font-medium">{animal.name}</div>
                            <div className="text-sm text-muted-foreground capitalize">{animal.type}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{animal.internal_id}</TableCell>
                      <TableCell>{animal.tag_number || '-'}</TableCell>
                      <TableCell>{animal.breed}</TableCell>
                      <TableCell className="capitalize">{animal.gender}</TableCell>
                      <TableCell>
                        {animal.birth_date ? format(new Date(animal.birth_date), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <AnimalStatusBadge status={animal.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/animals/${animal.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/animals/${animal.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive" 
                              onClick={() => handleDeleteAnimal(animal.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredAnimals.length} of {animals.length} animals
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Animals;
