// components/ProductionCard.tsx
import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    Edit, Trash2, Calendar, Clock, Tag, BarChart3, User, DollarSign, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Production } from '@/services/animalProductionApi';
import { 
    getQualityStyles, 
    getStatusIcon, 
    formatDateTime, 
    formatRelativeTime, 
    isOrganic 
} from '../helpers/productionHelpers';

interface ProductionCardProps {
    production: Production;
    animalId: string;
    onEdit: (production: Production) => void;
    onDelete: (production: Production) => void;
}

const ProductionCard: React.FC<ProductionCardProps> = ({ 
    production, 
    animalId, 
    onEdit, 
    onDelete 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { 
        borderClass: qualityBorderClass, 
        iconColorClass: qualityIconColor, 
        badgeStyle: qualityBadgeStyle 
    } = getQualityStyles(production.quality_status);
    
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

export default ProductionCard;