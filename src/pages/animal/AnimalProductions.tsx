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
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const loadData = async (animalId: string) => {
    setLoading(true);
    try {
      const animalData = await fetchAnimal(animalId);
      if (!animalData) throw new Error('No animal data returned');
      setAnimal(animalData);

      const productionsData = await fetchProductions(animalId);
      const productionList = Array.isArray(productionsData) ? productionsData : productionsData.data || [];
      setProductions(productionList);
      if (!productionList.length) {
        toast.info('No production records found for this animal.');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
      if (!animal) navigate('/animals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      navigate('/animals');
      return;
    }

    loadData(id).catch((err) => {
      console.error('Unhandled error in fetchData:', err);
      toast.error('An unexpected error occurred');
    });

    if (location.state?.refresh) {
      loadData(id).then(() => {
        navigate(location.pathname, { replace: true, state: {} });
      });
    }
  }, [id, location.state?.refresh, navigate]);

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

  const getFormattedDateTime = (date: string, time: string) => {
    try {
      return format(parseISO(`${date}T${time}`), 'PPP hh:mm a');
    } catch {
      return `${date} ${time}`;
    }
  };

  const getQualityColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      return isPast(parseISO(`${date}T${time}`));
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
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${format(new Date(), 'PPPp')}`, 10, 28);
      pdf.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight);
      pdf.save(`${animal.name}_productions_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success('PDF report generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <Card>
          <CardContent className="p-4">
            <p>Animal not found</p>
            <Button variant="outline" onClick={() => navigate('/animals')}>
              Back to Animals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="flex justify-between mb-8">
        <Button variant="ghost" onClick={() => navigate(`/animals/${id}`)}>
          <ArrowLeft className="h-5 w-5 mr-2" /> Back
        </Button>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/animals/${id}/production/new`)}>
            <Plus className="mr-2 h-4 w-4" /> Add Production
          </Button>
          <Button variant="outline" onClick={generatePDF}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="passed">Passed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredProductions().length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Tag className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No {activeTab !== 'all' ? activeTab : ''} Records</h3>
                <Button onClick={() => navigate(`/animals/${id}/production/new`)} className="mt-4">
                  Add Production
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div ref={pdfContentRef} className="space-y-6">
              {filteredProductions().map((production) => (
                <Card
                  key={production.id}
                  className={isPastDue(production.production_date, production.production_time) ? 'border-red-300' : ''}
                >
                  {isPastDue(production.production_date, production.production_time) && (
                    <div className="bg-red-100 px-4 py-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-700 mr-2" />
                      <span className="text-sm text-red-700">Past Due</span>
                    </div>
                  )}
                  <CardHeader className="flex flex-row justify-between">
                    <div>
                      <CardTitle>
                        {production.product_category.name} - {production.trace_number}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1 inline" />
                        {formatDistanceToNow(parseISO(production.created_at), { addSuffix: true })}
                        
                       
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
                  <CardContent>
                    <p className="text-sm mb-4">
                      {production.notes || `${production.quantity} ${production.product_category.measurement_unit}`}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{production.product_grade.name}</Badge>
                      <Badge variant="outline" className={getQualityColor(production.quality_status)}>
                        {getStatusIcon(production.quality_status)}
                        {production.quality_status}
                      </Badge>
                      <Badge variant="outline">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        {isOrganic(production.is_organic)}
                      </Badge>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>
                        <strong>Collector:</strong> {production.collector.name}
                      </p>
                      <p>
                        <strong>Total Price:</strong> ${production.total_price}
                      </p>
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
          </DialogHeader>
          <p>Are you sure you want to delete this production record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
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
};

export default AnimalProductions;