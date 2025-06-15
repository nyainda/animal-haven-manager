import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HealthDetailsSection } from './HealthDetailsSection';
import { HealthRecord } from '@/types/HealthTypes';

interface HealthExpandableDetailsProps {
  health: HealthRecord;
  onViewContent: (content: string, title: string) => void;
}

export const HealthExpandableDetails: React.FC<HealthExpandableDetailsProps> = ({ 
  health, 
  onViewContent 
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <motion.div
      className="border-t border-muted pt-3"
      initial={false}
      animate={{ height: 'auto' }}
      transition={{ duration: 0.2 }}
    >
      <button
        className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-primary"
        onClick={() => setIsDetailsOpen(!isDetailsOpen)}
        aria-expanded={isDetailsOpen}
        aria-controls="health-details"
      >
        <span>More Details</span>
        {isDetailsOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      <AnimatePresence>
        {isDetailsOpen && (
          <motion.div
            id="health-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <HealthDetailsSection health={health} onViewContent={onViewContent} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};