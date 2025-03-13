import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { toast } from 'sonner';
import { 
  ArrowLeft, Plus, Loader2, Calendar, Edit, Trash2, AlertTriangle, Clock, Tag, BarChart3, CheckCircle2, XCircle, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAnimal } from '@/services/animalService';
import { fetchProductions, deleteProduction, Production } from '@/services/animalProductionApi';
import { Animal } from '@/types/AnimalTypes';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatDistanceToNow, format, isPast } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AnimalProductions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation(); // Added to access navigation state
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [productionToDelete, setProductionToDelete] = useState<Production | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const pdfContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      navigate('/animals');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const animalData = await fetchAnimal(id);
        setAnimal(animalData);

        const productionsData = await fetchProductions(id);
        setProductions(productionsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load animal data or productions');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Check for refresh flag in navigation state
    if (location.state?.refresh) {
      loadData();
      // Clear the state to prevent infinite reloads
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [id, navigate, location.state]); // Added location.state to dependencies

  const handleDeleteClick = (production: Production) => {
    setProductionToDelete(production);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productionToDelete || !id) return;

    try {
      await deleteProduction(id, productionToDelete.id);
      setProductions(productions.filter((p) => p.id !== productionToDelete.id));
      toast.success('Production record deleted successfully');
    } catch (error) {
      console.error('Error deleting production:', error);
      toast.error('Failed to delete production');
    } finally {
      setDeleteConfirmOpen(false);
      setProductionToDelete(null);
    }
  };

  const getFormattedDate = (date: string) => {
    try {
      return format(new Date(date), 'PPP');
    } catch {
      return date;
    }
  };

  const getQualityColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'passed': return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case 'failed': return <XCircle className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  const isOrganic = (isOrganic: boolean) => (isOrganic ? 'Organic' : 'Non-Organic');

  const filteredProductions = () => {
    if (activeTab === 'all') return productions;
    if (activeTab === 'passed') return productions.filter((p) => p.quality_status?.toLowerCase() === 'passed');
    if (activeTab === 'failed') return productions.filter((p) => p.quality_status?.toLowerCase() === 'failed');
    if (activeTab === 'pending') return productions.filter((p) => p.quality_status?.toLowerCase() === 'pending');
    return productions;
  };

  const generatePDF = async () => {
    if (!pdfContentRef.current || !animal) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const canvas = await html2canvas(pdfContentRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 190;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10;

    pdf.setFontSize(18);
    pdf.setTextColor(0, 102, 204);
    pdf.text(`${animal.name}'s Production Report`, 10, 20);
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Generated on: ${format(new Date(), 'PPPp')}`, 10, 28);

    pdf.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight);
    heightLeft -= pageHeight - 40;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 40;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(`Animal Management System - Page ${pdf.getNumberOfPages()}`, 10, 290);

    pdf.save(`${animal.name}_productions_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('PDF report generated successfully');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading animal data...</span>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          <h2 className="text-lg font-medium">Error</h2>
          <p>Animal not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/animals')}>
            Back to Animals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="flex items-center mb-4 md:mb-0">
          <Button variant="ghost" className="mr-2 p-2" onClick={() => navigate(`/animals/${id}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-4">{/* Add avatar content if available */}</Avatar>
            <div>
              <h1 className="text-2xl font-bold">{animal.name}'s Production Records</h1>
              <p className="text-sm text-muted-foreground">Manage production records for {animal.name}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/animals/${id}/production/new`)} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Add Production
          </Button>
          <Button onClick={generatePDF} variant="outline" className="shrink-0">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="passed">Passed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredProductions().length === 0 ? (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Tag className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No {activeTab !== 'all' ? activeTab : ''} Production Records</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === 'all'
                      ? 'No production records have been recorded for this animal yet.'
                      : `No ${activeTab} production records found for this animal.`}
                  </p>
                  <Button onClick={() => navigate(`/animals/${id}/production/new`)}>Add Production</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div ref={pdfContentRef} className="grid grid-cols-1 gap-6">
              {filteredProductions().map((production) => (
                <Card key={production.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div>
                      <CardTitle className="text-xl">{production.product_category.name} - {production.trace_number}</CardTitle>
                      <div className="flex flex-wrap items-center text-sm text-muted-foreground mt-1 gap-x-3 gap-y-1">
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          Produced: {getFormattedDate(production.production_date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          At: {format(new Date(`1970-01-01T${production.production_time}`), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/animals/${id}/production/${production.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(production)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2">
                    <p className="whitespace-pre-line mb-4 text-sm">
                      {production.notes || `${production.quantity} ${production.product_category.measurement_unit} - ${production.production_method.method_name}`}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="outline" className="flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        {production.product_grade.name}
                      </Badge>
                      <Badge variant="outline" className={`flex items-center ${getQualityColor(production.quality_status)}`}>
                        {getStatusIcon(production.quality_status)}
                        {production.quality_status}
                      </Badge>
                      <Badge variant="outline" className="flex items-center">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        {isOrganic(production.is_organic)}
                      </Badge>
                    </div>

                    <div className="mt-4 text-sm text-muted-foreground">
                      <p><strong>Collector:</strong> {production.collector.name}</p>
                      <p><strong>Storage:</strong> {production.storage_location.name} ({production.storage_location.location_code})</p>
                      <p><strong>Total Price:</strong> ${production.total_price}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this production record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnimalProductions;