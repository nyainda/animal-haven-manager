import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  HealthFormData, 
  createHealthRecord, 
  updateHealthRecord, 
  fetchHealthRecord 
} from '@/services/healthservice';

// Utility function to format ISO date to yyyy-MM-dd
const formatDateToYMD = (isoDate: string): string => {
  if (!isoDate) return '';
  return isoDate.split('T')[0]; // Extracts "2022-04-04" from "2022-04-04T00:00:00.000000Z"
};

interface HealthRecordFormProps {
  animalId: string;
  onSuccess?: () => void;
}

interface UpdatedHealthFormData extends Omit<HealthFormData, 'allergies' | 'exercise_requirements' | 'notes' | 'parasite_prevention' | 'regular_medication'> {
  allergies: string[];
  exercise_requirements: string[];
  notes: string[];
  parasite_prevention: string[];
  regular_medication: string[];
  medical_history: Record<string, string>;
}

export const HealthRecordForm: React.FC<HealthRecordFormProps> = ({ animalId, onSuccess }) => {
  const { healthId } = useParams<{ healthId?: string }>();
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
    last_vet_visit: '',
    insurance_details: '',
    exercise_requirements: [],
    parasite_prevention: [],
    vaccinations: '',
    allergies: [],
    notes: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [medicalHistoryDate, setMedicalHistoryDate] = useState('');
  const [medicalHistoryNote, setMedicalHistoryNote] = useState('');
  const [inputValues, setInputValues] = useState({
    regular_medication: '',
    exercise_requirements: '',
    parasite_prevention: '',
    allergies: '',
    notes: '',
  });

  useEffect(() => {
    if (healthId && animalId) {
      const loadHealthRecord = async () => {
        setIsLoading(true);
        try {
          const healthData = await fetchHealthRecord(animalId, healthId);
          setFormData({
            ...healthData,
            regular_medication: healthData.regular_medication || [],
            exercise_requirements: healthData.exercise_requirements || [],
            parasite_prevention: healthData.parasite_prevention || [],
            allergies: healthData.allergies || [],
            notes: healthData.notes || [],
            medical_history: healthData.medical_history || {},
            last_vet_visit: formatDateToYMD(healthData.last_vet_visit), // Normalize date
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSelectChange = (name: keyof UpdatedHealthFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayInput = (field: keyof typeof inputValues) => {
    const value = inputValues[field].trim();
    if (value && !formData[field].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
      setInputValues(prev => ({ ...prev, [field]: '' }));
    }
  };

  const removeArrayItem = (field: keyof UpdatedHealthFormData, item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter(i => i !== item),
    }));
  };

  const addMedicalHistory = () => {
    if (medicalHistoryDate && medicalHistoryNote) {
      setFormData(prev => ({
        ...prev,
        medical_history: {
          ...prev.medical_history,
          [medicalHistoryDate]: medicalHistoryNote,
        },
      }));
      setMedicalHistoryDate('');
      setMedicalHistoryNote('');
    }
  };

  const removeMedicalHistory = (date: string) => {
    setFormData(prev => {
      const { [date]: _, ...rest } = prev.medical_history;
      return { ...prev, medical_history: rest };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const action = isEditing 
        ? updateHealthRecord(animalId, healthId!, formData)
        : createHealthRecord(animalId, formData);
      await action;
      toast.success(`Health record ${isEditing ? 'updated' : 'created'} successfully`);
      onSuccess?.();
      navigate(`/animals/${animalId}/health`);
    } catch (error) {
      console.error('Failed to submit health record:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} health record`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading health record...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/animals/${animalId}/health`)}
          className="hover:bg-accent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Health Records
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="text-2xl font-semibold">
            {isEditing ? 'Edit Health Record' : 'New Health Record'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Status Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Health Status</Label>
                <Select 
                  value={formData.health_status} 
                  onValueChange={handleSelectChange('health_status')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Healthy', 'Sick', 'Recovering', 'Critical'].map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Vaccination Status</Label>
                <Select 
                  value={formData.vaccination_status} 
                  onValueChange={handleSelectChange('vaccination_status')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Up-to-date', 'Pending', 'Overdue', 'Not Applicable'].map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Medical History Section */}
            <section className="space-y-4">
              <Label className="text-sm font-medium">Medical History</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="date"
                  value={medicalHistoryDate}
                  onChange={e => setMedicalHistoryDate(e.target.value)}
                  className="md:col-span-1"
                />
                <Input
                  value={medicalHistoryNote}
                  onChange={e => setMedicalHistoryNote(e.target.value)}
                  placeholder="Medical note"
                  className="md:col-span-1"
                />
                <Button 
                  type="button" 
                  onClick={addMedicalHistory}
                  variant="outline"
                  className="md:col-span-1"
                >
                  Add Entry
                </Button>
              </div>
              {Object.keys(formData.medical_history).length > 0 && (
                <div className="mt-2 space-y-2">
                  {Object.entries(formData.medical_history).map(([date, note]) => (
                    <div 
                      key={date} 
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <span className="text-sm">
                        <strong>{date}:</strong> {note}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedicalHistory(date)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Basic Info Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Last Vet Visit</Label>
                <Input
                  type="date"
                  name="last_vet_visit"
                  value={formData.last_vet_visit}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Neutered/Spayed</Label>
                <Switch
                  checked={formData.neutered_spayed}
                  onCheckedChange={checked => setFormData(prev => ({ ...prev, neutered_spayed: checked }))}
                />
              </div>
            </section>

            {/* Text Areas Section */}
            <section className="space-y-6">
              {[
                { name: 'dietary_restrictions', label: 'Dietary Restrictions' },
                { name: 'insurance_details', label: 'Insurance Details' },
                { name: 'vaccinations', label: 'Vaccinations' },
              ].map(field => (
                <div key={field.name} className="space-y-2">
                  <Label className="text-sm font-medium">{field.label}</Label>
                  <Textarea
                    name={field.name}
                    value={formData[field.name as keyof UpdatedHealthFormData] as string}
                    onChange={handleChange}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              ))}
            </section>

            {/* Array Fields Section */}
            <section className="space-y-.Fetching6">
              {[
                { name: 'regular_medication', label: 'Regular Medication' },
                { name: 'exercise_requirements', label: 'Exercise Requirements' },
                { name: 'parasite_prevention', label: 'Parasite Prevention' },
                { name: 'allergies', label: 'Allergies' },
                { name: 'notes', label: 'Additional Notes' },
              ].map(field => (
                <div key={field.name} className="space-y-2">
                  <Label className="text-sm font-medium">{field.label}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={inputValues[field.name as keyof typeof inputValues]}
                      onChange={e => setInputValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                      placeholder={`Add ${field.label.toLowerCase()}`}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleArrayInput(field.name as keyof typeof inputValues))}
                    />
                    <Button 
                      type="button" 
                      onClick={() => handleArrayInput(field.name as keyof typeof inputValues)}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  {(formData[field.name as keyof UpdatedHealthFormData] as string[]).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(formData[field.name as keyof UpdatedHealthFormData] as string[]).map((item, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => removeArrayItem(field.name as keyof UpdatedHealthFormData, item)}
                            className="ml-2 text-primary/70 hover:text-primary"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/animals/${animalId}/health`)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update' : 'Save'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};