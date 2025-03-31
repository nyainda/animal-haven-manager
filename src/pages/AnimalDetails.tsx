import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, NavigateFunction } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { 
  ArrowLeft, Edit, Trash2, AlertTriangle, MoreHorizontal, 
  FileText, Activity, Heart, PiggyBank, CheckSquare, Tag,
  LucideProps
} from 'lucide-react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchAnimal } from '@/services/animalService';
import { fetchSuppliers, Supplier } from '@/services/supplierApi';
import { fetchProductions, Production } from '@/services/animalProductionApi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Animal } from '@/types/AnimalTypes';

interface QuickAction {
  label: string;
  href: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
}

interface QuickActionsProps {
  actions: QuickAction[];
  navigate: NavigateFunction;
}

const QuickActions = React.memo(({ actions, navigate }: QuickActionsProps) => (
  <div className="grid grid-cols-1 gap-2">
    {actions.map((action) => (
      <Button 
        key={action.label} 
        variant="outline" 
        size="sm"
        className="w-full justify-start h-10 px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors border border-input rounded-md"
        onClick={() => navigate(action.href)}
      >
        <action.icon className="h-4 w-4 mr-2" />
        {action.label}
      </Button>
    ))}
  </div>
));

const AnimalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  interface DataState {
    animal: Animal | null;
    suppliers: Supplier[];
    productions: Production[];
    upcomingTasks: any[];
  }

  interface LoadingStates {
    main: boolean;
    productions: boolean;
    suppliers: boolean;
    tasks: boolean;
  }

  const [data, setData] = useState<DataState>({
    animal: null,
    suppliers: [],
    productions: [],
    upcomingTasks: []
  });
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    main: true,
    productions: false,
    suppliers: false,
    tasks: false
  });
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        setLoadingStates(prev => ({ ...prev, main: true }));
        const [animalData, suppliersData, productionsData] = await Promise.all([
          fetchAnimal(id),
          fetchSuppliers(id),
          fetchProductions(id)
        ]);

        setData(prev => ({
          ...prev,
          animal: animalData,
          suppliers: suppliersData,
          productions: productionsData
        }));
        setError(null);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError('Failed to load data');
          toast.error('Error loading animal details');
        }
      } finally {
        setLoadingStates(prev => ({ ...prev, main: false }));
      }
    };

    const fetchTasks = async () => {
      try {
        setLoadingStates(prev => ({ ...prev, tasks: true }));
        const response = await fetch(`/api/animals/${id}/tasks?status=pending&limit=3`, {
          signal: controller.signal
        });
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const taskData = await response.json();
        setData(prev => ({
          ...prev,
          upcomingTasks: taskData.data || []
        }));
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      } finally {
        setLoadingStates(prev => ({ ...prev, tasks: false }));
      }
    };

    fetchData();
    fetchTasks();

    return () => controller.abort();
  }, [id]);

  const formatDate = useCallback((dateString?: string | null): string => {
    return dateString ? format(parseISO(dateString), 'PPP') : 'Not specified';
  }, []);

  const getStatusColor = useCallback((status?: string): string => ({
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    sold: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    deceased: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
  }[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'), []);

  const getTaskPriorityColor = useCallback((priority?: string): string => ({
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
  }[priority?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'), []);

  const getSupplierImportanceColor = useCallback((importance?: string): string => ({
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
  }[importance?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'), []);

  const getQualityStatusColor = useCallback((status?: string): string => ({
    passed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
  }[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'), []);

  const handleDelete = () => toast.error('Delete functionality not implemented yet');

  const quickActions: QuickAction[] = [
    { label: 'Activities', href: `/animals/${id}/activities`, icon: Activity },
    { label: 'Health', href: `/animals/${id}/health`, icon: Heart },
    { label: 'Notes', href: `/animals/${id}/notes`, icon: FileText },
    { label: 'Production', href: `/animals/${id}/production`, icon: PiggyBank },
    { label: 'Tasks', href: `/animals/${id}/tasks`, icon: CheckSquare },
    { label: 'Suppliers', href: `/animals/${id}/suppliers`, icon: Tag },
  ];

  if (loadingStates.main) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !data.animal) {
    return (
      <Card className="max-w-4xl mx-auto mt-6 border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error || 'Animal not found'}</p>
          <Button onClick={() => navigate('/animals')} className="mt-4">
            Return to Animals
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => navigate('/animals')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{data.animal.name}</h1>
          <Badge className={cn("ml-2", getStatusColor(data.animal.status))}>
            {data.animal.status}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/animals/${id}/edit`)}>
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
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-xl">Animal Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6 rounded-lg bg-muted p-1">
                  {['overview', 'details', 'birth', 'production', 'suppliers'].map(tab => (
                    <TabsTrigger 
                      key={tab}
                      value={tab}
                      className="capitalize transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { label: 'Animal Type', value: data.animal.type },
                      { label: 'Breed', value: data.animal.breed },
                      { label: 'Gender', value: data.animal.gender },
                      { label: 'Tag Number', value: data.animal.tag_number || 'None' },
                      { label: 'Birth Date', value: formatDate(data.animal.birth_date) },
                      { label: 'Status', value: (
                        <Badge className={getStatusColor(data.animal.status)}>
                          {data.animal.status}
                        </Badge>
                      )},
                      { label: 'Age', value: `${data.animal.age} years` }, // Added
                      { label: 'Internal ID', value: data.animal.internal_id }, // Added
                      { label: 'Animal ID', value: data.animal.animal_id }, // Added
                    ].map((item, idx) => (
                      <div key={idx} className="min-w-0">
                        <h3 className="text-sm text-muted-foreground font-medium truncate">{item.label}</h3>
                        <p className="mt-1 text-base font-medium truncate">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground font-medium mb-3">Quick Actions</h3>
                    <QuickActions actions={quickActions} navigate={navigate} />
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { label: 'Breeding Stock', value: data.animal.is_breeding_stock ? 'Yes' : 'No' }, // Added
                      { label: 'Deceased', value: data.animal.is_deceased ? 'Yes' : 'No' }, // Added
                      { label: 'Origin', value: data.animal.raised_purchased || 'Not specified' },
                      { label: 'Next Checkup', value: formatDate(data.animal.next_checkup_date) },
                      { label: 'Breeder Info', value: data.animal.breeder_info || 'Not specified' }, // Added
                    ].map((item, idx) => (
                      <div key={idx} className="min-w-0">
                        <h3 className="text-sm text-muted-foreground font-medium truncate">{item.label}</h3>
                        <p className="mt-1 text-base font-medium truncate">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="birth" className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { label: 'Birth Date', value: formatDate(data.animal.birth_date) },
                      { label: 'Birth Time', value: data.animal.birth_time || 'Not recorded' },
                      { label: 'Birth Weight', value: data.animal.birth_weight ? `${data.animal.birth_weight} ${data.animal.weight_unit}` : 'Not recorded' },
                      { label: 'Birth Status', value: data.animal.birth_status || 'Not specified' },
                      { label: 'Health at Birth', value: data.animal.health_at_birth || 'Not specified' }, // Added
                      { label: 'Multiple Birth', value: data.animal.multiple_birth ? 'Yes' : 'No' }, // Added
                    ].map((item, idx) => (
                      <div key={idx} className="min-w-0">
                        <h3 className="text-sm text-muted-foreground font-medium truncate">{item.label}</h3>
                        <p className="mt-1 text-base font-medium truncate">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="production" className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-base font-medium">Production Records</h3>
                    <Button size="sm" onClick={() => navigate(`/animals/${id}/production`)}>
                      <PiggyBank className="h-4 w-4 mr-2" />
                      Manage Production
                    </Button>
                  </div>
                  {data.productions.length > 0 ? (
                    <div className="space-y-3">
                      {data.productions.slice(0, 3).map((production) => (
                        <div key={production.id} className="border rounded-lg p-3 bg-background">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{production.product_category.name}</p>
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {formatDate(production.production_date)} - {production.quantity}{' '}
                                {production.product_category.measurement_unit}
                              </p>
                            </div>
                            <Badge className={getQualityStatusColor(production.quality_status)}>
                              {production.quality_status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No production records available</p>
                  )}
                </TabsContent>

                <TabsContent value="suppliers" className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-base font-medium">Suppliers</h3>
                    <Button size="sm" onClick={() => navigate(`/animals/${id}/suppliers`)}>
                      <Tag className="h-4 w-4 mr-2" />
                      Manage Suppliers
                    </Button>
                  </div>
                  {data.suppliers.length > 0 ? (
                    <div className="space-y-3">
                      {data.suppliers.slice(0, 3).map((supplier) => (
                        <div key={supplier.id} className="border rounded-lg p-3 bg-background">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{supplier.name}</p>
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                Ends: {formatDate(supplier.contract_end_date)}
                              </p>
                            </div>
                            <Badge className={getSupplierImportanceColor(supplier.supplier_importance)}>
                              {supplier.supplier_importance}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No suppliers available</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="shadow-sm border border-input">
            <CardHeader className="bg-muted/50 border-b border-input">
              <CardTitle className="text-lg font-semibold text-foreground">Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <QuickActions actions={quickActions} navigate={navigate} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-input">
            <CardHeader className="bg-muted/50 border-b border-input">
              <CardTitle className="text-lg font-semibold text-foreground">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {loadingStates.tasks ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary" />
                </div>
              ) : data.upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {data.upcomingTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="border border-input rounded-md p-3 bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="space-y-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            Due: {formatDate(task.due_date)}
                          </p>
                        </div>
                        <Badge 
                          className={cn(
                            getTaskPriorityColor(task.priority),
                            "text-xs font-medium px-2 py-0.5"
                          )}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-muted-foreground hover:text-foreground"
                    onClick={() => navigate(`/animals/${id}/tasks`)}
                  >
                    View All Tasks
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">No upcoming tasks</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/animals/${id}/tasks/new`)}
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default React.memo(AnimalDetails);