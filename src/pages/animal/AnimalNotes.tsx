import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, Plus, FileText, Calendar, Edit, Trash2, MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchAnimal } from '@/services/animalService';
import { fetchNotes, deleteNote, Note } from '@/services/noteApi';
import { Animal } from '@/types/AnimalTypes';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// --- NoteCard Sub-Component ---
interface NoteCardProps {
  note: Note;
  animalId: string;
  onEdit: (noteId: number) => void;
  onDelete: (note: Note) => void;
  onViewContent: (content: string, category: string) => void;
}

// Helper function to check if a note is expired
const isNoteExpired = (dueDate: string): boolean => {
  const currentDate = new Date();
  const noteDueDate = new Date(dueDate);
  return noteDueDate < currentDate;
};

const NoteCard: React.FC<NoteCardProps> = ({ note, animalId, onEdit, onDelete, onViewContent }) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    //if (note.notes_id) onEdit(note.notes_id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(note);
  };

  const handleViewContent = () => {
    onViewContent(note.content || 'No content provided.', note.category || 'Untitled Note');
  };

  const content = note.content || 'No content provided.';
  const isLongContent = content.length > 150;

  // Status badge styling
  const getStatusBadgeStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bgClass: 'bg-green-100', textClass: 'text-green-800', borderClass: 'border-green-500' };
      case 'pending':
        return { bgClass: 'bg-amber-100', textClass: 'text-amber-800', borderClass: 'border-amber-500' };
      case 'in progress':
        return { bgClass: 'bg-blue-100', textClass: 'text-blue-800', borderClass: 'border-blue-500' };
      case 'expired':
        return { bgClass: 'bg-red-100', textClass: 'text-red-800', borderClass: 'border-red-500' };
      default:
        return { bgClass: 'bg-gray-100', textClass: 'text-gray-800', borderClass: 'border-gray-500' };
    }
  };

  // Determine display status
  const isExpired = note.due_date && isNoteExpired(note.due_date) && note.status?.toLowerCase() !== 'completed' && note.status?.toLowerCase() !== 'archived';
  const displayStatus = isExpired ? 'Expired' : note.status;
  const statusStyle = getStatusBadgeStyle(displayStatus);

  // Check if completed late (for completed notes only)
  const isCompletedLate = note.due_date && isNoteExpired(note.due_date) && note.status?.toLowerCase() === 'completed';

  return (
    <Card
      className="group relative overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out flex flex-col h-full border-l-4 border-primary/50"
    >
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-background/70 backdrop-blur-sm">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Note Actions</span>
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
            {note.category || 'Untitled Note'}
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground flex items-center gap-x-3 gap-y-1 flex-wrap">
          <Tooltip>
            <TooltipTrigger className="flex items-center cursor-default">
              <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span>
                {formatDistanceToNow(new Date(note.due_date), { addSuffix: true })}
                {isCompletedLate && ' (Completed late)'}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Due Date
            </TooltipContent>
          </Tooltip>
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-2 pb-3 flex-grow">
        <div className="flex flex-wrap gap-2 mb-3">
          {note.category && (
            <Badge variant="secondary" className="text-xs font-medium">
              <FileText className="h-3 w-3 mr-1.5" />
              {note.category}
            </Badge>
          )}
          {displayStatus && (
            <Badge
              variant="outline"
              className={`text-xs font-medium flex items-center ${statusStyle.bgClass} ${statusStyle.textClass} ${statusStyle.borderClass}`}
            >
              {displayStatus}
            </Badge>
          )}
        </div>
        <div>
          <p
            className={`text-sm text-foreground/90 whitespace-pre-wrap ${!note.content ? 'text-muted-foreground italic' : ''} line-clamp-3`}
            onClick={isLongContent ? handleViewContent : undefined}
          >
            {content}
          </p>
          {isLongContent && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 mt-1 text-primary"
              onClick={handleViewContent}
            >
              Read More
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// --- Skeleton Component ---
const NoteSkeleton = () => (
  <Card className="flex flex-col border-l-4 border-gray-200 dark:border-gray-700 shadow-sm">
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
);

// --- Main AnimalNotes Component ---
const AnimalNotes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [contentDialogOpen, setContentDialogOpen] = useState<boolean>(false);
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');

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
        const notesData = await fetchNotes(id);
        setNotes(notesData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load animal data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const handleDeleteClick = (note: Note) => {
    setNoteToDelete(note);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete || !id) return;

    try {
      await deleteNote(id, noteToDelete.notes_id);
      setNotes(notes.filter(note => note.notes_id !== noteToDelete.notes_id));
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    } finally {
      setDeleteConfirmOpen(false);
      setNoteToDelete(null);
    }
  };

  const handleAddNote = () => {
    if (!id) return;
    navigate(`/animals/${id}/notes/new`);
  };

  const handleEditNote = (noteId: number) => {
    if (!id || !noteId) return;
    navigate(`/animals/${id}/notes/${noteId}/edit`);
  };

  const handleViewContent = (content: string, category: string) => {
    setSelectedContent(content);
    setSelectedCategory(category);
    setContentDialogOpen(true);
  };

  const noteCounts = useMemo(() => {
    const counts = { all: notes.length, pending: 0, completed: 0, archived: 0 };
    notes.forEach(note => {
      const status = note.status?.toLowerCase();
      if (status === 'pending') counts.pending++;
      if (status === 'completed') counts.completed++;
      if (status === 'archived') counts.archived++;
    });
    return counts;
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const lowerCaseTab = activeTab.toLowerCase();
    if (lowerCaseTab === 'all') return notes;
    return notes.filter(note => note.status?.toLowerCase() === lowerCaseTab);
  }, [notes, activeTab]);

  if (loading) {
    return (
      <TooltipProvider delayDuration={150}>
        <div className="bg-background min-h-screen py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
              <div className="flex items-center gap-3 flex-wrap">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-60" />
                </div>
              </div>
              <Skeleton className="h-10 w-full sm:w-32 sm:h-12" />
            </div>
            {/* Tabs Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
            {/* Notes Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <NoteSkeleton key={index} />
              ))}
            </div>
          </div>
          </div>
        </TooltipProvider>
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
    <TooltipProvider delayDuration={150}>
      <div className="bg-background min-h-screen py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full flex-shrink-0 h-10 w-10"
                    onClick={() => navigate(`/animals/${id}`)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Back</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Back to {animal.name}'s Details</p>
                </TooltipContent>
              </Tooltip>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Notes for {animal.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  View and manage notes for {animal.name}.
                </p>
              </div>
            </div>
            <Button onClick={handleAddNote} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </header>

          {/* Status Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto mb-6 h-auto p-1.5">
              <TabsTrigger value="all" className="py-1.5 text-xs sm:text-sm">
                All <Badge variant="secondary" className="ml-1.5 px-1.5">{noteCounts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="py-1.5 text-xs sm:text-sm">
                Pending <Badge variant="secondary" className="ml-1.5 px-1.5">{noteCounts.pending}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="py-1.5 text-xs sm:text-sm">
                Completed <Badge variant="secondary" className="ml-1.5 px-1.5">{noteCounts.completed}</Badge>
              </TabsTrigger>
              <TabsTrigger value="archived" className="py-1.5 text-xs sm:text-sm">
                Archived <Badge variant="secondary" className="ml-1.5 px-1.5">{noteCounts.archived}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredNotes.length === 0 ? (
                <Card className="border-dashed border-border shadow-none mt-8">
                  <CardContent className="py-12 flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-muted mb-4">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      No {activeTab !== 'all' ? `${activeTab} ` : ''}Notes Found
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      {activeTab === 'all'
                        ? `There are currently no notes for ${animal.name}. Add one!`
                        : `No notes match the filter "${activeTab}".`}
                    </p>
                    {activeTab === 'all' && (
                      <Button onClick={handleAddNote}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Note
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredNotes.map((note) => (
                    <NoteCard
                      key={note.notes_id}
                      note={note}
                      animalId={id!}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteClick}
                      onViewContent={handleViewContent}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-destructive" /> Confirm Deletion
                </DialogTitle>
                <DialogDescription className="pt-2">
                  Are you sure you want to permanently delete the note: <br />
                  <strong className="px-1 text-foreground">{noteToDelete?.category || 'this note'}</strong>?
                  <br /> This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 gap-2 flex-col-reverse sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Note
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Content View Dialog */}
          <Dialog open={contentDialogOpen} onOpenChange={setContentDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedCategory}</DialogTitle>
              </DialogHeader>
              <div className="mt-2">
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                  {selectedContent}
                </p>
              </div>
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setContentDialogOpen(false)}
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

export default AnimalNotes;