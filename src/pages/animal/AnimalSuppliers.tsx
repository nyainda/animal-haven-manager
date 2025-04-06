import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ArrowLeft, Plus, Loader2, Calendar, Edit, Trash2, AlertTriangle, Clock, Tag, BarChart3, CheckCircle2, XCircle, Download, MoreVertical, Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAnimal } from '@/services/animalService';
import { fetchSuppliers, deleteSupplier, Supplier } from '@/services/supplierApi';
import { Animal } from '@/types/AnimalTypes';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose,
} from '@/components/ui/dialog';
import { formatDistanceToNowStrict, format, isPast, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Helper Functions ---

interface BadgeStyleProps { bgClass: string; textClass: string; borderClass: string; }

const getImportanceStyles = (importance?: string): { borderClass: string; iconColorClass: string; badgeStyle: BadgeStyleProps } => {
    const baseStyle: BadgeStyleProps = { bgClass: '', textClass: '', borderClass: '' };
    switch (importance?.toLowerCase()) {
        case 'high':
            return { borderClass: 'border-l-4 border-red-500', iconColorClass: 'text-red-500', badgeStyle: { ...baseStyle, bgClass: 'bg-red-100', textClass: 'text-red-800', borderClass: 'border-red-500' } };
        case 'medium':
            return { borderClass: 'border-l-4 border-amber-500', iconColorClass: 'text-amber-500', badgeStyle: { ...baseStyle, bgClass: 'bg-amber-100', textClass: 'text-amber-800', borderClass: 'border-amber-500' } };
        case 'low':
            return { borderClass: 'border-l-4 border-green-500', iconColorClass: 'text-green-500', badgeStyle: { ...baseStyle, bgClass: 'bg-green-100', textClass: 'text-green-800', borderClass: 'border-green-500' } };
        default:
            return { borderClass: 'border-l-4 border-gray-300 dark:border-gray-600', iconColorClass: 'text-gray-500', badgeStyle: { ...baseStyle, bgClass: 'bg-gray-100', textClass: 'text-gray-800', borderClass: 'border-gray-500' } };
    }
};

const getStatusBadgeStyle = (status?: string): BadgeStyleProps => {
    switch (status?.toLowerCase()) {
        case 'active': return { bgClass: 'bg-green-100', textClass: 'text-green-800', borderClass: 'border-green-500' };
        case 'inactive': return { bgClass: 'bg-red-100', textClass: 'text-red-800', borderClass: 'border-red-500' };
        default: return { bgClass: 'bg-gray-100', textClass: 'text-gray-800', borderClass: 'border-gray-500' };
    }
};

const getStatusIcon = (status?: string): React.ReactNode => {
    switch (status?.toLowerCase()) {
        case 'active': return <CheckCircle2 className="h-3 w-3 mr-1" />;
        case 'inactive': return <XCircle className="h-3 w-3 mr-1" />;
        default: return null;
    }
};

const formatDateTime = (dateStr: string): string => {
    try {
        return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
        return 'Invalid Date';
    }
};

const formatRelativeTime = (dateStr: string): string => {
    try {
        return formatDistanceToNowStrict(parseISO(dateStr), { addSuffix: true });
    } catch {
        return 'Unknown time';
    }
};

const isContractExpired = (endDate: string): boolean => {
    try {
        return isPast(parseISO(endDate));
    } catch {
        return false;
    }
};

// --- SupplierCard Sub-Component ---

interface SupplierCardProps {
    supplier: Supplier;
    animalId: string;
    onEdit: (supplierId: number) => void;
    onDelete: (supplier: Supplier) => void;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, animalId, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isExpired = isContractExpired(supplier.contract_end_date) && supplier.status?.toLowerCase() === 'active';
    const { borderClass: importanceBorderClass, iconColorClass: importanceIconColor, badgeStyle: importanceBadgeStyle } = getImportanceStyles(supplier.supplier_importance);
    const statusStyle = getStatusBadgeStyle(supplier.status);

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (supplier.id) onEdit(supplier.id);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(supplier);
    };

    const description = supplier.notes || `${supplier.shop_name} - ${supplier.product_type}`;
    const isLongDescription = description.length > 150;

    return (
        <Card
            className={`group relative overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out flex flex-col h-full ${importanceBorderClass} ${isExpired ? 'border-t-destructive/60 border-r-destructive/60 border-b-destructive/60 bg-destructive/5 dark:bg-destructive/10' : 'border-border'}`}
        >
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-background/70 backdrop-blur-sm">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="sr-only">Supplier Actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleEditClick}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <CardHeader className="p-4 pb-3">
                <div className="flex justify-between items-start gap-2 mb-1">
                    <CardTitle className="text-base font-semibold leading-tight pr-8 group-hover:text-primary transition-colors">
                        {supplier.name || "Unnamed Supplier"}
                    </CardTitle>
                    {supplier.supplier_importance && (
                        <Tooltip>
                            <TooltipTrigger>
                                <BarChart3 className={`h-4 w-4 flex-shrink-0 ${importanceIconColor} transform rotate-90`} />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{supplier.supplier_importance} Importance</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
                <CardDescription className="text-xs text-muted-foreground flex items-center gap-x-3 gap-y-1 flex-wrap">
                    <Tooltip>
                        <TooltipTrigger className="flex items-center cursor-default">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                            <span>Ends {formatDateTime(supplier.contract_end_date)}</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Contract End Date</TooltipContent>
                    </Tooltip>
                    <span className="text-muted-foreground/50 hidden sm:inline">•</span>
                    <Tooltip>
                        <TooltipTrigger className="flex items-center cursor-default">
                            <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                            <span>Added {formatRelativeTime(supplier.created_at)}</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Creation Date</TooltipContent>
                    </Tooltip>
                </CardDescription>
                {isExpired && (
                    <Badge variant="destructive" className="mt-2 text-xs w-fit">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Contract Expired
                    </Badge>
                )}
            </CardHeader>

            <CardContent className="p-4 pt-2 pb-3 flex-grow">
                <div className="flex flex-wrap gap-2 mb-3">
                    {supplier.type && (
                        <Badge variant="secondary" className="text-xs font-medium">
                            <Tag className="h-3 w-3 mr-1.5" />
                            {supplier.type}
                        </Badge>
                    )}
                    {supplier.status && (
                        <Badge
                            variant="outline"
                            className={`text-xs font-medium flex items-center ${statusStyle.bgClass} ${statusStyle.textClass} ${statusStyle.borderClass}`}
                        >
                            {getStatusIcon(supplier.status)}
                            {supplier.status}
                        </Badge>
                    )}
                </div>

                <div>
                    <p
                        className={`text-sm text-foreground/90 whitespace-pre-wrap ${!supplier.notes ? 'text-muted-foreground italic' : ''} ${!isExpanded && isLongDescription ? 'line-clamp-3' : ''}`}
                    >
                        {description}
                    </p>
                    {isLongDescription && (
                        <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 mt-1 text-primary"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? 'Show Less' : 'Read More'}
                        </Button>
                    )}
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                    <p><strong>Contact:</strong> {supplier.contact_name || 'N/A'} ({supplier.contact_email || 'No email'})</p>
                    <p><strong>Phone:</strong> {supplier.phone || 'N/A'}</p>
                    <p><strong>Address:</strong> {supplier.address ? `${supplier.address}, ${supplier.city}, ${supplier.state} ${supplier.postal_code}, ${supplier.country}` : 'N/A'}</p>
                </div>
            </CardContent>
        </Card>
    );
};

// --- Main AnimalSuppliers Component ---

const AnimalSuppliers: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
    const [activeTab, setActiveTab] = useState<string>('all');
    const pdfContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!id) {
            toast.error('Animal ID is missing.');
            navigate('/animals');
            return;
        }
        let isMounted = true;
        const loadData = async () => {
            try {
                const [animalData, suppliersData] = await Promise.all([
                    fetchAnimal(id),
                    fetchSuppliers(id)
                ]);
                if (isMounted) {
                    setAnimal(animalData);
                    setSuppliers(suppliersData.sort((a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime()));
                }
            } catch (error) {
                console.error('Error loading data:', error);
                if (isMounted) toast.error('Failed to load animal data or suppliers.');
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setIsInitialLoad(false);
                }
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, [id, navigate]);

    const handleDeleteClick = useCallback((supplier: Supplier) => {
        setSupplierToDelete(supplier);
        setDeleteConfirmOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!supplierToDelete?.id || !id) return;
        const originalSuppliers = suppliers;
        setSuppliers(prev => prev.filter(s => s.id !== supplierToDelete.id));
        setDeleteConfirmOpen(false);

        try {
            await deleteSupplier(id, supplierToDelete.id);
            toast.success(`Supplier "${supplierToDelete.name}" deleted.`);
            setSupplierToDelete(null);
        } catch (error) {
            console.error('Error deleting supplier:', error);
            toast.error(`Failed to delete "${supplierToDelete.name}". Restoring supplier.`);
            setSuppliers(originalSuppliers);
        }
    }, [id, supplierToDelete, suppliers]);

    const handleAddSupplier = useCallback(() => {
        if (!id) return;
        navigate(`/animals/${id}/suppliers/new`);
    }, [id, navigate]);

    const handleEditSupplier = useCallback((supplierId: number) => {
        if (!id || !supplierId) return;
        navigate(`/animals/${id}/suppliers/${supplierId}/edit`);
    }, [id, navigate]);

    const generatePDF = useCallback(async () => {
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
        pdf.text(`${animal.name}'s Suppliers Report`, 10, 20);
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
        pdf.save(`${animal.name}_suppliers_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        toast.success('PDF report generated successfully');
    }, [animal]);

    const supplierCounts = useMemo(() => {
        const counts = { all: suppliers.length, active: 0, inactive: 0, expired: 0 };
        suppliers.forEach(supplier => {
            const status = supplier.status?.toLowerCase();
            if (status === 'active') counts.active++;
            if (status === 'inactive') counts.inactive++;
            if (isContractExpired(supplier.contract_end_date) && status === 'active') counts.expired++;
        });
        return counts;
    }, [suppliers]);

    const filteredSuppliers = useMemo(() => {
        const lowerCaseTab = activeTab.toLowerCase();
        if (lowerCaseTab === 'all') return suppliers;
        if (lowerCaseTab === 'active') return suppliers.filter(s => s.status?.toLowerCase() === 'active');
        if (lowerCaseTab === 'inactive') return suppliers.filter(s => s.status?.toLowerCase() === 'inactive');
        if (lowerCaseTab === 'expired') return suppliers.filter(s => isContractExpired(s.contract_end_date) && s.status?.toLowerCase() === 'active');
        return suppliers;
    }, [suppliers, activeTab]);

    const renderSkeletons = (count = 6) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <Card key={index} className="flex flex-col border-l-4 border-gray-200 dark:border-gray-700">
                    <CardHeader className="p-4 pb-3">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                    </CardHeader>
                    <CardContent className="p-4 pt-2 pb-3 flex-grow">
                        <div className="flex gap-2 mb-3">
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    if (!loading && !animal) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-150px)] px-4">
                <Card className="w-full max-w-md text-center shadow-lg border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-2xl text-destructive flex items-center justify-center gap-2">
                            <AlertTriangle className="h-6 w-6" />
                            Animal Not Found
                        </CardTitle>
                        <CardDescription>
                            We couldn't find the animal associated with this ID.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-6">
                            Please check the ID or navigate back to the animals list.
                        </p>
                        <Button variant="outline" onClick={() => navigate('/animals')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Animals
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <TooltipProvider delayDuration={150}>
            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-full flex-shrink-0 h-10 w-10" onClick={() => navigate(`/animals/${id}`)} disabled={!animal}>
                                    <ArrowLeft className="h-5 w-5" />
                                    <span className="sr-only">Back</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Back to {animal?.name || 'Animal'}'s Details</p></TooltipContent>
                        </Tooltip>
                        <div className="flex items-center gap-3">
                            {loading && !animal ? (
                                <Skeleton className="h-12 w-12 rounded-full" />
                            ) : (
                                <Avatar className="h-12 w-12 border">
                                    <AvatarFallback className="text-lg bg-muted">{animal?.name?.charAt(0)?.toUpperCase() ?? '?'}</AvatarFallback>
                                </Avatar>
                            )}
                            <div>
                                {loading && !animal ? (
                                    <>
                                        <Skeleton className="h-6 w-40 mb-1.5" />
                                        <Skeleton className="h-4 w-60" />
                                    </>
                                ) : (
                                    <>
                                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                            {animal?.name}'s Suppliers
                                        </h1>
                                        <p className="text-sm text-muted-foreground">
                                            View and manage suppliers for {animal?.name}.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button onClick={handleAddSupplier} disabled={loading || !animal} className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Supplier
                        </Button>
                        <Button onClick={generatePDF} variant="outline" disabled={loading || !animal} className="w-full sm:w-auto">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                </header>

                <Separator className="mb-6" />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto mb-6 h-auto p-1.5">
                        <TabsTrigger value="all" className="py-1.5 text-xs sm:text-sm">All <Badge variant="secondary" className="ml-1.5 px-1.5">{supplierCounts.all}</Badge></TabsTrigger>
                        <TabsTrigger value="active" className="py-1.5 text-xs sm:text-sm">Active <Badge variant="secondary" className="ml-1.5 px-1.5">{supplierCounts.active}</Badge></TabsTrigger>
                        <TabsTrigger value="inactive" className="py-1.5 text-xs sm:text-sm">Inactive <Badge variant="secondary" className="ml-1.5 px-1.5">{supplierCounts.inactive}</Badge></TabsTrigger>
                        <TabsTrigger value="expired" className="py-1.5 text-xs sm:text-sm">Expired <Badge variant={supplierCounts.expired > 0 ? "destructive" : "secondary"} className="ml-1.5 px-1.5">{supplierCounts.expired}</Badge></TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab}>
                        {isInitialLoad ? (
                            renderSkeletons()
                        ) : filteredSuppliers.length === 0 ? (
                            <Card className="border-dashed border-border shadow-none mt-8">
                                <CardContent className="py-12 flex flex-col items-center text-center">
                                    <div className="p-3 rounded-full bg-muted mb-4">
                                        {activeTab === 'all' && <Inbox className="h-10 w-10 text-muted-foreground" />}
                                        {activeTab === 'active' && <CheckCircle2 className="h-10 w-10 text-green-500" />}
                                        {activeTab === 'inactive' && <XCircle className="h-10 w-10 text-red-500" />}
                                        {activeTab === 'expired' && <AlertTriangle className="h-10 w-10 text-red-500" />}
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground mb-1">
                                        No {activeTab !== 'all' ? `${activeTab} ` : ''}Suppliers Found
                                    </h3>
                                    <p className="text-muted-foreground mb-6 max-w-sm">
                                        {activeTab === 'all'
                                            ? `There are currently no suppliers recorded for ${animal?.name ?? 'this animal'}. Add one!`
                                            : `No suppliers match the filter "${activeTab}".`}
                                    </p>
                                    {activeTab === 'all' && (
                                        <Button onClick={handleAddSupplier} disabled={!animal}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add First Supplier
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div ref={pdfContentRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {filteredSuppliers.map((supplier) => (
                                    <SupplierCard
                                        key={supplier.id}
                                        supplier={supplier}
                                        animalId={id!}
                                        onEdit={handleEditSupplier}
                                        onDelete={handleDeleteClick}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" /> Confirm Deletion
                            </DialogTitle>
                            <DialogDescription className="pt-2">
                                Are you sure you want to permanently delete the supplier: <br />
                                <strong className="px-1 text-foreground">{supplierToDelete?.name || 'this supplier'}</strong>?
                                <br /> This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 gap-2 flex-col-reverse sm:flex-row sm:justify-end">
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button variant="destructive" onClick={handleConfirmDelete}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Supplier
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
};

export default AnimalSuppliers;