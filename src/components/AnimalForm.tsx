
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
  genderOptions, 
  birthStatusOptions, 
  healthAtBirthOptions, 
  raisedPurchasedOptions,
  statusOptions,
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
  const [openTypePopover, setOpenTypePopover] = useState(false);
  const [openGenderPopover, setOpenGenderPopover] = useState(false);
  const [openStatusPopover, setOpenStatusPopover] = useState(false);
  const [openBirthStatusPopover, setOpenBirthStatusPopover] = useState(false);
  const [openHealthPopover, setOpenHealthPopover] = useState(false);
  const [openOriginPopover, setOpenOriginPopover] = useState(false);
  const [openWeightUnitPopover, setOpenWeightUnitPopover] = useState(false);

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
        <span className="ml-2 text-lg">Loading animal data...</span>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Animal' : 'Add New Animal'}</CardTitle>
        <CardDescription>
          Enter all animal information in one form
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter animal name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Animal Type *</Label>
              <Popover open={openTypePopover} onOpenChange={setOpenTypePopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openTypePopover}
                    className="w-full justify-between"
                  >
                    {formData.type ? formData.type : "Select type..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search animal type..." />
                    <CommandEmpty>No type found.</CommandEmpty>
                    <CommandGroup>
                      {animalTypes.map((type) => (
                        <CommandItem
                          key={type}
                          value={type}
                          onSelect={() => {
                            handleSelectChange('type', type);
                            setOpenTypePopover(false);
                          }}
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
              <Label htmlFor="breed">Breed *</Label>
              <Input
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={handleInputChange}
                placeholder="Enter breed"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Popover open={openGenderPopover} onOpenChange={setOpenGenderPopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openGenderPopover}
                    className="w-full justify-between"
                  >
                    {genderOptions.find(option => option.value === formData.gender)?.label || "Select gender..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search gender..." />
                    <CommandEmpty>No gender found.</CommandEmpty>
                    <CommandGroup>
                      {genderOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => {
                            handleSelectChange('gender', option.value);
                            setOpenGenderPopover(false);
                          }}
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
              <Label htmlFor="birth_date">Birth Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.birth_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.birth_date ? format(new Date(formData.birth_date), 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={handleDateChange}
                    initialFocus
                    className="bg-background"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag_number">Tag Number</Label>
              <Input
                id="tag_number"
                name="tag_number"
                value={formData.tag_number || ''}
                onChange={handleInputChange}
                placeholder="Enter tag number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Popover open={openStatusPopover} onOpenChange={setOpenStatusPopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStatusPopover}
                    className="w-full justify-between"
                  >
                    {statusOptions.find(option => option.value === formData.status)?.label || "Select status..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-background">
                  <Command>
                    <CommandInput placeholder="Search status..." />
                    <CommandEmpty>No status found.</CommandEmpty>
                    <CommandGroup>
                      {statusOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => {
                            handleSelectChange('status', option.value);
                            setOpenStatusPopover(false);
                          }}
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
              />
              <Label htmlFor="is_breeding_stock">Breeding Stock</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_deceased"
                checked={formData.is_deceased}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('is_deceased', checked === true)
                }
              />
              <Label htmlFor="is_deceased">Deceased</Label>
            </div>
          
            <div className="space-y-2">
              <Label htmlFor="birth_status">Birth Status</Label>
              <Popover open={openBirthStatusPopover} onOpenChange={setOpenBirthStatusPopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openBirthStatusPopover}
                    className="w-full justify-between"
                  >
                    {birthStatusOptions.find(option => option.value === formData.birth_status)?.label || "Select birth status..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-background">
                  <Command>
                    <CommandInput placeholder="Search birth status..." />
                    <CommandEmpty>No birth status found.</CommandEmpty>
                    <CommandGroup>
                      {birthStatusOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => {
                            handleSelectChange('birth_status', option.value);
                            setOpenBirthStatusPopover(false);
                          }}
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
              <Label htmlFor="health_at_birth">Health at Birth</Label>
              <Popover open={openHealthPopover} onOpenChange={setOpenHealthPopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openHealthPopover}
                    className="w-full justify-between"
                  >
                    {healthAtBirthOptions.find(option => option.value === formData.health_at_birth)?.label || "Select health status..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-background">
                  <Command>
                    <CommandInput placeholder="Search health status..." />
                    <CommandEmpty>No health status found.</CommandEmpty>
                    <CommandGroup>
                      {healthAtBirthOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => {
                            handleSelectChange('health_at_birth', option.value);
                            setOpenHealthPopover(false);
                          }}
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
              <Label htmlFor="birth_weight">Birth Weight</Label>
              <div className="flex space-x-2">
                <Input
                  id="birth_weight"
                  name="birth_weight"
                  type="number"
                  value={formData.birth_weight || ''}
                  onChange={handleInputChange}
                  placeholder="Enter birth weight"
                  className="flex-1"
                />
                <Popover open={openWeightUnitPopover} onOpenChange={setOpenWeightUnitPopover}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openWeightUnitPopover}
                      className="w-20"
                    >
                      {formData.weight_unit || 'kg'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[80px] p-0 bg-background">
                    <Command>
                      <CommandGroup>
                        <CommandItem 
                          onSelect={() => {
                            handleSelectChange('weight_unit', 'kg');
                            setOpenWeightUnitPopover(false);
                          }}
                        >
                          <Check className={cn(
                            "mr-2 h-4 w-4",
                            formData.weight_unit === 'kg' ? "opacity-100" : "opacity-0"
                          )}/>
                          kg
                        </CommandItem>
                        <CommandItem 
                          onSelect={() => {
                            handleSelectChange('weight_unit', 'lb');
                            setOpenWeightUnitPopover(false);
                          }}
                        >
                          <Check className={cn(
                            "mr-2 h-4 w-4",
                            formData.weight_unit === 'lb' ? "opacity-100" : "opacity-0"
                          )}/>
                          lb
                        </CommandItem>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="raised_purchased">Origin</Label>
              <Popover open={openOriginPopover} onOpenChange={setOpenOriginPopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openOriginPopover}
                    className="w-full justify-between"
                  >
                    {raisedPurchasedOptions.find(option => option.value === formData.raised_purchased)?.label || "Select origin..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-background">
                  <Command>
                    <CommandInput placeholder="Search origin..." />
                    <CommandEmpty>No option found.</CommandEmpty>
                    <CommandGroup>
                      {raisedPurchasedOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => {
                            handleSelectChange('raised_purchased', option.value);
                            setOpenOriginPopover(false);
                          }}
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
              />
              <Label htmlFor="multiple_birth">Multiple Birth</Label>
            </div>
          
            <div className="space-y-2 md:col-span-2">
              <Label>Physical Traits</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.physical_traits?.map((trait, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
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
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTrait();
                    }
                  }}
                />
                <Button type="button" onClick={addTrait}>Add</Button>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Keywords</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.keywords?.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
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
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                />
                <Button type="button" onClick={addKeyword}>Add</Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md mt-4">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/animals')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
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
