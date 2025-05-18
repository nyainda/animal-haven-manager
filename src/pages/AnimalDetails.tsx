import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  ArrowLeft, Edit, Trash2, AlertTriangle, MoreHorizontal,
  FileText, Activity, Heart, PiggyBank, CheckSquare, Tag,
  Calendar, Info, Layers, ExternalLink, DollarSign
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { fetchAnimal } from '@/services/animalService';
import { fetchSuppliers, Supplier } from '@/services/supplierApi';
import { fetchProductions, Production } from '@/services/animalProductionApi';
import { fetchTransactions, deleteTransaction, Transaction } from '@/services/transactionApis';
import { Animal } from '@/types/AnimalTypes';

interface QuickAction {
  label: string;
  href: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
}

const QuickActionCard = ({ action, onClick }: { action: QuickAction; onClick: () => void }) => (
  <Card
    className="overflow-hidden cursor-pointer transition-all border hover:border-primary/50 hover:shadow-md group"
    onClick={onClick}
  >
    <CardContent className="p-4 flex items-center space-x-3">
      <div className={`${action.color} p-2 rounded-lg group-hover:opacity-90 transition-colors`}>
        <action.icon className="h-5 w-5 text-white" />
      </div>
      <div className="space-y-0.5">
        <h3 className="font-medium text-sm">{action.label}</h3>
        <p className="text-xs text-muted-foreground">{action.description}</p>
      </div>
    </CardContent>
  </Card>
);

const AnimalsDetailsSkeleton = () => (
  <div className="max-w-full mx-auto p-4 md:p-6 space-y-6">
    <div className="bg-white dark:bg-card rounded-xl shadow-sm p-4 md:p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-muted h-16 w-16 animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="hidden md:flex gap-2">
          <div className="h-9 w-20 bg-muted rounded animate-pulse" />
          <div className="h-9 w-20 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-card rounded-xl shadow-sm p-4 h-24 animate-pulse">
          <div className="h-4 w-20 bg-muted rounded mb-2" />
          <div className="h-6 w-16 bg-muted rounded" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-card rounded-xl shadow-sm h-[500px] animate-pulse" />
      </div>
      <div className="space-y-6">
        <div className="bg-white dark:bg-card rounded-xl shadow-sm h-64 animate-pulse" />
        <div className="bg-white dark:bg-card rounded-xl shadow-sm h-64 animate-pulse" />
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
    transactions: Transaction[];
    upcomingTasks: any[];
  }

  interface LoadingStates {
    main: boolean;
    productions: boolean;
    suppliers: boolean;
    transactions: boolean;
    tasks: boolean;
  }

  const [data, setData] = useState<DataState>({
    animal: null,
    suppliers: [],
    productions: [],
    transactions: [],
    upcomingTasks: [],
  });
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    main: true,
    productions: false,
    suppliers: false,
    transactions: false,
    tasks: false,
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
        const [animalData, suppliersData, productionsData, transactionsData] = await Promise.all([
          fetchAnimal(id),
          fetchSuppliers(id),
          fetchProductions(id),
          fetchTransactions(id),
        ]);

        console.log('Fetched productions for AnimalDetails:', productionsData);
        console.log('Fetched transactions for AnimalDetails:', transactionsData);

        setData(prev => ({
          ...prev,
          animal: animalData,
          suppliers: suppliersData,
          productions: productionsData.sort((a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime()),
          transactions: transactionsData.sort((a, b) => parseISO(b.transaction_date).getTime() - parseISO(a.transaction_date).getTime()),
        }));
        setError(null);
        if (!productionsData.length) toast.info('No production records found for this animal.');
        if (!transactionsData.length) toast.info('No transaction records found for this animal.');
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
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const taskData = await response.json();
        setData(prev => ({
          ...prev,
          upcomingTasks: taskData.data || [],
        }));
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        toast.info('No upcoming tasks found');
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

  const formatCurrency = useCallback((amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }, []);

  const getStatusColor = useCallback((status?: string): string => ({
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    sold: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    deceased: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  }[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'), []);

  const getTaskPriorityColor = useCallback((priority?: string): string => ({
    high: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  }[priority?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'), []);

  const getSupplierImportanceColor = useCallback((importance?: string): string => ({
    high: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
  }[importance?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'), []);

  const getQualityStatusColor = useCallback((status?: string): string => ({
    passed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  }[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'), []);

  const getTransactionStatusColor = useCallback((status?: string): string => ({
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  }[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'), []);

  const handleDelete = async () => {
    try {
      await fetch(`/api/animals/${id}`, { method: 'DELETE' });
      toast.success('Animal deleted successfully');
      navigate('/animals');
    } catch (err) {
      console.error('Failed to delete animal:', err);
      toast.error('Failed to delete animal');
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, transactions: true }));
      await deleteTransaction(id!, transactionId);
      setData(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== transactionId),
      }));
      toast.success('Transaction deleted successfully');
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      toast.error('Failed to delete transaction');
    } finally {
      setLoadingStates(prev => ({ ...prev, transactions: false }));
    }
  };

  const quickActions: QuickAction[] = [
    { label: 'Activities', href: `/animals/${id}/activities`, icon: Activity, description: 'View activity history', color: 'bg-blue-500' },
    { label: 'Health', href: `/animals/${id}/health`, icon: Heart, description: 'Health records & checkups', color: 'bg-red-500' },
    { label: 'Notes', href: `/animals/${id}/notes`, icon: FileText, description: 'Notes & observations', color: 'bg-amber-500' },
    { label: 'Production', href: `/animals/${id}/production`, icon: PiggyBank, description: 'Production metrics', color: 'bg-emerald-500' },
    { label: 'Tasks', href: `/animals/${id}/tasks`, icon: CheckSquare, description: 'Scheduled tasks', color: 'bg-purple-500' },
    { label: 'Suppliers', href: `/animals/${id}/suppliers`, icon: Tag, description: 'Supplier management', color: 'bg-indigo-500' },
    { label: 'Transactions', href: `/animals/${id}/transactions`, icon: DollarSign, description: 'Financial transactions', color: 'bg-green-600' },
  ];

  const getAnimalTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'cow': case 'cattle': case 'bull': return '🐄';
      case 'sheep': return '🐑';
      case 'goat': return '🐐';
      case 'pig': return '🐖';
      case 'chicken': return '🐓';
      case 'horse': return '🐎';
      default: Grok: return '🦮';
    }
  };

  const getAnimalAvatar = (animal: Animal) => {
    const initials = animal.name.substring(0, 2).toUpperCase();
    const animalIcon = getAnimalTypeIcon(animal.type);
    
    const animalType = animal.type?.toLowerCase() || '';
    const bgColorClass = `bg-animal-${animalType}`;

    return (
      <div className={`relative h-20 w-20 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${bgColorClass} text-white overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20" />
        <span className="relative z-10">{animalIcon || initials}</span>
      </div>
    );
  };

  if (loadingStates.main) {
    return <AnimalsDetailsSkeleton />;
  }

  if (error || !data.animal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/30 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Error Loading Animal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error || 'Animal not found'}</p>
            <Button onClick={() => navigate('/animals')} className="mt-6 w-full">
              Return to Animals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-full px-4 py-6 md:px-6 lg:px-8 space-y-6">
      <Card className="overflow-hidden border-none地上瘾: border-none shadow-md bg-gradient-to-br from-white to-secondary/30 dark:from-card dark:to-secondary/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              {getAnimalAvatar(data.animal)}
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{data.animal.name}</h1>
                  <Badge className={cn("font-medium", getStatusColor(data.animal.status))}>
                    {data.animal.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-muted-foreground">
                  <span>{data.animal.type}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{data.animal.breed}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">ID: {data.animal.tag_number}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" onClick={() => navigate('/animals')} className="sm:text-sm flex-1 md:flex-none">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button variant="default" size="sm" onClick={() => navigate(`/animals/${id}/edit`)} className="sm:text-sm flex-1 md:flex-none">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="sm:text-sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-50 bg-white dark:bg-card">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {quickActions.map((action) => (
                    <DropdownMenuItem
                      key={action.label}
                      onClick={() => navigate(action.href)}
                      className="cursor-pointer"
                    >
                      <div className={`${action.color} p-1 rounded-full mr-2`}>
                        <action.icon className="h-3 w-3 text-white" />
                      </div>
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="animal-stat-card group before:bg-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">ID</p>
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl font-bold">{data.animal.internal_id}</p>
            <p className="text-xs text-muted-foreground mt-1">Born: {format(parseISO(data.animal.birth_date), 'MMM d, yyyy')}</p>
          </CardContent>
        </Card>

        <Card className="animal-stat-card group before:bg-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Gender</p>
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                <Info className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl font-bold">{data.animal.gender}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.animal.is_breeding_stock ? 'Breeding Stock' : 'Not Breeding'}
            </p>
          </CardContent>
        </Card>

        <Card className="animal-stat-card group before:bg-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Production</p>
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 transition-colors">
                <PiggyBank className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl font-bold">{data.productions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Production Records</p>
          </CardContent>
        </Card>

        <Card className="animal-stat-card group before:bg-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Tasks</p>
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                <CheckSquare className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl font-bold">{data.upcomingTasks.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Pending Tasks</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-md overflow-hidden border-none">
            <CardHeader className="bg-gradient-to-r from-white to-secondary/30 dark:from-card dark:to-secondary/10 border-b pb-4">
              <CardTitle className="flex items-center text-xl">
                <Info className="h-5 w-5 mr-2 text-primary" />
                Animal Information
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex w-full h-14 rounded-none border-b bg-transparent p-0 overflow-x-auto">
                  {['overview', 'details', 'birth', 'production', 'suppliers', 'transactions'].map(tab => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="animal-tab"
                    >
                      {({
                        overview: <Layers className="h-4 w-4" />,
                        details: <Info className="h-4 w-4" />,
                        birth: <Calendar className="h-4 w-4" />,
                        production: <PiggyBank className="h-4 w-4" />,
                        suppliers: <Tag className="h-4 w-4" />,
                        transactions: <DollarSign className="h-4 w-4" />,
                      })[tab]}
                      <span className="capitalize">{tab}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="p-5">
                  <TabsContent value="overview" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { label: 'Animal Type', value: data.animal.type, icon: Layers, color: 'bg-blue-500' },
                        { label: 'Breed', value: data.animal.breed, icon: Tag, color: 'bg-amber-500' },
                        { label: 'Gender', value: data.animal.gender, icon: Info, color: 'bg-purple-500' },
                        { label: 'Tag Number', value: data.animal.tag_number || 'None', icon: Tag, color: 'bg-emerald-500' },
                        { label: 'Birth Date', value: formatDate(data.animal.birth_date), icon: Calendar, color: 'bg-indigo-500' },
                        { label: 'Status', value: (
                          <Badge className={getStatusColor(data.animal.status)}>
                            {data.animal.status}
                          </Badge>
                        ), icon: Activity, color: 'bg-rose-500' },
                        { label: 'Age', value: `${data.animal.age} years`, icon: Calendar, color: 'bg-red-500' },
                        { label: 'Internal ID', value: data.animal.internal_id, icon: Tag, color: 'bg-green-500' },
                        { label: 'Animal ID', value: data.animal.animal_id, icon: Tag, color: 'bg-sky-500' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className={`${item.color} p-2 rounded-full flex items-center justify-center`}>
                            <item.icon className="h-4 w-4 text-white" />
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

                  <TabsContent value="details" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { label: 'Breeding Stock', value: data.animal.is_breeding_stock ? 'Yes' : 'No', icon: Heart, color: 'bg-red-500' },
                        { label: 'Deceased', value: data.animal.is_deceased ? 'Yes' : 'No', icon: AlertTriangle, color: 'bg-amber-500' },
                        { label: 'Origin', value: data.animal.raised_purchased || 'Not specified', icon: ExternalLink, color: 'bg-blue-500' },
                        { label: 'Next Checkup', value: formatDate(data.animal.next_checkup_date), icon: Calendar, color: 'bg-purple-500' },
                        { label: 'Breeder Info', value: data.animal.breeder_info || 'Not specified', icon: Info, color: 'bg-indigo-500' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className={`${item.color} p-2 rounded-full flex items-center justify-center`}>
                            <item.icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm text-muted-foreground font-medium truncate">{item.label}</h3>
                            <div className="mt-1 text-base font-medium truncate">{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="birth" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { label: 'Birth Date', value: formatDate(data.animal.birth_date), icon: Calendar, color: 'bg-blue-500' },
                        { label: 'Birth Time', value: data.animal.birth_time || 'Not recorded', icon: Calendar, color: 'bg-purple-500' },
                        { label: 'Birth Weight', value: data.animal.birth_weight ? `${data.animal.birth_weight} ${data.animal.weight_unit}` : 'Not recorded', icon: Activity, color: 'bg-amber-500' },
                        { label: 'Birth Status', value: data.animal.birth_status || 'Not specified', icon: Info, color: 'bg-emerald-500' },
                        { label: 'Health at Birth', value: data.animal.health_at_birth || 'Not specified', icon: Heart, color: 'bg-red-500' },
                        { label: 'Multiple Birth', value: data.animal.multiple_birth ? 'Yes' : 'No', icon: Layers, color: 'bg-indigo-500' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className={`${item.color} p-2 rounded-full flex items-center justify-center`}>
                            <item.icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm text-muted-foreground font-medium truncate">{item.label}</h3>
                            <div className="mt-1 text-base font-medium truncate">{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="production" className="mt-0 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h3 className="flex items-center text-base font-medium">
                        <PiggyBank className="h-4 w-4 mr-2 text-amber-500" />
                        Production Records
                      </h3>
                      <Button size="sm" onClick={() => navigate(`/animals/${id}/production`)} className="rounded-full px-4">
                        Manage Production
                      </Button>
                    </div>
                    {data.productions.length > 0 ? (
                      <div className="space-y-3">
                        {data.productions.slice(0, 3).map((production) => (
                          <Card
                            key={production.id}
                            className="overflow-hidden transition-all hover:shadow-md group border border-border/50"
                          >
                            <CardContent className="p-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 p-2 rounded-full flex-shrink-0 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                                    <PiggyBank className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate">
                                      {production.product_category.name} - {production.trace_number}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {format(parseISO(production.production_date), 'MMM d, yyyy')}
                                    </p>
                                  </div>
                                </div>
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
                          variant="outline"
                          size="sm"
                          className="w-full text-primary hover:text-primary hover:bg-primary/5"
                          onClick={() => navigate(`/animals/${id}/production`)}
                        >
                          View All Records
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 bg-muted/30 rounded-lg border border-dashed">
                        <PiggyBank className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground mb-3">No production records available</p>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/animals/${id}/production/new`)} className="rounded-full px-4">
                          Add Production Record
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="suppliers" className="mt-0 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h3 className="flex items-center text-base font-medium">
                        <Tag className="h-4 w-4 mr-2 text-indigo-500" />
                        Suppliers
                      </h3>
                      <Button size="sm" onClick={() => navigate(`/animals/${id}/suppliers`)} className="rounded-full px-4">
                        Manage Suppliers
                      </Button>
                    </div>
                    {data.suppliers.length > 0 ? (
                      <div className="space-y-3">
                        {data.suppliers.slice(0, 3).map((supplier) => (
                          <Card key={supplier.id} className="overflow-hidden border border-border/50 hover:shadow-md transition-all group">
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 p-2 rounded-full group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
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
                          variant="outline"
                          size="sm"
                          className="w-full text-primary hover:text-primary hover:bg-primary/5"
                          onClick={() => navigate(`/animals/${id}/suppliers`)}
                        >
                          View All Suppliers
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 bg-muted/30 rounded-lg border border-dashed">
                        <Tag className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground mb-3">No suppliers available</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/animals/${id}/suppliers/new`)}
                          className="rounded-full px-4"
                        >
                          Add Supplier
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="transactions" className="mt-0 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h3 className="flex items-center text-base font-medium">
                        <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                        Transactions
                      </h3>
                      <Button size="sm" onClick={() => navigate(`/animals/${id}/transactions`)} className="rounded-full px-4">
                        Manage Transactions
                      </Button>
                    </div>
                    {data.transactions.length > 0 ? (
                      <div className="space-y-3">
                        {data.transactions.slice(0, 3).map((transaction) => (
                          <Card
                            key={transaction.id}
                            className="overflow-hidden transition-all hover:shadow-md group border border-border/50"
                          >
                            <CardContent className="p-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 p-2 rounded-full flex-shrink-0 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                                    <DollarSign className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate capitalize">
                                      {transaction.transaction_type} - {transaction.payment_reference || transaction.id}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {format(parseISO(transaction.transaction_date), 'MMM d, yyyy')}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-3 sm:justify-end">
                                  <div className="text-right">
                                    <p className="text-sm font-bold">
                                      {formatCurrency(transaction.total_amount, transaction.currency)}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                      {transaction.seller_name} → {transaction.buyer_name}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className={getTransactionStatusColor(transaction.transaction_status)}>
                                      {transaction.transaction_status || 'N/A'}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteTransaction(transaction.id)}
                                      disabled={loadingStates.transactions}
                                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-primary hover:text-primary hover:bg-primary/5"
                          onClick={() => navigate(`/animals/${id}/transactions`)}
                        >
                          View All Transactions
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 bg-muted/30 rounded-lg border border-dashed">
                        <DollarSign className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground mb-3">No transactions available</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/animals/${id}/transactions/new`)}
                          className="rounded-full px-4"
                        >
                          Add Transaction
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
          <Card className="shadow-md overflow-hidden border-none">
            <CardHeader className="bg-gradient-to-r from-white to-secondary/30 dark:from-card dark:to-secondary/10 border-b pb-3">
              <CardTitle className="flex items-center text-lg">
                <CheckSquare className="h-5 w-5 mr-2 text-primary" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {loadingStates.tasks ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="h-16 bg-muted/50 rounded animate-pulse" />
                  ))}
                </div>
              ) : data.upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {data.upcomingTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 p-2 rounded-full">
                        <CheckSquare className="h-4 w-4" />
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
                    variant="outline"
                    size="sm"
                    className="w-full text-primary hover:text-primary hover:bg-primary/5"
                    onClick={() => navigate(`/animals/${id}/tasks`)}
                  >
                    View All Tasks
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 bg-muted/30 rounded-lg border border-dashed">
                  <CheckSquare className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">No upcoming tasks</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/animals/${id}/tasks/new`)}
                    className="rounded-full px-4"
                  >
                    Add Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden border-none">
            <CardHeader className="bg-gradient-to-r from-white to-secondary/30 dark:from-card dark:to-secondary/10 border-b pb-3">
              <CardTitle className="flex items-center text-lg">
                <Layers className="h-5 w-5 mr-2 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <QuickActionCard
                    key={action.label}
                    action={action}
                    onClick={() => navigate(action.href)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default AnimalDetails;