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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  const [itemsPerPage] = useState<number>(10);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const loadData = async (animalId: string) => {
    setLoading(true);
    try {
      const animalData = await fetchAnimal(animalId);
      if (!animalData) throw new Error('No animal data returned');
      setAnimal(animalData);

      const productionsData = await fetchProductions(animalId);
      const productionList = Array.isArray(productionsData) ? productionsData : productionsData.data || [];
      if (!productionList.length) toast.info('No production records found.');
      setProductions(productionList);
    } catch (error: any) {
      toast.error(`Failed to load data: ${error.message || 'Unknown error'}`);
      if (!animal) navigate('/animals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      toast.error('Missing animal ID');
      navigate('/animals');
      return;
    }
    loadData(id).catch((err) => toast.error('Unexpected error occurred'));
  }, [id, navigate, location.state?.refresh]);

  const handleEditClick = (production: Production) => navigate(`/animals/${id}/production/${production.id}/edit`, { state: { production } });
  const handleDeleteClick = (production: Production) => {
    setProductionToDelete(production);
    setDeleteConfirmOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!productionToDelete || !id) return;
    try {
      await deleteProduction(id, productionToDelete.id);
      setProductions(productions.filter((p) => p.id !== productionToDelete.id));
      toast.success('Production record deleted');
    } catch (error: any) {
      toast.error(`Failed to delete: ${error.message || 'Unknown error'}`);
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
      case 'passed': return 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300 border-green-500/20';
      case 'failed': return 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 border-yellow-500/20';
      default: return 'bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground border-muted';
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'passed': return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case 'failed': return <XCircle className="h-4 w-4 mr-1" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 mr-1" />;
      default: return null;
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
    if (activeTab === 'overdue') return productions.filter((p) => isPastDue(p.production_date, p.production_time) && p.quality_status?.toLowerCase() !== 'passed');
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
      toast.success('PDF report generated');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProductions().slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProductions().length / itemsPerPage);

  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center py-6 px-4">
        <Card className="border-border shadow-md w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary sm:h-8 sm:w-8" />
            <p className="text-base font-sans text-foreground dark:text-foreground sm:text-lg">
              Loading production data...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center py-6 px-4">
        <Card className="border-border shadow-md w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-destructive dark:text-destructive sm:text-xl">
              Oops!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground sm:text-base">
              Animal not found.
            </p>
            <Button
              variant="outline"
              className="w-full font-serif text-primary dark:text-primary border-primary dark:border-primary hover:bg-primary/10 dark:hover:bg-primary/20 h-10 sm:h-12"
              onClick={() => navigate('/animals')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Animals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/animals/${id}`)}
              className="text-primary dark:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-full h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-serif font-semibold text-foreground dark:text-foreground sm:text-2xl">
              <span className="text-primary dark:text-primary">{animal.name}</span>’s Production
            </h1>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => navigate(`/animals/${id}/production/new`)}
              className="font-serif bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80 h-10 w-full sm:w-auto sm:h-12"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Production
            </Button>
            <Button
              variant="outline"
              onClick={generatePDF}
              className="font-serif text-foreground dark:text-foreground border-muted-foreground dark:border-muted-foreground hover:bg-muted/10 dark:hover:bg-muted/20 h-10 w-full sm:w-auto sm:h-12"
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </header>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-3 gap-2 sm:grid-cols-5 bg-muted p-1 rounded-lg">
            <TabsTrigger value="all" className="text-xs sm:text-sm font-sans">All</TabsTrigger>
            <TabsTrigger value="passed" className="text-xs sm:text-sm font-sans">Passed</TabsTrigger>
            <TabsTrigger value="failed" className="text-xs sm:text-sm font-sans">Failed</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm font-sans">Pending</TabsTrigger>
            <TabsTrigger value="overdue" className="text-xs sm:text-sm font-sans">Overdue</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            {currentItems.length === 0 ? (
              <Card className="border-border shadow-md">
                <CardContent className="py-8 text-center">
                  <Tag className="h-8 w-8 text-muted-foreground dark:text-muted-foreground mx-auto mb-4 sm:h-10 sm:w-10" />
                  <h3 className="text-base font-sans font-medium text-foreground dark:text-foreground mb-2 sm:text-lg">
                    No {activeTab !== 'all' ? activeTab : 'Production'} Records
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-6 max-w-md mx-auto">
                    {activeTab === 'all' ? `Add a production record for ${animal.name}.` : `No ${activeTab} records found.`}
                  </p>
                  <Button
                    onClick={() => navigate(`/animals/${id}/production/new`)}
                    className="font-serif bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80 h-10 w-full max-w-xs mx-auto sm:h-12"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Production
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div ref={pdfContentRef} className="space-y-6">
                {currentItems.map((production) => (
                  <Card
                    key={production.id}
                    className={`border-border shadow-md ${isPastDue(production.production_date, production.production_time) ? 'border-destructive/50' : ''}`}
                  >
                    {isPastDue(production.production_date, production.production_time) && (
                      <div className="bg-destructive/10 dark:bg-destructive/20 border-b border-destructive/50 px-4 py-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 text-destructive dark:text-destructive mr-2" />
                        <span className="text-sm font-sans text-destructive dark:text-destructive">Past Due</span>
                      </div>
                    )}
                    <CardHeader className="flex flex-col gap-3 pb-4 border-b border-border sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-serif text-foreground dark:text-foreground sm:text-lg">
                          {production.product_category.name} - {production.trace_number}
                        </CardTitle>
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground dark:text-muted-foreground sm:text-sm sm:flex-row sm:gap-4">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 sm:h-4 sm:w-4" />
                            {getFormattedDateTime(production.production_date, production.production_time)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 sm:h-4 sm:w-4" />
                            Created {formatDistanceToNow(parseISO(production.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(production)}
                          className="font-sans text-primary dark:text-primary border-primary dark:border-primary hover:bg-primary/10 dark:hover:bg-primary/20 h-9 w-full sm:w-auto sm:h-10"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(production)}
                          className="font-sans text-destructive dark:text-destructive border-destructive dark:border-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 h-9 w-full sm:w-auto sm:h-10"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm text-foreground dark:text-foreground font-sans mb-4">
                        {production.notes || `${production.quantity} ${production.product_category.measurement_unit}`}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="text-xs font-sans">{production.product_grade.name}</Badge>
                        <Badge variant="outline" className={`${getQualityColor(production.quality_status)} text-xs font-sans`}>
                          {getStatusIcon(production.quality_status)}
                          {production.quality_status}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-sans">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          {isOrganic(production.is_organic)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-3 text-sm text-foreground dark:text-foreground sm:grid-cols-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground dark:text-muted-foreground" />
                          <span><strong>Collector:</strong> {production.collector.name}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground dark:text-muted-foreground" />
                          <span><strong>Total:</strong> ${production.total_price} <span className="text-xs">(${production.price_per_unit}/unit)</span></span>
                        </div>
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-2 text-muted-foreground dark:text-muted-foreground" />
                          <span><strong>Method:</strong> {production.production_method.method_name}</span>
                        </div>
                        <div className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2 text-muted-foreground dark:text-muted-foreground" />
                          <span><strong>Storage:</strong> {production.storage_location.name}</span>
                        </div>
                        {production.weather_conditions && (
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-muted-foreground dark:text-muted-foreground" />
                            <span><strong>Weather:</strong> {production.weather_conditions.temperature}°C, {production.weather_conditions.humidity}%</span>
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

        {/* Pagination */}
        <div className="flex flex-col items-center gap-4 mt-6 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="font-sans text-foreground dark:text-foreground border-muted-foreground dark:border-muted-foreground hover:bg-muted/10 dark:hover:bg-muted/20 h-10 w-full sm:w-auto max-w-xs"
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground dark:text-muted-foreground">
            Page {currentPage} of {totalPages} ({filteredProductions().length} records)
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="font-sans text-foreground dark:text-foreground border-muted-foreground dark:border-muted-foreground hover:bg-muted/10 dark:hover:bg-muted/20 h-10 w-full sm:w-auto max-w-xs"
          >
            Next <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Delete Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="bg-background border-border shadow-md w-[90vw] max-w-md sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-serif text-foreground dark:text-foreground sm:text-xl">
                Confirm Deletion
              </DialogTitle>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                Are you sure you want to delete{' '}
                <span className="font-medium">
                  {productionToDelete?.product_category.name} - {productionToDelete?.trace_number}
                </span>
                ? This action cannot be undone.
              </p>
            </DialogHeader>
            <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                className="font-serif w-full text-foreground dark:text-foreground border-muted-foreground dark:border-muted-foreground hover:bg-muted/10 dark:hover:bg-muted/20 h-10 sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                className="font-serif w-full bg-destructive text-destructive-foreground dark:bg-destructive dark:text-destructive-foreground hover:bg-destructive/90 dark:hover:bg-destructive/80 h-10 sm:w-auto"
              >
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