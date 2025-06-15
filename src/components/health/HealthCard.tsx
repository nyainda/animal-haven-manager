import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { HealthCardActions } from './HealthCardActions';
import { HealthCardHeader } from './HealthCardHeader';
import { HealthBasicInfo } from './HealthBasicInfo';
import { HealthExpandableDetails } from './HealthExpandableDetails';
import { HealthCardProps } from '@/types/HealthTypes';

export const HealthCard: React.FC<HealthCardProps> = ({ 
  health, 
  animalId, 
  onEdit, 
  onDelete, 
  onViewContent 
}) => {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return { border: 'border-green-400' };
      case 'sick':
        return { border: 'border-red-400' };
      case 'recovering':
        return { border: 'border-yellow-400' };
      case 'critical':
        return { border: 'border-orange-400' };
      default:
        return { border: 'border-gray-400' };
    }
  };

  const statusStyle = getStatusStyle(health.health_status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`group relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border ${statusStyle.border} backdrop-blur-sm bg-background/90`}
      >
        <HealthCardActions onEdit={onEdit} onDelete={onDelete} />
        <HealthCardHeader health={health} />
        
        <CardContent className="p-4 pt-0">
          <HealthBasicInfo health={health} />
          <HealthExpandableDetails health={health} onViewContent={onViewContent} />
        </CardContent>
      </Card>
    </motion.div>
  );
};