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
    if (formData.tag_number && isNaN(Number(formData.tag_number))) {
      errors.tag_number = 'Tag number must be numeric';
    }

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

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <Card className="shadow-lg border-border">
        <CardHeader className="bg-card border-b">
          <CardTitle className="font-serif text-2xl flex items-center justify-between">
            {isEditing ? 'Edit Animal' : 'Add New Animal'}
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
                    <SelectContent className="font-serif">
                      {animalTypes.map((type) => (
                        <SelectItem key={type} value={type} className="font-serif">
                          {type}
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
                    <SelectContent className="font-serif">
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
                  <Label htmlFor="birth_time" className="font-serif text-sm">Birth Time</Label>
                  <Input
                    id="birth_time"
                    name="birth_time"
                    value={formData.birth_time}
                    onChange={handleInputChange}
                    placeholder="HH:mm:ss (optional)"
                    className={cn("font-serif", formErrors.birth_time && "border-destructive")}
                    disabled={isLoading}
                  />
                  {formErrors.birth_time && <p className="text-destructive text-xs">{formErrors.birth_time}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tag_number" className="font-serif text-sm">Tag Number</Label>
                  <Input
                    id="tag_number"
                    name="tag_number"
                    value={isEditing ? (formData.tag_number || 'N/A') : 'Generated automatically'}
                    className="font-serif bg-muted text-muted-foreground"
                    disabled
                  />
                  {!isEditing && (
                    <p className="text-xs text-muted-foreground">System-generated</p>
                  )}
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
              </div>

              {/* Additional Fields */}
              <div className="md:col-span-2 space-y-4">
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

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_breeding_stock"
                      checked={formData.is_breeding_stock}
                      onCheckedChange={handleCheckboxChange('is_breeding_stock')}
                      disabled={isLoading}
                    />
                    <Label htmlFor="is_breeding_stock" className="font-serif text-sm">Breeding Stock</Label>
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
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="multiple_birth"
                      checked={formData.multiple_birth}
                      onCheckedChange={handleCheckboxChange('multiple_birth')}
                      disabled={isLoading}
                    />
                    <Label htmlFor="multiple_birth" className="font-serif text-sm">Multiple Birth</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-serif text-sm">Vaccinations</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.vaccinations?.map((vaccination, index) => (
                      <Badge key={index} variant="outline" className="font-serif">
                        {vaccination}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-4 w-4 p-0 ml-1" 
                          onClick={() => removeItem('vaccinations', vaccination)}
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newVaccination}
                      onChange={(e) => setNewVaccination(e.target.value)}
                      placeholder="Add vaccination"
                      className="font-serif flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('vaccinations', newVaccination, setNewVaccination))}
                      disabled={isLoading}
                    />
                    <Button 
                      type="button" 
                      onClick={() => addItem('vaccinations', newVaccination, setNewVaccination)} 
                      size="sm"
                      className="font-serif"
                      disabled={isLoading}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-serif text-sm">Physical Traits</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.physical_traits?.map((trait, index) => (
                      <Badge key={index} variant="secondary" className="font-serif">
                        {trait}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-4 w-4 p-0 ml-1" 
                          onClick={() => removeItem('physical_traits', trait)}
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTrait}
                      onChange={(e) => setNewTrait(e.target.value)}
                      placeholder="Add trait"
                      className="font-serif flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('physical_traits', newTrait, setNewTrait))}
                      disabled={isLoading}
                    />
                    <Button 
                      type="button" 
                      onClick={() => addItem('physical_traits', newTrait, setNewTrait)} 
                      size="sm"
                      className="font-serif"
                      disabled={isLoading}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-serif text-sm">Keywords</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.keywords?.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="font-serif">
                        {keyword}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-4 w-4 p-0 ml-1" 
                          onClick={() => removeItem('keywords', keyword)}
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Add keyword"
                      className="font-serif flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('keywords', newKeyword, setNewKeyword))}
                      disabled={isLoading}
                    />
                    <Button 
                      type="button" 
                      onClick={() => addItem('keywords', newKeyword, setNewKeyword)} 
                      size="sm"
                      className="font-serif"
                      disabled={isLoading}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "birth_status", label: "Birth Status", options: birthStatusOptions },
                    { id: "health_at_birth", label: "Health at Birth", options: healthAtBirthOptions },
                    { id: "raised_purchased", label: "Origin", options: raisedPurchasedOptions },
                  ].map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="font-serif text-sm">{field.label}</Label>
                      <Select 
                        value={formData[field.id as keyof AnimalFormData] as string} 
                        onValueChange={(value) => handleSelectChange(field.id as keyof AnimalFormData, value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="font-serif">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="font-serif">
                          {field.options.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="font-serif">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "colostrum_intake", label: "Colostrum Intake", placeholder: "Enter intake" },
                    { id: "milk_feeding", label: "Milk Feeding", placeholder: "Enter details" },
                    { id: "birth_order", label: "Birth Order", placeholder: "Enter order", type: "number" },
                    { id: "gestation_length", label: "Gestation Length (days)", placeholder: "Enter days", type: "number" },
                    { id: "breeder_info", label: "Breeder Info", placeholder: "Enter info" },
                    { id: "birth_photos", label: "Birth Photos URL", placeholder: "Enter URL" },
                  ].map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="font-serif text-sm">{field.label}</Label>
                      <Input
                        id={field.id}
                        name={field.id}
                        type={field.type || "text"}
                        value={formData[field.id as keyof AnimalFormData] === null 
                          ? '' 
                          : String(formData[field.id as keyof AnimalFormData])}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        className={cn("font-serif", formErrors[field.id] && "border-destructive")}
                        disabled={isLoading}
                        min={field.type === "number" ? 0 : undefined}
                      />
                      {formErrors[field.id] && <p className="text-destructive text-xs">{formErrors[field.id]}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/animals')}
                className="font-serif px-6"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="font-serif px-6"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimalForm;