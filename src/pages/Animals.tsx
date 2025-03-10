import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, Plus, Download, Edit, Trash2, Eye, AlertCircle, Loader2,
  ChevronRight, Home, LayoutDashboard, Filter, ArrowUpDown,
  ChevronsLeft, ChevronsRight, ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { fetchAnimals, deleteAnimal, exportAnimalsToCSV } from '@/services/animalService';
import { Animal } from '@/types/AnimalTypes';
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

  useEffect(() => {
    loadAnimals();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, animalTypeFilter, statusFilter]);

  const loadAnimals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAnimals();
      setAnimals(data);
    } catch (error) {
      console.error('Error loading animals:', error);
      setError('Failed to load animals. Please try again later.');
      toast.error('Failed to load animals');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (animal: Animal) => {
    setAnimalToDelete(animal);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!animalToDelete) return;
    
    try {
      await deleteAnimal(animalToDelete.id);
      setAnimals(animals.filter(a => a.id !== animalToDelete.id));
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
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'tag':
        comparison = (a.tag_number || '').localeCompare(b.tag_number || '');
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      default:
        comparison = a.name.localeCompare(b.name);
    }
    
    return sortDir === 'asc' ? comparison : -comparison;
  });

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

  const filteredAnimals = sortedAnimals.filter(animal => {
    const matchesSearch = 
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.tag_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.internal_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
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
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('ellipsis');
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1);
      pageNumbers.push('ellipsis');
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
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

  return (
    <div className={`container mx-auto py-6 px-4 font-serif ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center">
          <Home className="h-4 w-4 mr-1" />
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center">
          <LayoutDashboard className="h-4 w-4 mr-1" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Animals</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Animals</h1>
          <p className="text-muted-foreground">
            Manage your animals and livestock
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportAnimalsToCSV} className="font-serif">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => navigate('/animals/new')} className="font-serif">
            <Plus className="mr-2 h-4 w-4" />
            Add Animal
          </Button>
        </div>
      </div>

      <Card className={`mb-6 border-border shadow-md ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-xl">Animal Inventory</CardTitle>
          <CardDescription className="font-serif">
            View and manage all your animals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search animals..."
                className="pl-8 font-serif"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  className={`rounded-md border border-input px-3 py-2 text-sm font-serif ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
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
              
              <div className="flex items-center gap-2">
                <select 
                  className={`rounded-md border border-input px-3 py-2 text-sm font-serif ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
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

              <div className="flex items-center gap-2">
                <select 
                  className={`rounded-md border border-input px-3 py-2 text-sm font-serif ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
          </div>
          
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-primary/10">
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium">Total Animals</h3>
                  <p className="text-3xl font-bold">{animals.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-green-500/10">
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium">Active</h3>
                  <p className="text-3xl font-bold">
                    {animals.filter(a => a.status === 'Active').length}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-blue-500/10">
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium">Breeding Stock</h3>
                  <p className="text-3xl font-bold">
                    {animals.filter(a => a.is_breeding_stock).length}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg font-serif">Loading animals...</span>
            </div>
          ) : error ? (
            <div className="bg-destructive/15 text-destructive p-4 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="font-serif">{error}</span>
              </div>
              <Button variant="outline" className="mt-4 font-serif" onClick={loadAnimals}>
                Try Again
              </Button>
            </div>
          ) : filteredAnimals.length === 0 ? (
            <div className="text-center py-12">
              {searchTerm || animalTypeFilter !== 'all' || statusFilter !== 'all' ? (
                <>
                  <h3 className="text-lg font-medium mb-2 font-serif">No animals found</h3>
                  <p className="text-muted-foreground mb-4 font-serif">
                    No animals match your search criteria
                  </p>
                  <Button 
                    variant="outline" 
                    className="font-serif"
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
                  <h3 className="text-lg font-medium mb-2 font-serif">No animals yet</h3>
                  <p className="text-muted-foreground mb-4 font-serif">
                    Add your first animal to get started
                  </p>
                  <Button onClick={() => navigate('/animals/new')} className="font-serif">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Animal
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className={`rounded-md border overflow-hidden ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-serif" onClick={() => handleSort('name')}>
                        <div className="flex items-center cursor-pointer">
                          Animal
                          {sortBy === 'name' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDir === 'asc' ? 'transform rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="font-serif" onClick={() => handleSort('type')}>
                        <div className="flex items-center cursor-pointer">
                          Type
                          {sortBy === 'type' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDir === 'asc' ? 'transform rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="font-serif" onClick={() => handleSort('tag')}>
                        <div className="flex items-center cursor-pointer">
                          Tag
                          {sortBy === 'tag' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDir === 'asc' ? 'transform rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="font-serif" onClick={() => handleSort('status')}>
                        <div className="flex items-center cursor-pointer">
                          Status
                          {sortBy === 'status' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDir === 'asc' ? 'transform rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right font-serif">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentAnimals.map((animal) => (
                      <TableRow 
                        key={animal.id}
                        className="cursor-pointer hover:bg-accent/20 transition-colors"
                        onClick={() => navigate(`/animals/${animal.id}`)}
                      >
                        <TableCell className="font-medium" onClick={(e) => e.stopPropagation()}>
                          <div 
                            className="font-medium font-serif hover:text-primary cursor-pointer"
                            onClick={() => navigate(`/animals/${animal.id}`)}
                          >
                            {animal.name}
                          </div>
                          <div className="text-sm text-muted-foreground font-serif">{animal.internal_id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="capitalize font-serif">{animal.type}</div>
                          <div className="text-sm text-muted-foreground font-serif">{animal.breed}</div>
                        </TableCell>
                        <TableCell className="font-serif">{animal.tag_number || '-'}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(animal.status)} font-serif`}>
                            {animal.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/animals/${animal.id}`);
                              }}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/animals/${animal.id}/edit`);
                              }}
                              title="Edit animal"
                            >
                              <Edit className="h-4 w-4" />
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
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="mr-1"
                        >
                          <ChevronsLeft className="h-4 w-4" />
                          <span className="sr-only">First page</span>
                        </Button>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {pageNumbers.map((page, index) => (
                        page === 'ellipsis' ? (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={page}>
                            <PaginationLink 
                              isActive={currentPage === page}
                              onClick={() => setCurrentPage(Number(page))}
                              className={currentPage === page ? "" : "cursor-pointer"}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="ml-1"
                        >
                          <ChevronsRight className="h-4 w-4" />
                          <span className="sr-only">Last page</span>
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  
                  <div className="text-center mt-2 text-sm text-muted-foreground font-serif">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAnimals.length)} of {filteredAnimals.length} animals
                  </div>
                  
                  <div className="flex justify-center mt-2">
                    <select 
                      className={`rounded-md border border-input px-3 py-2 text-sm font-serif ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
          
          {!loading && !error && filteredAnimals.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4 font-serif">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card 
                  className="cursor-pointer hover:bg-accent/20 transition-colors"
                  onClick={() => navigate('/animals/new')}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Plus className="h-8 w-8 mb-2 text-primary" />
                    <h4 className="font-medium font-serif">Add Animal</h4>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:bg-accent/20 transition-colors"
                  onClick={() => navigate('/dashboard')}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <LayoutDashboard className="h-8 w-8 mb-2 text-blue-500" />
                    <h4 className="font-medium font-serif">Dashboard</h4>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:bg-accent/20 transition-colors"
                  onClick={exportAnimalsToCSV}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Download className="h-8 w-8 mb-2 text-green-500" />
                    <h4 className="font-medium font-serif">Export Data</h4>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:bg-accent/20 transition-colors"
                  onClick={() => navigate('/animals')}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Filter className="h-8 w-8 mb-2 text-amber-500" />
                    <h4 className="font-medium font-serif">Filter Animals</h4>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="font-serif">
          <DialogHeader>
            <DialogTitle className="font-serif">Confirm Deletion</DialogTitle>
            <DialogDescription className="font-serif">
              Are you sure you want to delete {animalToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="font-serif">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} className="font-serif">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Animals;
