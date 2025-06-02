import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const NoteSkeleton: React.FC = () => (
  <Card className="flex flex-col border-l-4 border-gray-200 dark:border-gray-700 shadow-sm">
    <CardHeader className="p-4 pb-3">
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </CardHeader>
    <CardContent className="p-4 pt-2 pb-3 flex-grow">
      <div className="flex gap-2 mb-3">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6" />
    </CardContent>
  </Card>
);

export default NoteSkeleton;