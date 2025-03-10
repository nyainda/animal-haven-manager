import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { createNote, NoteFormData } from '@/services/noteApi';

interface NoteFormProps {
  animalId?: string; // Optional if using URL params
  onSuccess?: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({ animalId: propAnimalId, onSuccess }) => {
  const navigate = useNavigate();
  const { animalId: paramAnimalId } = useParams<{ animalId: string }>(); // Get from URL if available
  const animalId = propAnimalId || paramAnimalId;

  const [isLoading, setIsLoading] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [keywords, setKeywords] = useState<string[]>([]);

  const [formData, setFormData] = useState<NoteFormData>({
    content: '',
    category: 'Business',
    keywords: [],
    file_path: '',
    add_to_calendar: false,
    status: 'pending',
    priority: 'high',
    due_date: format(new Date(), 'yyyy-MM-dd'),
  });

  // Ensure animalId is provided
  if (!animalId) {
    return <div>Error: No animal ID provided. Please select an animal to add a note.</div>;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, add_to_calendar: checked }));
  };

  const handleKeywordAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const newKeywords = [...keywords, e.currentTarget.value.trim()];
      setKeywords(newKeywords);
      setFormData((prev) => ({ ...prev, keywords: newKeywords }));
      e.currentTarget.value = '';
      e.preventDefault();
    }
  };

  const handleKeywordRemove = (keyword: string) => {
    const newKeywords = keywords.filter((k) => k !== keyword);
    setKeywords(newKeywords);
    setFormData((prev) => ({ ...prev, keywords: newKeywords }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newNote = await createNote(animalId, formData);
      toast.success('Note created successfully');
      if (onSuccess) onSuccess();
      navigate(`/animals/${animalId}/notes`);
    } catch (error) {
      // Error handling managed in createNote
    } finally {
      setIsLoading(false);
    }
  };

  const handleDueDateSelect = (date: Date | undefined) => {
    if (date) {
      setDueDate(date);
      setFormData((prev) => ({
        ...prev,
        due_date: format(date, 'yyyy-MM-dd'),
      }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-border rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-2xl text-foreground">
            Add Note for Animal {animalId}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/animals/${animalId}/notes`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content" className="font-serif text-foreground">
                Note Content
              </Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter note details"
                rows={4}
                className="font-serif bg-background border-input focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="font-serif text-foreground">
                Category
              </Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md font-serif bg-background focus:ring-primary"
              >
                <option value="Business">Business</option>
                <option value="Health">Health</option>
                <option value="Behavior">Behavior</option>
                <option value="Feeding">Feeding</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords" className="font-serif text-foreground">
                Keywords
              </Label>
              <Input
                id="keywords"
                onKeyDown={handleKeywordAdd}
                placeholder="Type a keyword and press Enter"
                className="font-serif bg-background border-input"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer hover:bg-destructive"
                    onClick={() => handleKeywordRemove(keyword)}
                  >
                    {keyword}
                    <span className="text-xs">×</span>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file_path" className="font-serif text-foreground">
                File Path (Optional)
              </Label>
              <Input
                id="file_path"
                name="file_path"
                value={formData.file_path}
                onChange={handleInputChange}
                placeholder="e.g., /uploads/documents/note.pdf"
                className="font-serif bg-background border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date" className="font-serif text-foreground">
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal font-serif',
                      !dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : <span>Pick a due date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={handleDueDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="font-serif text-foreground">
                Priority
              </Label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md font-serif bg-background focus:ring-primary"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="font-serif text-foreground">
                Status
              </Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md font-serif bg-background focus:ring-primary"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="add_to_calendar"
                checked={formData.add_to_calendar}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="add_to_calendar" className="font-serif text-foreground">
                Add to Calendar
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/animals/${animalId}/notes`)}
              className="font-serif border-input hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="font-serif bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Note
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NoteForm;