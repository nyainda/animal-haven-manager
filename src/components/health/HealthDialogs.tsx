import React from 'react';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HealthRecord } from '@/types/HealthTypes';

interface HealthDialogsProps {
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  healthToDelete: HealthRecord | null;
  onConfirmDelete: () => void;
  contentDialogOpen: boolean;
  setContentDialogOpen: (open: boolean) => void;
  selectedContent: string;
  selectedTitle: string;
}

export const HealthDialogs: React.FC<HealthDialogsProps> = ({
  deleteDialogOpen,
  setDeleteDialogOpen,
  healthToDelete,
  onConfirmDelete,
  contentDialogOpen,
  setContentDialogOpen,
  selectedContent,
  selectedTitle,
}) => {
  return (
    <>
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
              onClick={onConfirmDelete}
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
    </>
  );
};