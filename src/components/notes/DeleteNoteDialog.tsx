import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import Spinner from '@/components/ui/Spinner';
import { Note } from '@/services/noteApi';

interface DeleteNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteToDelete: Note | null;
  isDeleting: boolean;
  deleteError: string | null;
  onConfirmDelete: () => void;
}

const DeleteNoteDialog: React.FC<DeleteNoteDialogProps> = ({
  open,
  onOpenChange,
  noteToDelete,
  isDeleting,
  deleteError,
  onConfirmDelete,
}) => (
  <Dialog open={open} onOpenChange={(openState) => {
    if (!isDeleting) {
      onOpenChange(openState);
    }
  }}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="text-xl flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-destructive" /> Confirm Deletion
        </DialogTitle>
        <DialogDescription className="pt-2">
          Are you sure you want to permanently delete the note: <br />
          <strong className="px-1 text-foreground">{noteToDelete?.category || 'this note'}</strong>?
          <br /> This action cannot be undone.
          {deleteError && (
            <p className="text-destructive text-sm mt-2">{deleteError}</p>
          )}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="mt-4 gap-2 flex-col-reverse sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirmDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Spinner />
              <span className="ml-2">Deleting...</span>
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Note
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default DeleteNoteDialog;