import React, { useState, useEffect, ComponentType, ErrorInfo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { animalTypes, breedsByType } from '@/types/AnimalTypes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import {
  createProduction,
  updateProduction,
  fetchProduction,
  ProductionFormData,
  StorageLocation,
} from '@/services/animalProductionApi';
import {
  productionTypesByAnimal,
  measurementUnitsByProductionType,
  qualityGradesByProductionType,
  productionMethodsByProductionType,
} from '@/types/AnimalTypes';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Error Boundary Component
interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          <h2>Something went wrong: {this.state.error?.message}</h2>
          {this.props.fallback}
        </div>
      );
    }
    return this.props.children;
  }
}

interface FormErrors {
  [key: string]: string | string[];
}

interface ExtendedProductionFormData extends ProductionFormData {
  animal_type: string;
  breed: string;
}

const AnimalProductionForm: React.FC = () => {
  const { id: animalId, productionId } = useParams<{ id: string; productionId?: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();
  const isEditing = !!productionId;
  const [isLoading, setIsLoading] = useState<boolean>(isEditing);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [formData, setFormData] = useState<ExtendedProductionFormData | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const initializeFormData = (productionData?: Partial<ExtendedProductionFormData>): ExtendedProductionFormData => {
    const defaultFormData: ExtendedProductionFormData = {
      animal_type: productionData?.animal_type || state?.production?.animal_type || '',
      breed: productionData?.breed || state?.production?.breed || '',
      product_category: {
        name: productionData?.product_category?.name || state?.production?.product_category?.name || '',
        description: productionData?.product_category?.description || state?.production?.product_category?.description || '',
        measurement_unit: productionData?.product_category?.measurement_unit || state?.production?.product_category?.measurement_unit || '',
      },
      product_grade: {
        name: productionData?.product_grade?.name || state?.production?.product_grade?.name || '',
        description: productionData?.product_grade?.description || state?.production?.product_grade?.description || '',
        price_modifier: productionData?.product_grade?.price_modifier || state?.production?.product_grade?.price_modifier || 1.0,
      },
      production_method: {
        method_name: productionData?.production_method?.method_name || state?.production?.production_method?.method_name || '',
        description: productionData?.production_method?.description || state?.production?.production_method?.description || '',
        requires_certification: productionData?.production_method?.requires_certification || state?.production?.production_method?.requires_certification || false,
        is_active: productionData?.production_method?.is_active ?? state?.production?.production_method?.is_active ?? true,
      },
      collector: {
        name: productionData?.collector?.name || state?.production?.collector?.name || '',
        employee_id: productionData?.collector?.employee_id || state?.production?.collector?.employee_id || null,
        contact_number: productionData?.collector?.contact_number || state?.production?.collector?.contact_number || null,
        certification_number: productionData?.collector?.certification_number || state?.production?.collector?.certification_number || null,
      },
      storage_location: {
        name: productionData?.storage_location?.name || state?.production?.storage_location?.name || '',
        location_code: productionData?.storage_location?.location_code || state?.production?.storage_location?.location_code || '',
        description: productionData?.storage_location?.description || state?.production?.storage_location?.description || '',
        storage_conditions: {
          temperature: productionData?.storage_location?.storage_conditions?.temperature || state?.production?.storage_location?.storage_conditions?.temperature || '',
          humidity: productionData?.storage_location?.storage_conditions?.humidity || state?.production?.storage_location?.storage_conditions?.humidity || '',
        },
        is_active: productionData?.storage_location?.is_active ?? state?.production?.storage_location?.is_active ?? true,
      },
      quantity: productionData?.quantity || state?.production?.quantity || '',
      price_per_unit: productionData?.price_per_unit || state?.production?.price_per_unit || '',
      total_price: productionData?.total_price || state?.production?.total_price || '',
      production_date: productionData?.production_date
        ? format(parseISO(productionData.production_date), 'yyyy-MM-dd')
        : state?.production?.production_date
        ? format(parseISO(state.production.production_date), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      production_time: productionData?.production_time
        ? format(parseISO(`2000-01-01T${productionData.production_time}`), 'HH:mm')
        : state?.production?.production_time
        ? format(parseISO(`2000-01-01T${state.production.production_time}`), 'HH:mm')
        : format(new Date(), 'HH:mm'),
      quality_status: productionData?.quality_status || state?.production?.quality_status || 'Pending',
      quality_notes: productionData?.quality_notes || state?.production?.quality_notes || '',
      trace_number: productionData?.trace_number || state?.production?.trace_number || '',
      weather_conditions: productionData?.weather_conditions
        ? { ...productionData.weather_conditions }
        : state?.production?.weather_conditions
        ? { ...state.production.weather_conditions }
        : { temperature: '', humidity: '' },
      storage_conditions: productionData?.storage_conditions
        ? { ...productionData.storage_conditions }
        : state?.production?.storage_conditions
        ? { ...state.production.storage_conditions }
        : { temperature: '', humidity: '' },
      is_organic: productionData?.is_organic || state?.production?.is_organic || false,
      certification_number: productionData?.certification_number || state?.production?.certification_number || '',
      additional_attributes: productionData?.additional_attributes
        ? { ...productionData.additional_attributes }
        : state?.production?.additional_attributes
        ? { ...state.production.additional_attributes }
        : { fat_content: '', pasteurized: 'No', homogenized: 'No' },
      notes: productionData?.notes || state?.production?.notes || '',
    };
    console.log('[AnimalProductionForm] Initialized formData:', {
      animal_type: defaultFormData.animal_type,
      breed: defaultFormData.breed,
      product_category: defaultFormData.product_category,
      trace_number: defaultFormData.trace_number,
    });
    return defaultFormData;
  };

  useEffect(() => {
    console.log('[AnimalProductionForm] useEffect triggered', {
      animalId,
      productionId,
      isEditing,
      stateProduction: state?.production
        ? {
            yield_id: state.production.yield_id,
            product_category: state.production.product_category?.name,
            quantity: state.production.quantity,
            animal_type: state.production.animal_type,
            breed: state.production.breed,
          }
        : null,
    });

    if (!animalId) {
      console.error('[AnimalProductionForm] Missing animalId');
      toast.error('Missing animal ID');
      navigate('/animals');
      return;
    }

    if (isEditing && !productionId) {
      console.error('[AnimalProductionForm] Missing productionId in edit mode');
      toast.error('Invalid production ID');
      navigate(`/animals/${animalId}/production`);
      return;
    }

    // Initialize formData immediately to prevent blank page
    setFormData(initializeFormData());

    if (!isEditing) {
      console.log('[AnimalProductionForm] Create mode, formData initialized');
      setIsLoading(false);
      return;
    }

    console.log('[AnimalProductionForm] Edit mode, fetching production for productionId:', productionId);
    fetchProduction(animalId, productionId!)
      .then((data) => {
        console.log('[AnimalProductionForm] Fetched production data:', {
          yield_id: data.yield_id,
          product_category: data.product_category?.name,
          quantity: data.quantity,
          animal_type: data.animal_type,
          breed: data.breed,
        });
        if (!data || Object.keys(data).length === 0) {
          console.warn('[AnimalProductionForm] Empty production data received');
          toast.warning('Production data is empty, using default values');
          setFormData(initializeFormData());
          return;
        }

        const formattedData: ExtendedProductionFormData = {
          ...initializeFormData(data),
          animal_type: data.animal_type || state?.production?.animal_type || '',
          breed: data.breed || state?.production?.breed || '',
          production_date: data.production_date
            ? format(parseISO(data.production_date), 'yyyy-MM-dd')
            : format(new Date(), 'yyyy-MM-dd'),
          production_time: data.production_time
            ? format(parseISO(`2000-01-01T${data.production_time}`), 'HH:mm')
            : format(new Date(), 'HH:mm'),
          product_category: {
            name: data.product_category?.name || '',
            description: data.product_category?.description || '',
            measurement_unit: data.product_category?.measurement_unit || '',
          },
          product_grade: {
            name: data.product_grade?.name || '',
            description: data.product_grade?.description || '',
            price_modifier: data.product_grade?.price_modifier || 1.0,
          },
          production_method: {
            method_name: data.production_method?.method_name || '',
            description: data.production_method?.description || '',
            requires_certification: data.production_method?.requires_certification || false,
            is_active: data.production_method?.is_active ?? true,
          },
          collector: {
            name: data.collector?.name || '',
            employee_id: data.collector?.employee_id || null,
            contact_number: data.collector?.contact_number || null,
            certification_number: data.collector?.certification_number || null,
          },
          storage_location: {
            name: data.storage_location?.name || '',
            location_code: data.storage_location?.location_code || '',
            description: data.storage_location?.description || '',
            storage_conditions: {
              temperature: data.storage_location?.storage_conditions?.temperature || '',
              humidity: data.storage_location?.storage_conditions?.humidity || '',
            },
            is_active: data.storage_location?.is_active ?? true,
          },
          quantity: data.quantity || '',
          price_per_unit: data.price_per_unit || '',
          total_price: data.total_price || '',
          quality_status: data.quality_status || 'Pending',
          quality_notes: data.quality_notes || '',
          trace_number: data.trace_number || '',
          weather_conditions: data.weather_conditions
            ? { ...data.weather_conditions }
            : { temperature: '', humidity: '' },
          storage_conditions: data.storage_conditions
            ? { ...data.storage_conditions }
            : { temperature: '', humidity: '' },
          is_organic: data.is_organic || false,
          certification_number: data.certification_number || '',
          additional_attributes: data.additional_attributes
            ? { ...data.additional_attributes }
            : { fat_content: '', pasteurized: 'No', homogenized: 'No' },
          notes: data.notes || '',
        };

        console.log('[AnimalProductionForm] Setting formData:', {
          animal_type: formattedData.animal_type,
          breed: formattedData.breed,
          product_category: formattedData.product_category,
          trace_number: formattedData.trace_number,
        });
        setFormData(formattedData);
        setErrors({});
      })
      .catch((error: any) => {
        console.error('[AnimalProductionForm] Failed to fetch production:', {
          error: error.message,
          animalId,
          productionId,
        });
        toast.error(`Failed to load production data: ${error.message}`);
        if (state?.production) {
          console.log('[AnimalProductionForm] Using state production as fallback:', {
            yield_id: state.production.yield_id,
            product_category: state.production.product_category?.name,
            quantity: state.production.quantity,
          });
          setFormData(initializeFormData(state.production));
          toast.warning('Loaded production from cache due to network issue');
        } else {
          console.warn('[AnimalProductionForm] No state production available, using default form');
          setFormData(initializeFormData());
          toast.warning('Unable to load production data. Editing with default values.');
        }
      })
      .finally(() => {
        console.log('[AnimalProductionForm] Fetch complete, setting isLoading to false');
        setIsLoading(false);
      });
  }, [animalId, productionId, isEditing, navigate, state]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field?: keyof ExtendedProductionFormData,
    subField?: keyof StorageLocation
  ) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData((prev) => {
      if (!prev) return prev;
      if (field === 'storage_location' && subField === 'storage_conditions' && prev.storage_location) {
        return {
          ...prev,
          storage_location: {
            ...prev.storage_location,
            storage_conditions: {
              ...prev.storage_location.storage_conditions,
              [name]: value,
            },
          },
        };
      } else if (field === 'weather_conditions' && prev.weather_conditions) {
        return {
          ...prev,
          weather_conditions: {
            ...prev.weather_conditions,
            [name]: value,
          },
        };
      } else if (field === 'additional_attributes' && prev.additional_attributes) {
        return {
          ...prev,
          additional_attributes: {
            ...prev.additional_attributes,
            [name]: value,
          },
        };
      } else if (field && prev[field] && typeof prev[field] === 'object') {
        return {
          ...prev,
          [field]: {
            ...(prev[field] as object),
            [name]: value,
          },
        };
      }
      return { ...prev, [name]: value };
    });
    setErrors((prev) => ({ ...prev, [field ? `${field}.${name}` : name]: '' }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, [name]: value };
        if (name === 'quantity' || name === 'price_per_unit') {
          updated.total_price =
            updated.quantity && updated.price_per_unit
              ? (parseFloat(updated.quantity) * parseFloat(updated.price_per_unit)).toFixed(2)
              : prev.total_price;
        }
        return updated;
      });
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field?: keyof ExtendedProductionFormData
  ) => {
    if (!formData) return;
    const { name, checked } = e.target;
    setFormData((prev) => {
      if (!prev) return prev;
      return field && prev[field] && typeof prev[field] === 'object'
        ? { ...prev, [field]: { ...(prev[field] as object), [name]: checked } }
        : { ...prev, [name]: checked };
    });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (!formData || !date) return;
    setFormData((prev) => {
      if (!prev) return prev;
      return { ...prev, production_date: format(date, 'yyyy-MM-dd') };
    });
    setErrors((prev) => ({ ...prev, production_date: '' }));
  };

  const handleSelectChange = (
    name: string,
    value: string,
    field?: keyof ExtendedProductionFormData
  ) => {
    if (!formData) return;
    setFormData((prev) => {
      if (!prev) return prev;
      return field && prev[field] && typeof prev[field] === 'object'
        ? { ...prev, [field]: { ...(prev[field] as object), [name]: value } }
        : { ...prev, [name]: value };
    });
    setErrors((prev) => ({ ...prev, [field ? `${field}.${name}` : name]: '' }));
  };

  const validateForm = (): FormErrors => {
    if (!formData) return { form: 'Form data not initialized' };
    const requiredFields: (keyof ExtendedProductionFormData)[] = [
      'animal_type',
      'breed',
      'quantity',
      'price_per_unit',
      'total_price',
      'production_date',
      'production_time',
      'quality_status',
      'trace_number',
    ];
    const newErrors: FormErrors = {};

    if (!formData.animal_type) newErrors.animal_type = 'Animal type is required';
    if (!formData.breed) newErrors.breed = 'Breed is required';
    if (!formData.product_category.name) newErrors['product_category.name'] = 'Product category name is required';
    if (!formData.product_category.measurement_unit)
      newErrors['product_category.measurement_unit'] = 'Measurement unit is required';
    if (!formData.product_grade.name) newErrors['product_grade.name'] = 'Product grade name is required';
    if (!formData.production_method.method_name)
      newErrors['production_method.method_name'] = 'Production method name is required';
    if (!formData.collector.name) newErrors['collector.name'] = 'Collector name is required';
    if (!formData.storage_location.name) newErrors['storage_location.name'] = 'Storage location name is required';

    requiredFields.forEach((field) => {
      if (!formData[field]) newErrors[field] = `${field.replace('_', ' ')} is required`;
    });

    if (formData.quantity && !/^\d*\.?\d+$/.test(formData.quantity)) {
      newErrors.quantity = 'Quantity must be a valid number';
    }
    if (formData.price_per_unit && !/^\d*\.?\d+$/.test(formData.price_per_unit)) {
      newErrors.price_per_unit = 'Price per unit must be a valid number';
    }
    if (formData.total_price && !/^\d*\.?\d+$/.test(formData.total_price)) {
      newErrors.total_price = 'Total price must be a valid number';
    }

    if (
      formData.weather_conditions?.temperature &&
      (parseFloat(formData.weather_conditions.temperature) < -50 || parseFloat(formData.weather_conditions.temperature) > 100)
    ) {
      newErrors['weather_conditions.temperature'] = 'Temperature must be between -50°C and 100°C';
    }

    if (
      formData.storage_location.storage_conditions.temperature &&
      !/^-?\d*\.?\d+$/.test(formData.storage_location.storage_conditions.temperature)
    ) {
      newErrors['storage_location.storage_conditions.temperature'] = 'Storage temperature must be a valid number';
    }
    if (
      formData.storage_location.storage_conditions.humidity &&
      !/^\d*\.?\d+$/.test(formData.storage_location.storage_conditions.humidity)
    ) {
      newErrors['storage_location.storage_conditions.humidity'] = 'Storage humidity must be a valid number';
    }

    console.log('[AnimalProductionForm] Validation errors:', newErrors);
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalId || !formData) {
      toast.error('Missing required data');
      return;
    }

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && productionId) {
        console.log('[AnimalProductionForm] Updating production:', { productionId, formData });
        await updateProduction(animalId, productionId, formData);
        toast.success('Production updated successfully');
      } else {
        console.log('[AnimalProductionForm] Creating production:', { formData });
        await createProduction(animalId, formData);
        toast.success('Production created successfully');
      }
      navigate(`/animals/${animalId}/production`, { state: { refresh: true } });
    } catch (error: any) {
      console.error('[AnimalProductionForm] Submission error:', error);
      const apiErrors: FormErrors = {};
      let errorMessage = 'Failed to save production';
      try {
        const errorData = JSON.parse(error.message || '{}');
        if (errorData.errors) {
          Object.entries(errorData.errors).forEach(([key, messages]) => {
            apiErrors[key] = Array.isArray(messages) ? messages[0] : messages;
          });
          errorMessage = errorData.message || errorMessage;
        }
      } catch {
        errorMessage = error.message || errorMessage;
      }
      setErrors(apiErrors);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async () => {
    const content = document.getElementById('production-form-content');
    if (!content) {
      console.error('[AnimalProductionForm] Form content not found for PDF');
      toast.error('Form content not found for PDF generation');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const canvas = await html2canvas(content, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.setFontSize(18);
      pdf.text(`${isEditing ? 'Edit' : 'New'} Production Record`, 10, 20);
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${format(new Date(), 'PPPp')}`, 10, 28);
      pdf.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight);
      pdf.save(`production_${formData?.trace_number || 'new'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('[AnimalProductionForm] PDF generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!animalId) {
    return <div className="p-4">Missing animal ID. Redirecting...</div>;
  }

  if (isLoading || !formData) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>{isEditing ? 'Loading production data...' : 'Initializing form...'}</span>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div>
          <p>An error occurred while rendering the form.</p>
          <Button onClick={() => navigate(`/animals/${animalId}/production`)}>Back to Productions</Button>
        </div>
      }
    >
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(`/animals/${animalId}/production`)} className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit Production Record' : 'Add New Production Record'}</h1>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{isEditing ? 'Edit Production Record' : 'Add New Production Record'}</CardTitle>
            <Button onClick={generatePDF} disabled={isGeneratingPDF}>
              {isGeneratingPDF ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Download PDF
            </Button>
          </CardHeader>
          <CardContent id="production-form-content">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Animal Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Animal Selection</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Animal Type *</Label>
                    <Select
                      value={formData.animal_type}
                      onValueChange={(value) => handleSelectChange('animal_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select animal type" />
                      </SelectTrigger>
                      <SelectContent>
                        {animalTypes.map((animal) => (
                          <SelectItem key={animal} value={animal}>
                            {animal.charAt(0).toUpperCase() + animal.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.animal_type && <p className="text-red-500 text-sm">{errors.animal_type}</p>}
                  </div>
                  {formData.animal_type && (
                    <div className="space-y-2">
                      <Label>Breed *</Label>
                      <Select
                        value={formData.breed}
                        onValueChange={(value) => handleSelectChange('breed', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select breed" />
                        </SelectTrigger>
                        <SelectContent>
                          {(breedsByType[formData.animal_type] || []).map((breed) => (
                            <SelectItem key={breed} value={breed}>
                              {breed}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.breed && <p className="text-red-500 text-sm">{errors.breed}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Category */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category Name *</Label>
                    <Select
                      value={formData.product_category.name}
                      onValueChange={(value) => handleSelectChange('name', value, 'product_category')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.animal_type && productionTypesByAnimal[formData.animal_type] || []).map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors['product_category.name'] && (
                      <p className="text-red-500 text-sm">{errors['product_category.name']}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Measurement Unit *</Label>
                    <Select
                      value={formData.product_category.measurement_unit}
                      onValueChange={(value) => handleSelectChange('measurement_unit', value, 'product_category')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.product_category.name && measurementUnitsByProductionType[formData.product_category.name] || []).map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors['product_category.measurement_unit'] && (
                      <p className="text-red-500 text-sm">{errors['product_category.measurement_unit']}</p>
                    )}
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      name="description"
                      value={formData.product_category.description || ''}
                      onChange={(e) => handleInputChange(e, 'product_category')}
                    />
                  </div>
                </div>
              </div>

              {/* Product Grade */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Grade</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Grade Name *</Label>
                    <Select
                      value={formData.product_grade.name}
                      onValueChange={(value) => handleSelectChange('name', value, 'product_grade')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.product_category.name && qualityGradesByProductionType[formData.product_category.name] || []).map((grade) => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors['product_grade.name'] && (
                      <p className="text-red-500 text-sm">{errors['product_grade.name']}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      name="description"
                      value={formData.product_grade.description || ''}
                      onChange={(e) => handleInputChange(e, 'product_grade')}
                    />
                  </div>
                </div>
              </div>

              {/* Production Method */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Production Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Method Name *</Label>
                    <Select
                      value={formData.production_method.method_name}
                      onValueChange={(value) => handleSelectChange('method_name', value, 'production_method')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.product_category.name && productionMethodsByProductionType[formData.product_category.name] || []).map((method) => (
                          <SelectItem key={method} value={method}>{method}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors['production_method.method_name'] && (
                      <p className="text-red-500 text-sm">{errors['production_method.method_name']}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      name="description"
                      value={formData.production_method.description || ''}
                      onChange={(e) => handleInputChange(e, 'production_method')}
                    />
                  </div>
                </div>
              </div>

              {/* Collector */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Collector Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      name="name"
                      value={formData.collector.name}
                      onChange={(e) => handleInputChange(e, 'collector')}
                      required
                    />
                    {errors['collector.name'] && <p className="text-red-500 text-sm">{errors['collector.name']}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Employee ID</Label>
                    <Input
                      name="employee_id"
                      value={formData.collector.employee_id || ''}
                      onChange={(e) => handleInputChange(e, 'collector')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Number</Label>
                    <Input
                      name="contact_number"
                      value={formData.collector.contact_number || ''}
                      onChange={(e) => handleInputChange(e, 'collector')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Certification Number</Label>
                    <Input
                      name="certification_number"
                      value={formData.collector.certification_number || ''}
                      onChange={(e) => handleInputChange(e, 'collector')}
                    />
                  </div>
                </div>
              </div>

              {/* Storage Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Storage Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      name="name"
                      value={formData.storage_location.name}
                      onChange={(e) => handleInputChange(e, 'storage_location')}
                      required
                    />
                    {errors['storage_location.name'] && (
                      <p className="text-red-500 text-sm">{errors['storage_location.name']}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Location Code</Label>
                    <Input
                      name="location_code"
                      value={formData.storage_location.location_code}
                      onChange={(e) => handleInputChange(e, 'storage_location')}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      name="description"
                      value={formData.storage_location.description || ''}
                      onChange={(e) => handleInputChange(e, 'storage_location')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Storage Temperature (°C) *</Label>
                    <Input
                      name="temperature"
                      value={formData.storage_location.storage_conditions.temperature}
                      onChange={(e) => handleInputChange(e, 'storage_location', 'storage_conditions')}
                      type="number"
                      step="0.1"
                      required
                    />
                    {errors['storage_location.storage_conditions.temperature'] && (
                      <p className="text-red-500 text-sm">{errors['storage_location.storage_conditions.temperature']}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Storage Humidity (%) *</Label>
                    <Input
                      name="humidity"
                      value={formData.storage_location.storage_conditions.humidity}
                      onChange={(e) => handleInputChange(e, 'storage_location', 'storage_conditions')}
                      type="number"
                      step="1"
                      required
                    />
                    {errors['storage_location.storage_conditions.humidity'] && (
                      <p className="text-red-500 text-sm">{errors['storage_location.storage_conditions.humidity']}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Production Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Production Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input name="quantity" value={formData.quantity} onChange={handleNumberChange} required />
                    {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Price per Unit ($)*</Label>
                    <Input name="price_per_unit" value={formData.price_per_unit} onChange={handleNumberChange} required />
                    {errors.price_per_unit && <p className="text-red-500 text-sm">{errors.price_per_unit}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Total Price ($)*</Label>
                    <Input name="total_price" value={formData.total_price} onChange={handleNumberChange} required />
                    {errors.total_price && <p className="text-red-500 text-sm">{errors.total_price}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Production Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <Calendar className="mr-2 h-4 w-4" />
                          {formData.production_date ? format(parseISO(formData.production_date), 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <CalendarComponent
                          mode="single"
                          selected={formData.production_date ? parseISO(formData.production_date) : undefined}
                          onSelect={handleDateChange}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.production_date && <p className="text-red-500 text-sm">{errors.production_date}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Production Time *</Label>
                    <Input
                      name="production_time"
                      type="time"
                      value={formData.production_time}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.production_time && <p className="text-red-500 text-sm">{errors.production_time}</p>}
                  </div>
                </div>
              </div>

              {/* Quality and Trace */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quality and Traceability</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quality Status *</Label>
                    <Select
                      value={formData.quality_status}
                      onValueChange={(value) => handleSelectChange('quality_status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Passed">Passed</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.quality_status && <p className="text-red-500 text-sm">{errors.quality_status}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Trace Number *</Label>
                    <Input name="trace_number" value={formData.trace_number} onChange={handleInputChange} required />
                    {errors.trace_number && <p className="text-red-500 text-sm">{errors.trace_number}</p>}
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Quality Notes</Label>
                    <Textarea name="quality_notes" value={formData.quality_notes || ''} onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              {/* Weather Conditions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Weather Conditions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Temperature (°C)</Label>
                    <Input
                      name="temperature"
                      value={formData.weather_conditions?.temperature || ''}
                      onChange={(e) => handleInputChange(e, 'weather_conditions')}
                      type="number"
                      step="0.1"
                      min="-50"
                      max="60"
                    />
                    {errors['weather_conditions.temperature'] && (
                      <p className="text-red-500 text-sm">{errors['weather_conditions.temperature']}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Humidity (%)</Label>
                    <Input
                      name="humidity"
                      value={formData.weather_conditions?.humidity || ''}
                      onChange={(e) => handleInputChange(e, 'weather_conditions')}
                      type="number"
                      step="1"
                    />
                  </div>
                </div>
              </div>

              {/* Organic Certification */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Organic Certification</h3>
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_organic"
                      checked={formData.is_organic}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                    />
                    Organic Product
                  </Label>
                  {formData.is_organic && (
                    <div className="space-y-2">
                      <Label>Certification Number</Label>
                      <Input
                        name="certification_number"
                        value={formData.certification_number || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Attributes (Milk-Specific) */}
              {formData.product_category.name === 'Milk' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Attributes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Fat Content (%)</Label>
                      <Input
                        name="fat_content"
                        value={formData.additional_attributes?.fat_content || ''}
                        onChange={(e) => handleInputChange(e, 'additional_attributes')}
                        type="number"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pasteurized</Label>
                      <Select
                        value={formData.additional_attributes?.pasteurized || 'No'}
                        onValueChange={(value) => handleSelectChange('pasteurized', value, 'additional_attributes')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Homogenized</Label>
                      <Select
                        value={formData.additional_attributes?.homogenized || 'No'}
                        onValueChange={(value) => handleSelectChange('homogenized', value, 'additional_attributes')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea name="notes" value={formData.notes || ''} onChange={handleInputChange} />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/animals/${animalId}/production`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Update' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default AnimalProductionForm;