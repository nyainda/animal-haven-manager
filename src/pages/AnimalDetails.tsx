
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { 
  ArrowLeft, Calendar, Edit, Clipboard, Heart, Printer, 
  Activity, Weight, Tag, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Animal } from '@/types/AnimalTypes';
import { fetchAnimal } from '@/services/animalService';

const AnimalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        setError('Failed to load animal data');
        toast.error('Failed to load animal data');
      } finally {
        setLoading(false);
      }
    };

    loadAnimal();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-2 text-lg">Loading animal data...</span>
        </div>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          <h2 className="text-lg font-medium">Error</h2>
          <p>{error || 'Animal not found'}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/animals')}>
            Back to Animals
          </Button>
        </div>
      </div>
    );
  }

  const animalTypeIcons: { [key: string]: string } = {
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

  const getAnimalTypeIcon = (type: string) => {
    return animalTypeIcons[type] || animalTypeIcons.other;
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

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/animals')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Animals
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{getAnimalTypeIcon(animal.type)}</div>
          <div>
            <h1 className="text-3xl font-bold">{animal.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="capitalize">{animal.type}</span>
              <span>•</span>
              <span>{animal.breed}</span>
              <span>•</span>
              <span className="capitalize">{animal.gender}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('Print functionality coming soon')}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={() => navigate(`/animals/${animal.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Animal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Clipboard className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">ID Information</h3>
            </div>
            <Separator className="my-2" />
            <dl className="space-y-2 mt-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Internal ID:</dt>
                <dd className="font-medium">{animal.internal_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tag Number:</dt>
                <dd className="font-medium">{animal.tag_number || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Animal ID:</dt>
                <dd className="font-medium font-mono text-sm">{animal.animal_id}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Birth Information</h3>
            </div>
            <Separator className="my-2" />
            <dl className="space-y-2 mt-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Birth Date:</dt>
                <dd className="font-medium">
                  {animal.birth_date ? format(new Date(animal.birth_date), 'MMM d, yyyy') : '-'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Age:</dt>
                <dd className="font-medium">{animal.age} {animal.age === 1 ? 'year' : 'years'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Birth Status:</dt>
                <dd className="font-medium capitalize">{animal.birth_status}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Status</h3>
            </div>
            <Separator className="my-2" />
            <dl className="space-y-2 mt-3">
              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground">Current Status:</dt>
                <dd>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(animal.status)}`}>
                    {animal.status}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Breeding Stock:</dt>
                <dd className="font-medium">{animal.is_breeding_stock ? 'Yes' : 'No'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Origin:</dt>
                <dd className="font-medium capitalize">{animal.raised_purchased}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full mb-4 justify-start">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="breeding">Breeding</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Animal Details</CardTitle>
              <CardDescription>
                Detailed information about {animal.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Physical Characteristics</h3>
                  <Separator className="mb-4" />
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-muted-foreground">Birth Weight:</span>
                      <p className="font-medium">
                        {animal.birth_weight 
                          ? `${animal.birth_weight} ${animal.weight_unit || 'kg'}`
                          : 'Not recorded'}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Health at Birth:</span>
                      <p className="font-medium capitalize">{animal.health_at_birth}</p>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Multiple Birth:</span>
                      <p className="font-medium">{animal.multiple_birth ? 'Yes' : 'No'}</p>
                      {animal.multiple_birth && animal.birth_order && (
                        <p className="text-sm text-muted-foreground">Birth order: {animal.birth_order}</p>
                      )}
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Physical Traits:</span>
                      {animal.physical_traits && animal.physical_traits.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {animal.physical_traits.map((trait, index) => (
                            <Badge key={index} variant="secondary">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic">No physical traits recorded</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Additional Information</h3>
                  <Separator className="mb-4" />
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-muted-foreground">Keywords:</span>
                      {animal.keywords && animal.keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {animal.keywords.map((keyword, index) => (
                            <Badge key={index} variant="outline">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic">No keywords added</p>
                      )}
                    </div>
                    
                    {animal.gestation_length && (
                      <div>
                        <span className="text-muted-foreground">Gestation Length:</span>
                        <p className="font-medium">{animal.gestation_length} days</p>
                      </div>
                    )}
                    
                    {animal.breeder_info && (
                      <div>
                        <span className="text-muted-foreground">Breeder Information:</span>
                        <p className="font-medium">{animal.breeder_info}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>Health Information</CardTitle>
              <CardDescription>
                Health records and medical history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed p-8 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Health Records</h3>
                <p className="text-muted-foreground mb-4">
                  No health records have been added for this animal yet.
                </p>
                <Button onClick={() => toast.info('Health record feature coming soon')}>
                  Add Health Record
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="breeding">
          <Card>
            <CardHeader>
              <CardTitle>Breeding Information</CardTitle>
              <CardDescription>
                Breeding records and genealogy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Breeding Records</h3>
                <p className="text-muted-foreground mb-4">
                  No breeding records have been added for this animal yet.
                </p>
                <Button onClick={() => toast.info('Breeding record feature coming soon')}>
                  Add Breeding Record
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnimalDetails;
