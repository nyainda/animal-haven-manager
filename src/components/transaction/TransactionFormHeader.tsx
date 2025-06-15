import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionFormHeaderProps {
  isEditing: boolean;
  onBack: () => void;
}

export const TransactionFormHeader: React.FC<TransactionFormHeaderProps> = ({
  isEditing,
  onBack,
}) => {
  return (
    <header className="flex items-center justify-between mb-6">
      <Button variant="outline" size="icon" onClick={onBack}>
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-2xl font-bold text-foreground">
        {isEditing ? 'Edit Transaction' : 'New Transaction'}
      </h1>
    </header>
  );
};
