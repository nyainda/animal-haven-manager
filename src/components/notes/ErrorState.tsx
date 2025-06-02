import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorStateProps {
  onBack: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ onBack }) => (
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
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Animals
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default ErrorState;