import React from 'react';
import { Edit, Trash2, MoreVertical, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Note } from '@/services/noteApi';
import { getStatusBadgeStyle } from '@/utils/taskUtils';

interface NoteCardProps {
  note: Note;
  animalId: string;
  onEdit: (noteId: string) => void;
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
      if (note.notes_id) onEdit(note.notes_id);
      else console.warn("Note ID is missing for edit.", note);
    };
  
    const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(note);
    };
  
    const handleViewContent = () => {
      onViewContent(note.content || 'No content provided.', note.category || 'Note Details');
    };
  
    const content = note.content || 'No content provided.';
    const isLongContent = content.length > 150;
  
    const isExpired = note.due_date && isNoteExpired(note.due_date) && note.status?.toLowerCase() !== 'completed' && note.status?.toLowerCase() !== 'archived';
    const displayStatus = isExpired ? 'Expired' : note.status;
    const statusStyle = getStatusBadgeStyle(displayStatus);
  
    const isCompletedLate = note.due_date && isNoteExpired(note.due_date) && note.status?.toLowerCase() === 'completed';
  
    return (
      <Card
        className="group relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ease-in-out flex flex-col h-full border-l-4"
        style={{ borderColor: statusStyle.borderClass ? `var(--${statusStyle.borderClass.replace('border-', '')})` : 'hsl(var(--primary))' }} // Dynamic border color based on status or default
      >
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-background/70 backdrop-blur-sm hover:bg-muted">
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
          <CardTitle className="text-base font-semibold leading-tight pr-8 group-hover:text-primary transition-colors cursor-pointer" onClick={handleViewContent}>
            {note.category || 'Untitled Note'}
          </CardTitle>
          {note.due_date && (
            <CardDescription className="text-xs text-muted-foreground flex items-center gap-x-3 gap-y-1 flex-wrap pt-1">
                <Tooltip>
                  <TooltipTrigger className="flex items-center cursor-default">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span>
                      {formatDistanceToNow(new Date(note.due_date), { addSuffix: true })}
                      {isCompletedLate && <span className="text-orange-600 dark:text-orange-400"> (Completed late)</span>}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Due Date: {new Date(note.due_date).toLocaleDateString()}
                  </TooltipContent>
                </Tooltip>
            </CardDescription>
          )}
        </CardHeader>
  
        <CardContent className="p-4 pt-2 pb-3 flex-grow">
          <div className="flex flex-wrap gap-2 mb-3">
            {note.category && ( // Show category badge only if it's not the title itself
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
          <div className="cursor-pointer" onClick={handleViewContent}>
            <p
              className={`text-sm text-foreground/80 dark:text-foreground/70 whitespace-pre-wrap ${!note.content ? 'text-muted-foreground italic' : ''} line-clamp-3`}
            >
              {content}
            </p>
            {isLongContent && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 mt-1 text-primary text-xs"
                onClick={(e) => { e.stopPropagation(); handleViewContent(); }} // Prevent card click if button is distinct
              >
                Read More
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
};


export default NoteCard;