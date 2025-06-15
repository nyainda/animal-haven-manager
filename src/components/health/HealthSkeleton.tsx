import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const HealthSkeleton: React.FC = () => (
  <Card className="flex flex-col border-l-4 border-gray-200 dark:border-gray-700 shadow-md animate-pulse bg-background">
    <CardHeader className="p-4 pb-2 flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-1/3 mb-1" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </CardHeader>
    <CardContent className="p-4 pt-0 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>
      <Skeleton className="h-6 w-1/2" />
    </CardContent>
  </Card>
);