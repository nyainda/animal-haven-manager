
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation } from '@tanstack/react-query';

interface NoteFormData {
  title: string;
  content: string;
}

const AnimalNoteForm: React.FC = () => {
  const { id, noteId } = useParams<{ id: string; noteId: string }>();
  const navigate = useNavigate();
  const isEditing = !!noteId;
  
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: ''
  });

  // Fetch existing note data if editing
  const { data: existingNote, isLoading: isLoadingNote } = useQuery({
    queryKey: ['animalNote', id, noteId],
    queryFn: async () => {
      if (!isEditing) return null;
      
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/animals/${id}/notes/${noteId}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching note:', error);
        toast.error('Failed to load note data');
        // Return fallback data as we're using real API now
        return { title: 'Error loading note', content: 'Please try again' };
      }
    },
    enabled: isEditing
  });

  // Update form data when existing note is loaded
  useEffect(() => {
    if (existingNote) {
      setFormData({
        title: existingNote.title || '',
        content: existingNote.content || ''
      });
    }
  }, [existingNote]);

  // Create/update note mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: NoteFormData) => {
      const url = isEditing 
        ? `http://127.0.0.1:8000/api/animals/${id}/notes/${noteId}`
        : `http://127.0.0.1:8000/api/animals/${id}/notes`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Note updated successfully' : 'Note created successfully');
      navigate(`/animals/${id}/notes`);
    },
    onError: (error) => {
      console.error('Error saving note:', error);
      toast.error(`Failed to save note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    mutate(formData);
  };

  if (isLoadingNote && isEditing) {
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
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter note title"
                required
              />
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
            
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/animals/${id}/notes`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
