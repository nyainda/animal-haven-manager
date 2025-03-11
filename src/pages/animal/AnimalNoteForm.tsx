
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { createNote, updateNote, fetchNote, NoteFormData } from '@/services/noteApi';

const AnimalNoteForm: React.FC = () => {
  const { id, noteId } = useParams<{ id: string; noteId: string }>();
  const navigate = useNavigate();
  const isEditing = !!noteId;
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<NoteFormData>({
    content: '',
    category: 'General',
    keywords: [],
    add_to_calendar: false,
    status: 'Active',
    priority: 'Normal',
    due_date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [keywordInput, setKeywordInput] = useState('');

  // Fetch existing note data if editing
  useEffect(() => {
    const fetchNoteData = async () => {
      if (!isEditing || !id || !noteId) return;
      
      setIsLoading(true);
      try {
        const note = await fetchNote(id, noteId);
        
        setFormData({
          content: note.content || '',
          category: note.category || 'General',
          keywords: note.keywords || [],
          add_to_calendar: note.add_to_calendar || false,
          status: note.status || 'Active',
          priority: note.priority || 'Normal',
          due_date: note.due_date || format(new Date(), 'yyyy-MM-dd'),
          file_path: note.file_path || undefined
        });
      } catch (error) {
        console.error('Error fetching note:', error);
        toast.error('Failed to load note data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNoteData();
  }, [id, noteId, isEditing]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, due_date: format(date, 'yyyy-MM-dd') }));
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim() || !formData.category.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!id) {
      toast.error('Animal ID is missing');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isEditing && noteId) {
        await updateNote(id, noteId, formData);
        toast.success('Note updated successfully');
      } else {
        await createNote(id, formData);
        toast.success('Note created successfully');
      }
      navigate(`/animals/${id}/notes`);
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error(`Failed to save note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Loading note data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(`/animals/${id}/notes`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Notes
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Note' : 'Add New Note'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="General">General</SelectItem>
    <SelectItem value="Health">Health</SelectItem>
    <SelectItem value="Feeding">Feeding</SelectItem>
    <SelectItem value="Behavior">Behavior</SelectItem>
    <SelectItem value="Breeding">Breeding</SelectItem>
    <SelectItem value="Task">Task</SelectItem>
    <SelectItem value="Training">Training</SelectItem>
    <SelectItem value="Grooming">Grooming</SelectItem>
    <SelectItem value="Housing">Housing</SelectItem>
    <SelectItem value="Equipment">Equipment</SelectItem>
    <SelectItem value="Socialization">Socialization</SelectItem>
    <SelectItem value="Safety">Safety</SelectItem>
    <SelectItem value="Nutrition">Nutrition</SelectItem>
    <SelectItem value="Exercise">Exercise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleSelectChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">medium</SelectItem>
                    <SelectItem value="high">high</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Note Content</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter note details"
                rows={8}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.due_date && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.due_date ? format(new Date(formData.due_date), 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={formData.due_date ? new Date(formData.due_date) : undefined}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                   
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Keywords</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Add keyword"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                />
                <Button type="button" onClick={addKeyword}>Add</Button>
              </div>
              
              {formData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.keywords.map((keyword, index) => (
                    <div 
                      key={index} 
                      className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 text-secondary-foreground/70 hover:text-secondary-foreground"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="add_to_calendar"
                checked={formData.add_to_calendar}
                onCheckedChange={(checked) => handleSwitchChange('add_to_calendar', checked)}
              />
              <Label htmlFor="add_to_calendar">Add to calendar</Label>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/animals/${id}/notes`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Note' : 'Save Note'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimalNoteForm;