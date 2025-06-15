import React from 'react';
import { X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UpdatedHealthFormData } from '@/types/types';

interface ArrayInputSectionProps {
  field: keyof UpdatedHealthFormData & keyof Record<string, string>;
  label: string;
  formData: UpdatedHealthFormData;
  inputValues: Record<string, string>;
  handleInputChange: (field: string, value: string) => void;
  handleAdd: (field: string) => void;
  handleRemove: (field: keyof UpdatedHealthFormData, item: string) => void;
}

export const ArrayInputSection: React.FC<ArrayInputSectionProps> = ({
  field,
  label,
  formData,
  inputValues,
  handleInputChange,
  handleAdd,
  handleRemove
}) => (
  <div className="space-y-2">
    <Label htmlFor={field} className="text-sm font-medium">{label}</Label>
    <div className="flex gap-2">
      <Input
        id={field}
        value={inputValues[field]}
        onChange={e => handleInputChange(field, e.target.value)}
        placeholder={`Add ${label.toLowerCase()}...`}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd(field);
          }
        }}
        className="flex-grow"
      />
      <Button
        type="button"
        onClick={() => handleAdd(field)}
        variant="outline"
        size="sm"
      >
        Add
      </Button>
    </div>
    {(formData[field] as string[]).length > 0 && (
      <div className="mt-3 flex flex-wrap gap-2">
        {(formData[field] as string[]).map((item, idx) => (
          <Badge key={idx} variant="secondary" className="py-1 px-2">
            {item}
            <button
              type="button"
              onClick={() => handleRemove(field, item)}
              className="ml-1.5 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          </Badge>
        ))}
      </div>
    )}
  </div>
);