import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { 
  ArrowLeft, Edit, Trash2, AlertTriangle, MoreHorizontal, 
  FileText, Activity, Heart, PiggyBank, CheckSquare, Tag,
  Calendar, Info, Layers, ExternalLink
} from 'lucide-react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
import { fetchAnimal } from '@/services/animalService';
import { fetchSuppliers, Supplier } from '@/services/supplierApi';
import { fetchProductions, Production } from '@/services/animalProductionApi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Animal } from '@/types/AnimalTypes';

interface QuickAction {
  label: string;
  href: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const QuickActionCard = ({ action, onClick }: { action: QuickAction; onClick: () => void }) => (
  <Card 
    className="overflow-hidden cursor-pointer transition-all border-muted hover:border-primary/50 hover:shadow-md group"
    onClick={onClick}
  >
    <CardContent className="p-4 flex items-center space-x-3">
      <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
        <action.icon className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-1">
        <h3 className="font-medium text-sm">{action.label}</h3>
        <p className="text-xs text-muted-foreground">{action.description}</p>
      </div>
    </CardContent>
  </Card>
);

const AnimalsDetailsSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 space-y-8">
    <div className="flex items-center gap-4">
      <div className="rounded-full bg-muted h-16 w-16 animate-pulse" />
      <div className="space-y-2">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-muted h-96 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-6">
        <div className="bg-muted h-64 rounded-lg animate-pulse" />
        <div className="bg-muted h-64 rounded-lg animate-pulse" />
      </div>
    </div>
  </div>
);

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
    if (!id) {
      toast.error('Animal ID is missing.');
      navigate('/animals');
      return;
    }

    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        setLoadingStates(prev => ({ ...prev, main: true }));
        const [animalData, suppliersData, productionsData] = await Promise.all([
          fetchAnimal(id),
          fetchSuppliers(id),
          fetchProductions(id)
        ]);

        console.log('Fetched productions for AnimalDetails:', productionsData); // Debug log

        setData(prev => ({
          ...prev,
          animal: animalData,
          suppliers: suppliersData,
          productions: productionsData.sort((a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime())
        }));
        setError(null);
        if (!productionsData.length) toast.info('No production records found for this animal.');
      } catch (err) {
        if (!controller.signal.aborted) {
          setError('Failed to load data');
          toast.error('Error loading animal details');
          console.error('Error fetching data:', err);
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
  }, [id, navigate]);

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
    { label: 'Activities', href: `/animals/${id}/activities`, icon: Activity, description: 'View activity history' },
    { label: 'Health', href: `/animals/${id}/health`, icon: Heart, description: 'Health records & checkups' },
    { label: 'Notes', href: `/animals/${id}/notes`, icon: FileText, description: 'Notes & observations' },
    { label: 'Production', href: `/animals/${id}/production`, icon: PiggyBank, description: 'Production metrics' },
    { label: 'Tasks', href: `/animals/${id}/tasks`, icon: CheckSquare, description: 'Scheduled tasks' },
    { label: 'Suppliers', href: `/animals/${id}/suppliers`, icon: Tag, description: 'Supplier management' },
  ];

  const getAnimalTypeIcon = (type?: string) => {
    switch(type?.toLowerCase()) {
      case 'cow': case 'cattle': case 'bull': return '🐄';
      case 'sheep': return '🐑';
      case 'goat': return '🐐';
      case 'pig': return '🐖';
      case 'chicken': return '🐓';
      case 'horse': return '🐎';
      default: return '🦮';
    }
  };

  const getAnimalAvatar = (animal: Animal) => {
    const initials = animal.name.substring(0, 2).toUpperCase();
    const animalIcon = getAnimalTypeIcon(animal.type);
    
    const typeColors = {
      'cow': 'bg-blue-600',
      'cattle': 'bg-blue-600',
      'bull': 'bg-blue-800',
      'sheep': 'bg-gray-600',
      'goat': 'bg-amber-600',
      'pig': 'bg-pink-600',
      'chicken': 'bg-yellow-600',
      'horse': 'bg-brown-600',
    };
    
    const bgColor = typeColors[animal.type?.toLowerCase()] || 'bg-primary';
    
    return (
      <Avatar className={`h-16 w-16 text-lg ${bgColor} text-white`}>
        <span>{animalIcon || initials}</span>
      </Avatar>
    );
  };

  if (loadingStates.main) {
    return <AnimalsDetailsSkeleton />;
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
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          {getAnimalAvatar(data.animal)}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{data.animal.name}</h1>
              <Badge className={cn("ml-1", getStatusColor(data.animal.status))}>
                {data.animal.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <span>{data.animal.type}</span>
              <span>•</span>
              <span>{data.animal.breed}</span>
              <span>•</span>
              <span>ID: {data.animal.tag_number}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/animals')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="default" size="sm" onClick={() => navigate(`/animals/${id}/edit`)}>
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Age</p>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-2">{data.animal.age} years</p>
            <p className="text-xs text-muted-foreground mt-1">Born: {formatDate(data.animal.birth_date)}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Gender</p>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-2">{data.animal.gender}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.animal.is_breeding_stock ? 'Breeding Stock' : 'Not Breeding Stock'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Production</p>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-2">{data.productions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Production Records</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Tasks</p>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-2">{data.upcomingTasks.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Pending Tasks</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-3">
              <CardTitle className="flex items-center text-xl">
                <Info className="h-5 w-5 mr-2 text-primary" />
                Animal Information
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex w-full h-12 rounded-none border-b bg-transparent p-0">
                  {['overview', 'details', 'birth', 'production', 'suppliers'].map(tab => (
                    <TabsTrigger 
                      key={tab}
                      value={tab}
                      className="flex-1 h-full capitalize rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent transition-all"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="p-6">
                  <TabsContent value="overview" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { label: 'Animal Type', value: data.animal.type, icon: Layers },
                        { label: 'Breed', value: data.animal.breed, icon: Tag },
                        { label: 'Gender', value: data.animal.gender, icon: Info },
                        { label: 'Tag Number', value: data.animal.tag_number || 'None', icon: Tag },
                        { label: 'Birth Date', value: formatDate(data.animal.birth_date), icon: Calendar },
                        { label: 'Status', value: (
                          <Badge className={getStatusColor(data.animal.status)}>
                            {data.animal.status}
                          </Badge>
                        ), icon: Activity },
                        { label: 'Age', value: `${data.animal.age} years`, icon: Calendar }, 
                        { label: 'Internal ID', value: data.animal.internal_id, icon: Tag }, 
                        { label: 'Animal ID', value: data.animal.animal_id, icon: Tag }, 
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <item.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm text-muted-foreground font-medium truncate">{item.label}</h3>
                            <div className="mt-1 text-base font-medium truncate">
                              {typeof item.value === 'string' ? item.value : item.value}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { label: 'Breeding Stock', value: data.animal.is_breeding_stock ? 'Yes' : 'No', icon: Heart },
                        { label: 'Deceased', value: data.animal.is_deceased ? 'Yes' : 'No', icon: AlertTriangle },
                        { label: 'Origin', value: data.animal.raised_purchased || 'Not specified', icon: ExternalLink },
                        { label: 'Next Checkup', value: formatDate(data.animal.next_checkup_date), icon: Calendar },
                        { label: 'Breeder Info', value: data.animal.breeder_info || 'Not specified', icon: Info },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <item.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm text-muted-foreground font-medium truncate">{item.label}</h3>
                            <div className="mt-1 text-base font-medium truncate">{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="birth" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { label: 'Birth Date', value: formatDate(data.animal.birth_date), icon: Calendar },
                        { label: 'Birth Time', value: data.animal.birth_time || 'Not recorded', icon: Calendar },
                        { label: 'Birth Weight', value: data.animal.birth_weight ? `${data.animal.birth_weight} ${data.animal.weight_unit}` : 'Not recorded', icon: Activity },
                        { label: 'Birth Status', value: data.animal.birth_status || 'Not specified', icon: Info },
                        { label: 'Health at Birth', value: data.animal.health_at_birth || 'Not specified', icon: Heart },
                        { label: 'Multiple Birth', value: data.animal.multiple_birth ? 'Yes' : 'No', icon: Layers },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <item.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm text-muted-foreground font-medium truncate">{item.label}</h3>
                            <div className="mt-1 text-base font-medium truncate">{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="production" className="space-y-6 mt-0">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <h3 className="text-base font-medium flex items-center">
      <PiggyBank className="h-4 w-4 mr-2 text-primary" />
      Production Records
    </h3>
    <Button size="sm" onClick={() => navigate(`/animals/${id}/production`)}>
      Manage Production
    </Button>
  </div>
  {data.productions.length > 0 ? (
    <div className="space-y-4">
      {data.productions.slice(0, 3).map((production, idx) => (
        <Card
          key={production.id}
          className={`overflow-hidden transition-shadow hover:shadow-md ${
            idx % 2 === 0 ? 'bg-muted/20' : 'bg-background'
          }`}
        >
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Section: Product Info */}
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 p-2 rounded-full flex-shrink-0">
                  <PiggyBank className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {production.product_category.name} - {production.trace_number}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(parseISO(production.production_date), 'MMM d, yyyy, h:mm a')}
                  </p>
                </div>
              </div>
              {/* Right Section: Metrics */}
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {production.quantity} {production.product_category.measurement_unit}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${parseFloat(production.total_price).toFixed(2) || '0.00'}
                  </p>
                </div>
                <Badge className={getQualityStatusColor(production.quality_status)}>
                  {production.quality_status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-primary hover:text-primary/80"
        onClick={() => navigate(`/animals/${id}/production`)}
      >
        View All Production Records
      </Button>
    </div>
  ) : (
    <div className="text-center py-8 bg-muted/20 rounded-lg">
      <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground mb-2">No production records available</p>
      <Button variant="outline" size="sm" onClick={() => navigate(`/animals/${id}/production/new`)}>
        Add Production Record
      </Button>
    </div>
  )}
</TabsContent>

                  <TabsContent value="suppliers" className="space-y-6 mt-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h3 className="text-base font-medium flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-primary" /> 
                        Suppliers
                      </h3>
                      <Button size="sm" onClick={() => navigate(`/animals/${id}/suppliers`)}>
                        Manage Suppliers
                      </Button>
                    </div>
                    {data.suppliers.length > 0 ? (
                      <div className="space-y-3">
                        {data.suppliers.slice(0, 3).map((supplier, idx) => (
                          <Card key={supplier.id} className={`overflow-hidden ${idx % 2 === 0 ? 'bg-muted/20' : 'bg-background'}`}>
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 p-2 rounded-full">
                                    <Tag className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{supplier.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Contract Ends: {formatDate(supplier.contract_end_date)}
                                    </p>
                                  </div>
                                </div>
                                <Badge className={getSupplierImportanceColor(supplier.supplier_importance)}>
                                  {supplier.supplier_importance}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-primary hover:text-primary/80"
                          onClick={() => navigate(`/animals/${id}/suppliers`)}
                        >
                          View All Suppliers
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-muted/20 rounded-lg">
                        <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">No suppliers available</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/animals/${id}/suppliers/new`)}
                        >
                          Add Supplier
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-3">
              <CardTitle className="flex items-center text-xl">
                <CheckSquare className="h-5 w-5 mr-2 text-primary" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loadingStates.tasks ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="h-16 bg-muted/50 rounded animate-pulse" />
                  ))}
                </div>
              ) : data.upcomingTasks.length > 0 ? (
                <div className="space-y-4">
                  {data.upcomingTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <CheckSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <Badge className={getTaskPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {formatDate(task.due_date)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-primary hover:text-primary/80"
                    onClick={() => navigate(`/animals/${id}/tasks`)}
                  >
                    View All Tasks
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">No upcoming tasks</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/animals/${id}/tasks/new`)}
                  >
                    Add Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-3">
              <CardTitle className="flex items-center text-xl">
                <Layers className="h-5 w-5 mr-2 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.label}
                  action={action}
                  onClick={() => navigate(action.href)}
                />
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default AnimalDetails;