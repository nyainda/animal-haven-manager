import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface NoteCounts {
  all: number;
  pending: number;
  completed: number;
  archived: number;
}

interface NotesTabsFilterProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  noteCounts: NoteCounts;
  children: React.ReactNode;
}

const NotesTabsFilter: React.FC<NotesTabsFilterProps> = ({ 
  activeTab, 
  onTabChange, 
  noteCounts, 
  children 
}) => (
  <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
    <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto mb-6 h-auto p-1.5">
      <TabsTrigger value="all" className="py-1.5 text-xs sm:text-sm">
        All <Badge variant="secondary" className="ml-1.5 px-1.5">{noteCounts.all}</Badge>
      </TabsTrigger>
      <TabsTrigger value="pending" className="py-1.5 text-xs sm:text-sm">
        Pending <Badge variant="secondary" className="ml-1.5 px-1.5">{noteCounts.pending}</Badge>
      </TabsTrigger>
      <TabsTrigger value="completed" className="py-1.5 text-xs sm:text-sm">
        Completed <Badge variant="secondary" className="ml-1.5 px-1.5">{noteCounts.completed}</Badge>
      </TabsTrigger>
      <TabsTrigger value="archived" className="py-1.5 text-xs sm:text-sm">
        Archived <Badge variant="secondary" className="ml-1.5 px-1.5">{noteCounts.archived}</Badge>
      </TabsTrigger>
    </TabsList>
    <TabsContent value={activeTab}>
      {children}
    </TabsContent>
  </Tabs>
);

export default NotesTabsFilter;