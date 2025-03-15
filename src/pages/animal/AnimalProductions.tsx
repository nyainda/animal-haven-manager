import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  Loader2,
  Calendar,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  Tag,
  BarChart3,
  CheckCircle2,
  XCircle,
  Download,
  DollarSign,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAnimal } from '@/services/animalService';
import { fetchProductions, deleteProduction, Production } from '@/services/animalProductionApi';
import { Animal } from '@/types/AnimalTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatDistanceToNow, format, isPast, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AnimalProductions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [productionToDelete, setProductionToDelete] = useState<Production | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10); // Default to 10 items per page
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const loadData = async (animalId: string) => {
    setLoading(true);
    try {
      console.log('Fetching animal data for ID:', animalId);
      const animalData = await fetchAnimal(animalId);
      if (!animalData) {
        throw new Error('No animal data returned from fetchAnimal');
      }
      console.log('Animal data fetched:', animalData);
      setAnimal(animalData);

      console.log('Fetching productions for animal ID:', animalId);
      const productionsData = await fetchProductions(animalId);
      console.log('Productions data raw:', productionsData);
      const productionList = Array.isArray(productionsData) ? productionsData : productionsData.data || [];
      if (!productionList.length) {
        console.warn('No production records found for animal:', animalId);
        toast.info('No production records found for this animal.');
      }
      console.log('Processed production list:', productionList);
      setProductions(productionList);
    } catch (error: any) {
      console.error('Error loading data:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      toast.error(`Failed to load production data: ${errorMessage}`);
      if (!animal) {
        console.warn('No animal data, redirecting to /animals');
        navigate('/animals');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      console.error('No ID provided in URL params');
      toast.error('Missing animal ID');
      navigate('/animals');
      return;
    }

    console.log('Effect triggered with ID:', id, 'Refresh state:', location.state?.refresh);
    loadData(id).catch((err) => {
      console.error('Unhandled error in fetchData:', err);
      toast.error('An unexpected error occurred while loading data');
    });
  }, [id, navigate, location.state?.refresh]);

  const handleEditClick = (production: Production) => {
    console.log('Navigating to edit production:', production.id);
    navigate(`/animals/${id}/production/${production.id}/edit`, { state: { production } });
  };

  const handleDeleteClick = (production: Production) => {
    console.log('Opening delete confirmation for production:', production.id);
    setProductionToDelete(production);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productionToDelete || !id) return;

    try {
      console.log('Deleting production:', productionToDelete.id);
      await deleteProduction(id, productionToDelete.id);
      setProductions(productions.filter((p) => p.id !== productionToDelete.id));
      toast.success('Production record deleted successfully');
    } catch (error: any) {
      console.error('Error deleting production:', error);
      const errorMessage = error.message ? `Failed to delete production: ${error.message}` : 'Failed to delete production';
      toast.error(errorMessage);
    } finally {
      setDeleteConfirmOpen(false);
      setProductionToDelete(null);
    }
  };

  const getFormattedDateTime = (date: string, time: string) => {
    try {
      const isoDate = parseISO(date);
      const formattedTime = time.includes(':') ? time : format(parseISO(`${date.split('T')[0]}T${time}`), 'HH:mm');
      return format(new Date(isoDate.setHours(parseInt(formattedTime.split(':')[0]), parseInt(formattedTime.split(':')[1]))), 'MMM d, yyyy • hh:mm a');
    } catch {
      return `${date.split('T')[0]} ${time}`;
    }
  };

  const getQualityColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'passed':
        return 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 border-yellow-500/20';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case 'failed':
        return <XCircle className="h-4 w-4 mr-1" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const isOrganic = (isOrganic: boolean | undefined) => (isOrganic ? 'Organic' : 'Non-Organic');

  const isPastDue = (date: string, time: string) => {
    try {
      return isPast(parseISO(`${date.split('T')[0]}T${time}`));
    } catch {
      return false;
    }
  };

  const filteredProductions = () => {
    if (activeTab === 'all') return productions;
    if (activeTab === 'passed') return productions.filter((p) => p.quality_status?.toLowerCase() === 'passed');
    if (activeTab === 'failed') return productions.filter((p) => p.quality_status?.toLowerCase() === 'failed');
    if (activeTab === 'pending') return productions.filter((p) => p.quality_status?.toLowerCase() === 'pending');
    if (activeTab === 'overdue')
      return productions.filter(
        (p) => isPastDue(p.production_date, p.production_time) && p.quality_status?.toLowerCase() !== 'passed'
      );
    return productions;
  };

  const generatePDF = async () => {
    if (!pdfContentRef.current || !animal) return;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const canvas = await html2canvas(pdfContentRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.setFontSize(18);
      pdf.text(`${animal.name}'s Production Report`, 10, 20);
      pdf.setFontSize(12);
      pdf.text(`Animal ID: ${animal.id}`, 10, 30);
      pdf.text(`Generated on: ${format(new Date(), 'PPPp')}`, 10, 38);
      pdf.setFontSize(10);
      pdf.addImage(imgData, 'PNG', 10, 50, imgWidth, imgHeight);
      pdf.save(`${animal.name}_productions_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success('PDF report generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProductions().slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProductions().length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400" />
          <span className="text-lg font-medium text-gray-700 dark:text-gray-200">Loading Production Data...</span>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="shadow-lg max-w-md w-full bg-white dark:bg-gray-800 border-none">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">Animal not found</p>
            <Button
              variant="outline"
              onClick={() => navigate('/animals')}
              className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Animals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/animals/${id}`)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-5 w-5 mr-2" /> Back to Animal
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {animal.name}'s Production
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => navigate(`/animals/${id}/production/new`)}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Production
            </Button>
            <Button
              variant="outline"
              onClick={generatePDF}
              className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" /> Export PDF
            </Button>
          </div>
        </header>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
            <TabsTrigger value="all" className="text-sm font-medium">All</TabsTrigger>
            <TabsTrigger value="passed" className="text-sm font-medium">Passed</TabsTrigger>
            <TabsTrigger value="failed" className="text-sm font-medium">Failed</TabsTrigger>
            <TabsTrigger value="pending" className="text-sm font-medium">Pending</TabsTrigger>
            <TabsTrigger value="overdue" className="text-sm font-medium">Overdue</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {currentItems.length === 0 ? (
              <Card className="shadow-md border-none bg-white dark:bg-gray-800">
                <CardContent className="pt-10 pb-8 text-center">
                  <Tag className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    No {activeTab !== 'all' ? activeTab : 'Production'} Records
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {activeTab === 'all'
                      ? 'Get started by adding a production record.'
                      : `No ${activeTab} production records found.`}
                  </p>
                  <Button
                    onClick={() => navigate(`/animals/${id}/production/new`)}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Production
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div ref={pdfContentRef} className="space-y-6">
                {currentItems.map((production) => (
                  <Card
                    key={production.id}
                    className={`shadow-md border ${
                      isPastDue(production.production_date, production.production_time)
                        ? 'border-red-200 dark:border-red-700/50'
                        : 'border-gray-200 dark:border-gray-700'
                    } bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-200`}
                  >
                    {isPastDue(production.production_date, production.production_time) && (
                      <div className="bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-700/50 px-4 py-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">Past Due</span>
                      </div>
                    )}
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4">
                      <div className="space-y-2">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                          {production.product_category.name} - {production.trace_number}
                        </CardTitle>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-1" />
                          {getFormattedDateTime(production.production_date, production.production_time)}
                          <Clock className="h-4 w-4 ml-3 mr-1" />
                          Created {formatDistanceToNow(parseISO(production.created_at), { addSuffix: true })}
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-3 sm:mt-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(production)}
                          className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(production)}
                          className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {production.notes || `${production.quantity} ${production.product_category.measurement_unit}`}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200">
                          {production.product_grade.name}
                        </Badge>
                        <Badge variant="outline" className={getQualityColor(production.quality_status)}>
                          {getStatusIcon(production.quality_status)}
                          {production.quality_status}
                        </Badge>
                        <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          {isOrganic(production.is_organic)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span>
                            <strong>Collector:</strong> {production.collector.name}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span>
                            <strong>Total:</strong> ${production.total_price} <span className="text-xs">(${production.price_per_unit}/unit)</span>
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span>
                            <strong>Method:</strong> {production.production_method.method_name}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span>
                            <strong>Storage:</strong> {production.storage_location.name}
                          </span>
                        </div>
                        {production.weather_conditions && (
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                            <span>
                              <strong>Weather:</strong> {production.weather_conditions.temperature}°C, {production.weather_conditions.humidity}%
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages} ({filteredProductions().length} records)
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Next <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to delete{' '}
                <span className="font-medium">
                  {productionToDelete?.product_category.name} - {productionToDelete?.trace_number}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AnimalProductions;