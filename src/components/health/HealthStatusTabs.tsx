import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface StatusCounts {
  all: number;
  healthy: number;
  sick: number;
  recovering: number;
  critical: number;
}

interface HealthStatusTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  statusCounts: StatusCounts;
  children: React.ReactNode;
}

export const HealthStatusTabs: React.FC<HealthStatusTabsProps> = ({
  activeTab,
  onTabChange,
  statusCounts,
  children
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full sm:w-auto mb-6 h-auto p-1.5">
        <TabsTrigger value="all" className="py-1.5 text-xs sm:text-sm">
          All <Badge variant="secondary" className="ml-1.5 px-1.5">{statusCounts.all}</Badge>
        </TabsTrigger>
        <TabsTrigger value="healthy" className="py-1.5 text-xs sm:text-sm">
          Healthy <Badge variant="secondary" className="ml-1.5 px-1.5">{statusCounts.healthy}</Badge>
        </TabsTrigger>
        <TabsTrigger value="sick" className="py-1.5 text-xs sm:text-sm">
          Sick <Badge variant="secondary" className="ml-1.5 px-1.5">{statusCounts.sick}</Badge>
        </TabsTrigger>
        <TabsTrigger value="recovering" className="py-1.5 text-xs sm:text-sm">
          Recovering <Badge variant="secondary" className="ml-1.5 px-1.5">{statusCounts.recovering}</Badge>
        </TabsTrigger>
        <TabsTrigger value="critical" className="py-1.5 text-xs sm:text-sm">
          Critical <Badge variant="secondary" className="ml-1.5 px-1.5">{statusCounts.critical}</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab}>
        {children}
      </TabsContent>
    </Tabs>
  );
};