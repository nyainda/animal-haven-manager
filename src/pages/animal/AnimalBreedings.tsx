
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, Plus, Heart, Loader2, Calendar, Users, Clock, ChevronDown,
  ChevronUp, Info, Tag, Check, X, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchAnimal } from '@/services/animalService';
import { Animal } from '@/types/AnimalTypes';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define the breeding record interface
interface BreedingRecord {
  id: string;
  date: string;
  partner_animal_id?: string;
  partner_animal_name?: string;
  partner_animal_type?: string;
  status: 'pending' | 'successful' | 'unsuccessful' | 'in_progress';
  notes?: string;
  expected_birth_date?: string;
  actual_birth_date?: string;
  offspring_count?: number;
  method?: string;
  location?: string;
  veterinarian?: string;
  created_at: string;
  updated_at: string;
}

// Mock data for demonstration
const mockBreedingRecords: BreedingRecord[] = [
  {
    id: 'br-001',
    date: '2025-02-15T10:30:00Z',
    partner_animal_name: 'Bella',
    partner_animal_type: 'Holstein',
    status: 'successful',
    notes: 'Successful breeding with good conditions.',
    expected_birth_date: '2025-11-20T00:00:00Z',
    actual_birth_date: '2025-11-18T08:45:00Z',
    offspring_count: 2,
    method: 'Natural',
    location: 'North Pasture',
    veterinarian: 'Dr. Martinez',
    created_at: '2025-02-15T12:30:00Z',
    updated_at: '2025-11-18T10:15:00Z'
  },
  {
    id: 'br-002',
    date: '2025-03-10T14:15:00Z',
    partner_animal_name: 'Max',
    partner_animal_type: 'Angus',
    status: 'unsuccessful',
    notes: 'Attempted breeding but unsuccessful. Will try again in next cycle.',
    method: 'Natural',
    location: 'Breeding Pen',
    created_at: '2025-03-10T15:00:00Z',
    updated_at: '2025-03-20T09:30:00Z'
  },
  {
    id: 'br-003',
    date: '2025-04-05T09:00:00Z',
    partner_animal_name: 'Charlie',
    partner_animal_type: 'Jersey',
    status: 'in_progress',
    notes: 'Breeding performed, monitoring for confirmation.',
    expected_birth_date: '2025-12-30T00:00:00Z',
    method: 'AI',
    veterinarian: 'Dr. Johnson',
    location: 'Main Barn',
    created_at: '2025-04-05T10:45:00Z',
    updated_at: '2025-04-05T10:45:00Z'
  }
];

const AnimalBreedings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  
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
        
        // In a real app, you would fetch breeding records here
        // For demo purposes, we'll use mock data with a delay to simulate API loading
        setTimeout(() => {
          setBreedingRecords(mockBreedingRecords);
          setLoading(false);
        }, 800);
        
      } catch (error) {
        console.error('Error loading animal:', error);
        toast.error('Failed to load animal data');
        setLoading(false);
      }
    };

    loadAnimal();
  }, [id, navigate]);
  
  // Toggle expanded record
  const toggleExpandRecord = (recordId: string) => {
    if (expandedRecord === recordId) {
      setExpandedRecord(null);
    } else {
      setExpandedRecord(recordId);
    }
  };
  
  // Filter records based on active tab
  const getFilteredRecords = () => {
    if (activeTab === 'all') return breedingRecords;
    return breedingRecords.filter(record => record.status === activeTab);
  };

  const formattedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formattedDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'successful':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'unsuccessful':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Loading breeding records...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="bg-destructive/15 text-destructive p-6 rounded-lg">
          <h2 className="text-xl font-medium mb-2">Animal Not Found</h2>
          <p>The animal you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/animals')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Animals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <Link to={`/animals/${id}`} className="inline-block mb-4">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Animal
          </Button>
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              Breeding Records 
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage breeding history for <span className="font-medium">{animal.name}</span> ({animal.type})
            </p>
          </div>
          
          <Button 
            onClick={() => navigate(`/animals/${id}/breedings/new`)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Breeding Record
          </Button>
        </div>
      </div>
      
      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Info className="h-5 w-5 text-muted-foreground" />
            Breeding Summary
          </CardTitle>
          <CardDescription>
            Overview of all breeding activities for this animal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-muted/30 border-none shadow-none">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <p className="text-sm text-muted-foreground">Total Breedings</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-3xl font-bold">{breedingRecords.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/30 border-none shadow-none">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-3xl font-bold">
                      {breedingRecords.length > 0 
                        ? `${Math.round((breedingRecords.filter(r => r.status === 'successful').length / breedingRecords.length) * 100)}%`
                        : '0%'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/30 border-none shadow-none">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <p className="text-sm text-muted-foreground">Total Offspring</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold">
                      {breedingRecords.reduce((sum, record) => sum + (record.offspring_count || 0), 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/30 border-none shadow-none">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <p className="text-sm text-muted-foreground">Last Breeding</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-base font-medium">
                      {breedingRecords.length > 0 
                        ? formattedDate(breedingRecords.sort((a, b) => 
                            new Date(b.date).getTime() - new Date(a.date).getTime()
                          )[0].date)
                        : 'None'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Breeding History</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Calendar className="h-4 w-4" />
                  Filter
                  <ChevronDown className="h-3.5 w-3.5 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setActiveTab('all')}>Show All Records</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab('successful')}>Successful Breedings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('in_progress')}>In Progress</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('unsuccessful')}>Unsuccessful Breedings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('pending')}>Pending Breedings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="all" className="text-xs data-[state=active]:bg-primary/10">
                All Records
              </TabsTrigger>
              <TabsTrigger value="successful" className="text-xs data-[state=active]:bg-primary/10">
                Successful
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="text-xs data-[state=active]:bg-primary/10">
                In Progress
              </TabsTrigger>
              <TabsTrigger value="unsuccessful" className="text-xs data-[state=active]:bg-primary/10">
                Unsuccessful
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent className="pt-4">
          {breedingRecords.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Breeding Records</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  No breeding records have been recorded for this animal yet. 
                  Add a breeding record to start tracking reproductive history.
                </p>
                <Button onClick={() => navigate(`/animals/${id}/breedings/new`)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Breeding Record
                </Button>
              </motion.div>
            </div>
          ) : getFilteredRecords().length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Info className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Matching Records</h3>
                <p className="text-muted-foreground mb-4">
                  No breeding records match your current filter.
                </p>
                <Button variant="outline" onClick={() => setActiveTab('all')}>
                  Show All Records
                </Button>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredRecords().map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Collapsible 
                    open={expandedRecord === record.id}
                    className="border border-border/50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CollapsibleTrigger asChild>
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30"
                        onClick={() => toggleExpandRecord(record.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full ${getBadgeColor(record.status)} flex items-center justify-center`}>
                            <Heart className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{record.partner_animal_name || 'Unknown Partner'}</p>
                              <Badge variant="outline" className={getBadgeColor(record.status)}>
                                {record.status.replace('_', ' ').charAt(0).toUpperCase() + record.status.replace('_', ' ').slice(1)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{formattedDate(record.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {record.offspring_count ? (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              <Users className="h-3 w-3 mr-1" />
                              {record.offspring_count} offspring
                            </Badge>
                          ) : null}
                          <div className="w-6 h-6 flex items-center justify-center">
                            {expandedRecord === record.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="p-4 pt-0 border-t border-border/50 bg-card">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                          <div className="space-y-1">
                            <dt className="text-xs text-muted-foreground">Partner Animal</dt>
                            <dd className="font-medium">{record.partner_animal_name || 'Not specified'}</dd>
                          </div>
                          
                          <div className="space-y-1">
                            <dt className="text-xs text-muted-foreground">Partner Type</dt>
                            <dd className="font-medium">{record.partner_animal_type || 'Not specified'}</dd>
                          </div>
                          
                          <div className="space-y-1">
                            <dt className="text-xs text-muted-foreground">Breeding Date</dt>
                            <dd className="font-medium">{formattedDateTime(record.date)}</dd>
                          </div>
                          
                          <div className="space-y-1">
                            <dt className="text-xs text-muted-foreground">Method</dt>
                            <dd className="font-medium">{record.method || 'Not specified'}</dd>
                          </div>
                          
                          {record.expected_birth_date && (
                            <div className="space-y-1">
                              <dt className="text-xs text-muted-foreground">Expected Birth</dt>
                              <dd className="font-medium">{formattedDate(record.expected_birth_date)}</dd>
                            </div>
                          )}
                          
                          {record.actual_birth_date && (
                            <div className="space-y-1">
                              <dt className="text-xs text-muted-foreground">Actual Birth</dt>
                              <dd className="font-medium">{formattedDate(record.actual_birth_date)}</dd>
                            </div>
                          )}
                          
                          {record.offspring_count !== undefined && (
                            <div className="space-y-1">
                              <dt className="text-xs text-muted-foreground">Offspring</dt>
                              <dd className="font-medium">{record.offspring_count}</dd>
                            </div>
                          )}
                          
                          {record.location && (
                            <div className="space-y-1">
                              <dt className="text-xs text-muted-foreground">Location</dt>
                              <dd className="font-medium">{record.location}</dd>
                            </div>
                          )}
                          
                          {record.veterinarian && (
                            <div className="space-y-1">
                              <dt className="text-xs text-muted-foreground">Veterinarian</dt>
                              <dd className="font-medium">{record.veterinarian}</dd>
                            </div>
                          )}
                          
                          <div className="md:col-span-2 space-y-1">
                            <dt className="text-xs text-muted-foreground">Notes</dt>
                            <dd className="font-medium">
                              {record.notes || 'No notes provided.'}
                            </dd>
                          </div>
                        </dl>
                        
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                          <div className="text-xs text-muted-foreground">
                            Last updated: {formattedDateTime(record.updated_at)}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => navigate(`/animals/${id}/breedings/${record.id}/edit`)}
                              className="text-xs h-8"
                            >
                              Edit Record
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => navigate(`/animals/${id}/breedings/${record.id}/edit`)}
                                >
                                  Edit Record
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500">
                                  Delete Record
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimalBreedings;
