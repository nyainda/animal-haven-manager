import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Dog, DollarSign, CalendarIcon, Truck } from 'lucide-react';

import { toast } from 'sonner';

interface ActionCardsProps {
  setActiveTab: (tab: string) => void;
}

const ActionCards: React.FC<ActionCardsProps> = ({ setActiveTab }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/animals/create')}>
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
            <Plus className="h-5 w-5 mr-2" /> Add New Animal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Create a new animal record</p>
        </CardContent>
      </Card>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/animals')}>
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
            <Dog className="h-5 w-5 mr-2" /> View Animals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Manage your animal list</p>
        </CardContent>
      </Card>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('/animals/${id}/suppliers')}>
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
            <Truck className="h-5 w-5 mr-2" /> Manage Suppliers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">View or add suppliers</p>
        </CardContent>
      </Card>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => toast.info('Export feature coming soon')}>
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
            <DollarSign className="h-5 w-5 mr-2" /> Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Download animal data as CSV</p>
        </CardContent>
      </Card>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('calendar')}>
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
            <CalendarIcon className="h-5 w-5 mr-2" /> Schedule Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Add an event to your calendar</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActionCards;