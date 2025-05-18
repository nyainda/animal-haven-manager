import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, List, ChartLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  animalId: string;
  mode: 'list' | 'summary';
}

export default function EmptyState({ animalId, mode }: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="border-dashed border-border shadow-md p-8 text-center max-w-md w-full bg-muted/20">
        <CardContent className="pt-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            {mode === 'list' ? (
              <List className="h-8 w-8 text-primary" />
            ) : (
              <ChartLine className="h-8 w-8 text-primary" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {mode === 'list' ? 'No Transactions Recorded' : 'No Data to Summarize'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {mode === 'list'
              ? 'Start tracking transactions by adding your first entry to monitor sales and purchases.'
              : 'Add transactions to generate insights and visualize financial activity.'}
          </p>
          <Button
            onClick={() => navigate(`/animals/${animalId}/transactions/new`)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add First Transaction
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}