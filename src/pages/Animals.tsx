import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, Plus, Download, Edit, Trash2, Eye, AlertCircle, Loader2,
  ChevronRight, Home, LayoutDashboard, Filter, ArrowUpDown,
  ChevronsLeft, ChevronsRight, Activity, Heart, FileText, PiggyBank, CheckSquare, Tag, PlusCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { 
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious
} from "@/components/ui/pagination";
import { fetchAnimals, deleteAnimal, exportAnimalsToCSV } from '@/services/animalService';
import { fetchTasks, Task } from '@/services/taskApi';
import { fetchNotes, Note } from '@/services/noteApi'; // Import Notes service
import { fetchSuppliers, Supplier } from '@/services/supplierApi'; // Import Suppliers service
import { Animal } from '../types/AnimalTypes';
import { useTheme } from '@/contexts/ThemeContext';

const Animals: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);
  const [animalTypeFilter, setAnimalTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksModalOpen, setTasksModalOpen] = useState<boolean>(false);
  const [tasksLoading, setTasksLoading] = useState<boolean>(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesModalOpen, setNotesModalOpen] = useState<boolean>(false);
  const [notesLoading, setNotesLoading] = useState<boolean>(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersModalOpen, setSuppliersModalOpen] = useState<boolean>(false);
  const [suppliersLoading, setSuppliersLoading] = useState<boolean>(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);

  const loadAnimals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAnimals({ cache: 'no-store' });
      setAnimals(data);
      setTotalItems(data.length);
    } catch (error) {
      console.error('Error loading animals:', error);
      setError('Failed to load animals. Retrying...');
      if (retryCount < 3) {
        setTimeout(() => setRetryCount(prev => prev + 1), 1000);
      } else {
        setError('Failed to load animals after retries. Please try again later.');
        toast.error('Failed to load animals');
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  const loadTasks = useCallback(async () => {
    setTasksLoading(true);
    setTasksModalOpen(true);
    try {
      if (selectedAnimalId) {
        const animalTasks = await fetchTasks(selectedAnimalId);
        setTasks(animalTasks);
      } else {
        const taskPromises = animals.map(animal => fetchTasks(animal.id));
        const tasksArrays = await Promise.all(taskPromises);
        const allTasks = tasksArrays.flat();
        setTasks(allTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, [animals, selectedAnimalId]);

  const loadNotes = useCallback(async () => {
    setNotesLoading(true);
    setNotesModalOpen(true);
    try {
      if (selectedAnimalId) {
        const animalNotes = await fetchNotes(selectedAnimalId);
        setNotes(animalNotes);
      } else {
        const notePromises = animals.map(animal => fetchNotes(animal.id));
        const notesArrays = await Promise.all(notePromises);
        const allNotes = notesArrays.flat();
        setNotes(allNotes);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Failed to load notes');
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  }, [animals, selectedAnimalId]);

  const loadSuppliers = useCallback(async () => {
    setSuppliersLoading(true);
    setSuppliersModalOpen(true);
    try {
      if (selectedAnimalId) {
        const animalSuppliers = await fetchSuppliers(selectedAnimalId);
        setSuppliers(animalSuppliers);
      } else {
        const supplierPromises = animals.map(animal => fetchSuppliers(animal.id));
        const supplierArrays = await Promise.all(supplierPromises);
        const allSuppliers = supplierArrays.flat();
        setSuppliers(allSuppliers);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      toast.error('Failed to load suppliers');
      setSuppliers([]);
    } finally {
      setSuppliersLoading(false);
    }
  }, [animals, selectedAnimalId]);

  useEffect(() => {
    loadAnimals();
  }, [loadAnimals, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, animalTypeFilter, statusFilter]);

  const handleDeleteClick = (animal: Animal) => {
    setAnimalToDelete(animal);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!animalToDelete) return;
    
    try {
      await deleteAnimal(animalToDelete.id);
      setAnimals(prev => prev.filter(a => a.id !== animalToDelete.id));
      setTotalItems(prev => prev - 1);
      toast.success(`${animalToDelete.name} has been deleted`);
    } catch (error) {
      console.error('Error deleting animal:', error);
      toast.error('Failed to delete animal');
    } finally {
      setDeleteConfirmOpen(false);
      setAnimalToDelete(null);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const sortedAnimals = [...animals].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name': comparison = a.name.localeCompare(b.name); break;
      case 'type': comparison = a.type.localeCompare(b.type); break;
      case 'tag': comparison = (a.tag_number || '').localeCompare(b.tag_number || ''); break;
      case 'status': comparison = a.status.localeCompare(b.status); break;
      case 'gender': comparison = (a.gender || '').localeCompare(b.gender || ''); break;
      case 'raised_purchased': comparison = a.raised_purchased.localeCompare(b.raised_purchased); break;
      case 'is_breeding_stock': comparison = Number(a.is_breeding_stock) - Number(b.is_breeding_stock); break;
      case 'internal_id': comparison = a.internal_id.localeCompare(b.internal_id); break;
      default: comparison = a.name.localeCompare(b.name);
    }
    return sortDir === 'asc' ? comparison : -comparison;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'sold': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'deceased': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'transferred': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getTaskPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const filteredAnimals = sortedAnimals.filter(animal => {
    const matchesSearch = 
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animal.tag_number?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      animal.internal_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animal.gender?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      animal.raised_purchased.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = animalTypeFilter === 'all' || animal.type === animalTypeFilter;
    const matchesStatus = statusFilter === 'all' || animal.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const animalTypes = ['all', ...new Set(animals.map(animal => animal.type))];
  const statuses = ['all', ...new Set(animals.map(animal => animal.status))];

  const totalPages = Math.ceil(filteredAnimals.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAnimals = filteredAnimals.slice(indexOfFirstItem, indexOfLastItem);

  const pageNumbers = [];
  const maxPageButtons = 5;
  
  if (totalPages <= maxPageButtons) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pageNumbers.push(i);
      pageNumbers.push('ellipsis');
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1);
      pageNumbers.push('ellipsis');
      for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      pageNumbers.push('ellipsis');
      pageNumbers.push(currentPage - 1);
      pageNumbers.push(currentPage);
      pageNumbers.push(currentPage + 1);
      pageNumbers.push('ellipsis');
      pageNumbers.push(totalPages);
    }
  }

  const handleRefresh = () => {
    setRetryCount(0);
    loadAnimals();
  };

  return (
    <div className={`container mx-auto py-4 px-2 sm:px-4 font-serif ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-4 flex-wrap">
        <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center">
          <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          Home
        </Link>
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center">
          <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="font-medium text-foreground">Animals</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Animals</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your animals and livestock</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={exportAnimalsToCSV} className="font-serif text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-4">
            <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Export
          </Button>
          <Button onClick={() => navigate('/animals/new')} className="font-serif text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-4">
            <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Add Animal
          </Button>
          <Button variant="ghost" onClick={handleRefresh} className="font-serif text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-4">
            Refresh
          </Button>
        </div>
      </div>

      <Card className={`mb-4 sm:mb-6 border-border shadow-md ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="font-serif text-lg sm:text-xl">Animal Inventory</CardTitle>
          <CardDescription className="font-serif text-xs sm:text-sm">View and manage all your animals</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative w-full max-w-full sm:max-w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search animals..."
                className="pl-8 font-serif text-sm sm:text-base py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <select 
                  className={`w-full sm:w-auto rounded-md border border-input px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-serif ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                  value={animalTypeFilter}
                  onChange={(e) => setAnimalTypeFilter(e.target.value)}
                >
                  {animalTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
                <select 
                  className={`w-full sm:w-auto rounded-md border border-input px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-serif ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
                <select 
                  className={`w-full sm:w-auto rounded-md border border-input px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-serif ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>

          {!loading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
              {[
                { label: 'Total Animals', value: totalItems, bg: 'bg-primary/10' },
                { label: 'Active', value: animals.filter(a => a.status === 'Active').length, bg: 'bg-green-500/10' },
                { label: 'Breeding Stock', value: animals.filter(a => a.is_breeding_stock).length, bg: 'bg-blue-500/10' },
                { label: 'Raised', value: animals.filter(a => a.raised_purchased === 'raised').length, bg: 'bg-purple-500/10' },
              ].map((stat, idx) => (
                <Card key={idx} className={`${stat.bg} p-2 sm:p-4`}>
                  <CardContent className="p-0">
                    <h3 className="text-sm sm:text-lg font-medium truncate">{stat.label}</h3>
                    <p className="text-lg sm:text-2xl md:text-3xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-32 sm:h-64">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
              <span className="ml-2 text-base sm:text-lg font-serif">Loading animals...</span>
            </div>
          ) : error ? (
            <div className="bg-destructive/15 text-destructive p-3 sm:p-4 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="font-serif text-sm sm:text-base">{error}</span>
              </div>
              <Button variant="outline" className="mt-3 sm:mt-4 font-serif text-xs sm:text-sm" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          ) : filteredAnimals.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              {searchTerm || animalTypeFilter !== 'all' || statusFilter !== 'all' ? (
                <>
                  <h3 className="text-base sm:text-lg font-medium mb-2 font-serif">No animals found</h3>
                  <p className="text-muted-foreground mb-3 sm:mb-4 font-serif text-sm sm:text-base">No animals match your search criteria</p>
                  <Button 
                    variant="outline" 
                    className="font-serif text-xs sm:text-sm"
                    onClick={() => {
                      setSearchTerm('');
                      setAnimalTypeFilter('all');
                      setStatusFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-base sm:text-lg font-medium mb-2 font-serif">No animals yet</h3>
                  <p className="text-muted-foreground mb-3 sm:mb-4 font-serif text-sm sm:text-base">Add your first animal to get started</p>
                  <Button onClick={() => navigate('/animals/new')} className="font-serif text-xs sm:text-sm">
                    <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Add Animal
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className={`rounded-md border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} overflow-x-auto`}>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {[
                          { key: 'name', label: 'Name' },
                          { key: 'type', label: 'Type' },
                          { key: 'tag', label: 'Tag' },
                          { key: 'gender', label: 'Gender' },
                          { key: 'internal_id', label: 'Animal ID' },
                          { key: 'is_breeding_stock', label: 'Breeding' },
                          { key: 'status', label: 'Status' },
                        ].map(col => (
                          <TableHead key={col.key} onClick={() => handleSort(col.key)}>
                            <div className="flex items-center cursor-pointer font-serif text-sm">
                              {col.label}
                              {sortBy === col.key && <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDir === 'asc' ? 'transform rotate-180' : ''}`} />}
                            </div>
                          </TableHead>
                        ))}
                        <TableHead className="text-right font-serif text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentAnimals.map((animal) => (
                        <TableRow 
                          key={animal.id}
                          className={`cursor-pointer hover:bg-accent/20 transition-colors ${selectedAnimalId === animal.id ? 'bg-accent/40' : ''}`}
                          onClick={() => setSelectedAnimalId(animal.id)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div 
                              className="font-medium font-serif hover:text-primary cursor-pointer text-sm"
                              onClick={() => navigate(`/animals/${animal.id}`)}
                            >
                              {animal.name}
                            </div>
                          </TableCell>
                          <TableCell className="font-serif text-sm">
                            {animal.type}
                            <div className="text-xs text-muted-foreground font-serif">{animal.breed}</div>
                          </TableCell>
                          <TableCell className="font-serif text-sm">{animal.tag_number || '-'}</TableCell>
                          <TableCell className="font-serif text-sm capitalize">{animal.gender || '-'}</TableCell>
                          <TableCell className="font-serif text-sm capitalize">{animal.internal_id || '-'}</TableCell>
                          <TableCell className="font-serif text-sm">
                            <Badge className={animal.is_breeding_stock ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'}>
                              {animal.is_breeding_stock ? 'Yes' : 'No'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(animal.status)} font-serif text-xs sm:text-sm`}>
                              {animal.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-1 sm:gap-2">
                              <Button variant="ghost" size="icon" onClick={() => navigate(`/animals/${animal.id}`)} title="View details">
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => navigate(`/animals/${animal.id}/edit`)} title="Edit animal">
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(animal);
                                }}
                                title="Delete animal"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden space-y-4 p-2">
                  {currentAnimals.map((animal) => (
                    <Card 
                      key={animal.id}
                      className={`cursor-pointer hover:bg-accent/20 transition-colors ${selectedAnimalId === animal.id ? 'bg-accent/40' : ''}`}
                      onClick={() => setSelectedAnimalId(animal.id)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex justify-between items-start">
                          <div 
                            className="font-medium font-serif hover:text-primary cursor-pointer text-sm sm:text-base"
                            onClick={(e) => { e.stopPropagation(); navigate(`/animals/${animal.id}`); }}
                          >
                            {animal.name}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/animals/${animal.id}`); }} title="View">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/animals/${animal.id}/edit`); }} title="Edit">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteClick(animal); }} title="Delete">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs sm:text-sm">
                          <div><span className="font-semibold">Type:</span> {animal.type} ({animal.breed})</div>
                          <div><span className="font-semibold">Tag:</span> {animal.tag_number || '-'}</div>
                          <div><span className="font-semibold">Gender:</span> {animal.gender || '-'}</div>
                          <div><span className="font-semibold">ID:</span> {animal.internal_id || '-'}</div>
                          <div><span className="font-semibold">Breeding:</span> {animal.is_breeding_stock ? 'Yes' : 'No'}</div>
                          <div>
                            <Badge className={`${getStatusColor(animal.status)} font-serif`}>{animal.status}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 sm:mt-6">
                  <Pagination>
                    <PaginationContent className="flex-wrap justify-center gap-1 sm:gap-2">
                      <PaginationItem>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="sr-only">First page</span>
                        </Button>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer text-xs sm:text-sm"}
                        />
                      </PaginationItem>
                      
                      {pageNumbers.map((page, index) => (
                        page === 'ellipsis' ? (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis className="text-xs sm:text-sm" />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={page}>
                            <PaginationLink 
                              isActive={currentPage === page}
                              onClick={() => setCurrentPage(Number(page))}
                              className={`text-xs sm:text-sm h-8 w-8 sm:h-10 sm:w-10 ${currentPage === page ? '' : 'cursor-pointer'}`}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer text-xs sm:text-sm"}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="sr-only">Last page</span>
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  <div className="text-center mt-2 text-xs sm:text-sm text-muted-foreground font-serif">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAnimals.length)} of {filteredAnimals.length} animals
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && !error && filteredAnimals.length > 0 && (
            <div className="mt-6 sm:mt-8">
              <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 font-serif">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
                {[
                  { label: 'Activities', href: '/activities', icon: Activity, color: 'text-indigo-500', action: () => navigate('/activities') },
                  { label: 'Health', href: '/health', icon: Heart, color: 'text-red-500', action: () => navigate('/health') },
                  { label: 'Notes', href: '/notes', icon: FileText, color: 'text-purple-500', action: loadNotes },
                  { label: 'Production', href: '/production', icon: PiggyBank, color: 'text-green-500', action: () => navigate('/production') },
                  { label: 'Tasks', href: '/tasks', icon: CheckSquare, color: 'text-blue-500', action: loadTasks },
                  { label: 'Suppliers', href: '/suppliers', icon: Tag, color: 'text-amber-500', action: loadSuppliers },
                ].map((action, idx) => (
                  <Card 
                    key={idx}
                    className={`cursor-pointer hover:shadow-lg transition-all duration-200 border ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}
                    onClick={action.action}
                  >
                    <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                      <action.icon className={`h-6 w-6 sm:h-8 sm:w-8 mb-1 sm:mb-2 ${action.color}`} />
                      <h4 className={`font-medium font-serif text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                        {action.label}
                      </h4>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="font-serif max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-base sm:text-lg">Confirm Deletion</DialogTitle>
            <DialogDescription className="font-serif text-sm sm:text-base">
              Are you sure you want to delete {animalToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="font-serif text-xs sm:text-sm w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} className="font-serif text-xs sm:text-sm w-full sm:w-auto">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tasksModalOpen} onOpenChange={setTasksModalOpen}>
        <DialogContent className={`font-serif max-w-[95vw] sm:max-w-4xl rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className="font-serif text-base sm:text-lg">Tasks</DialogTitle>
            <DialogDescription className="font-serif text-sm sm:text-base">
              View and manage tasks associated with your animals.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 sm:mt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 mb-3 sm:mb-4">
              <label className="font-serif text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Filter by Animal:</label>
              <select 
                className={`w-full sm:w-64 rounded-md border border-input px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-serif ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}
                value={selectedAnimalId || 'all'}
                onChange={(e) => {
                  const value = e.target.value === 'all' ? null : e.target.value;
                  setSelectedAnimalId(value);
                  if (value) fetchTasks(value).then(setTasks).catch(() => toast.error('Failed to load tasks'));
                  else loadTasks();
                }}
              >
                <option value="all">All Animals</option>
                {animals.map(animal => (
                  <option key={animal.id} value={animal.id}>
                    {animal.name} ({animal.internal_id})
                  </option>
                ))}
              </select>
            </div>
            {tasksLoading ? (
              <div className="py-6 sm:py-8">
                <div className="flex justify-center items-center mb-3 sm:mb-4">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
                  <span className="ml-2 text-base sm:text-lg font-serif text-gray-600 dark:text-gray-300">Fetching tasks...</span>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {Array(3).fill(0).map((_, idx) => (
                    <div key={idx} className="flex items-center space-x-2 sm:space-x-4 animate-pulse">
                      <div className="h-3 sm:h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 sm:h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 sm:h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 sm:h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <PlusCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium mb-2 font-serif text-gray-700 dark:text-gray-300">
                  No Tasks Available
                </h3>
                <p className="text-muted-foreground mb-3 sm:mb-4 font-serif text-sm sm:text-base">
                  {selectedAnimalId ? `No tasks found for ${animals.find(a => a.id === selectedAnimalId)?.name}.` : 'It looks like there are no tasks yet.'} Get started by creating one!
                </p>
                <Button 
                  onClick={() => {
                    setTasksModalOpen(false);
                    navigate(selectedAnimalId ? `/animals/${selectedAnimalId}/tasks/new` : '/tasks/new');
                  }} 
                  className="font-serif text-xs sm:text-sm"
                >
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Create a Task
                </Button>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto">
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-serif text-sm">Title</TableHead>
                        <TableHead className="font-serif text-sm">Animal</TableHead>
                        <TableHead className="font-serif text-sm">Start</TableHead>
                        <TableHead className="font-serif text-sm">Priority</TableHead>
                        <TableHead className="font-serif text-sm">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.task_id}>
                          <TableCell className="font-serif text-sm">{task.title}</TableCell>
                          <TableCell className="font-serif text-sm">
                            {animals.find(a => a.id === task.animal_id)?.name || task.animal_id}
                          </TableCell>
                          <TableCell className="font-serif text-sm">
                            {new Date(`${task.start_date}T${task.start_time}`).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getTaskPriorityColor(task.priority)} font-serif text-xs sm:text-sm`}>
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(task.status)} font-serif text-xs sm:text-sm`}>
                              {task.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden space-y-3 p-2">
                  {tasks.map((task) => (
                    <Card key={task.task_id}>
                      <CardContent className="p-3">
                        <div className="text-sm font-medium font-serif">{task.title}</div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div><span className="font-semibold">Animal:</span> {animals.find(a => a.id === task.animal_id)?.name || task.animal_id}</div>
                          <div><span className="font-semibold">Start:</span> {new Date(`${task.start_date}T${task.start_time}`).toLocaleString()}</div>
                          <div><span className="font-semibold">Priority:</span> <Badge className={getTaskPriorityColor(task.priority)}>{task.priority}</Badge></div>
                          <div><span className="font-semibold">Status:</span> <Badge className={getStatusColor(task.status)}>{task.status}</Badge></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between">
            {tasks.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setTasksModalOpen(false);
                  navigate(selectedAnimalId ? `/animals/${selectedAnimalId}/tasks/new` : '/tasks/new');
                }} 
                className="font-serif text-xs sm:text-sm w-full sm:w-auto"
              >
                <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Create Another Task
              </Button>
            )}
            <Button variant="outline" onClick={() => setTasksModalOpen(false)} className="font-serif text-xs sm:text-sm w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={notesModalOpen} onOpenChange={setNotesModalOpen}>
        <DialogContent className={`font-serif max-w-[95vw] sm:max-w-4xl rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className="font-serif text-base sm:text-lg">Notes</DialogTitle>
            <DialogDescription className="font-serif text-sm sm:text-base">
              View and manage notes associated with your animals.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 sm:mt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 mb-3 sm:mb-4">
              <label className="font-serif text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Filter by Animal:</label>
              <select 
                className={`w-full sm:w-64 rounded-md border border-input px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-serif ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}
                value={selectedAnimalId || 'all'}
                onChange={(e) => {
                  const value = e.target.value === 'all' ? null : e.target.value;
                  setSelectedAnimalId(value);
                  if (value) fetchNotes(value).then(setNotes).catch(() => toast.error('Failed to load notes'));
                  else loadNotes();
                }}
              >
                <option value="all">All Animals</option>
                {animals.map(animal => (
                  <option key={animal.id} value={animal.id}>
                    {animal.name} ({animal.internal_id})
                  </option>
                ))}
              </select>
            </div>
            {notesLoading ? (
              <div className="py-6 sm:py-8">
                <div className="flex justify-center items-center mb-3 sm:mb-4">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
                  <span className="ml-2 text-base sm:text-lg font-serif text-gray-600 dark:text-gray-300">Fetching notes...</span>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {Array(3).fill(0).map((_, idx) => (
                    <div key={idx} className="flex items-center space-x-2 sm:space-x-4 animate-pulse">
                      <div className="h-3 sm:h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 sm:h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 sm:h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <PlusCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium mb-2 font-serif text-gray-700 dark:text-gray-300">
                  No Notes Available
                </h3>
                <p className="text-muted-foreground mb-3 sm:mb-4 font-serif text-sm sm:text-base">
                  {selectedAnimalId ? `No notes found for ${animals.find(a => a.id === selectedAnimalId)?.name}.` : 'It looks like there are no notes yet.'} Get started by creating one!
                </p>
                <Button 
                  onClick={() => {
                    setNotesModalOpen(false);
                    navigate(selectedAnimalId ? `/animals/${selectedAnimalId}/notes/new` : '/notes/new');
                  }} 
                  className="font-serif text-xs sm:text-sm"
                >
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Create a Note
                </Button>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto">
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-serif text-sm">Content</TableHead>
                        <TableHead className="font-serif text-sm">Animal</TableHead>
                        <TableHead className="font-serif text-sm">Category</TableHead>
                        <TableHead className="font-serif text-sm">Due Date</TableHead>
                        <TableHead className="font-serif text-sm">Priority</TableHead>
                        <TableHead className="font-serif text-sm">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notes.map((note) => (
                        <TableRow key={note.notes_id}>
                          <TableCell className="font-serif text-sm truncate max-w-xs">{note.content}</TableCell>
                          <TableCell className="font-serif text-sm">
                            {animals.find(a => a.id === note.animal_id)?.name || note.animal_id}
                          </TableCell>
                          <TableCell className="font-serif text-sm">{note.category}</TableCell>
                          <TableCell className="font-serif text-sm">{new Date(note.due_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={`${getTaskPriorityColor(note.priority)} font-serif text-xs sm:text-sm`}>
                              {note.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(note.status)} font-serif text-xs sm:text-sm`}>
                              {note.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden space-y-3 p-2">
                  {notes.map((note) => (
                    <Card key={note.notes_id}>
                      <CardContent className="p-3">
                        <div className="text-sm font-medium font-serif truncate">{note.content}</div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div><span className="font-semibold">Animal:</span> {animals.find(a => a.id === note.animal_id)?.name || note.animal_id}</div>
                          <div><span className="font-semibold">Category:</span> {note.category}</div>
                          <div><span className="font-semibold">Due:</span> {new Date(note.due_date).toLocaleDateString()}</div>
                          <div><span className="font-semibold">Priority:</span> <Badge className={getTaskPriorityColor(note.priority)}>{note.priority}</Badge></div>
                          <div><span className="font-semibold">Status:</span> <Badge className={getStatusColor(note.status)}>{note.status}</Badge></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between">
            {notes.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setNotesModalOpen(false);
                  navigate(selectedAnimalId ? `/animals/${selectedAnimalId}/notes/new` : '/notes/new');
                }} 
                className="font-serif text-xs sm:text-sm w-full sm:w-auto"
              >
                <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Create Another Note
              </Button>
            )}
            <Button variant="outline" onClick={() => setNotesModalOpen(false)} className="font-serif text-xs sm:text-sm w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={suppliersModalOpen} onOpenChange={setSuppliersModalOpen}>
        <DialogContent className={`font-serif max-w-[95vw] sm:max-w-4xl rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className="font-serif text-base sm:text-lg">Suppliers</DialogTitle>
            <DialogDescription className="font-serif text-sm sm:text-base">
              View and manage suppliers associated with your animals.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 sm:mt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 mb-3 sm:mb-4">
              <label className="font-serif text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Filter by Animal:</label>
              <select 
                className={`w-full sm:w-64 rounded-md border border-input px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-serif ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}
                value={selectedAnimalId || 'all'}
                onChange={(e) => {
                  const value = e.target.value === 'all' ? null : e.target.value;
                  setSelectedAnimalId(value);
                  if (value) fetchSuppliers(value).then(setSuppliers).catch(() => toast.error('Failed to load suppliers'));
                  else loadSuppliers();
                }}
              >
                <option value="all">All Animals</option>
                {animals.map(animal => (
                  <option key={animal.id} value={animal.id}>
                    {animal.name} ({animal.internal_id})
                  </option>
                ))}
              </select>
            </div>
            {suppliersLoading ? (
              <div className="py-6 sm:py-8">
                <div className="flex justify-center items-center mb-3 sm:mb-4">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
                  <span className="ml-2 text-base sm:text-lg font-serif text-gray-600 dark:text-gray-300">Fetching suppliers...</span>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {Array(3).fill(0).map((_, idx) => (
                    <div key={idx} className="flex items-center space-x-2 sm:space-x-4 animate-pulse">
                      <div className="h-3 sm:h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 sm:h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 sm:h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <PlusCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium mb-2 font-serif text-gray-700 dark:text-gray-300">
                  No Suppliers Available
                </h3>
                <p className="text-muted-foreground mb-3 sm:mb-4 font-serif text-sm sm:text-base">
                  {selectedAnimalId ? `No suppliers found for ${animals.find(a => a.id === selectedAnimalId)?.name}.` : 'It looks like there are no suppliers yet.'} Get started by creating one!
                </p>
                <Button 
                  onClick={() => {
                    setSuppliersModalOpen(false);
                    navigate(selectedAnimalId ? `/animals/${selectedAnimalId}/suppliers/new` : '/suppliers/new');
                  }} 
                  className="font-serif text-xs sm:text-sm"
                >
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Create a Supplier
                </Button>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto">
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-serif text-sm">Name</TableHead>
                        <TableHead className="font-serif text-sm">Animal</TableHead>
                        <TableHead className="font-serif text-sm">Type</TableHead>
                        <TableHead className="font-serif text-sm">Contact</TableHead>
                        <TableHead className="font-serif text-sm">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-serif text-sm truncate max-w-xs">{supplier.name}</TableCell>
                          <TableCell className="font-serif text-sm">
                            {animals.find(a => a.id === supplier.id)?.name || supplier.id}
                          </TableCell>
                          <TableCell className="font-serif text-sm">{supplier.type}</TableCell>
                          <TableCell className="font-serif text-sm">{supplier.contact?.email || '-'}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(supplier.status)} font-serif text-xs sm:text-sm`}>
                              {supplier.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden space-y-3 p-2">
                  {suppliers.map((supplier) => (
                    <Card key={supplier.id}>
                      <CardContent className="p-3">
                        <div className="text-sm font-medium font-serif truncate">{supplier.name}</div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div><span className="font-semibold">Animal:</span> {animals.find(a => a.id === supplier.id)?.name || supplier.id}</div>
                          <div><span className="font-semibold">Type:</span> {supplier.type}</div>
                          <div><span className="font-semibold">Contact:</span> {supplier.contact?.email || '-'}</div>
                          <div><span className="font-semibold">Status:</span> <Badge className={getStatusColor(supplier.status)}>{supplier.status}</Badge></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between">
            {suppliers.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSuppliersModalOpen(false);
                  navigate(selectedAnimalId ? `/animals/${selectedAnimalId}/suppliers/new` : '/suppliers/new');
                }} 
                className="font-serif text-xs sm:text-sm w-full sm:w-auto"
              >
                <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Create Another Supplier
              </Button>
            )}
            <Button variant="outline" onClick={() => setSuppliersModalOpen(false)} className="font-serif text-xs sm:text-sm w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Animals;