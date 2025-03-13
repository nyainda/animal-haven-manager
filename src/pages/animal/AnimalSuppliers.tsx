import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, Plus, Loader2, Calendar, Edit, Trash2, AlertTriangle, Clock, Tag, BarChart3, CheckCircle2, XCircle, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { fetchAnimal } from '@/services/animalService';
import { fetchSuppliers, deleteSupplier, Supplier } from '@/services/supplierApi';
import { Animal } from '@/types/AnimalTypes';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { formatDistanceToNow, format, isPast } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AnimalSuppliers: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const pdfContentRef = useRef<HTMLDivElement>(null); // Ref to capture PDF content

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

        const suppliersData = await fetchSuppliers(id);
        setSuppliers(suppliersData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load animal data or suppliers');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete || !id) return;

    try {
      await deleteSupplier(id, supplierToDelete.id);
      setSuppliers(suppliers.filter(supplier => supplier.id !== supplierToDelete.id));
      toast.success('Supplier deleted successfully');
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast.error('Failed to delete supplier');
    } finally {
      setDeleteConfirmOpen(false);
      setSupplierToDelete(null);
    }
  };

  const getFormattedDate = (date: string) => {
    try {
      return format(new Date(date), 'PPP');
    } catch {
      return date;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case 'inactive': return <XCircle className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  const isContractExpired = (endDate: string) => {
    try {
      return isPast(new Date(endDate));
    } catch {
      return false;
    }
  };

  const filteredSuppliers = () => {
    if (activeTab === 'all') return suppliers;
    if (activeTab === 'active') return suppliers.filter(supplier => supplier.status?.toLowerCase() === 'active');
    if (activeTab === 'inactive') return suppliers.filter(supplier => supplier.status?.toLowerCase() === 'inactive');
    if (activeTab === 'expired') return suppliers.filter(supplier => 
      isContractExpired(supplier.contract_end_date) && supplier.status?.toLowerCase() === 'active'
    );
    return suppliers;
  };

  const generatePDF = async () => {
    if (!pdfContentRef.current || !animal) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const canvas = await html2canvas(pdfContentRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 190; // Width in mm (A4 width - margins)
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10; // Top margin

    // Add header
    pdf.setFontSize(18);
    pdf.setTextColor(0, 102, 204); // Blue color
    pdf.text(`${animal.name}'s Suppliers Report`, 10, 20);
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Generated on: ${format(new Date(), 'PPPp')}`, 10, 28);

    // Add image content
    pdf.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight);
    heightLeft -= pageHeight - 40;

    // Handle multiple pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 40;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Add footer
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(`Animal Management System - Page ${pdf.getNumberOfPages()}`, 10, 290);

    pdf.save(`${animal.name}_suppliers_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
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
            <Avatar className="h-12 w-12 mr-4">
              {/* Add avatar content if available */}
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{animal.name}'s Suppliers</h1>
              <p className="text-sm text-muted-foreground">
                Manage suppliers for {animal.name}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/animals/${id}/suppliers/new`)} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
          <Button onClick={generatePDF} variant="outline" className="shrink-0">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Suppliers</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="expired">Expired Contracts</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {filteredSuppliers().length === 0 ? (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Tag className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No {activeTab !== 'all' ? activeTab : ''} Suppliers</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === 'all' 
                      ? "No suppliers have been recorded for this animal yet." 
                      : `No ${activeTab} suppliers found for this animal.`}
                  </p>
                  <Button onClick={() => navigate(`/animals/${id}/suppliers/new`)}>
                    Add Supplier
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div ref={pdfContentRef} className="grid grid-cols-1 gap-6">
              {filteredSuppliers().map((supplier) => {
                const isExpired = isContractExpired(supplier.contract_end_date) && 
                  supplier.status?.toLowerCase() === 'active';

                return (
                  <Card 
                    key={supplier.id} 
                    className={`overflow-hidden ${isExpired ? 'border-red-300' : ''}`}
                  >
                    {isExpired && (
                      <div className="bg-red-100 px-4 py-1 flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-700 mr-2" />
                        <span className="text-sm text-red-700 font-medium">Contract Expired</span>
                      </div>
                    )}
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                      <div>
                        <CardTitle className="text-xl">{supplier.name}</CardTitle>
                        <div className="flex flex-wrap items-center text-sm text-muted-foreground mt-1 gap-x-3 gap-y-1">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            Added: {formatDistanceToNow(new Date(supplier.created_at), { addSuffix: true })}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            Contract Ends: {getFormattedDate(supplier.contract_end_date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/animals/${id}/suppliers/${supplier.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(supplier)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-2">
                      <p className="whitespace-pre-line mb-4 text-sm">
                        {supplier.notes || `${supplier.shop_name} - ${supplier.product_type}`}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        {supplier.type && (
                          <Badge variant="outline" className="flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            {supplier.type}
                          </Badge>
                        )}
                        {supplier.supplier_importance && (
                          <Badge variant="outline" className={`flex items-center ${getImportanceColor(supplier.supplier_importance)}`}>
                            <BarChart3 className="h-3 w-3 mr-1" />
                            {supplier.supplier_importance}
                          </Badge>
                        )}
                        {supplier.status && (
                          <Badge variant="outline" className={`flex items-center ${getStatusColor(supplier.status)}`}>
                            {getStatusIcon(supplier.status)}
                            {supplier.status}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-4 text-sm text-muted-foreground">
                        <p><strong>Contact:</strong> {supplier.contact_name || 'N/A'} ({supplier.contact_email || 'No email'})</p>
                        <p><strong>Phone:</strong> {supplier.phone}</p>
                        <p><strong>Address:</strong> {supplier.address}, {supplier.city}, {supplier.state} {supplier.postal_code}, {supplier.country}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this supplier? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
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

export default AnimalSuppliers;