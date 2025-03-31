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
} from '@/services/healthservice'; // Adjust path as needed

interface HealthRecordFormProps {
  animalId: string;
  onSuccess?: () => void;
}

// Assuming HealthFormData has these fields as arrays
interface UpdatedHealthFormData extends Omit<HealthFormData, 'allergies' | 'exercise_requirements' | 'notes' | 'parasite_prevention' | 'regular_medication'> {
  allergies: string[];
  exercise_requirements: string[];
  notes: string[];
  parasite_prevention: string[];
  regular_medication: string[];
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

  // Fetch existing health record if editing
  useEffect(() => {
    if (healthId && animalId) {
      const loadHealthRecord = async () => {
        setIsLoading(true);
        try {
          const healthData = await fetchHealthRecord(animalId, healthId);
          setFormData({
            health_status: healthData.health_status || 'Healthy',
            vaccination_status: healthData.vaccination_status || 'Up-to-date',
            vet_contact_id: healthData.vet_contact_id || null,
            medical_history: healthData.medical_history || {},
            dietary_restrictions: healthData.dietary_restrictions || '',
            neutered_spayed: healthData.neutered_spayed || false,
            regular_medication: healthData.regular_medication || [],
            last_vet_visit: healthData.last_vet_visit || '',
            insurance_details: healthData.insurance_details || '',
            exercise_requirements: healthData.exercise_requirements || [],
            parasite_prevention: healthData.parasite_prevention || [],
            vaccinations: healthData.vaccinations || '',
            allergies: healthData.allergies || [],
            notes: healthData.notes || [],
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, neutered_spayed: checked }));
  };

  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const addArrayItem = (field: keyof typeof inputValues) => {
    const value = inputValues[field].trim();
    if (value && !formData[field].includes(value)) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
      setInputValues((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const removeArrayItem = (field: keyof UpdatedHealthFormData, item: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((i) => i !== item),
    }));
  };

  const addMedicalHistory = () => {
    if (medicalHistoryDate && medicalHistoryNote) {
      setFormData((prev) => ({
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
    setFormData((prev) => {
      const { [date]: _, ...rest } = prev.medical_history;
      return { ...prev, medical_history: rest };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (healthId) {
        await updateHealthRecord(animalId, healthId, formData);
        toast.success('Health record updated successfully');
      } else {
        await createHealthRecord(animalId, formData);
        toast.success('Health record created successfully');
      }
      if (onSuccess) onSuccess();
      navigate(`/animals/${animalId}/health`);
    } catch (error) {
      console.error('Failed to submit health record:', error);
      toast.error(`Failed to ${healthId ? 'update' : 'create'} health record`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Loading health record...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(`/animals/${animalId}/health`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Health Records
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Health Record' : 'Add New Health Record'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="health_status">Health Status</Label>
                <Select
                  value={formData.health_status}
                  onValueChange={(value) => handleSelectChange('health_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select health status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Healthy">Healthy</SelectItem>
                    <SelectItem value="Sick">Sick</SelectItem>
                    <SelectItem value="Recovering">Recovering</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vaccination_status">Vaccination Status</Label>
                <Select
                  value={formData.vaccination_status}
                  onValueChange={(value) => handleSelectChange('vaccination_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vaccination status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Up-to-date">Up-to-date</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Medical History</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="date"
                  value={medicalHistoryDate}
                  onChange={(e) => setMedicalHistoryDate(e.target.value)}
                />
                <Input
                  value={medicalHistoryNote}
                  onChange={(e) => setMedicalHistoryNote(e.target.value)}
                  placeholder="Enter medical note"
                />
                <Button type="button" onClick={addMedicalHistory}>Add</Button>
              </div>
              {Object.entries(formData.medical_history).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(formData.medical_history).map(([date, note]) => (
                    <div
                      key={date}
                      className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {date}: {note}
                      <button
                        type="button"
                        onClick={() => removeMedicalHistory(date)}
                        className="ml-1 text-secondary-foreground/70 hover:text-secondary-foreground"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="last_vet_visit">Last Vet Visit</Label>
                <Input
                  type="date"
                  name="last_vet_visit"
                  value={formData.last_vet_visit}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="neutered_spayed"
                  checked={formData.neutered_spayed}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="neutered_spayed">Neutered/Spayed</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
              <Textarea
                id="dietary_restrictions"
                name="dietary_restrictions"
                value={formData.dietary_restrictions}
                onChange={handleChange}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance_details">Insurance Details</Label>
              <Textarea
                id="insurance_details"
                name="insurance_details"
                value={formData.insurance_details}
                onChange={handleChange}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vaccinations">Vaccinations</Label>
              <Textarea
                id="vaccinations"
                name="vaccinations"
                value={formData.vaccinations}
                onChange={handleChange}
                rows={2}
              />
            </div>

            {/* Array Fields */}
            {[
              { name: 'regular_medication', label: 'Regular Medication' },
              { name: 'exercise_requirements', label: 'Exercise Requirements' },
              { name: 'parasite_prevention', label: 'Parasite Prevention' },
              { name: 'allergies', label: 'Allergies' },
              { name: 'notes', label: 'Additional Notes' },
            ].map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id={field.name}
                    name={field.name}
                    value={inputValues[field.name as keyof typeof inputValues]}
                    onChange={handleArrayInputChange}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem(field.name as keyof typeof inputValues);
                      }
                    }}
                  />
                  <Button type="button" onClick={() => addArrayItem(field.name as keyof typeof inputValues)}>
                    Add
                  </Button>
                </div>
                {formData[field.name as keyof UpdatedHealthFormData].length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(formData[field.name as keyof UpdatedHealthFormData] as string[]).map((item, index) => (
                      <div
                        key={index}
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => removeArrayItem(field.name as keyof UpdatedHealthFormData, item)}
                          className="ml-1 text-secondary-foreground/70 hover:text-secondary-foreground"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/animals/${animalId}/health`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Health Record' : 'Save Health Record'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};