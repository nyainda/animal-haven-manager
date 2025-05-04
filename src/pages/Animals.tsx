import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, Plus, Download, Edit, Trash2, Eye, AlertCircle, Loader2,
  ChevronRight, Home, Filter, ArrowUpDown, PieChart,
  ChevronsLeft, ChevronsRight, Activity, Heart, FileText, PiggyBank, CheckSquare, Tag,
  RefreshCw, Clipboard
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchAnimals, deleteAnimal, exportAnimalsToCSV } from '@/services/animalService';
import { Animal } from '../types/AnimalTypes';
import { useTheme } from '@/contexts/ThemeContext';

const AnimalCard = ({ animal, onView, onEdit, onDelete }) => {
  const { theme } = useTheme();
  const statusColors = {
    Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'For Sale': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Sold: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    Deceased: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  const typeIcons = {
    Cattle: '🐄',
    Sheep: '🐑',
    Goat: '🐐',
    Pig: '🐖',
    Chicken: '🐓',
    Horse: '🐎'
  };

  return (
    <div className={`rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border bg-background border-border`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <span className="text-3xl">{typeIcons[animal.type] || '🐾'}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[animal.status] || 'bg-gray-100 text-gray-800'}`}>
            {animal.status}
          </span>
        </div>
        <h3 className="font-medium text-lg mb-1 truncate">{animal.name}</h3>
        <div className="text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{animal.type}</span>
            {animal.tag_number && (
              <span className="px-2 py-0.5 bg-muted rounded text-xs">
                #{animal.tag_number}
              </span>
            )}
          </div>
          <div className="mt-1">
            <span>ID: {animal.internal_id || '—'}</span>
          </div>
          <div className="mt-1">
            <span>Gender: <span className="capitalize">{animal.gender || 'N/A'}</span></span>
          </div>
          <div className="mt-1">
            <span>Breed: {animal.breed || 'N/A'}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border p-2 flex justify-between bg-background">
        <button 
          onClick={() => onView(animal.id)}
          className="pGN-2 rounded-md hover:bg-muted text-blue-600 dark:text-blue-400"
          aria-label="View details"
        >
          <Eye size={18} />
        </button>
        <button 
          onClick={() => onEdit(animal.id)}
          className="p-2 rounded-md hover:bg-muted text-yellow-600 dark:text-yellow-400"
          aria-label="Edit animal"
        >
          <Edit size={18} />
        </button>
        <button 
          onClick={() => onDelete(animal)}
          className="p-2 rounded-md hover:bg-muted text-red-600 dark:text-red-400"
          aria-label="Delete animal"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

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
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filtersVisible, setFiltersVisible] = useState<boolean>(false);

  const loadAnimals = useCallback(async () => {
    setLoading(true);
    try {
     const data = await fetchAnimals({ cache: 'no-store', page: 1, limit: 100 });
     setAnimals(data);
    } catch (error) {
      setError('Failed to load animals.');
      toast.error('Failed to load animals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnimals();
  }, [loadAnimals]);

  const handleSort = (column: string) => {
    setSortBy(column);
    setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
  };

  const sortedAnimals = [...animals].sort((a, b) => {
    const comparison = sortBy === 'name' 
      ? a.name.localeCompare(b.name) 
      : a[sortBy]?.localeCompare(b[sortBy]) || 0;
    return sortDir === 'asc' ? comparison : -comparison;
  });

  const filteredAnimals = sortedAnimals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          animal.tag_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = animalTypeFilter === 'all' || animal.type === animalTypeFilter;
    const matchesStatus = statusFilter === 'all' || animal.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAnimals.length / itemsPerPage);
  const currentAnimals = filteredAnimals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteClick = (animal: Animal) => {
    setAnimalToDelete(animal);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!animalToDelete) return;
    try {
      await deleteAnimal(animalToDelete.id);
      setAnimals(animals.filter(a => a.id !== animalToDelete.id));
      toast.success(`${animalToDelete.name} deleted`);
    } catch (error) {
      toast.error('Failed to delete animal');
    } finally {
      setDeleteConfirmOpen(false);
      setAnimalToDelete(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setAnimalTypeFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className={`min-h-screen bg-background text-foreground ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Quick Actions */}
        <div className="lg:hidden shadow-sm p-4 border-b border-border bg-background">
          <div className="flex space-x-3 overflow-x-auto">
            {[
              { label: 'Add New', icon: Plus, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', action: () => navigate('/animals/new') },
              { label: 'Export', icon: Download, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', action: exportAnimalsToCSV },
              { label: 'Filter', icon: Filter, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', action: () => setFiltersVisible(!filtersVisible) },
              { label: 'View', icon: viewMode === 'grid' ? Clipboard : PieChart, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', action: () => setViewMode(viewMode === 'grid' ? 'table' : 'grid') }
            ].map(action => (
              <button
                key={action.label}
                onClick={action.action}
                className={`flex flex-col items-center p-2 rounded-lg ${action.color} min-w-16`}
              >
                <action.icon size={18} />
                <span className="text-xs mt-1">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Header */}
          <header className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold">Animals</h1>
                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded-full font-medium">
                    {filteredAnimals.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Link to="/dashboard" className="hover:text-primary flex items-center gap-1">
                    <Home size={14} /> Home
                  </Link>
                  <ChevronRight size={14} />
                  <span>Animals</span>
                </div>
              </div>
              <div className="hidden lg:flex gap-3">
                <button 
                  onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                  className="flex items-center gap-2 px-3 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-muted transition text-sm"
                >
                  {viewMode === 'grid' ? (
                    <>
                      <Clipboard size={16} /> Table View
                    </>
                  ) : (
                    <>
                      <PieChart size={16} /> Grid View
                    </>
                  )}
                </button>
                <button 
                  onClick={exportAnimalsToCSV} 
                  className="flex items-center gap-2 px-3 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-muted transition text-sm"
                >
                  <Download size={16} /> Export
                </button>
                <button 
                  onClick={() => navigate('/animals/new')} 
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition text-sm shadow-sm"
                >
                  <Plus size={16} /> Add Animal
                </button>
              </div>
            </div>
          </header>

          {/* Overview Header */}
          <section className="mb-6">
            <div className="block sm:hidden overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
              <div className="flex gap-3 pb-2">
                {[
                  { label: 'Total', value: animals.length, icon: PieChart, color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' },
                  { label: 'Active', value: animals.filter(a => a.status === 'Active').length, icon: Activity, color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' },
                  { label: 'Raised', value: animals.filter(a => a.raised_purchased === 'raised').length, icon: Heart, color: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300' },
                  { label: 'Purchased', value: animals.filter(a => a.raised_purchased === 'purchased').length, icon: Tag, color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300' },
                ].map(stat => (
                  <div key={stat.label} className="flex-shrink-0 w-24 p-3 rounded-lg shadow-sm border bg-background border-border">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${stat.color}`}>
                      <stat.icon size={18} />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">{stat.label}</p>
                    <p className="text-lg font-bold text-center">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden sm:block lg:hidden">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Animals', value: animals.length, icon: PieChart, color: 'text-blue-600 dark:text-blue-400' },
                  { label: 'Active', value: animals.filter(a => a.status === 'Active').length, icon: Activity, color: 'text-green-600 dark:text-blue-400' },
                  { label: 'Raised', value: animals.filter(a => a.raised_purchased === 'raised').length, icon: Heart, color: 'text-purple-600 dark:text-purple-400' },
                  { label: 'Purchased', value: animals.filter(a => a.raised_purchased === 'purchased').length, icon: Tag, color: 'text-yellow-600 dark:text-yellow-400' },
                ].map(stat => (
                  <div key={stat.label} className="p-4 rounded-lg shadow-sm border flex items-center gap-3 bg-background border-border">
                    <stat.icon size={24} className={stat.color} />
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-4 gap-4">
              {[
                { label: 'Total Animals', value: animals.length, icon: PieChart, color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' },
                { label: 'Active', value: animals.filter(a => a.status === 'Active').length, icon: Activity, color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' },
                { label: 'Raised', value: animals.filter(a => a.raised_purchased === 'raised').length, icon: Heart, color: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300' },
                { label: 'Purchased', value: animals.filter(a => a.raised_purchased === 'purchased').length, icon: Tag, color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300' },
              ].map(stat => (
                <div key={stat.label} className="p-4 rounded-xl shadow-sm flex items-center border bg-background border-border">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Filters */}
          <section className={`mb-6 rounded-xl shadow-sm border bg-background border-border ${filtersVisible || window.innerWidth >= 1024 ? 'block' : 'hidden'}`}>
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h2 className="font-medium flex items-center gap-2">
                <Filter size={16} /> Filters
              </h2>
              <button 
                onClick={resetFilters}
                className="text-sm text-primary flex items-center gap-1 hover:underline"
              >
                <RefreshCw size={14} /> Reset
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name or tag..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
                <select
                  value={animalTypeFilter}
                  onChange={(e) => setAnimalTypeFilter(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="all">All Types</option>
                  {[...new Set(animals.map(a => a.type))].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="all">All Statuses</option>
                  {[...new Set(animals.map(a => a.status))].map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-lg bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  {[8, 12, 24, 48].map(num => (
                    <option key={num} value={num}>{num} per page</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Results Stats */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{currentAnimals.length}</span> of {filteredAnimals.length} animals
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSort(sortBy)}
                className="flex items-center gap-1 text-sm text-foreground hover:text-primary"
              >
                <ArrowUpDown size={14} /> 
                {sortDir === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>

          {/* Animals Content */}
          <section className="mb-6">
            {loading ? (
              <div className="flex justify-center items-center h-64 rounded-xl shadow-sm bg-background border border-border">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <p className="text-sm text-muted-foreground">Loading animals...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 rounded-xl flex items-center gap-3 shadow-sm border bg-background border-border text-red-700 dark:text-red-300">
                <AlertCircle size={24} />
                <div>
                  <h3 className="font-medium">Error loading animals</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            ) : filteredAnimals.length === 0 ? (
              <div className="p-8 rounded-xl shadow-sm border text-center bg-background border-border">
                <div className="flex flex-col items-center gap-2 max-w-md mx-auto">
                  <div className="p-3 bg-muted rounded-full">
                    <AlertCircle size={24} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mt-2">No animals found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchTerm || animalTypeFilter !== 'all' || statusFilter !== 'all' ? 
                      'Try adjusting your filters to find what you\'re looking for.' : 
                      'Add your first animal to get started.'}
                  </p>
                  {searchTerm || animalTypeFilter !== 'all' || statusFilter !== 'all' ? (
                    <button 
                      onClick={resetFilters}
                      className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 text-sm font-medium transition"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate('/animals/new')}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium transition"
                    >
                      Add Animal
                    </button>
                  )}
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentAnimals.map(animal => (
                  <AnimalCard 
                    key={animal.id} 
                    animal={animal} 
                    onView={(id) => navigate(`/animals/${id}`)}
                    onEdit={(id) => navigate(`/animals/${id}/edit`)}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl shadow-sm overflow-hidden border bg-background border-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        {['Name', 'Type', 'Tag', 'Status', 'Internal ID', 'Gender', 'Breed', 'Actions'].map((header, idx) => (
                          <th
                            key={idx}
                            className="p-4 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-primary"
                            onClick={() => header !== 'Actions' && handleSort(header.toLowerCase().replace(' ', '_'))}
                          >
                            <div className="flex items-center gap-1">
                              {header}
                              {sortBy === header.toLowerCase().replace(' ', '_') && <ArrowUpDown size={14} />}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentAnimals.map(animal => (
                        <tr 
                          key={animal.id} 
                          className={`border-t border-border transition-colors ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-lg">
                                {animal.type === 'Cattle' && '🐄'}
                                {animal.type === 'Sheep' && '🐑'}
                                {animal.type === 'Goat' && '🐐'}
                                {animal.type === 'Pig' && '🐖'}
                                {animal.type === 'Chicken' && '🐓'}
                                {animal.type === 'Horse' && '🐎'}
                                {!['Cattle', 'Sheep', 'Goat', 'Pig', 'Chicken', 'Horse'].includes(animal.type) && '🐾'}
                              </div>
                              <Link to={`/animals/${animal.id}`} className="text-primary hover:underline font-medium">
                                {animal.name}
                              </Link>
                            </div>
                          </td>
                          <td className="p-4 text-sm">{animal.type}</td>
                          <td className="p-4 text-sm">{animal.tag_number || '—'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              animal.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                              animal.status === 'For Sale' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              animal.status === 'Sold' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              animal.status === 'Deceased' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {animal.status}
                            </span>
                          </td>
                          <td className="p-4 text-sm">{animal.internal_id || '—'}</td>
                          <td className="p-4 text-sm capitalize">{animal.gender || 'N/A'}</td>
                          <td className="p-4 text-sm">{animal.breed || 'N/A'}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => navigate(`/animals/${animal.id}`)}
                                className="p-1.5 rounded-md hover:bg-muted text-blue-600 dark:text-blue-400"
                                aria-label="View details"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => navigate(`/animals/${animal.id}/edit`)} 
                                className="p-1.5 rounded-md hover:bg-muted text-yellow-600 dark:text-yellow-400"
                                aria-label="Edit animal"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(animal)} 
                                className="p-1.5 rounded-md hover:bg-muted text-red-600 dark:text-red-400"
                                aria-label="Delete animal"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-xl shadow-sm border bg-background border-border">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-muted text-foreground disabled:opacity-50 hover:bg-muted/80 transition"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg bg-muted text-foreground disabled:opacity-50 hover:bg-muted/80 transition text-sm flex items-center gap-1"
                >
                  <ChevronRight className="rotate-180" size={16} />
                  Previous
                </button>
              </div>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg bg-muted text-foreground disabled:opacity-50 hover:bg-muted/80 transition text-sm flex items-center gap-1"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-muted text-foreground disabled:opacity-50 hover:bg-muted/80 transition"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {!loading && !error && filteredAnimals.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Tasks', icon: CheckSquare, color: 'bg-blue-500', action: () => navigate('/tasks') },
                  { label: 'Notes', icon: FileText, color: 'bg-purple-500', action: () => navigate('/notes') },
                  { label: 'Suppliers', icon: Tag, color: 'bg-yellow-500', action: () => navigate('/suppliers') },
                  { label: 'Health', icon: Heart, color: 'bg-red-500', action: () => navigate('/health') },
                  { label: 'Production', icon: PiggyBank, color: 'bg-green-500', action: () => navigate('/production') },
                  { label: 'Activities', icon: Activity, color: 'bg-indigo-500', action: () => navigate('/activities') },
                ].map(action => (
                  <button
                    key={action.label}
                    onClick={action.action}
                    className={`${action.color} text-white p-4 rounded-lg flex flex-col items-center justify-center hover:opacity-90 transition`}
                  >
                    <action.icon size={24} />
                    <span className="mt-2 text-sm font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
              <div className="p-6 rounded-lg shadow-lg w-full max-w-sm bg-background border border-border">
                <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Are you sure you want to delete {animalToDelete?.name}?
                </p>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setDeleteConfirmOpen(false)} 
                    className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmDelete} 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Animals;