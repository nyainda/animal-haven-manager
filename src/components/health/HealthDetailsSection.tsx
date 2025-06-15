import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isValid } from 'date-fns';
import { HealthRecord } from '@/types/HealthTypes';

interface HealthDetailsSectionProps {
  health: HealthRecord;
  onViewContent: (content: string, title: string) => void;
}

export const HealthDetailsSection: React.FC<HealthDetailsSectionProps> = ({ health, onViewContent }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return 'Invalid date';
      return format(date, 'MMMM d, yyyy');
    } catch {
      return 'Not specified';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="mt-3 space-y-3">
      {health.dietary_restrictions && (
        <div>
          <h4 className="text-sm font-medium text-foreground">Dietary Restrictions</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {health.dietary_restrictions.length > 150 ? (
              <>
                {truncateText(health.dietary_restrictions, 150)}
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 ml-1 text-primary"
                  onClick={() => onViewContent(health.dietary_restrictions, 'Dietary Restrictions')}
                >
                  Read More
                </Button>
              </>
            ) : (
              health.dietary_restrictions
            )}
          </p>
        </div>
      )}
      
      {health.medical_history && Object.keys(health.medical_history).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground">Medical History</h4>
          <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
            {Object.entries(health.medical_history).map(([date, note], index) => {
              const noteText = `${formatDate(date)}: ${note}`;
              return (
                <li key={index}>
                  {noteText.length > 150 ? (
                    <>
                      {truncateText(noteText, 150)}
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 ml-1 text-primary"
                        onClick={() => onViewContent(noteText, `Medical History - ${formatDate(date)}`)}
                      >
                        Read More
                      </Button>
                    </>
                  ) : (
                    noteText
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {health.regular_medication?.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground">Regular Medication</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            {health.regular_medication.map((med, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => onViewContent(med, `Medication: ${med}`)}
              >
                {med}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {health.notes?.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground">Notes</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            {health.notes.map((note, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => onViewContent(note, `Note ${index + 1}`)}
              >
                {truncateText(note, 20)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
