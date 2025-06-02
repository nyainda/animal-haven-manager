import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface ContentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
}

const ContentViewDialog: React.FC<ContentViewDialogProps> = ({
  open,
  onOpenChange,
  title,
  content,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="text-xl">{title}</DialogTitle>
      </DialogHeader>
      <div className="mt-2">
        <p className="text-sm text-foreground/90 whitespace-pre-wrap">
          {content}
        </p>
      </div>
      <DialogFooter className="mt-4">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ContentViewDialog;