import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { 
  CalendarIcon, ArrowLeft, Edit, Trash2, AlertTriangle, MoreHorizontal, 
  FileText, Activity, Heart, FileEdit, PiggyBank, CheckSquare, Tag
} from 'lucide-react';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchAnimal } from '@/services/animalService';
import { fetchSuppliers, Supplier } from '@/services/supplierApi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Animal } from '@/types/AnimalTypes';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, 
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AnimalDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  useEffect(() => {
    const getAnimalDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const animalData = await fetchAnimal(id);
        setAnimal(animalData);
        setError(null);

        setSuppliersLoading(true);
        const suppliersData = await fetchSuppliers(id);
        setSuppliers(suppliersData);
      } catch (err) {
        console.error('Failed to fetch animal details or suppliers:', err);
        setError('Failed to load animal details or suppliers. Please try again later.');
        toast.error('Could not load animal details or suppliers');
      } finally {
        setLoading(false);
        setSuppliersLoading(false);
      }
    };

    getAnimalDetails();
  }, [id]);

  useEffect(() => {
    const fetchUpcomingTasks = async () => {
      if (!id) return;
      
      try {
        setTasksLoading(true);
        const response = await fetch(`/api/animals/${id}/tasks?status=pending&limit=3`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        setUpcomingTasks(data.data || []);
      } catch (err) {
        console.error('Failed to fetch upcoming tasks:', err);
      } finally {
        setTasksLoading(false);
      }
    };

    if (animal) fetchUpcomingTasks();
  }, [id, animal]);

  const handleEdit = () => navigate(`/animals/${id}/edit`);
  const handleDelete = () => toast.error('Delete functionality not implemented yet');

  const getFormattedDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not specified';
    try {
      return format(parseISO(dateString), 'PPP');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
      case 'sold': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'deceased': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getTaskPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getSupplierImportanceColor = (importance: string) => {
    switch (importance?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Error
            </CardTitle>
            <CardDescription>{error || 'Animal not found'}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/animals')}>Return to Animals</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const quickActions = [
    { label: 'Activities', href: `/animals/${id}/activities`, icon: Activity },
    { label: 'Health', href: `/animals/${id}/health`, icon: Heart },
    { label: 'Notes', href: `/animals/${id}/notes`, icon: FileText },
    { label: 'Production', href: `/animals/${id}/production`, icon: PiggyBank },
    { label: 'Tasks', href: `/animals/${id}/tasks`, icon: CheckSquare },
    { label: 'Suppliers', href: `/animals/${id}/suppliers`, icon: Tag },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Button variant="ghost" size="sm" className="mr-2" onClick={() => navigate('/animals')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{animal.name}</h1>
          <Badge variant="secondary" className={cn("ml-3", getStatusColor(animal.status))}>
            {animal.status}
          </Badge>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {quickActions.map((action) => (
                <DropdownMenuItem 
                  key={action.label}
                  onClick={() => navigate(action.href)}
                  className="cursor-pointer"
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Animal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="overviews">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="birth">Birth Info</TabsTrigger>
                  <TabsTrigger value="production">Production</TabsTrigger>
                  <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Animal Type</h3>
                      <p className="text-base font-medium mt-1">{animal.type}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Breed</h3>
                      <p className="text-base font-medium mt-1">{animal.breed}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Gender</h3>
                      <p className="text-base font-medium mt-1">{animal.gender}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Tag Number</h3>
                      <p className="text-base font-medium mt-1">{animal.tag_number || 'None'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Birth Date</h3>
                      <p className="text-base font-medium mt-1">{getFormattedDate(animal.birth_date)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                      <Badge variant="secondary" className={cn("mt-1", getStatusColor(animal.status))}>
                        {animal.status}
                      </Badge>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {quickActions.map((action) => (
                        <Button 
                          key={action.label} 
                          variant="outline" 
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => navigate(action.href)}
                        >
                          <action.icon className="h-4 w-4 mr-2" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Internal ID</h3>
                      <p className="text-base font-medium mt-1">{animal.id}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Origin</h3>
                      <p className="text-base font-medium mt-1 capitalize">{animal.raised_purchased || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Breeding Stock</h3>
                      <p className="text-base font-medium mt-1">{animal.is_breeding_stock ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Next Checkup</h3>
                      <p className="text-base font-medium mt-1">{getFormattedDate(animal.next_checkup_date)}</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Physical Traits</h3>
                    <div className="flex flex-wrap gap-2">
                      {animal.physical_traits && animal.physical_traits.length > 0 ? (
                        animal.physical_traits.map((trait, idx) => (
                          <Badge key={idx} variant="secondary" className="px-3 py-1">
                            {trait}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No physical traits specified</p>
                      )}
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {animal.keywords && animal.keywords.length > 0 ? (
                        animal.keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="px-3 py-1">
                            {keyword}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No keywords specified</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="birth">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Birth Date</h3>
                      <p className="text-base font-medium mt-1">{getFormattedDate(animal.birth_date)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Birth Time</h3>
                      <p className="text-base font-medium mt-1">{animal.birth_time || 'Not recorded'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Birth Weight</h3>
                      <p className="text-base font-medium mt-1">
                        {animal.birth_weight ? `${animal.birth_weight} ${animal.weight_unit}` : 'Not recorded'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Birth Status</h3>
                      <p className="text-base font-medium mt-1 capitalize">{animal.birth_status}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Multiple Birth</h3>
                      <p className="text-base font-medium mt-1">{animal.multiple_birth ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Birth Order</h3>
                      <p className="text-base font-medium mt-1">{animal.birth_order || 'Not applicable'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Gestation Length</h3>
                      <p className="text-base font-medium mt-1">
                        {animal.gestation_length ? `${animal.gestation_length} days` : 'Not recorded'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Health at Birth</h3>
                      <p className="text-base font-medium mt-1 capitalize">{animal.health_at_birth}</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Vaccinations</h3>
                    <div className="flex flex-wrap gap-2">
                      {animal.vaccinations && animal.vaccinations.length > 0 ? (
                        animal.vaccinations.map((vaccination, idx) => (
                          <Badge key={idx} variant="secondary" className="px-3 py-1">
                            {vaccination}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No vaccinations recorded</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="production">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-medium">Production Records</h3>
                      <Button size="sm" onClick={() => navigate(`/animals/${id}/production`)}>
                        <PiggyBank className="h-4 w-4 mr-2" />
                        Manage Production
                      </Button>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Production Type</h4>
                          <p className="text-base font-medium mt-1">Not implemented</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Production Status</h4>
                          <p className="text-base font-medium mt-1">Not implemented</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/animals/${id}/production-statistics`)}>
                          View Statistics
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-medium mb-2">Quick Actions</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/animals/${id}/production/new`)}>
                          Add Production Record
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/animals/${id}/production-statistics`)}>
                          Production Statistics
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="suppliers">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-medium">Suppliers</h3>
                      <Button size="sm" onClick={() => navigate(`/animals/${id}/suppliers/new`)}>
                        <Tag className="h-4 w-4 mr-2" />
                        Add Supplier
                      </Button>
                    </div>
                    {suppliersLoading ? (
                      <div className="py-4 flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : suppliers.length > 0 ? (
                      <div className="space-y-3">
                        {suppliers.slice(0, 3).map((supplier) => (
                          <div key={supplier.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium">{supplier.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Contract Ends: {getFormattedDate(supplier.contract_end_date)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {supplier.shop_name} - {supplier.product_type}
                                </p>
                              </div>
                              <Badge variant="secondary" className={getSupplierImportanceColor(supplier.supplier_importance)}>
                                {supplier.supplier_importance}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => navigate(`/animals/${id}/suppliers`)}
                        >
                          View all suppliers
                        </Button>
                      </div>
                    ) : (
                      <div className="py-3 text-center">
                        <p className="text-sm text-muted-foreground">No suppliers recorded</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate(`/animals/${id}/suppliers/new`)}>
                          <Tag className="h-4 w-4 mr-2" />
                          Add Supplier
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quickActions.map((action) => (
                    <Button 
                      key={action.label} 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate(action.href)}
                    >
                      <action.icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="py-4 flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : upcomingTasks.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingTasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">{task.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Due: {getFormattedDate(task.due_date)}
                            </p>
                          </div>
                          <Badge variant="secondary" className={getTaskPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs mt-2 line-clamp-2">{task.description}</p>
                        )}
                      </div>
                    ))}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => navigate(`/animals/${id}/tasks`)}
                    >
                      View all tasks
                    </Button>
                  </div>
                ) : (
                  <div className="py-3 text-center">
                    <p className="text-sm text-muted-foreground">No upcoming tasks</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate(`/animals/${id}/tasks/new`)}>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Create Task
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-2 border-muted pl-4 pb-2 relative">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                    <p className="text-sm font-medium">Record created</p>
                    <p className="text-xs text-muted-foreground">
                      {getFormattedDate(animal.birth_date)}
                    </p>
                  </div>
                  {animal.health_at_birth !== 'healthy' && (
                    <div className="border-l-2 border-muted pl-4 pb-2 relative">
                      <div className="absolute w-3 h-3 bg-amber-500 rounded-full -left-[7px] top-1"></div>
                      <p className="text-sm font-medium">Health issue at birth</p>
                      <p className="text-xs text-muted-foreground">
                        {animal.health_at_birth}
                      </p>
                    </div>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => navigate(`/animals/${id}/activities`)}
                  >
                    View full history
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetails;