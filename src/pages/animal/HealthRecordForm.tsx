import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Import CalendarIcon and necessary date-fns function
import { ArrowLeft, Loader2, X, CalendarIcon } from 'lucide-react'; 
import { format } from 'date-fns'; // For formatting dates
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// Import Popover and Calendar components
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; 
import { Calendar } from '@/components/ui/calendar'; 
import { cn } from "@/lib/utils"; // Assuming you have this utility from shadcn setup

import {
  HealthFormData,
  createHealthRecord,
  updateHealthRecord,
  fetchHealthRecord
} from '@/services/healthservice';

// Utility function to format Date object to yyyy-MM-dd string
const formatDateToYMDString = (date: Date | undefined | null): string => {
  if (!date) return '';
  try {
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return ''; // Handle invalid dates gracefully
  }
};

// Utility function to parse yyyy-MM-dd string to Date object
const parseYMDStringToDate = (dateString: string | undefined | null): Date | undefined => {
  if (!dateString) return undefined;
  try {
    // Add time component to avoid timezone issues during parsing
    const date = new Date(`${dateString}T00:00:00`); 
    // Basic validation
    if (isNaN(date.getTime())) {
        return undefined;
    }
    return date;
  } catch (error) {
    console.error("Error parsing date string:", dateString, error);
    return undefined;
  }
};


interface HealthRecordFormProps {
  animalId: string;
  onSuccess?: () => void;
}

// Update interface to use Date type for relevant fields
interface UpdatedHealthFormData extends Omit<HealthFormData, 'allergies' | 'exercise_requirements' | 'notes' | 'parasite_prevention' | 'regular_medication' | 'last_vet_visit'> {
  allergies: string[];
  exercise_requirements: string[];
  notes: string[];
  parasite_prevention: string[];
  regular_medication: string[];
  medical_history: Record<string, string>; // Keys will still be string 'yyyy-MM-dd'
  last_vet_visit: Date | undefined; // Use Date object here
}

// Reusable ArrayInputSection (no changes needed here)
interface ArrayInputSectionProps {
  field: keyof UpdatedHealthFormData & keyof typeof inputValues;
  label: string;
  formData: UpdatedHealthFormData;
  inputValues: Record<string, string>;
  handleInputChange: (field: keyof typeof inputValues, value: string) => void;
  handleAdd: (field: keyof typeof inputValues) => void;
  handleRemove: (field: keyof UpdatedHealthFormData, item: string) => void;
}

const ArrayInputSection: React.FC<ArrayInputSectionProps> = ({
  field, label, formData, inputValues, handleInputChange, handleAdd, handleRemove
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
        size="sm" // Slightly smaller button
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


export const HealthRecordForm: React.FC<HealthRecordFormProps> = ({ animalId, onSuccess }) => {
  const { healthId } = useParams<{ healthId?: string }>();
  const navigate = useNavigate();
  const isEditing = !!healthId;

  // Adjust initial state for dates to use Date | undefined
  const [formData, setFormData] = useState<UpdatedHealthFormData>({
    health_status: 'Healthy',
    vaccination_status: 'Up-to-date',
    vet_contact_id: null,
    medical_history: {},
    dietary_restrictions: '',
    neutered_spayed: false,
    regular_medication: [],
    last_vet_visit: undefined, // Initialize as undefined
    insurance_details: '',
    exercise_requirements: [],
    parasite_prevention: [],
    vaccinations: '',
    allergies: [],
    notes: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // State for the Medical History date picker
  const [medicalHistoryDate, setMedicalHistoryDate] = useState<Date | undefined>(undefined); 
  const [medicalHistoryNote, setMedicalHistoryNote] = useState('');
  
  // Define inputValues here to fix the error
  const [inputValues, setInputValues] = useState({
    regular_medication: '',
    exercise_requirements: '',
    parasite_prevention: '',
    allergies: '',
    notes: '',
  });

  // Update useEffect to parse fetched date string into Date object
  useEffect(() => {
    if (healthId && animalId) {
      const loadHealthRecord = async () => {
        setIsLoading(true);
        try {
          const healthData = await fetchHealthRecord(animalId, healthId);
          // Parse the fetched date string into a Date object
          const lastVetVisitDate = parseYMDStringToDate(healthData.last_vet_visit);

          setFormData({
            ...healthData,
            regular_medication: healthData.regular_medication || [],
            exercise_requirements: healthData.exercise_requirements || [],
            parasite_prevention: healthData.parasite_prevention || [],
            allergies: healthData.allergies || [],
            notes: healthData.notes || [],
            medical_history: healthData.medical_history || {},
            last_vet_visit: lastVetVisitDate, // Set the parsed Date object
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

  // Generic handler for text/textarea/switch changes remains the same
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isChecked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? isChecked : value,
    }));
  };

  // Generic handler for Select changes remains the same
  const handleSelectChange = (name: keyof UpdatedHealthFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler specifically for Calendar date selection
  const handleDateSelect = (fieldName: keyof UpdatedHealthFormData) => (date: Date | undefined) => {
      // Check if the field is 'last_vet_visit' before updating
      if (fieldName === 'last_vet_visit') {
          setFormData(prev => ({
              ...prev,
              [fieldName]: date,
          }));
      } else {
          console.warn(`Attempted to use handleDateSelect for non-date field: ${fieldName}`);
      }
  };

  // Array input handlers remain the same
  const handleArrayInputChange = (field: keyof typeof inputValues, value: string) => {
    setInputValues(prev => ({ ...prev, [field]: value }));
  };
  const handleArrayAdd = (field: keyof typeof inputValues) => {
    const value = inputValues[field].trim();
    const formField = field as keyof UpdatedHealthFormData;
    if (value && !(formData[formField] as string[]).includes(value)) {
      setFormData(prev => ({
        ...prev,
        [formField]: [...(prev[formField] as string[]), value],
      }));
      setInputValues(prev => ({ ...prev, [field]: '' }));
    }
  };
  const handleArrayRemove = (field: keyof UpdatedHealthFormData, itemToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter(item => item !== itemToRemove),
    }));
  };

  // Update addMedicalHistory to format the Date object into a string key
  const addMedicalHistory = () => {
    const dateString = formatDateToYMDString(medicalHistoryDate); // Format Date to string
    const note = medicalHistoryNote.trim();

    if (dateString && note) {
      if (formData.medical_history[dateString]) {
          toast.warning(`Entry for ${dateString} already exists. Update manually if needed.`);
          return;
      }
      setFormData(prev => ({
        ...prev,
        medical_history: {
          ...prev.medical_history,
          [dateString]: note, // Use formatted string as key
        },
      }));
      setMedicalHistoryDate(undefined); // Clear date picker state
      setMedicalHistoryNote('');
    } else {
        toast.info("Please select a date and enter a note for the medical history entry.")
    }
  };

  // removeMedicalHistory uses string key, so it remains the same
  const removeMedicalHistory = (date: string) => {
    setFormData(prev => {
      const { [date]: _, ...rest } = prev.medical_history;
      return { ...prev, medical_history: rest };
    });
  };

  // Update handleSubmit to format the Date object back to string before sending
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.health_status || !formData.vaccination_status) {
        toast.error("Please fill in all required fields (marked with *)");
        setIsSubmitting(false);
        return;
    }

    try {
      // Format Date object back to string for API/backend
      const lastVetVisitString = formatDateToYMDString(formData.last_vet_visit);

      const dataToSend = {
        ...formData,
        last_vet_visit: lastVetVisitString || null, // Send string or null
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
      const errorMessage = error?.response?.data?.detail || `Failed to ${isEditing ? 'update' : 'create'} health record.`;
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state remains the same
  if (isLoading) {
    // ... (loading spinner code) ...
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
        {/* ... (Back Button) ... */}
         <Button
          variant="ghost"
          onClick={() => navigate(`/animals/${animalId}/health`)}
          className="hover:bg-accent text-sm" // Slightly smaller text
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Health Records
        </Button>
      </div>

      <Card className="shadow-md border">
        <CardHeader className="border-b bg-muted/30 px-6 py-4">
          {/* ... (Card Title) ... */}
           <CardTitle className="text-xl font-semibold"> 
            {isEditing ? 'Edit Health Record' : 'New Health Record'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Status Section - No changes needed */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
               {/* ... (Health Status Select) ... */}
               <div className="space-y-1.5"> {/* Reduced space between label and input */}
                <Label htmlFor="health_status" className="text-sm font-medium">
                  Health Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.health_status}
                  onValueChange={handleSelectChange('health_status')}
                  name="health_status" // Added name for potential future form library use
                >
                  <SelectTrigger id="health_status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Healthy', 'Sick', 'Recovering', 'Critical', 'Unknown'].map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               {/* ... (Vaccination Status Select) ... */}
               <div className="space-y-1.5">
                <Label htmlFor="vaccination_status" className="text-sm font-medium">
                  Vaccination Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.vaccination_status}
                  onValueChange={handleSelectChange('vaccination_status')}
                  name="vaccination_status"
                >
                  <SelectTrigger id="vaccination_status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Up-to-date', 'Pending', 'Overdue', 'Not Applicable', 'Unknown'].map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            <Separator className="my-6" />

            {/* Basic Info Section - Updated Last Vet Visit */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start"> {/* Changed to items-start */}
              <div className="space-y-1.5">
                <Label htmlFor="last_vet_visit_trigger" className="text-sm font-medium">Last Vet Visit</Label>
                {/* Date Picker for Last Vet Visit */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="last_vet_visit_trigger"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.last_vet_visit && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.last_vet_visit ? format(formData.last_vet_visit, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.last_vet_visit}
                      onSelect={handleDateSelect('last_vet_visit')}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01") // Example: Disable future dates
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {/* Neutered/Spayed Switch - No change */}
              <div className="flex items-center space-x-3 pt-1.5 md:pt-7"> {/* Adjusted padding */}
                 <Label htmlFor="neutered_spayed" className="text-sm font-medium">Neutered/Spayed</Label>
                 <Switch
                   id="neutered_spayed"
                   checked={formData.neutered_spayed}
                   onCheckedChange={checked => setFormData(prev => ({ ...prev, neutered_spayed: checked }))}
                   name="neutered_spayed"
                 />
               </div>
            </section>

            <Separator className="my-6" />

            {/* Medical History Section - Updated Date Input */}
            <section className="space-y-4">
              <h3 className="text-lg font-medium mb-3">Medical History</h3>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-3 items-end">
                <div className="space-y-1.5">
                    <Label htmlFor="medicalHistoryDateTrigger" className="text-sm">Date</Label>
                    {/* Date Picker for Medical History Date */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                              id="medicalHistoryDateTrigger"
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !medicalHistoryDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {medicalHistoryDate ? format(medicalHistoryDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={medicalHistoryDate}
                              onSelect={setMedicalHistoryDate} // Direct state setter works for single select
                               disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-1.5">
                    {/* ... (Medical History Note Input - no change) ... */}
                     <Label htmlFor="medicalHistoryNote" className="text-sm">Note</Label>
                    <Input
                      id="medicalHistoryNote"
                      value={medicalHistoryNote}
                      onChange={e => setMedicalHistoryNote(e.target.value)}
                      placeholder="Condition, treatment, etc."
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addMedicalHistory();
                        }
                      }}
                    />
                </div>
                {/* ... (Add Medical History Button - no change) ... */}
                <Button
                  type="button"
                  onClick={addMedicalHistory}
                  variant="outline"
                  size="sm" // Smaller button
                >
                  Add Entry
                </Button>
              </div>
              {/* Display Medical History List - No change needed here as keys are strings */}
              {Object.keys(formData.medical_history).length > 0 && (
                // ... (existing code to display history entries) ...
                 <div className="mt-4 space-y-2 border rounded-md p-3 bg-muted/20"> {/* Added border and light bg */}
                  {Object.entries(formData.medical_history)
                    // Optional: Sort entries by date descending
                    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA)) 
                    .map(([date, note]) => (
                      <div
                        key={date}
                        className="flex items-center justify-between p-2 border-b last:border-b-0" // Separator lines
                      >
                        <p className="text-sm flex-1 mr-4">
                          <strong className="font-medium">{date}:</strong> {note}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedicalHistory(date)}
                          className="text-destructive hover:text-destructive/80 h-7 px-2" // Make button smaller
                          aria-label={`Remove history entry for ${date}`}
                        >
                          Remove
                        </Button>
                      </div>
                  ))}
                </div>
              )}
            </section>

            <Separator className="my-6" />

            {/* Text Areas Section - No changes needed */}
            <section className="space-y-6">
              {/* ... (Existing Textarea fields) ... */}
               <h3 className="text-lg font-medium mb-3">Details</h3> {/* Added sub-heading */}
              {[
                { name: 'dietary_restrictions', label: 'Dietary Restrictions' },
                { name: 'insurance_details', label: 'Insurance Details' },
                { name: 'vaccinations', label: 'Vaccination Details / History' }, // Clarified label
              ].map(field => (
                <div key={field.name} className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-sm font-medium">{field.label}</Label>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    // Type assertion needed here as well
                    value={formData[field.name as keyof UpdatedHealthFormData] as string}
                    onChange={handleChange}
                    rows={3}
                    className="resize-y min-h-[80px]" // Allow vertical resize
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                </div>
              ))}
            </section>

            <Separator className="my-6" />

            {/* Array Fields Section - No changes needed */}
            <section className="space-y-6">
               {/* ... (Existing ArrayInputSection fields) ... */}
                 <h3 className="text-lg font-medium mb-3">Additional Information</h3> {/* Added sub-heading */}
              {[
                { field: 'regular_medication', label: 'Regular Medication' },
                { field: 'exercise_requirements', label: 'Exercise Requirements' },
                { field: 'parasite_prevention', label: 'Parasite Prevention' },
                { field: 'allergies', label: 'Allergies' },
                { field: 'notes', label: 'Additional Notes' },
              ].map(({ field, label }) => (
                // Use the reusable component
                <ArrayInputSection
                  key={field}
                  // Type assertions needed because TS can't guarantee `field` matches both interfaces perfectly
                  field={field as keyof UpdatedHealthFormData & keyof typeof inputValues} 
                  label={label}
                  formData={formData}
                  inputValues={inputValues}
                  handleInputChange={handleArrayInputChange}
                  handleAdd={handleArrayAdd}
                  handleRemove={handleArrayRemove}
                />
              ))}
            </section>

            <Separator className="mt-8 mb-6" />

            {/* Actions - No changes needed */}
            <div className="flex justify-end gap-3 pt-2">
              {/* ... (Cancel and Submit Buttons) ... */}
               <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/animals/${animalId}/health`)}
                disabled={isSubmitting} // Disable cancel while submitting too
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoading} // Also disable if loading initial data
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
