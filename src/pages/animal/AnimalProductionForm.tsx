import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import {
  createProduction,
  updateProduction,
  fetchProduction,
  ProductionFormData,
} from '@/services/animalProductionApi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type NestedObjectKeys = 'product_category' | 'product_grade' | 'production_method' | 'collector' | 'storage_location';

interface FormErrors {
  [key: string]: string | string[];
}

const AnimalProductionForm: React.FC = () => {
  const { id: animalId, productionId } = useParams<{ id: string; productionId?: string }>();
  const navigate = useNavigate();
  const isEditing = !!productionId;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProductionFormData>({
    product_category: { name: '', description: '', measurement_unit: '' },
    product_grade: { name: '', description: '', price_modifier: 1.0 },
    production_method: { method_name: '', description: '', requires_certification: false, is_active: true },
    collector: { name: '', contact_info: '' },
    storage_location: { name: '', location_code: '', description: '', storage_conditions: [], is_active: true },
    quantity: '',
    price_per_unit: '',
    total_price: '',
    production_date: format(new Date(), 'yyyy-MM-dd'),
    production_time: format(new Date(), 'HH:mm'),
    quality_status: 'Pending',
    quality_notes: '',
    trace_number: '',
    weather_conditions: undefined,
    storage_conditions: undefined,
    is_organic: false,
    certification_number: '',
    additional_attributes: {},
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!animalId) {
      console.error('No animalId provided');
      toast.error('Missing animal ID');
      navigate('/animals');
      return;
    }

    if (!isEditing || !productionId) return;

    setIsLoading(true);
    fetchProduction(animalId, productionId)
      .then((data) => {
        console.log('Fetched production data:', data);
        setFormData({
          product_category: data.product_category || { name: '', description: '', measurement_unit: '' },
          product_grade: data.product_grade || { name: '', description: '', price_modifier: 1.0 },
          production_method: data.production_method || {
            method_name: '',
            description: '',
            requires_certification: false,
            is_active: true,
          },
          collector: data.collector || { name: '', contact_info: '' },
          storage_location: data.storage_location || {
            name: '',
            location_code: '',
            description: '',
            storage_conditions: [],
            is_active: true,
          },
          quantity: data.quantity || '',
          price_per_unit: data.price_per_unit || '',
          total_price: data.total_price || (Number(data.quantity || 0) * Number(data.price_per_unit || 0)).toString(),
          production_date: data.production_date
            ? format(parseISO(data.production_date), 'yyyy-MM-dd')
            : format(new Date(), 'yyyy-MM-dd'),
          production_time: data.production_time
            ? format(parseISO(`2000-01-01T${data.production_time}`), 'HH:mm')
            : format(new Date(), 'HH:mm'),
          quality_status: data.quality_status || 'Pending',
          quality_notes: data.quality_notes || '',
          trace_number: data.trace_number || '',
          weather_conditions: data.weather_conditions,
          storage_conditions: data.storage_conditions,
          is_organic: data.is_organic || false,
          certification_number: data.certification_number || '',
          additional_attributes: data.additional_attributes || {},
          notes: data.notes || '',
        });
        setErrors({});
      })
      .catch((error) => {
        console.error('Failed to fetch production:', error);
        toast.error('Failed to load production data');
        navigate(`/animals/${animalId}/production`);
      })
      .finally(() => setIsLoading(false));
  }, [animalId, productionId, isEditing, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    nestedField?: NestedObjectKeys
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (nestedField) {
        return {
          ...prev,
          [nestedField]: {
            ...prev[nestedField],
            [name]: value,
          },
        };
      }
      return { ...prev, [name]: value };
    });
    setErrors((prev) => ({ ...prev, [name]: '', [`${nestedField}.${name}`]: '' }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => {
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, nestedField?: NestedObjectKeys) => {
    const { name, checked } = e.target;
    setFormData((prev) => {
      if (nestedField) {
        return {
          ...prev,
          [nestedField]: {
            ...prev[nestedField],
            [name]: checked,
          },
        };
      }
      return { ...prev, [name]: checked };
    });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, production_date: format(date, 'yyyy-MM-dd') }));
      setErrors((prev) => ({ ...prev, production_date: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): FormErrors => {
    const requiredFields: (keyof ProductionFormData)[] = [
      'quantity',
      'price_per_unit',
      'total_price',
      'production_date',
      'production_time',
      'quality_status',
      'trace_number',
    ];
    const newErrors: FormErrors = {};

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

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalId) {
      toast.error('Animal ID is missing');
      navigate('/animals');
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
        await updateProduction(animalId, productionId, formData);
        toast.success('Production updated successfully');
      } else {
        await createProduction(animalId, formData);
        toast.success('Production created successfully');
      }
      navigate(`/animals/${animalId}/production`, { state: { refresh: true } });
    } catch (error: any) {
      console.error('Submission error:', error);
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
      toast.error('Form content not found for PDF generation');
      return;
    }

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
      pdf.save(`production_${formData.trace_number || 'new'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  if (!animalId) {
    return <div className="p-4">Missing animal ID. Redirecting...</div>;
  }

  if (isLoading && isEditing) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Loading production data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(`/animals/${animalId}/production`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Production
        </Button>
        <Button variant="outline" onClick={generatePDF}>
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Production Record' : 'Add New Production Record'}</CardTitle>
        </CardHeader>
        <CardContent id="production-form-content">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Product Category Name *</Label>
              <Input
                name="name"
                value={formData.product_category.name}
                onChange={(e) => handleInputChange(e, 'product_category')}
                required
              />
              {errors['product_category.name'] && (
                <p className="text-red-500 text-sm">{errors['product_category.name']}</p>
              )}
              <Label>Measurement Unit *</Label>
              <Input
                name="measurement_unit"
                value={formData.product_category.measurement_unit}
                onChange={(e) => handleInputChange(e, 'product_category')}
                required
              />
              {errors['product_category.measurement_unit'] && (
                <p className="text-red-500 text-sm">{errors['product_category.measurement_unit']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Product Grade Name *</Label>
              <Input
                name="name"
                value={formData.product_grade.name}
                onChange={(e) => handleInputChange(e, 'product_grade')}
                required
              />
              {errors['product_grade.name'] && (
                <p className="text-red-500 text-sm">{errors['product_grade.name']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Production Method Name *</Label>
              <Input
                name="method_name"
                value={formData.production_method.method_name}
                onChange={(e) => handleInputChange(e, 'production_method')}
                required
              />
              {errors['production_method.method_name'] && (
                <p className="text-red-500 text-sm">{errors['production_method.method_name']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Collector Name *</Label>
              <Input
                name="name"
                value={formData.collector.name}
                onChange={(e) => handleInputChange(e, 'collector')}
                required
              />
              {errors['collector.name'] && <p className="text-red-500 text-sm">{errors['collector.name']}</p>}
            </div>

            <div className="space-y-2">
              <Label>Storage Location Name *</Label>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input name="quantity" value={formData.quantity} onChange={handleNumberChange} required />
                {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
              </div>
              <div className="space-y-2">
                <Label>Price per Unit ($)*</Label>
                <Input
                  name="price_per_unit"
                  value={formData.price_per_unit}
                  onChange={handleNumberChange}
                  required
                />
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
                    value={formData.certification_number}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea name="notes" value={formData.notes} onChange={handleInputChange} />
            </div>

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
  );
};

export default AnimalProductionForm;