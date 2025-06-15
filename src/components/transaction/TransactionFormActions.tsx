import React from 'react';
import { Button } from '@/components/ui/button';

interface TransactionFormActionsProps {
  isSubmitting: boolean;
  isEditing: boolean;
  onCancel: () => void;
}

export const TransactionFormActions: React.FC<TransactionFormActionsProps> = ({
  isSubmitting,
  isEditing,
  onCancel,
}) => {
  return (
    <div className="flex justify-end gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        {isSubmitting
          ? 'Saving...'
          : isEditing
          ? 'Update Transaction'
          : 'Create Transaction'}
      </Button>
    </div>
  );
};
