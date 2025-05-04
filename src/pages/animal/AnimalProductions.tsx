import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  BarChart,
  Calendar,
  ChevronDown,
  Clock,
  Edit,
  Egg,
  LineChart,
  Loader2,
  MoreHorizontal,
  Package,
  Plus,
  Trash2,
  Truck,
  Weight,
} from 'lucide-react';
import { fetchAnimal } from '@/services/animalService';
import {
  fetchProductions,
  deleteProduction,
  Production,
  ProductionStats,
  fetchProductionStats,
} from '@/services/productionService';
import { Animal } from '@/types/AnimalTypes';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function AnimalProductions() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [productions, setProductions] = useState<Production[]>([]);
  const [stats, setStats] = useState<ProductionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productionToDelete, setProductionToDelete] = useState<Production | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const [animalData, productionsData, statsData] = await Promise.all([
          fetchAnimal(id),
          fetchProductions(id),
          fetchProductionStats(id),
        ]);
        
        setAnimal(animalData);
        setProductions(productionsData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load animal production data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  const handleDeleteClick = (production: Production) => {
    setProductionToDelete(production);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!id || !productionToDelete) return;
    
    try {
      await deleteProduction(id, productionToDelete.id);
      setProductions((prev) => prev.filter((p) => p.id !== productionToDelete.id));
      toast.success('Production record deleted successfully');
      
      // Refresh stats after deletion
      const statsData = await fetchProductionStats(id);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to delete production:', error);
      toast.error('Failed to delete production record');
    } finally {
      setDeleteDialogOpen(false);
      setProductionToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PP');
    } catch (error) {
      return dateString;
    }
  };

  const formatWeight = (weight: number, unit: string = 'kg') => {
    return `${weight} ${unit}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="mr-4" onClick={() => navigate(`/animals/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        
        <Skeleton className="h-32 w-full mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
        
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Animal Not Found</h2>
        <p className="mb-6">The animal you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate('/animals')}>
          Back to Animals
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-4" onClick={() => navigate(`/animals/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Animal
        </Button>
        <h1 className="text-3xl font-bold">Production Records</h1>
      </div>
      
      <AnimalProductionInfo animal={animal} productions={productions} />
      
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="list" className="flex items-center">
                <Package className="mr-2 h-4 w-4" />
                Production List
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center">
                <BarChart className="mr-2 h-4 w-4" />
                Statistics
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center">
                <LineChart className="mr-2 h-4 w-4" />
                Trends
              </TabsTrigger>
            </TabsList>
            
            <Button onClick={() => navigate(`/animals/${id}/productions/new`)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Production
            </Button>
          </div>
          
          <TabsContent value="list" className="mt-0">
            <ProductionList 
              productions={productions} 
              formatDate={formatDate} 
              formatWeight={formatWeight}
              onEdit={(production) => navigate(`/animals/${id}/productions/${production.id}/edit`)}
              onDelete={handleDeleteClick}
            />
          </TabsContent>
          
          <TabsContent value="stats" className="mt-0">
            <ProductionStats stats={stats} />
          </TabsContent>
          
          <TabsContent value="trends" className="mt-0">
            <ProductionTrends productions={productions} />
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this production record from {formatDate(productionToDelete?.production_date || '')}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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
}

export function AnimalProductionInfo({ animal, productions }: { animal: Animal; productions: Production[] }) {
    return (
        <div className="mb-6 py-4 px-5 bg-muted/20 rounded-lg border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <BarChart className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-foreground">
                            {animal?.name}'s Production
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Type: {animal?.type || 'N/A'} | Breed: {animal?.breed || 'N/A'} | Location: {productions[0]?.storage_location?.location_code || 'N/A'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 text-sm">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>First Record: {productions.length > 0 ? format(new Date(productions[productions.length - 1].production_date), 'PP') : 'N/A'}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 text-sm">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Latest: {productions.length > 0 ? format(new Date(productions[0].production_date), 'PP') : 'N/A'}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 text-sm">
                        <Package className="h-3.5 w-3.5" />
                        <span>Total Records: {productions.length}</span>
                    </Badge>
                </div>
            </div>
        </div>
    );
}

function ProductionList({ 
  productions, 
  formatDate, 
  formatWeight,
  onEdit,
  onDelete
}: { 
  productions: Production[]; 
  formatDate: (date: string) => string;
  formatWeight: (weight: number, unit?: string) => string;
  onEdit: (production: Production) => void;
  onDelete: (production: Production) => void;
}) {
  if (productions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 pb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Egg className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Production Records</h3>
          <p className="text-muted-foreground mb-4">
            Start tracking your animal's production by adding your first record.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Production History</CardTitle>
        <CardDescription>
          A complete list of all recorded production for this animal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Storage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productions.map((production) => (
                <TableRow key={production.id}>
                  <TableCell className="font-medium">
                    {formatDate(production.production_date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {production.production_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{production.quantity} {production.unit}</TableCell>
                  <TableCell>
                    {production.weight ? formatWeight(production.weight, production.weight_unit) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getQualityVariant(production.quality)}>
                      {production.quality || 'Standard'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {production.storage_location?.name || 'Not specified'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(production)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(production)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
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
      </CardContent>
    </Card>
  );
}

function getQualityVariant(quality: string | null | undefined): "default" | "outline" | "secondary" | "destructive" {
  if (!quality) return "outline";
  
  switch (quality.toLowerCase()) {
    case 'premium':
    case 'excellent':
      return "default";
    case 'good':
      return "secondary";
    case 'poor':
    case 'bad':
      return "destructive";
    default:
      return "outline";
  }
}

function ProductionStats({ stats }: { stats: ProductionStats | null }) {
  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading statistics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Package className="mr-2 h-5 w-5 text-primary" />
            Total Production
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">{stats.total_quantity}</div>
          <p className="text-muted-foreground text-sm">
            Across {stats.total_records} records
          </p>
          <div className="mt-4 space-y-2">
            {stats.by_type.map((type) => (
              <div key={type.type} className="flex justify-between items-center">
                <span className="text-sm">{type.type}</span>
                <span className="text-sm font-medium">{type.quantity} {type.unit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Weight className="mr-2 h-5 w-5 text-primary" />
            Weight Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">
            {stats.total_weight} {stats.weight_unit}
          </div>
          <p className="text-muted-foreground text-sm">
            Average: {stats.average_weight} {stats.weight_unit} per record
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Heaviest</span>
              <span className="text-sm font-medium">
                {stats.max_weight} {stats.weight_unit}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Lightest</span>
              <span className="text-sm font-medium">
                {stats.min_weight} {stats.weight_unit}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Truck className="mr-2 h-5 w-5 text-primary" />
            Storage Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">
            {stats.storage_locations.length}
          </div>
          <p className="text-muted-foreground text-sm">
            Different storage locations used
          </p>
          <div className="mt-4 space-y-2">
            {stats.storage_locations.map((location) => (
              <div key={location.id} className="flex justify-between items-center">
                <span className="text-sm">{location.name}</span>
                <span className="text-sm font-medium">{location.count} records</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductionTrends({ productions }: { productions: Production[] }) {
  const chartData = useMemo(() => {
    if (productions.length === 0) return [];
    
    // Group by month and sum quantities
    const groupedByMonth: Record<string, { date: string; quantity: number; weight: number }> = {};
    
    productions.forEach(prod => {
      const date = new Date(prod.production_date);
      const monthYear = format(date, 'MMM yyyy');
      
      if (!groupedByMonth[monthYear]) {
        groupedByMonth[monthYear] = {
          date: monthYear,
          quantity: 0,
          weight: 0
        };
      }
      
      groupedByMonth[monthYear].quantity += prod.quantity;
      groupedByMonth[monthYear].weight += prod.weight || 0;
    });
    
    // Convert to array and sort by date
    return Object.values(groupedByMonth).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [productions]);
  
  if (productions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <LineChart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Data for Trends</h3>
          <p className="text-muted-foreground mb-4">
            Add more production records to see trends over time.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (chartData.length < 2) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Insufficient Data</h3>
          <p className="text-muted-foreground mb-4">
            Need at least two months of data to display meaningful trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Production Trends</CardTitle>
            <CardDescription>Monthly production quantity and weight</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <span>Monthly</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Monthly</DropdownMenuItem>
              <DropdownMenuItem>Quarterly</DropdownMenuItem>
              <DropdownMenuItem>Yearly</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="quantity"
                stroke="#8884d8"
                name="Quantity"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="weight"
                stroke="#82ca9d"
                name="Weight"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
          <div>
            First record: {productions.length > 0 ? format(new Date(productions[productions.length - 1].production_date), 'PP') : 'N/A'}
          </div>
          <div>
            Latest record: {productions.length > 0 ? format(new Date(productions[0].production_date), 'PP') : 'N/A'}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default AnimalProductions;
