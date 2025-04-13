import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, Plus, FileText, Calendar, Edit, Trash2, Heart, MoreVertical, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchAnimal } from '@/services/animalService';
import { fetchHealthRecords, deleteHealthRecord, Health } from '@/services/healthservice';
import { Animal } from '@/types/AnimalTypes';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, format, isValid, differenceInDays } from 'date-fns';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';

// --- Health Interface ---
interface Health {
  Health_id: number;
  health_status: string;
  vaccination_status?: string;
  neutered_spayed: boolean;
  last_vet_visit?: string;
  dietary_restrictions?: string;
  medical_history?: Record<string, string>;
  regular_medication?: string[];
  notes?: string[];
  created_at: string;
}

// --- HealthCard Sub-Component ---
interface HealthCardProps {
  health: Health;
  animalId: string;
  onEdit: () => void;
  onDelete: () => void;
  onViewContent: (content: string, title: string) => void;
}

const HealthCard: React.FC<HealthCardProps> = ({ health, animalId, onEdit, onDelete, onViewContent }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return { bg: 'bg-background', text: 'text-green-600', border: 'border-green-400', ring: 'text-green-500', progress: 100 };
      case 'sick':
        return { bg: 'bg-background', text: 'text-red-600', border: 'border-red-400', ring: 'text-red-500', progress: 50 };
      case 'recovering':
        return { bg: 'bg-background', text: 'text-yellow-600', border: 'border-yellow-400', ring: 'text-yellow-500', progress: 75 };
      case 'critical':
        return { bg: 'bg-background', text: 'text-orange-600', border: 'border-orange-400', ring: 'text-orange-500', progress: 25 };
      default:
        return { bg: 'bg-background', text: 'text-gray-600', border: 'border-gray-400', ring: 'text-gray-500', progress: 0 };
    }
  };

  const statusStyle = getStatusStyle(health.health_status);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return 'Invalid date';
      return format(date, 'MMMM d, yyyy');
    } catch {
      return 'Not specified';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const daysSinceVetVisit = health.last_vet_visit
    ? differenceInDays(new Date(), new Date(health.last_vet_visit))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`group relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border ${statusStyle.border} backdrop-blur-sm bg-background/90`}
      >
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/80 hover:bg-background"
                aria-label="Health record actions"
              >
                <MoreVertical className="h-4 w-4 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardHeader className="p-4 pb-2 flex items-center gap-4">
          {/* Health Status Ring */}
          <div className="relative flex-shrink-0">
            <svg className="w-12 h-12" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted-foreground/20"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${statusStyle.progress}, 100`}
                className={statusStyle.ring}
              />
            </svg>
            <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-foreground" />
          </div>

          <div className="flex-1">
            <CardTitle className={`text-lg font-semibold ${statusStyle.text} group-hover:text-primary transition-colors`}>
              {health.health_status}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground flex gap-x-3 gap-y-1 flex-wrap mt-1">
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Created {formatDistanceToNow(new Date(health.created_at), { addSuffix: true })}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Creation Date</TooltipContent>
              </Tooltip>
              {health.vaccination_status && (
                <Badge variant="secondary" className="text-xs">
                  {health.vaccination_status}
                </Badge>
              )}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <div className="space-y-3">
            {/* Basic Info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Neutered/Spayed</span>
              <Badge variant="outline" className="text-xs font-medium">
                {health.neutered_spayed ? 'Yes' : 'No'}
              </Badge>
            </div>
            {health.last_vet_visit && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Vet Visit</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium transition-transform duration-300 hover:scale-105 ${
                        daysSinceVetVisit && daysSinceVetVisit > 365 ? 'border-red-400 text-red-600' : ''
                      }`}
                    >
                      {formatDate(health.last_vet_visit)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {daysSinceVetVisit
                      ? `${daysSinceVetVisit} days since last visit`
                      : 'Vet visit date'}
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Collapsible Details */}
            <motion.div
              className="border-t border-muted pt-3"
              initial={false}
              animate={{ height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              <button
                className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                aria-expanded={isDetailsOpen}
                aria-controls="health-details"
              >
                <span>More Details</span>
                {isDetailsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              <AnimatePresence>
                {isDetailsOpen && (
                  <motion.div
                    id="health-details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 space-y-3"
                  >
                    {health.dietary_restrictions && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Dietary Restrictions</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {health.dietary_restrictions.length > 150 ? (
                            <>
                              {truncateText(health.dietary_restrictions, 150)}
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 ml-1 text-primary"
                                onClick={() => onViewContent(health.dietary_restrictions, 'Dietary Restrictions')}
                              >
                                Read More
                              </Button>
                            </>
                          ) : (
                            health.dietary_restrictions
                          )}
                        </p>
                      </div>
                    )}
                    {health.medical_history && Object.keys(health.medical_history).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Medical History</h4>
                        <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                          {Object.entries(health.medical_history).map(([date, note], index) => {
                            const noteText = `${formatDate(date)}: ${note}`;
                            return (
                              <li key={index}>
                                {noteText.length > 150 ? (
                                  <>
                                    {truncateText(noteText, 150)}
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="h-auto p-0 ml-1 text-primary"
                                      onClick={() => onViewContent(noteText, `Medical History - ${formatDate(date)}`)}
                                    >
                                      Read More
                                    </Button>
                                  </>
                                ) : (
                                  noteText
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {health.regular_medication?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Regular Medication</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {health.regular_medication.map((med, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                              onClick={() => onViewContent(med, `Medication: ${med}`)}
                            >
                              {med}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {health.notes?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Notes</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {health.notes.map((note, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                              onClick={() => onViewContent(note, `Note ${index + 1}`)}
                            >
                              {truncateText(note, 20)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// --- Skeleton Component ---
const HealthSkeleton = () => (
  <Card className="flex flex-col border-l-4 border-gray-200 dark:border-gray-700 shadow-md animate-pulse bg-background">
    <CardHeader className="p-4 pb-2 flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-1/3 mb-1" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </CardHeader>
    <CardContent className="p-4 pt-0 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>
      <Skeleton className="h-6 w-1/2" />
    </CardContent>
  </Card>
);

// --- Main AnimalHealth Component ---
const AnimalHealth: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [healthRecords, setHealthRecords] = useState<Health[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [healthToDelete, setHealthToDelete] = useState<Health | null>(null);
  const [contentDialogOpen, setContentDialogOpen] = useState<boolean>(false);
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    if (!id) {
      navigate('/animals');
      return;
    }

    const loadData = async () => {
      setIsFetching(true);
      try {
        const [animalData, healthData] = await Promise.all([
          fetchAnimal(id),
          fetchHealthRecords(id),
        ]);
        setAnimal(animalData);
        setHealthRecords(healthData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load animal health data');
      } finally {
        setIsFetching(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const handleDeleteClick = (health: Health) => {
    setHealthToDelete(health);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!healthToDelete || !id) return;

    try {
      await deleteHealthRecord(id, healthToDelete.Health_id);
      setHealthRecords((prev) => prev.filter((h) => h.Health_id !== healthToDelete.Health_id));
      toast.success('Health record deleted successfully');
    } catch (error) {
      console.error('Error deleting health record:', error);
      toast.error('Failed to delete health record');
    } finally {
      setDeleteDialogOpen(false);
      setHealthToDelete(null);
    }
  };

  const handleAddHealthRecord = () => {
    if (!id) return;
    navigate(`/animals/${id}/health/new`);
  };

  const handleEditHealthRecord = (healthId: number) => {
    if (!id || !healthId) return;
    navigate(`/animals/${id}/health/${healthId}/edit`);
  };

  const handleViewContent = (content: string, title: string) => {
    setSelectedContent(content);
    setSelectedTitle(title);
    setContentDialogOpen(true);
  };

  const statusCounts = useMemo(() => {
    const counts = { all: healthRecords.length, healthy: 0, sick: 0, recovering: 0, critical: 0 };
    healthRecords.forEach((h) => {
      const status = h.health_status.toLowerCase();
      if (status in counts) counts[status]++;
    });
    return counts;
  }, [healthRecords]);

  const filteredHealthRecords = useMemo(() => {
    if (activeTab === 'all') return healthRecords;
    return healthRecords.filter((h) => h.health_status.toLowerCase() === activeTab);
  }, [healthRecords, activeTab]);

  if (isFetching) {
    return (
      <TooltipProvider delayDuration={150}>
        <div className="min-h-screen bg-background py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-60" />
                </div>
              </div>
              <Skeleton className="h-10 w-full sm:w-32" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <HealthSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  if (!animal) {
    return (
      <TooltipProvider delayDuration={150}>
        <div className="min-h-screen bg-background flex items-center justify-center py-6 px-4">
          <Card className="border-border shadow-md w-full max-w-md bg-background">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-destructive">Oops!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base text-muted-foreground">
                Animal not found.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/animals')}
                className="w-full border-primary text-primary hover:bg-primary/10 h-10 sm:h-12"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Animals
              </Button>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-10 w-10"
                    onClick={() => navigate(`/animals/${id}`)}
                    aria-label="Back to animal details"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Back to {animal.name}'s Details</p>
                </TooltipContent>
              </Tooltip>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Health Records for {animal.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track and manage health information for {animal.name}.
                </p>
              </div>
            </div>
            <Button onClick={handleAddHealthRecord} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Health Record
            </Button>
          </header>

          {/* Status Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full sm:w-auto mb-6 h-auto p-1.5">
              <TabsTrigger value="all" className="py-1.5 text-xs sm:text-sm">
                All <Badge variant="secondary" className="ml-1.5 px-1.5">{statusCounts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="healthy" className="py-1.5 text-xs sm:text-sm">
                Healthy <Badge variant="secondary" className="ml-1.5 px-1.5">{statusCounts.healthy}</Badge>
              </TabsTrigger>
              <TabsTrigger value="sick" className="py-1.5 text-xs sm:text-sm">
                Sick <Badge variant="secondary" className="ml-1.5 px-1.5">{statusCounts.sick}</Badge>
              </TabsTrigger>
              <TabsTrigger value="recovering" className="py-1.5 text-xs sm:text-sm">
                Recovering <Badge variant="secondary" className="ml-1.5 px-1.5">{statusCounts.recovering}</Badge>
              </TabsTrigger>
              <TabsTrigger value="critical" className="py-1.5 text-xs sm:text-sm">
                Critical <Badge variant="secondary" className="ml-1.5 px-1.5">{statusCounts.critical}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredHealthRecords.length === 0 ? (
                <Card className="border-dashed border-border shadow-none mt-8 bg-background">
                  <CardContent className="py-12 flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-muted mb-4">
                      <Heart className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      No {activeTab !== 'all' ? `${activeTab} ` : ''}Health Records Found
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      {activeTab === 'all'
                        ? `There are currently no health records for ${animal.name}. Add one!`
                        : `No health records match the filter "${activeTab}".`}
                    </p>
                    {activeTab === 'all' && (
                      <Button onClick={handleAddHealthRecord}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Health Record
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredHealthRecords.map((health) => (
                    <HealthCard
                      key={health.Health_id}
                      health={health}
                      animalId={id!}
                      onEdit={() => handleEditHealthRecord(health.Health_id)}
                      onDelete={() => handleDeleteClick(health)}
                      onViewContent={handleViewContent}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px] bg-background">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-destructive" /> Confirm Deletion
                </DialogTitle>
                <DialogDescription className="pt-2">
                  Are you sure you want to permanently delete this health record? <br />
                  <strong className="px-1 text-foreground">{healthToDelete?.health_status}</strong>?
                  <br /> This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 gap-2 flex-col-reverse sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  aria-label="Cancel deletion"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  aria-label="Confirm deletion"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Content View Dialog */}
          <Dialog open={contentDialogOpen} onOpenChange={setContentDialogOpen}>
            <DialogContent className="sm:max-w-[600px] bg-background">
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedTitle}</DialogTitle>
              </DialogHeader>
              <div className="mt-2">
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{selectedContent}</p>
              </div>
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setContentDialogOpen(false)}
                  aria-label="Close content dialog"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AnimalHealth;