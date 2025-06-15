import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

import { StatusSection } from '@/components/health-form/StatusSection';
import { BasicInfoSection } from '@/components/health-form/BasicInfoSection';
import { MedicalHistorySection } from '@/components/health-form/MedicalHistorySection';
import { DetailsSection } from '@/components/health-form/DetailsSection';
import { AdditionalInfoSection } from '@/components/health-form/AdditionalInfoSection';
import { useHealthForm } from '@/hooks/useHealthForm';
import { UpdatedHealthFormData } from '@/types/types';

interface HealthRecordFormProps {
  animalId: string;
  onSuccess?: () => void;
}

export const HealthRecordForm: React.FC<HealthRecordFormProps> = ({ 
  animalId, 
  onSuccess 
}) => {
  const { healthId } = useParams<{ healthId?: string }>();
  const navigate = useNavigate();
  const isEditing = !!healthId;

  const {
    formData,
    isSubmitting,
    isLoading,
    handleSubmit,
    updateFormData,
    inputValues,
    handleArrayInputChange,
    handleArrayAdd,
    handleArrayRemove,
  } = useHealthForm(animalId, healthId, onSuccess);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading health record...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/animals/${animalId}/health`)}
          className="hover:bg-accent text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Health Records
        </Button>
      </div>

      <Card className="shadow-md border">
        <CardHeader className="border-b bg-muted/30 px-6 py-4">
          <CardTitle className="text-xl font-semibold">
            {isEditing ? 'Edit Health Record' : 'New Health Record'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <StatusSection 
              formData={formData} 
              onUpdate={updateFormData} 
            />
            
            <Separator className="my-6" />
            
            <BasicInfoSection 
              formData={formData} 
              onUpdate={updateFormData} 
            />
            
            <Separator className="my-6" />
            
            <MedicalHistorySection 
              formData={formData} 
              onUpdate={updateFormData} 
            />
            
            <Separator className="my-6" />
            
            <DetailsSection 
              formData={formData} 
              onUpdate={updateFormData} 
            />
            
            <Separator className="my-6" />
            
            <AdditionalInfoSection
              formData={formData}
              inputValues={inputValues}
              onInputChange={handleArrayInputChange}
              onAdd={handleArrayAdd}
              onRemove={handleArrayRemove}
            />

            <Separator className="mt-8 mb-6" />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/animals/${animalId}/health`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isEditing ? 'Update Record' : 'Save Record'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};