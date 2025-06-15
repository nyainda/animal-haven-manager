import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  createHealthRecord, 
  updateHealthRecord, 
  fetchHealthRecord 
} from '@/services/healthservice';
import { UpdatedHealthFormData } from '@/types/types';
import { formatDateToYMDString, parseYMDStringToDate } from '../utils/health';

export const useHealthForm = (animalId: string, healthId?: string, onSuccess?: () => void) => {
  const navigate = useNavigate();
  const isEditing = !!healthId;

  const [formData, setFormData] = useState<UpdatedHealthFormData>({
    health_status: 'Healthy',
    vaccination_status: 'Up-to-date',
    vet_contact_id: null,
    medical_history: {},
    dietary_restrictions: '',
    neutered_spayed: false,
    regular_medication: [],
    last_vet_visit: undefined,
    insurance_details: '',
    exercise_requirements: [],
    parasite_prevention: [],
    vaccinations: '',
    allergies: [],
    notes: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValues, setInputValues] = useState({
    regular_medication: '',
    exercise_requirements: '',
    parasite_prevention: '',
    allergies: '',
    notes: '',
  });

  // Load existing record if editing
  useEffect(() => {
    if (healthId && animalId) {
      const loadHealthRecord = async () => {
        setIsLoading(true);
        try {
          const healthData = await fetchHealthRecord(animalId, healthId);
          const lastVetVisitDate = parseYMDStringToDate(healthData.last_vet_visit);

          setFormData({
            ...healthData,
            regular_medication: healthData.regular_medication || [],
            exercise_requirements: healthData.exercise_requirements || [],
            parasite_prevention: healthData.parasite_prevention || [],
            allergies: healthData.allergies || [],
            notes: healthData.notes || [],
            medical_history: healthData.medical_history || {},
            last_vet_visit: lastVetVisitDate,
          });
        } catch (error) {
          console.error('Error loading health record:', error);
          toast.error('Failed to load health record');
        } finally {
          setIsLoading(false);
        }
      };
      loadHealthRecord();
    }
  }, [healthId, animalId]);

  const updateFormData = (updates: Partial<UpdatedHealthFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleArrayInputChange = (field: string, value: string) => {
    setInputValues(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayAdd = (field: string) => {
    const value = inputValues[field].trim();
    const formField = field as keyof UpdatedHealthFormData;
    if (value && !(formData[formField] as string[]).includes(value)) {
      updateFormData({
        [formField]: [...(formData[formField] as string[]), value],
      });
      setInputValues(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayRemove = (field: keyof UpdatedHealthFormData, itemToRemove: string) => {
    updateFormData({
      [field]: (formData[field] as string[]).filter(item => item !== itemToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.health_status || !formData.vaccination_status) {
      toast.error("Please fill in all required fields (marked with *)");
      setIsSubmitting(false);
      return;
    }

    try {
      const lastVetVisitString = formatDateToYMDString(formData.last_vet_visit);
      const dataToSend = {
        ...formData,
        last_vet_visit: lastVetVisitString || null,
        health_status: formData.health_status || 'Healthy',
        vaccination_status: formData.vaccination_status || 'Up-to-date',
        neutered_spayed: formData.neutered_spayed || false,
      };

      const action = isEditing
        ? updateHealthRecord(animalId, healthId!, dataToSend)
        : createHealthRecord(animalId, dataToSend);
      
      await action;
      toast.success(`Health record ${isEditing ? 'updated' : 'created'} successfully!`);
      onSuccess?.();
      navigate(`/animals/${animalId}/health`);
    } catch (error: any) {
      console.error('Failed to submit health record:', error);
      const errorMessage = error?.response?.data?.detail || 
        `Failed to ${isEditing ? 'update' : 'create'} health record.`;
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    isLoading,
    handleSubmit,
    updateFormData,
    inputValues,
    handleArrayInputChange,
    handleArrayAdd,
    handleArrayRemove,
  };
};