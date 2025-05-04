import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ArrowLeft, Plus, Calendar, Edit, Trash2, AlertTriangle, Clock, Tag, BarChart3, CheckCircle2, XCircle, Download, DollarSign, User, ChevronLeft, ChevronRight, MoreVertical, Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAnimal } from '@/services/animalService';
import { fetchProductions, deleteProduction, updateProduction, Production, ProductionFormData } from '@/services/animalProductionApi';
import { Animal } from '@/types/AnimalTypes';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
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

const getQualityStyles = (status?: string): { borderClass: string; iconColorClass: string; badgeStyle: BadgeStyleProps } => {
    const baseStyle: BadgeStyleProps = { bgClass: '', textClass: '', borderClass: '' };
    switch (status?.toLowerCase()) {
        case 'passed':
            return { borderClass: 'border-l-4 border-green-500', iconColorClass: 'text-green-500', badgeStyle: { ...baseStyle, bgClass: 'bg-green-100', textClass: 'text-green-800', borderClass: 'border-green-500' } };
        case 'failed':
            return { borderClass: 'border-l-4 border-red-500', iconColorClass: 'text-red-500', badgeStyle: { ...baseStyle, bgClass: 'bg-red-100', textClass: 'text-red-800', borderClass: 'border-red-500' } };
        case 'pending':
            return { borderClass: 'border-l-4 border-yellow-500', iconColorClass: 'text-yellow-500', badgeStyle: { ...baseStyle, bgClass: 'bg-yellow-100', textClass: 'text-yellow-800', borderClass: 'border-yellow-500' } };
        default:
            return { borderClass: 'border-l-4 border-gray-300 dark:border-gray-600', iconColorClass: 'text-gray-500', badgeStyle: { ...baseStyle, bgClass: 'bg-gray-100', textClass: 'text-gray-800', borderClass: 'border-gray-500' } };
    }
};

const getStatusIcon = (status?: string): React.ReactNode => {
    switch (status?.toLowerCase()) {
        case 'passed': return <CheckCircle2 className="h-3 w-3 mr-1" />;
        case 'failed': return <XCircle className="h-3 w-3 mr-1" />;
        case 'pending': return <AlertTriangle className="h-3 w-3 mr-1" />;
        default: return null;
    }
};

const formatDateTime = (dateStr: string, timeStr: string): string => {
    try {
        const date = parseISO(dateStr);
        const [hours, minutes, seconds] = timeStr.split(':');
        const dateTime = new Date(date.setUTCHours(parseInt(hours), parseInt(minutes), parseInt(seconds.split('.')[0])));
        return format(dateTime, 'MMM d, yyyy, h:mm a');
    } catch (error) {
        console.error('Error formatting date-time:', error, { dateStr, timeStr });
        return `${dateStr.split('T')[0]} ${timeStr.split('.')[0]}`;
    }
};

const formatRelativeTime = (dateStr: string): string => {
    try {
        return formatDistanceToNowStrict(parseISO(dateStr), { addSuffix: true });
    } catch {
        return 'Unknown time';
    }
};

const isOrganic = (isOrganic?: boolean): string => (isOrganic ? 'Organic' : 'Non-Organic');

// --- ProductionCard Sub-Component ---

interface ProductionCardProps {
    production: Production;
    animalId: string;
    onEdit: (production: Production) => void;
    onDelete: (production: Production) => void;
}

const ProductionCard: React.FC<ProductionCardProps> = ({ production, animalId, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { borderClass: qualityBorderClass, iconColorClass: qualityIconColor, badgeStyle: qualityBadgeStyle } = getQualityStyles(production.quality_status);
    
    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        console.log('[ProductionCard] Edit clicked:', {
            animalId,
            yield_id: production.yield_id,
            id: production.id,
            trace_number: production.trace_number,
        });
        if (!production.yield_id) {
            console.error('[ProductionCard] Missing yield_id for production:', production);
            toast.error('Cannot edit: Production ID is missing.');
            return;
        }
        onEdit(production);
    };
    
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        console.log('[ProductionCard] Delete clicked:', {
            animalId,
            yield_id: production.yield_id,
            id: production.id,
            trace_number: production.trace_number,
        });
        if (!production.yield_id && !production.id) {
            console.error('[ProductionCard] Missing both yield_id and id for production:', production);
            toast.error('Cannot delete: Production ID is missing.');
            return;
        }
        onDelete(production);
    };
    
    const description = production.notes || `${production.quantity} ${production.product_category.measurement_unit}`;
    const isLongDescription = description.length > 150;

    const formattedDateTime = formatDateTime(production.production_date, production.production_time);
    const relativeTime = formatRelativeTime(production.production_date);

    return (
        <Card
            className={`group relative overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out flex flex-col h-full ${qualityBorderClass} border-border`}
        >
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-background/70 backdrop-blur-sm">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="sr-only">Production Actions</span>
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
                        {production.product_category.name} - {production.trace_number}
                    </CardTitle>
                    {production.quality_status && (
                        <Tooltip>
                            <TooltipTrigger>
                                <BarChart3 className={`h-4 w-4 flex-shrink-0 ${qualityIconColor} transform rotate-90`} />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Quality: {production.quality_status}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
                <CardDescription className="text-xs text-muted-foreground flex items-center gap-x-3 gap-y-1 flex-wrap">
                    <Tooltip>
                        <TooltipTrigger className="flex items-center cursor-default">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                            <span>{formattedDateTime}</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Production Date & Time</p>
                            <p>Relative: {relativeTime}</p>
                            <p>Raw: {production.production_date} {production.production_time}</p>
                        </TooltipContent>
                    </Tooltip>
                    <span className="text-muted-foreground/50 hidden sm:inline">•</span>
                    <Tooltip>
                        <TooltipTrigger className="flex items-center cursor-default">
                            <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                            <span>Created {formatRelativeTime(production.created_at)}</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Creation Date</TooltipContent>
                    </Tooltip>
                </CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-2 pb-3 flex-grow">
                <div className="flex flex-wrap gap-2 mb-3">
                    {production.product_grade?.name && (
                        <Badge variant="secondary" className="text-xs font-medium">
                            <Tag className="h-3 w-3 mr-1.5" />
                            {production.product_grade.name}
                        </Badge>
                    )}
                    {production.quality_status && (
                        <Badge
                            variant="outline"
                            className={`text-xs font-medium flex items-center ${qualityBadgeStyle.bgClass} ${qualityBadgeStyle.textClass} ${qualityBadgeStyle.borderClass}`}
                        >
                            {getStatusIcon(production.quality_status)}
                            {production.quality_status}
                        </Badge>
                    )}
                    <Badge variant="outline" className="text-xs font-medium">
                        {isOrganic(production.is_organic)}
                    </Badge>
                </div>

                <div>
                    <p
                        className={`text-sm text-foreground/90 whitespace-pre-wrap ${!production.notes ? 'text-muted-foreground italic' : ''} ${!isExpanded && isLongDescription ? 'line-clamp-3' : ''}`}
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

                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <div className="flex items-center">
                        <User className="h-3.5 w-3.5 mr-1.5" />
                        <span><strong>Collector:</strong> {production.collector?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center">
                        <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                        <span><strong>Total:</strong> ${production.total_price || '0'} (${production.price_per_unit || '0'}/unit)</span>
                    </div>
                    <div className="flex items-center">
                        <Tag className="h-3.5 w-3.5 mr-1.5" />
                        <span><strong>Method:</strong> {production.production_method?.method_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                        <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                        <span><strong>Storage:</strong> {production.storage_location?.name || 'N/A'} ({production.storage_location?.location_code || 'N/A'})</span>
                    </div>
                    {production.weather_conditions && (
                        <div className="flex items-center">
                            <Tag className="h-3.5 w-3.5 mr-1.5" />
                            <span><strong>Weather:</strong> {production.weather_conditions.temperature}°C, {production.weather_conditions.humidity}%</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

// --- Main AnimalProductions Component ---

const AnimalProductions: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [productions, setProductions] = useState<Production[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
    const [productionToDelete, setProductionToDelete] = useState<Production | null>(null);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);
    const pdfContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!id) {
            console.error('[AnimalProductions] Missing animal ID');
            toast.error('Animal ID is missing.');
            navigate('/animals');
            return;
        }
        
        let isMounted = true;
        
        const loadData = async () => {
            try {
                setLoading(true);
                
                let animalData;
                try {
                    animalData = await fetchAnimal(id);
                    console.log('[AnimalProductions] Animal data fetched:', animalData);
                } catch (animalError: any) {
                    console.error('[AnimalProductions] Error fetching animal:', animalError);
                    if (isMounted) {
                        toast.error(`Failed to load animal: ${animalError.message || 'Unknown error'}`);
                        navigate('/animals');
                    }
                    return;
                }
                
                let productionsData;
                try {
                    productionsData = await fetchProductions(id);
                    console.log('[AnimalProductions] Productions data fetched:', productionsData.length, 'records');
                } catch (productionsError: any) {
                    console.error('[AnimalProductions] Error fetching productions:', productionsError);
                    if (isMounted) {
                        toast.error(`Failed to load productions: ${productionsError.message || 'Unknown error'}`);
                        setAnimal(animalData);
                        setProductions([]);
                        setLoading(false);
                        setIsInitialLoad(false);
                    }
                    return;
                }
                
                if (isMounted) {
                    setAnimal(animalData);
                    setProductions(productionsData.sort((a, b) => 
                        parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime()
                    ));
                    
                    if (!productionsData.length) {
                        console.log('[AnimalProductions] No production records found');
                        toast.info('No production records found.');
                    }
                }
            } catch (error: any) {
                console.error('[AnimalProductions] Error in loadData:', error);
                if (isMounted) {
                    toast.error(`Failed to load data: ${error.message || 'Check your network or authentication.'}`);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setIsInitialLoad(false);
                }
            }
        };
        
        loadData();
        return () => { isMounted = false; };
    }, [id, navigate, location.state?.refresh]);

    const handleDeleteClick = useCallback((production: Production) => {
        console.log('[AnimalProductions] Delete clicked:', {
            yield_id: production.yield_id,
            id: production.id,
            trace_number: production.trace_number,
        });
        setProductionToDelete(production);
        setDeleteConfirmOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        const productionId = productionToDelete?.yield_id || productionToDelete?.id;
        
        if (!productionId || !id) {
            console.error('[AnimalProductions] Missing production ID or animal ID:', {
                productionId,
                animalId: id,
            });
            toast.error('Missing production ID or animal ID');
            setDeleteConfirmOpen(false);
            return;
        }
        
        const originalProductions = [...productions];
        setProductions(prev => prev.filter(p => (p.yield_id !== productionId && p.id !== productionId)));
        setDeleteConfirmOpen(false);
        
        try {
            await deleteProduction(id, productionId);
            console.log('[AnimalProductions] Production deleted:', productionId);
            setProductionToDelete(null);
        } catch (error: any) {
            console.error('[AnimalProductions] Error deleting production:', error);
            toast.error(`Failed to delete production: ${error.message || 'Operation failed.'}`);
            setProductions(originalProductions);
        }
    }, [id, productionToDelete, productions]);

    const handleAddProduction = useCallback(() => {
        if (!id) {
            console.error('[AnimalProductions] Missing animal ID for new production');
            toast.error('Animal ID is missing');
            return;
        }
        console.log('[AnimalProductions] Navigating to new production form:', { animalId: id });
        navigate(`/animals/${id}/production/new`);
    }, [id, navigate]);

    const handleEditProduction = useCallback((production: Production) => {
        if (!id) {
            console.error('[AnimalProductions] Missing animal ID');
            toast.error('Animal ID is missing');
            return;
        }
        
        if (!production.yield_id) {
            console.error('[AnimalProductions] Missing yield_id for production:', {
                id: production.id,
                trace_number: production.trace_number,
            });
            toast.error('Cannot edit: Production ID is missing');
            return;
        }
        
        console.log('[AnimalProductions] Navigating to edit production:', {
            animalId: id,
            yield_id: production.yield_id,
            trace_number: production.trace_number,
            stateProduction: {
                product_category: production.product_category,
                quantity: production.quantity,
                animal_type: production.animal_type,
                breed: production.breed,
            },
        });
        
        navigate(`/animals/${id}/production/${production.yield_id}/edit`, {
            state: {
                production: {
                    ...production,
                    animal_type: production.animal_type || animal?.animal_type || '',
                    breed: production.breed || animal?.breed || '',
                },
            },
        });
    }, [id, animal, navigate]);

    const generatePDF = useCallback(async () => {
        if (!pdfContentRef.current || !animal) {
            console.error('[AnimalProductions] Missing PDF content or animal data');
            toast.error('Cannot generate PDF: Missing data');
            return;
        }
        try {
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
            pdf.text(`Animal ID: ${animal.id} | Location: ${productions[0]?.storage_location?.location_code || 'N/A'} | Generated on: ${format(new Date(), 'PPPp')}`, 10, 28);

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
            console.log('[AnimalProductions] PDF generated successfully');
            toast.success('PDF report generated successfully');
        } catch (error: any) {
            console.error('[AnimalProductions] Error generating PDF:', error);
            toast.error('Failed to generate PDF');
        }
    }, [animal, productions]);

    const productionCounts = useMemo(() => {
        const counts = { 
            all: productions.length, 
            organic: 0, 
            recent: 0, 
            highValue: 0 
        };
        productions.forEach(p => {
            if (p.is_organic) counts.organic++;
            if (isPast(parseISO(p.production_date)) && (new Date().getTime() - parseISO(p.production_date).getTime()) / (1000 * 60 * 60 * 24) <= 30) counts.recent++;
            if (parseFloat(p.total_price || '0') > 100) counts.highValue++;
        });
        return counts;
    }, [productions]);

    const filteredProductions = useMemo(() => {
        const lowerCaseTab = activeTab.toLowerCase();
        if (lowerCaseTab === 'all') return productions;
        if (lowerCaseTab === 'organic') return productions.filter(p => p.is_organic);
        if (lowerCaseTab === 'recent') return productions.filter(p => isPast(parseISO(p.production_date)) && (new Date().getTime() - parseISO(p.production_date).getTime()) / (1000 * 60 * 60 * 24) <= 30);
        if (lowerCaseTab === 'highvalue') return productions.filter(p => parseFloat(p.total_price || '0') > 100);
        return productions;
    }, [productions, activeTab]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProductions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProductions.length / itemsPerPage);

    const handleNextPage = useCallback(() => currentPage < totalPages && setCurrentPage(prev => prev + 1), [currentPage, totalPages]);
    const handlePrevPage = useCallback(() => currentPage > 1 && setCurrentPage(prev => prev - 1), [currentPage]);

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
                                            {animal?.name}'s Production
                                        </h1>
                                        <p className="text-sm text-muted-foreground">
                                            Type: {animal?.type || 'N/A'} | Breed: {animal?.breed || 'N/A'} | Location: {productions[0]?.storage_location?.location_code || 'N/A'}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button onClick={handleAddProduction} disabled={loading || !animal} className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Production
                        </Button>
                        <Button onClick={generatePDF} variant="outline" disabled={loading || !animal || !productions.length} className="w-full sm:w-auto">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                </header>

                <Separator className="mb-6" />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto mb-6 h-auto p-1.5">
                        <TabsTrigger value="all" className="py-1.5 text-xs sm:text-sm">All <Badge variant="secondary" className="ml-1.5 px-1.5">{productionCounts.all}</Badge></TabsTrigger>
                        <TabsTrigger value="organic" className="py-1.5 text-xs sm:text-sm">Organic <Badge variant="secondary" className="ml-1.5 px-1.5">{productionCounts.organic}</Badge></TabsTrigger>
                        <TabsTrigger value="recent" className="py-1.5 text-xs sm:text-sm">Recent <Badge variant="secondary" className="ml-1.5 px-1.5">{productionCounts.recent}</Badge></TabsTrigger>
                        <TabsTrigger value="highValue" className="py-1.5 text-xs sm:text-sm">High Value <Badge variant="secondary" className="ml-1.5 px-1.5">{productionCounts.highValue}</Badge></TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab}>
                        {isInitialLoad ? (
                            renderSkeletons()
                        ) : currentItems.length === 0 ? (
                            <Card className="border-dashed border-border shadow-none mt-8">
                                <CardContent className="py-12 flex flex-col items-center text-center">
                                    <div className="p-3 rounded-full bg-muted mb-4">
                                        {activeTab === 'all' && <Inbox className="h-10 w-10 text-muted-foreground" />}
                                        {activeTab === 'organic' && <Tag className="h-10 w-10 text-green-500" />}
                                        {activeTab === 'recent' && <Clock className="h-10 w-10 text-blue-500" />}
                                        {activeTab === 'highValue' && <DollarSign className="h-10 w-10 text-yellow-500" />}
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground mb-1">
                                        No {activeTab !== 'all' ? `${activeTab} ` : ''}Production Records Found
                                    </h3>
                                    <p className="text-muted-foreground mb-6 max-w-sm">
                                        {activeTab === 'all'
                                            ? `There are currently no production records for ${animal?.name ?? 'this animal'}. Add one!`
                                            : `No production records match the filter "${activeTab}".`}
                                    </p>
                                    {activeTab === 'all' && (
                                        <Button onClick={handleAddProduction} disabled={!animal}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add First Production
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div ref={pdfContentRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {currentItems.map((production) => (
                                    <ProductionCard
                                        key={production.yield_id || production.id}
                                        production={production}
                                        animalId={id!}
                                        onEdit={handleEditProduction}
                                        onDelete={handleDeleteClick}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {filteredProductions.length > itemsPerPage && (
                    <div className="flex flex-col items-center gap-4 mt-6 sm:flex-row sm:justify-between">
                        <Button
                            variant="outline"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="w-full sm:w-auto"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages} ({filteredProductions.length} records)
                        </span>
                        <Button
                            variant="outline"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="w-full sm:w-auto"
                        >
                            Next <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                )}

                <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" /> Confirm Deletion
                            </DialogTitle>
                            <DialogDescription className="pt-2">
                                Are you sure you want to permanently delete the production record: <br />
                                <strong className="px-1 text-foreground">{productionToDelete?.product_category.name} - {productionToDelete?.trace_number}</strong>?
                                <br /> This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 gap-2 flex-col-reverse sm:flex-row sm:justify-end">
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button variant="destructive" onClick={handleConfirmDelete}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Production
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
};

export default AnimalProductions;
