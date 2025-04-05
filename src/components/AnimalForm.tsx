import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { CalendarIcon, Check, ChevronDown, Loader2, Save, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  animalTypes, 
  breedsByType,
  genderOptions, 
  birthStatusOptions, 
  healthAtBirthOptions, 
  raisedPurchasedOptions,
  statusOptions,
  weightUnits,
  AnimalFormData,
  Animal
} from '@/types/AnimalTypes';
import { createAnimal, fetchAnimal, updateAnimal } from '@/services/animalService';

// Define which fields should be shown for each animal type
const fieldVisibilityByType = {
  common: [
    'name', 'type', 'breed', 'gender', 'birth_date', 'status',
    'tag_number', 'keywords', 'physical_traits', 'birth_weight', 'weight_unit'
  ],
  cattle: ['is_breeding_stock', 'colostrum_intake', 'raised_purchased', 'multiple_birth', 'birth_order', 'gestation_length', 'breeder_info', 'vaccinations', 'birth_status', 'health_at_birth', 'birth_photos'],
  sheep: ['is_breeding_stock', 'colostrum_intake', 'raised_purchased', 'multiple_birth', 'birth_order', 'vaccinations', 'birth_status', 'health_at_birth'],
  goat: ['is_breeding_stock', 'colostrum_intake', 'raised_purchased', 'multiple_birth', 'birth_order', 'vaccinations', 'birth_status', 'health_at_birth', 'milk_feeding'],
  pig: ['is_breeding_stock', 'multiple_birth', 'birth_order', 'birth_status', 'health_at_birth', 'raised_purchased'],
  horse: ['is_breeding_stock', 'birth_status', 'health_at_birth', 'vaccinations', 'breeder_info', 'raised_purchased', 'gestation_length'],
  chicken: ['raised_purchased', 'health_at_birth'],
  duck: ['raised_purchased', 'health_at_birth'],
  rabbit: ['is_breeding_stock', 'multiple_birth', 'birth_order', 'raised_purchased'],
  turkey: ['raised_purchased', 'health_at_birth'],
  alpaca: ['is_breeding_stock', 'vaccinations', 'breeder_info'],
  llama: ['is_breeding_stock', 'vaccinations', 'breeder_info'],
  buffalo: ['is_breeding_stock', 'colostrum_intake', 'raised_purchased', 'multiple_birth', 'birth_order', 'gestation_length', 'breeder_info', 'vaccinations', 'birth_status', 'health_at_birth'],
  deer: ['is_breeding_stock', 'raised_purchased', 'breeder_info', 'vaccinations'],
  emu: ['raised_purchased', 'health_at_birth'],
  ostrich: ['raised_purchased', 'health_at_birth'],
  quail: ['raised_purchased', 'health_at_birth'],
  pheasant: ['raised_purchased', 'health_at_birth'],
  geese: ['raised_purchased', 'health_at_birth'],
  bison: ['is_breeding_stock', 'raised_purchased', 'vaccinations', 'breeder_info'],
  donkey: ['is_breeding_stock', 'raised_purchased', 'vaccinations', 'breeder_info', 'gestation_length'],
  mule: ['raised_purchased', 'vaccinations', 'breeder_info'],
  camel: ['is_breeding_stock', 'raised_purchased', 'vaccinations', 'breeder_info', 'milk_feeding', 'gestation_length'],
  fish: ['raised_purchased'],
  'guinea fowl': ['raised_purchased', 'health_at_birth'],
  other: ['is_breeding_stock', 'multiple_birth', 'birth_order', 'birth_status', 'health_at_birth', 'milk_feeding', 'vaccinations', 'raised_purchased', 'colostrum_intake', 'gestation_length', 'breeder_info', 'birth_photos']
};

// Field groupings for organization
const fieldGroups = {
  birthDetails: ['birth_status', 'health_at_birth', 'multiple_birth', 'birth_order', 'gestation_length', 'birth_photos'],
  nutrition: ['colostrum_intake', 'milk_feeding'],
  management: ['is_breeding_stock', 'vaccinations', 'raised_purchased', 'breeder_info'],
};

const AnimalForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<AnimalFormData>({
    name: '',
    internal_id: '',
    type: 'cattle',
    breed: breedsByType['cattle'][0],
    gender: 'male',
    birth_date: format(new Date(), 'yyyy-MM-dd'),
    birth_time: '',
    tag_number: undefined,
    status: 'Active',
    is_breeding_stock: false,
    is_deceased: false,
    birth_weight: undefined,
    weight_unit: 'kg',
    birth_status: 'normal',
    colostrum_intake: null,
    health_at_birth: 'healthy',
    vaccinations: [],
    milk_feeding: null,
    multiple_birth: false,
    birth_order: null,
    gestation_length: null,
    breeder_info: null,
    raised_purchased: 'raised',
    birth_photos: null,
    physical_traits: [],
    keywords: []
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newTrait, setNewTrait] = useState<string>('');
  const [newKeyword, setNewKeyword] = useState<string>('');
  const [newVaccination, setNewVaccination] = useState<string>('');
  const [birthDate, setBirthDate] = useState<Date>(new Date());
  const [nextCheckupDate, setNextCheckupDate] = useState<Date | undefined>(undefined);
  const [breedOptions, setBreedOptions] = useState<string[]>(breedsByType[formData.type]);
  const [visibleFields, setVisibleFields] = useState<string[]>([]);

  // Update visible fields based on selected animal type
  useEffect(() => {
    const typeSpecificFields = fieldVisibilityByType[formData.type as keyof typeof fieldVisibilityByType] || [];
    const allVisibleFields = [...fieldVisibilityByType.common, ...typeSpecificFields];
    setVisibleFields(allVisibleFields);
  }, [formData.type]);

  useEffect(() => {
    setBreedOptions(breedsByType[formData.type]);
    if (!breedsByType[formData.type].includes(formData.breed)) {
      setFormData(prev => ({ ...prev, breed: breedsByType[formData.type][0] }));
    }
  }, [formData.type]);

  useEffect(() => {
    if (isEditing && id) {
      const loadAnimal = async () => {
        setIsFetching(true);
        try {
          const animal = await fetchAnimal(id);
          const birthDateTime = animal.birth_date ? parseISO(animal.birth_date) : new Date();
          const nextCheckup = animal.next_checkup_date ? parseISO(animal.next_checkup_date) : undefined;
          const formattedData: AnimalFormData = {
            ...animal,
            birth_date: format(birthDateTime, 'yyyy-MM-dd'),
            birth_time: animal.birth_time || '',
            tag_number: animal.tag_number || undefined,
            birth_weight: animal.birth_weight || undefined,
            colostrum_intake: animal.colostrum_intake || null,
            vaccinations: animal.vaccinations || [],
            milk_feeding: animal.milk_feeding || null,
            birth_order: animal.birth_order || null,
            gestation_length: animal.gestation_length || null,
            breeder_info: animal.breeder_info || null,
            birth_photos: animal.birth_photos || null,
            physical_traits: animal.physical_traits || [],
            keywords: animal.keywords || []
          };
          setFormData(formattedData);
          setBirthDate(birthDateTime);
          setNextCheckupDate(nextCheckup);
          setBreedOptions(breedsByType[animal.type]);
          toast.success('Animal data loaded successfully');
        } catch (error) {
          console.error('Error loading animal:', error);
          toast.error('Failed to load animal data. You can still edit the form with default values.');
        } finally {
          setIsFetching(false);
        }
      };
      loadAnimal();
    }
  }, [id, isEditing]);

  // Check if a field should be visible
  const isFieldVisible = (fieldName: string): boolean => {
    return visibleFields.includes(fieldName);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const parsedValue = 
      name === 'birth_weight' || name === 'birth_order' || name === 'gestation_length'
        ? (value === '' ? null : Number(value))
        : value;
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (name: keyof AnimalFormData) => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: keyof AnimalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setBirthDate(date);
      setFormData(prev => ({ ...prev, birth_date: format(date, 'yyyy-MM-dd') }));
      if (formErrors.birth_date) {
        setFormErrors(prev => ({ ...prev, birth_date: '' }));
      }
    }
  };

  const handleNextCheckupDateChange = (date: Date | undefined) => {
    setNextCheckupDate(date);
  };

  const addItem = (field: 'physical_traits' | 'keywords' | 'vaccinations', value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
      setter('');
    }
  };

  const removeItem = (field: 'physical_traits' | 'keywords' | 'vaccinations', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((item: string) => item !== value)
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.birth_date) {
      errors.birth_date = 'Birth date is required';
    }
    if (formData.birth_weight && formData.birth_weight < 0) {
      errors.birth_weight = 'Birth weight cannot be negative';
    }
    if (formData.birth_order && formData.birth_order < 0) {
      errors.birth_order = 'Birth order cannot be negative';
    }
    if (formData.gestation_length && formData.gestation_length < 0) {
      errors.gestation_length = 'Gestation length cannot be negative';
    }
  //  if (formData.tag_number && isNaN(Number(formData.tag_number))) {
     // errors.tag_number = 'Tag number must be numeric';
   // }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsLoading(true);
    const submissionData: Partial<Animal> = {
      ...formData,
      birth_time: formData.birth_time || null,
      next_checkup_date: nextCheckupDate ? format(nextCheckupDate, 'yyyy-MM-dd') : null,
    };

    try {
      if (isEditing && id) {
        await updateAnimal(id, submissionData);
        toast.success('Animal updated successfully');
      } else {
        const response = await createAnimal(submissionData as AnimalFormData);
        console.log('Created animal with internal_id:', response.internal_id);
        toast.success('Animal created successfully');
      }
      navigate('/animals');
    } catch (error: any) {
      console.error('Error saving animal:', error);
      const errorMessage = error.message || 'Failed to save animal';
      if (errorMessage.includes('birth time field must be a valid date')) {
        setFormErrors(prev => ({
          ...prev,
          birth_time: 'Please enter a valid time (HH:mm:ss) or leave it blank',
        }));
        toast.error('Update failed: Invalid birth time format');
      } else if (errorMessage.includes('tag number has already been taken')) {
        setFormErrors(prev => ({
          ...prev,
          tag_number: 'This tag number is already in use by another animal',
        }));
        toast.error('Update failed: Tag number conflict');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFormTitle = () => {
    return isEditing ? `Edit ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}` : `Add New ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <Card className="shadow-lg border-border">
        <CardHeader className="bg-card border-b">
          <CardTitle className="font-serif text-2xl flex items-center justify-between">
            {getFormTitle()}
            {isFetching && (
              <span className="text-sm text-muted-foreground flex items-center">
                <Loader2 className="inline h-4 w-4 animate-spin mr-2" /> Loading...
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-serif text-sm">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter animal name"
                    className={cn("font-serif", formErrors.name && "border-destructive")}
                    disabled={isLoading}
                  />
                  {formErrors.name && <p className="text-destructive text-xs">{formErrors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="font-serif text-sm">Animal Type *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleSelectChange('type', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="font-serif">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="font-serif max-h-80">
                      {animalTypes.map((type) => (
                        <SelectItem key={type} value={type} className="font-serif">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breed" className="font-serif text-sm">Breed *</Label>
                  <Select 
                    value={formData.breed} 
                    onValueChange={(value) => handleSelectChange('breed', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="font-serif">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="font-serif max-h-80">
                      {breedOptions.map((breed) => (
                        <SelectItem key={breed} value={breed} className="font-serif">
                          {breed}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="font-serif text-sm">Gender *</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => handleSelectChange('gender', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="font-serif">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="font-serif">
                      {genderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="font-serif">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Birth Information Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="birth_date" className="font-serif text-sm">Birth Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-serif",
                          formErrors.birth_date && "border-destructive"
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.birth_date ? format(new Date(formData.birth_date), 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-border shadow-md">
                      <Calendar
                        mode="single"
                        selected={birthDate}
                        onSelect={handleDateChange}
                        initialFocus
                        disabled={isLoading}
                      />
                    </PopoverContent>
                  </Popover>
                  {formErrors.birth_date && <p className="text-destructive text-xs">{formErrors.birth_date}</p>}
                </div>

               

                <div className="space-y-2">
                  <Label htmlFor="tag_number" className="font-serif text-sm">Tag Number</Label>
                  <Input
                    id="tag_number"
                    name="tag_number"
                    value={formData.tag_number ?? ''}
                    onChange={handleInputChange}
                    placeholder="Enter tag number"
                    className={cn("font-serif", formErrors.tag_number && "border-destructive")}
                    disabled={isLoading || isEditing} // Disable in edit mode if tag is system-managed
                  />
                  {!isEditing && (
                    <p className="text-xs text-muted-foreground">Leave blank for auto-generation</p>
                  )}
                  {formErrors.tag_number && <p className="text-destructive text-xs">{formErrors.tag_number}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="font-serif text-sm">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleSelectChange('status', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="font-serif">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="font-serif">
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="font-serif">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_deceased"
                    checked={formData.is_deceased}
                    onCheckedChange={handleCheckboxChange('is_deceased')}
                    disabled={isLoading}
                  />
                  <Label htmlFor="is_deceased" className="font-serif text-sm">Deceased</Label>
                </div>
              </div>

              {/* Additional Fields */}
              <div className="md:col-span-2 space-y-6">
                {/* Weight Information */}
                {isFieldVisible('birth_weight') && (
                  <div className="space-y-4">
                    <h3 className="font-serif font-medium text-lg">Weight Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birth_weight" className="font-serif text-sm">Birth Weight</Label>
                        <div className="flex gap-2">
                          <Input
                            id="birth_weight"
                            name="birth_weight"
                            type="number"
                            value={formData.birth_weight ?? ''}
                            onChange={handleInputChange}
                            placeholder="Weight"
                            className={cn("font-serif flex-1", formErrors.birth_weight && "border-destructive")}
                            min="0"
                            step="0.1"
                            disabled={isLoading}
                          />
                          <Select 
                            value={formData.weight_unit} 
                            onValueChange={(value) => handleSelectChange('weight_unit', value)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="w-24 font-serif">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="font-serif">
                              {weightUnits.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value} className="font-serif">
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {formErrors.birth_weight && <p className="text-destructive text-xs">{formErrors.birth_weight}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="next_checkup_date" className="font-serif text-sm">Next Checkup</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-serif",
                                !nextCheckupDate && "text-muted-foreground"
                              )}
                              disabled={isLoading}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {nextCheckupDate ? format(nextCheckupDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-border shadow-md">
                            <Calendar
                              mode="single"
                              selected={nextCheckupDate}
                              onSelect={handleNextCheckupDateChange}
                              initialFocus
                              disabled={isLoading}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                )}

                {/* Birth Details Section */}
                {fieldGroups.birthDetails.some(field => isFieldVisible(field)) && (
                  <div className="space-y-4">
                    <h3 className="font-serif font-medium text-lg">Birth Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {isFieldVisible('birth_status') && (
                        <div className="space-y-2">
                          <Label htmlFor="birth_status" className="font-serif text-sm">Birth Status</Label>
                          <Select 
                            value={formData.birth_status} 
                            onValueChange={(value) => handleSelectChange('birth_status', value)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="font-serif">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="font-serif">
                              {birthStatusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="font-serif">
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {isFieldVisible('health_at_birth') && (
                        <div className="space-y-2">
                          <Label htmlFor="health_at_birth" className="font-serif text-sm">Health at Birth</Label>
                          <Select 
                            value={formData.health_at_birth} 
                            onValueChange={(value) => handleSelectChange('health_at_birth', value)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="font-serif">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="font-serif">
                              {healthAtBirthOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="font-serif">
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {isFieldVisible('multiple_birth') && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="multiple_birth"
                            checked={formData.multiple_birth}
                            onCheckedChange={handleCheckboxChange('multiple_birth')}
                            disabled={isLoading}
                          />
                          <Label htmlFor="multiple_birth" className="font-serif text-sm">Multiple Birth</Label>
                        </div>
                      )}

                      {isFieldVisible('birth_order') && (
                        <div className="space-y-2">
                          <Label htmlFor="birth_order" className="font-serif text-sm">Birth Order</Label>
                          <Input
                            id="birth_order"
                            name="birth_order"
                            type="number"
                            value={formData.birth_order ?? ''}
                            onChange={handleInputChange}
                            placeholder="Enter order"
                            className={cn("font-serif", formErrors.birth_order && "border-destructive")}
                            disabled={isLoading}
                            min="1"
                          />
                          {formErrors.birth_order && <p className="text-destructive text-xs">{formErrors.birth_order}</p>}
                        </div>
                      )}

                      {isFieldVisible('gestation_length') && (
                        <div className="space-y-2">
                          <Label htmlFor="gestation_length" className="font-serif text-sm">Gestation Length (days)</Label>
                          <Input
                            id="gestation_length"
                            name="gestation_length"
                            type="number"
                            value={formData.gestation_length ?? ''}
                            onChange={handleInputChange}
                            placeholder="Enter days"
                            className={cn("font-serif", formErrors.gestation_length && "border-destructive")}
                            disabled={isLoading}
                            min="0"
                          />
                          {formErrors.gestation_length && <p className="text-destructive text-xs">{formErrors.gestation_length}</p>}
                        </div>
                      )}

                      {isFieldVisible('birth_photos') && (
                        <div className="space-y-2">
                          <Label htmlFor="birth_photos" className="font-serif text-sm">Birth Photos URL</Label>
                          <Input
                            id="birth_photos"
                            name="birth_photos"
                            value={formData.birth_photos || ''}
                            onChange={handleInputChange}
                            placeholder="Enter URL"
                            className="font-serif"
                            disabled={isLoading}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Nutrition Section */}
                {fieldGroups.nutrition.some(field => isFieldVisible(field)) && (
                  <div className="space-y-4">
                    <h3 className="font-serif font-medium text-lg">Nutrition</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {isFieldVisible('colostrum_intake') && (
                        <div className="space-y-2">
                          <Label htmlFor="colostrum_intake" className="font-serif text-sm">Colostrum Intake</Label>
                          <Input
                            id="colostrum_intake"
                            name="colostrum_intake"
                            value={formData.colostrum_intake || ''}
                            onChange={handleInputChange}
                            placeholder="Enter details"
                            className="font-serif"
                            disabled={isLoading}
                          />
                        </div>
                      )}

                      {isFieldVisible('milk_feeding') && (
                        <div className="space-y-2">
                          <Label htmlFor="milk_feeding" className="font-serif text-sm">Milk Feeding</Label>
                          <Input
                            id="milk_feeding"
                            name="milk_feeding"
                            value={formData.milk_feeding || ''}
                            onChange={handleInputChange}
                            placeholder="Enter feeding details"
                            className="font-serif"
                            disabled={isLoading}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Management Section */}
                {fieldGroups.management.some(field => isFieldVisible(field)) && (
                  <div className="space-y-4">
                    <h3 className="font-serif font-medium text-lg">Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {isFieldVisible('is_breeding_stock') && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="is_breeding_stock"
                            checked={formData.is_breeding_stock}
                            onCheckedChange={handleCheckboxChange('is_breeding_stock')}
                            disabled={isLoading}
                          />
                          <Label htmlFor="is_breeding_stock" className="font-serif text-sm">Breeding Stock</Label>
                        </div>
                      )}

                      {isFieldVisible('raised_purchased') && (
                        <div className="space-y-2">
                          <Label htmlFor="raised_purchased" className="font-serif text-sm">Raised or Purchased</Label>
                          <Select
                            value={formData.raised_purchased}
                            onValueChange={(value) => handleSelectChange('raised_purchased', value)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="font-serif">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="font-serif">
                              {raisedPurchasedOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="font-serif">
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {isFieldVisible('breeder_info') && (
                        <div className="space-y-2">
                          <Label htmlFor="breeder_info" className="font-serif text-sm">Breeder Info</Label>
                          <Input
                            id="breeder_info"
                            name="breeder_info"
                            value={formData.breeder_info || ''}
                            onChange={handleInputChange}
                            placeholder="Enter breeder details"
                            className="font-serif"
                            disabled={isLoading}
                          />
                        </div>
                      )}
                    </div>

                    {isFieldVisible('vaccinations') && (
                      <div className="space-y-2">
                        <Label className="font-serif text-sm">Vaccinations</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newVaccination}
                            onChange={(e) => setNewVaccination(e.target.value)}
                            placeholder="Add vaccination"
                            className="font-serif"
                            disabled={isLoading}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addItem('vaccinations', newVaccination, setNewVaccination);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => addItem('vaccinations', newVaccination, setNewVaccination)}
                            disabled={isLoading || !newVaccination.trim()}
                            className="font-serif"
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.vaccinations.map((vaccination) => (
                            <Badge key={vaccination} variant="secondary" className="font-serif">
                              {vaccination}
                              <button
                                type="button"
                                onClick={() => removeItem('vaccinations', vaccination)}
                                className="ml-2 text-destructive"
                                disabled={isLoading}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Traits and Keywords */}
                <div className="space-y-4">
                  <h3 className="font-serif font-medium text-lg">Traits & Keywords</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isFieldVisible('physical_traits') && (
                      <div className="space-y-2">
                        <Label className="font-serif text-sm">Physical Traits</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newTrait}
                            onChange={(e) => setNewTrait(e.target.value)}
                            placeholder="Add trait"
                            className="font-serif"
                            disabled={isLoading}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addItem('physical_traits', newTrait, setNewTrait);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => addItem('physical_traits', newTrait, setNewTrait)}
                            disabled={isLoading || !newTrait.trim()}
                            className="font-serif"
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.physical_traits.map((trait) => (
                            <Badge key={trait} variant="secondary" className="font-serif">
                              {trait}
                              <button
                                type="button"
                                onClick={() => removeItem('physical_traits', trait)}
                                className="ml-2 text-destructive"
                                disabled={isLoading}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {isFieldVisible('keywords') && (
                      <div className="space-y-2">
                        <Label className="font-serif text-sm">Keywords</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            placeholder="Add keyword"
                            className="font-serif"
                            disabled={isLoading}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addItem('keywords', newKeyword, setNewKeyword);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => addItem('keywords', newKeyword, setNewKeyword)}
                            disabled={isLoading || !newKeyword.trim()}
                            className="font-serif"
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.keywords.map((keyword) => (
                            <Badge key={keyword} variant="secondary" className="font-serif">
                              {keyword}
                              <button
                                type="button"
                                onClick={() => removeItem('keywords', keyword)}
                                className="ml-2 text-destructive"
                                disabled={isLoading}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/animals')}
                disabled={isLoading}
                className="font-serif"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="font-serif"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isEditing ? 'Update' : 'Save'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimalForm;