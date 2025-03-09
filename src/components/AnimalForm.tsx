
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { CalendarIcon, Check, ChevronsUpDown, Loader2, Save, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
    breed: '',
    gender: 'unknown',
    birth_date: format(new Date(), 'yyyy-MM-dd'),
    birth_time: format(new Date(), 'HH:mm:ss'),
    tag_number: '',
    status: 'Active',
    is_breeding_stock: false,
    is_deceased: false,
    birth_weight: null,
    weight_unit: 'kg',
    birth_status: 'normal',
    health_at_birth: 'healthy',
    multiple_birth: false,
    raised_purchased: 'raised',
    physical_traits: [],
    keywords: []
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newTrait, setNewTrait] = useState<string>('');
  const [newKeyword, setNewKeyword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<Date>(new Date());
  
  // Dropdown states
  const [breedOptions, setBreedOptions] = useState<string[]>(breedsByType[formData.type] || []);
  
  useEffect(() => {
    // Update breed options when animal type changes
    setBreedOptions(breedsByType[formData.type] || []);
    
    // If switching type, select the first breed from the new options
    if (breedsByType[formData.type] && !breedsByType[formData.type].includes(formData.breed)) {
      setFormData(prev => ({ ...prev, breed: breedsByType[formData.type][0] }));
    }
  }, [formData.type]);

  useEffect(() => {
    if (isEditing && id) {
      const loadAnimal = async () => {
        setIsLoading(true);
        try {
          const animal = await fetchAnimal(id);
          const formattedData: AnimalFormData = {
            ...animal,
            birth_date: animal.birth_date ? animal.birth_date.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
          };
          setFormData(formattedData);
          if (animal.birth_date) {
            setBirthDate(parseISO(animal.birth_date));
          }
          
          // Update breed options based on the loaded animal type
          setBreedOptions(breedsByType[animal.type] || []);
          
        } catch (error) {
          console.error('Error loading animal:', error);
          toast.error('Failed to load animal data');
          setError('Failed to load animal data');
        } finally {
          setIsLoading(false);
        }
      };

      loadAnimal();
    }
  }, [id, isEditing]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setBirthDate(date);
      setFormData((prev) => ({ 
        ...prev, 
        birth_date: format(date, 'yyyy-MM-dd') 
      }));
    }
  };

  const addTrait = () => {
    if (newTrait.trim()) {
      setFormData((prev) => ({
        ...prev,
        physical_traits: [...(prev.physical_traits || []), newTrait.trim()]
      }));
      setNewTrait('');
    }
  };

  const removeTrait = (trait: string) => {
    setFormData((prev) => ({
      ...prev,
      physical_traits: (prev.physical_traits || []).filter((t) => t !== trait)
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: (prev.keywords || []).filter((k) => k !== keyword)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEditing && id) {
        await updateAnimal(id, formData);
        toast.success('Animal updated successfully');
      } else {
        await createAnimal(formData);
        toast.success('Animal created successfully');
      }
      navigate('/animals');
    } catch (error: any) {
      console.error('Error saving animal:', error);
      setError(error.message || 'Failed to save animal');
      toast.error(error.message || 'Failed to save animal');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg font-serif">Loading animal data...</span>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-md border-border">
      <CardHeader className="bg-card">
        <CardTitle className="font-serif text-2xl">{isEditing ? 'Edit Animal' : 'Add New Animal'}</CardTitle>
        <CardDescription className="font-serif">
          Enter all animal information in this form
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-card pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-serif">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter animal name"
                className="font-serif bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="font-serif">Animal Type *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="type"
                    variant="outline"
                    role="combobox"
                    aria-expanded={true}
                    className="w-full justify-between font-serif bg-background"
                  >
                    {formData.type || "Select type..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-background border border-border shadow-md">
                  <Command className="bg-background">
                    <CommandInput placeholder="Search animal type..." className="font-serif" />
                    <CommandEmpty className="font-serif">No type found.</CommandEmpty>
                    <CommandGroup className="bg-background max-h-[200px] overflow-y-auto">
                      {animalTypes.map((type) => (
                        <CommandItem
                          key={type}
                          value={type}
                          onSelect={() => {
                            handleSelectChange('type', type);
                          }}
                          className="font-serif"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.type === type ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {type}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed" className="font-serif">Breed *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="breed"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-serif bg-background"
                  >
                    {formData.breed || "Select breed..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-background border border-border shadow-md">
                  <Command className="bg-background">
                    <CommandInput placeholder="Search breed..." className="font-serif" />
                    <CommandEmpty className="font-serif">No breed found.</CommandEmpty>
                    <CommandGroup className="bg-background max-h-[200px] overflow-y-auto">
                      {breedOptions.map((breed) => (
                        <CommandItem
                          key={breed}
                          value={breed}
                          onSelect={() => handleSelectChange('breed', breed)}
                          className="font-serif"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.breed === breed ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {breed}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="font-serif">Gender *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="gender"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-serif bg-background"
                  >
                    {genderOptions.find(option => option.value === formData.gender)?.label || "Select gender..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-background border border-border shadow-md">
                  <Command className="bg-background">
                    <CommandInput placeholder="Search gender..." className="font-serif" />
                    <CommandEmpty className="font-serif">No gender found.</CommandEmpty>
                    <CommandGroup className="bg-background">
                      {genderOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => handleSelectChange('gender', option.value)}
                          className="font-serif"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.gender === option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date" className="font-serif">Birth Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="birth_date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal font-serif bg-background",
                      !formData.birth_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.birth_date ? format(new Date(formData.birth_date), 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border border-border shadow-md" align="start">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={handleDateChange}
                    initialFocus
                    className="bg-card"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag_number" className="font-serif">Tag Number</Label>
              <Input
                id="tag_number"
                name="tag_number"
                value={formData.tag_number || ''}
                onChange={handleInputChange}
                placeholder="Enter tag number"
                className="font-serif bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="font-serif">Status</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="status"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-serif bg-background"
                  >
                    {statusOptions.find(option => option.value === formData.status)?.label || "Select status..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-background border border-border shadow-md">
                  <Command className="bg-background">
                    <CommandInput placeholder="Search status..." className="font-serif" />
                    <CommandEmpty className="font-serif">No status found.</CommandEmpty>
                    <CommandGroup className="bg-background">
                      {statusOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => handleSelectChange('status', option.value)}
                          className="font-serif"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.status === option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_breeding_stock"
                checked={formData.is_breeding_stock}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('is_breeding_stock', checked === true)
                }
                className="bg-background"
              />
              <Label htmlFor="is_breeding_stock" className="font-serif">Breeding Stock</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_deceased"
                checked={formData.is_deceased}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('is_deceased', checked === true)
                }
                className="bg-background"
              />
              <Label htmlFor="is_deceased" className="font-serif">Deceased</Label>
            </div>
          
            <div className="space-y-2">
              <Label htmlFor="birth_status" className="font-serif">Birth Status</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="birth_status"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-serif bg-background"
                  >
                    {birthStatusOptions.find(option => option.value === formData.birth_status)?.label || "Select birth status..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-background border border-border shadow-md">
                  <Command className="bg-background">
                    <CommandInput placeholder="Search birth status..." className="font-serif" />
                    <CommandEmpty className="font-serif">No birth status found.</CommandEmpty>
                    <CommandGroup className="bg-background">
                      {birthStatusOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => handleSelectChange('birth_status', option.value)}
                          className="font-serif"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.birth_status === option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="health_at_birth" className="font-serif">Health at Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="health_at_birth"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-serif bg-background"
                  >
                    {healthAtBirthOptions.find(option => option.value === formData.health_at_birth)?.label || "Select health status..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-background border border-border shadow-md">
                  <Command className="bg-background">
                    <CommandInput placeholder="Search health status..." className="font-serif" />
                    <CommandEmpty className="font-serif">No health status found.</CommandEmpty>
                    <CommandGroup className="bg-background">
                      {healthAtBirthOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => handleSelectChange('health_at_birth', option.value)}
                          className="font-serif"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.health_at_birth === option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_weight" className="font-serif">Birth Weight</Label>
              <div className="flex space-x-2">
                <Input
                  id="birth_weight"
                  name="birth_weight"
                  type="number"
                  value={formData.birth_weight || ''}
                  onChange={handleInputChange}
                  placeholder="Enter birth weight"
                  className="flex-1 font-serif bg-background"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-20 font-serif bg-background"
                    >
                      {formData.weight_unit || 'kg'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[80px] p-0 bg-background border border-border shadow-md">
                    <Command className="bg-background">
                      <CommandGroup className="bg-background">
                        {weightUnits.map((unit) => (
                          <CommandItem 
                            key={unit.value}
                            onSelect={() => handleSelectChange('weight_unit', unit.value)}
                            className="font-serif"
                          >
                            <Check className={cn(
                              "mr-2 h-4 w-4",
                              formData.weight_unit === unit.value ? "opacity-100" : "opacity-0"
                            )}/>
                            {unit.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="raised_purchased" className="font-serif">Origin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="raised_purchased"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-serif bg-background"
                  >
                    {raisedPurchasedOptions.find(option => option.value === formData.raised_purchased)?.label || "Select origin..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-background border border-border shadow-md">
                  <Command className="bg-background">
                    <CommandInput placeholder="Search origin..." className="font-serif" />
                    <CommandEmpty className="font-serif">No option found.</CommandEmpty>
                    <CommandGroup className="bg-background">
                      {raisedPurchasedOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => handleSelectChange('raised_purchased', option.value)}
                          className="font-serif"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.raised_purchased === option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="multiple_birth"
                checked={formData.multiple_birth}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('multiple_birth', checked === true)
                }
                className="bg-background"
              />
              <Label htmlFor="multiple_birth" className="font-serif">Multiple Birth</Label>
            </div>
          
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
                      onClick={() => removeTrait(trait)}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTrait();
                    }
                  }}
                />
                <Button type="button" onClick={addTrait} className="font-serif">Add</Button>
              </div>
            </div>

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
                      onClick={() => removeKeyword(keyword)}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                />
                <Button type="button" onClick={addKeyword} className="font-serif">Add</Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md mt-4 font-serif">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/animals')}
              className="font-serif"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="font-serif">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Animal' : 'Create Animal'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AnimalForm;
