import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';
import NoteSkeleton from './NoteSkeleton';

const LoadingState: React.FC = () => (
  <TooltipProvider delayDuration={150}>
    <div className="bg-background min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div className="flex items-center gap-3 flex-wrap">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
          <Skeleton className="h-10 w-full sm:w-32 sm:h-12" />
        </div>
        {/* Tabs Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
        {/* Notes Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <NoteSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  </TooltipProvider>
);

export default LoadingState;