import React from 'react';
import { Plus, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyHealthStateProps {
  activeTab: string;
  animalName: string;
  onAddHealthRecord: () => void;
}

export const EmptyHealthState: React.FC<EmptyHealthStateProps> = ({
  activeTab,
  animalName,
  onAddHealthRecord
}) => {
  return (
    <Card className="border-dashed border-border shadow-none mt-8 bg-background">
      <CardContent className="py-12 flex flex-col items-center text-center">
        <div className="p-3 rounded-full bg-muted mb-4">
          <Heart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-1">
          No {activeTab !== 'all' ? `${activeTab} ` : ''}Health Records Found
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          {activeTab === 'all'
            ? `There are currently no health records for ${animalName}. Add one!`
            : `No health records match the filter "${activeTab}".`}
        </p>
        {activeTab === 'all' && (
          <Button onClick={onAddHealthRecord}>
            <Plus className="mr-2 h-4 w-4" />
            Add First Health Record
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
