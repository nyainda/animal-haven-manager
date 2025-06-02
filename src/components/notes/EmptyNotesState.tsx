import React from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyNotesStateProps {
  activeTab: string;
  animalName: string;
  onAddNote: () => void;
}

const EmptyNotesState: React.FC<EmptyNotesStateProps> = ({ activeTab, animalName, onAddNote }) => (
  <Card className="border-dashed border-border shadow-none mt-8">
    <CardContent className="py-12 flex flex-col items-center text-center">
      <div className="p-3 rounded-full bg-muted mb-4">
        <FileText className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-1">
        No {activeTab !== 'all' ? `${activeTab} ` : ''}Notes Found
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {activeTab === 'all'
          ? `There are currently no notes for ${animalName}. Add one!`
          : `No notes match the filter "${activeTab}".`}
      </p>
      {activeTab === 'all' && (
        <Button onClick={onAddNote}>
          <Plus className="mr-2 h-4 w-4" />
          Add First Note
        </Button>
      )}
    </CardContent>
  </Card>
);

export default EmptyNotesState;