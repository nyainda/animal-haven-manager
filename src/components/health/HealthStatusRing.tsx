import React from 'react';
import { Heart } from 'lucide-react';

interface HealthStatusRingProps {
  status: string;
}

export const HealthStatusRing: React.FC<HealthStatusRingProps> = ({ status }) => {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return { ring: 'text-green-500', progress: 100 };
      case 'sick':
        return { ring: 'text-red-500', progress: 50 };
      case 'recovering':
        return { ring: 'text-yellow-500', progress: 75 };
      case 'critical':
        return { ring: 'text-orange-500', progress: 25 };
      default:
        return { ring: 'text-gray-500', progress: 0 };
    }
  };

  const statusStyle = getStatusStyle(status);

  return (
    <div className="relative flex-shrink-0">
      <svg className="w-12 h-12" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-muted-foreground/20"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={`${statusStyle.progress}, 100`}
          className={statusStyle.ring}
        />
      </svg>
      <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-foreground" />
    </div>
  );
};