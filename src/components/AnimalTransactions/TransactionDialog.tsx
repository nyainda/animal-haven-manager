import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Edit, Calendar, FileText, Notebook } from 'lucide-react';
import { toast } from 'sonner';

interface TransactionDialogProps {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  field: 'details' | 'delivery_instructions' | 'terms_and_conditions' | 'special_conditions';
  content: string;
  transactionType: string;
  transactionDate: string;
  animalId: string;
}

export default function TransactionDialog({
  open,
  onClose,
  transactionId,
  field,
  content,
  transactionType,
  transactionDate,
  animalId,
}: TransactionDialogProps) {
  const navigate = useNavigate();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} copied to clipboard`);
  };

  const fieldIcons = {
    details: <FileText className="h-5 w-5 text-primary" />,
    delivery_instructions: <Notebook className="h-5 w-5 text-primary" />,
    terms_and_conditions: <FileText className="h-5 w-5 text-primary" />,
    special_conditions: <Notebook className="h-5 w-5 text-primary" />,
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg transition-all duration-200 ease-in-out">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent rounded-lg -z-10"></div>
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            {fieldIcons[field]}
            {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} -{' '}
            {field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            Recorded on {format(parseISO(transactionDate), 'PPP')}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 p-4 bg-muted/40 rounded-lg border backdrop-blur-sm">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => copyToClipboard(content)}
            className="gap-1.5"
            aria-label={`Copy ${field} to clipboard`}
          >
            <Copy className="h-4 w-4" />
            Copy Text
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/animals/${animalId}/transactions/${transactionId}/edit`)}
              className="gap-1.5"
              aria-label={`Edit ${transactionType} transaction`}
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="default" onClick={onClose} aria-label="Close dialog">
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}