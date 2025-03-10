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
          const animal = await fetchAnimal(id); // Using the fetchAnimal from your animalService.ts
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
      next_checkup_date: nextCheckupDate ? format(nextCheckupDate, 'yyyy-MM-dd') : null,
    };

    try {
      if (isEditing && id) {
        await updateAnimal(id, submissionData);
        toast.success('Animal updated successfully');
      } else {
        await createAnimal(submissionData as AnimalFormData);
        toast.success('Animal created successfully');
      }
      navigate('/animals');
    } catch (error: any) {
      console.error('Error saving animal:', error);
      const errorMessage = error.message || 'Failed to save animal';
      if (errorMessage.includes('tag number has already been taken')) {
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
    <Card className="w-full max-w-4xl mx-auto shadow-md border-border">
      <CardHeader className="bg-card">
        <CardTitle className="font-serif text-2xl">
          {isEditing ? 'Edit Animal' : 'Add New Animal'}
          {isFetching && (
            <span className="ml-2 text-sm text-muted-foreground">
              <Loader2 className="inline h-4 w-4 animate-spin" /> Loading data...
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-card pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-serif">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter animal name"
                className={cn("font-serif bg-background", formErrors.name && "border-destructive")}
                disabled={isLoading}
              />
              {formErrors.name && <p className="text-destructive text-sm">{formErrors.name}</p>}
            </div>

            {/* Animal Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="font-serif">Animal Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleSelectChange('type', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full font-serif bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-serif bg-background">
                  {animalTypes.map((type) => (
                    <SelectItem key={type} value={type} className="font-serif">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Breed */}
            <div className="space-y-2">
              <Label htmlFor="breed" className="font-serif">Breed *</Label>
              <Select 
                value={formData.breed} 
                onValueChange={(value) => handleSelectChange('breed', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full font-serif bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-serif bg-background">
                  {breedOptions.map((breed) => (
                    <SelectItem key={breed} value={breed} className="font-serif">
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="font-serif">Gender *</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => handleSelectChange('gender', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full font-serif bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-serif bg-background">
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="font-serif">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birth_date" className="font-serif">Birth Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal font-serif bg-background",
                      formErrors.birth_date && "border-destructive"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.birth_date ? format(new Date(formData.birth_date), 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border border-border shadow-md">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={handleDateChange}
                    initialFocus
                    className="bg-card"
                    disabled={isLoading}
                  />
                </PopoverContent>
              </Popover>
              {formErrors.birth_date && <p className="text-destructive text-sm">{formErrors.birth_date}</p>}
            </div>

            {/* Birth Time */}
            <div className="space-y-2">
              <Label htmlFor="birth_time" className="font-serif">Birth Time</Label>
              <Input
                id="birth_time"
                name="birth_time"
                value={formData.birth_time}
                onChange={handleInputChange}
                placeholder="HH:mm:ss (optional)"
                className="font-serif bg-background"
                disabled={isLoading}
              />
            </div>

            {/* Tag Number */}
            <div className="space-y-2">
              <Label htmlFor="tag_number" className="font-serif">Tag Number</Label>
              <Input
                id="tag_number"
                name="tag_number"
                value={formData.tag_number || ''}
                onChange={handleInputChange}
                placeholder="Enter tag number"
                className={cn("font-serif bg-background", formErrors.tag_number && "border-destructive")}
                disabled={isLoading}
              />
              {formErrors.tag_number && <p className="text-destructive text-sm">{formErrors.tag_number}</p>}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="font-serif">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange('status', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full font-serif bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-serif bg-background">
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="font-serif">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_breeding_stock"
                  checked={formData.is_breeding_stock}
                  onCheckedChange={handleCheckboxChange('is_breeding_stock')}
                  className="bg-background"
                  disabled={isLoading}
                />
                <Label htmlFor="is_breeding_stock" className="font-serif">Breeding Stock</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_deceased"
                  checked={formData.is_deceased}
                  onCheckedChange={handleCheckboxChange('is_deceased')}
                  className="bg-background"
                  disabled={isLoading}
                />
                <Label htmlFor="is_deceased" className="font-serif">Deceased</Label>
              </div>
            </div>

            {/* Next Checkup Date */}
            <div className="space-y-2">
              <Label htmlFor="next_checkup_date" className="font-serif">Next Checkup Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal font-serif bg-background",
                      !nextCheckupDate && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nextCheckupDate ? format(nextCheckupDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border border-border shadow-md">
                  <Calendar
                    mode="single"
                    selected={nextCheckupDate}
                    onSelect={handleNextCheckupDateChange}
                    initialFocus
                    className="bg-card"
                    disabled={isLoading}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Birth Weight */}
            <div className="space-y-2">
              <Label htmlFor="birth_weight" className="font-serif">Birth Weight</Label>
              <div className="flex space-x-2">
                <Input
                  id="birth_weight"
                  name="birth_weight"
                  type="number"
                  value={formData.birth_weight ?? ''}
                  onChange={handleInputChange}
                  placeholder="Enter birth weight"
                  className={cn("flex-1 font-serif bg-background", formErrors.birth_weight && "border-destructive")}
                  min="0"
                  step="0.1"
                  disabled={isLoading}
                />
                <Select 
                  value={formData.weight_unit} 
                  onValueChange={(value) => handleSelectChange('weight_unit', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-20 font-serif bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="font-serif bg-background">
                    {weightUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value} className="font-serif">
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formErrors.birth_weight && <p className="text-destructive text-sm">{formErrors.birth_weight}</p>}
            </div>

            {/* Birth Status */}
            <div className="space-y-2">
              <Label htmlFor="birth_status" className="font-serif">Birth Status</Label>
              <Select 
                value={formData.birth_status} 
                onValueChange={(value) => handleSelectChange('birth_status', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full font-serif bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-serif bg-background">
                  {birthStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="font-serif">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Colostrum Intake */}
            <div className="space-y-2">
              <Label htmlFor="colostrum_intake" className="font-serif">Colostrum Intake</Label>
              <Input
                id="colostrum_intake"
                name="colostrum_intake"
                value={formData.colostrum_intake || ''}
                onChange={handleInputChange}
                placeholder="Enter colostrum intake"
                className="font-serif bg-background"
                disabled={isLoading}
              />
            </div>

            {/* Health at Birth */}
            <div className="space-y-2">
              <Label htmlFor="health_at_birth" className="font-serif">Health at Birth</Label>
              <Select 
                value={formData.health_at_birth} 
                onValueChange={(value) => handleSelectChange('health_at_birth', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full font-serif bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-serif bg-background">
                  {healthAtBirthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="font-serif">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vaccinations */}
            <div className="space-y-2 md:col-span-2">
              <Label className="font-serif">Vaccinations</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.vaccinations?.map((vaccination, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1 font-serif">
                    {vaccination}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0 ml-2" 
                      onClick={() => removeItem('vaccinations', vaccination)}
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  value={newVaccination}
                  onChange={(e) => setNewVaccination(e.target.value)}
                  placeholder="Add a vaccination"
                  className="flex-1 font-serif bg-background"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('vaccinations', newVaccination, setNewVaccination))}
                  disabled={isLoading}
                />
                <Button 
                  type="button" 
                  onClick={() => addItem('vaccinations', newVaccination, setNewVaccination)} 
                  className="font-serif"
                  disabled={isLoading}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Milk Feeding */}
            <div className="space-y-2">
              <Label htmlFor="milk_feeding" className="font-serif">Milk Feeding</Label>
              <Input
                id="milk_feeding"
                name="milk_feeding"
                value={formData.milk_feeding || ''}
                onChange={handleInputChange}
                placeholder="Enter milk feeding details"
                className="font-serif bg-background"
                disabled={isLoading}
              />
            </div>

            {/* Multiple Birth */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="multiple_birth"
                checked={formData.multiple_birth}
                onCheckedChange={handleCheckboxChange('multiple_birth')}
                className="bg-background"
                disabled={isLoading}
              />
              <Label htmlFor="multiple_birth" className="font-serif">Multiple Birth</Label>
            </div>

            {/* Birth Order */}
            <div className="space-y-2">
              <Label htmlFor="birth_order" className="font-serif">Birth Order</Label>
              <Input
                id="birth_order"
                name="birth_order"
                type="number"
                value={formData.birth_order ?? ''}
                onChange={handleInputChange}
                placeholder="Enter birth order"
                className={cn("font-serif bg-background", formErrors.birth_order && "border-destructive")}
                min="0"
                disabled={isLoading}
              />
              {formErrors.birth_order && <p className="text-destructive text-sm">{formErrors.birth_order}</p>}
            </div>

            {/* Gestation Length */}
            <div className="space-y-2">
              <Label htmlFor="gestation_length" className="font-serif">Gestation Length (days)</Label>
              <Input
                id="gestation_length"
                name="gestation_length"
                type="number"
                value={formData.gestation_length ?? ''}
                onChange={handleInputChange}
                placeholder="Enter gestation length"
                className={cn("font-serif bg-background", formErrors.gestation_length && "border-destructive")}
                min="0"
                disabled={isLoading}
              />
              {formErrors.gestation_length && <p className="text-destructive text-sm">{formErrors.gestation_length}</p>}
            </div>

            {/* Breeder Info */}
            <div className="space-y-2">
              <Label htmlFor="breeder_info" className="font-serif">Breeder Info</Label>
              <Input
                id="breeder_info"
                name="breeder_info"
                value={formData.breeder_info || ''}
                onChange={handleInputChange}
                placeholder="Enter breeder information"
                className="font-serif bg-background"
                disabled={isLoading}
              />
            </div>

            {/* Origin */}
            <div className="space-y-2">
              <Label htmlFor="raised_purchased" className="font-serif">Origin</Label>
              <Select 
                value={formData.raised_purchased} 
                onValueChange={(value) => handleSelectChange('raised_purchased', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full font-serif bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-serif bg-background">
                  {raisedPurchasedOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="font-serif">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Birth Photos */}
            <div className="space-y-2">
              <Label htmlFor="birth_photos" className="font-serif">Birth Photos URL</Label>
              <Input
                id="birth_photos"
                name="birth_photos"
                value={formData.birth_photos || ''}
                onChange={handleInputChange}
                placeholder="Enter URL to birth photos"
                className="font-serif bg-background"
                disabled={isLoading}
              />
            </div>

            {/* Physical Traits */}
            <div className="space-y-2 md:col-span-2">
              <Label className="font-serif">Physical Traits</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.physical_traits?.map((trait, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1 font-serif">
                    {trait}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0 ml-2" 
                      onClick={() => removeItem('physical_traits', trait)}
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  value={newTrait}
                  onChange={(e) => setNewTrait(e.target.value)}
                  placeholder="Add a physical trait"
                  className="flex-1 font-serif bg-background"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('physical_traits', newTrait, setNewTrait))}
                  disabled={isLoading}
                />
                <Button 
                  type="button" 
                  onClick={() => addItem('physical_traits', newTrait, setNewTrait)} 
                  className="font-serif"
                  disabled={isLoading}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-2 md:col-span-2">
              <Label className="font-serif">Keywords</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.keywords?.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1 font-serif">
                    {keyword}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0 ml-2" 
                      onClick={() => removeItem('keywords', keyword)}
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Add a keyword"
                  className="flex-1 font-serif bg-background"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('keywords', newKeyword, setNewKeyword))}
                  disabled={isLoading}
                />
                <Button 
                  type="button" 
                  onClick={() => addItem('keywords', newKeyword, setNewKeyword)} 
                  className="font-serif"
                  disabled={isLoading}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/animals')}
              className="font-serif"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="font-serif">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Animal" : "Create Animal"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AnimalForm;