// components/health/AnimalHealth.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { fetchAnimal } from '@/services/animalService';
import { fetchHealthRecords, deleteHealthRecord } from '@/services/healthservice';
import { Animal } from '@/types/AnimalTypes';
import { Health } from '@/services/healthservice'; 
import { HealthCard } from '@/components/health/HealthCard';
import { HealthSkeleton } from '@/components/health/HealthSkeleton';
import { HealthStatusTabs } from '@/components/health/HealthStatusTabs';
import { EmptyHealthState } from '@/components/health/EmptyHealthState';
import { HealthHeader } from '@/components/health/HealthHeader';
import { HealthDialogs } from '@/components/health/HealthDialogs';

const AnimalHealth: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [healthRecords, setHealthRecords] = useState<Health[]>([]); 
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [healthToDelete, setHealthToDelete] = useState<Health | null>(null); 
  const [contentDialogOpen, setContentDialogOpen] = useState<boolean>(false);
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');

  
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        toast.error('Invalid animal ID');
        navigate('/animals');
        return;
      }

      setIsFetching(true);
      try {
        const [animalData, healthData] = await Promise.all([
          fetchAnimal(id),
          fetchHealthRecords(id, { page: 1, perPage: 100 }), 
        ]);
        setAnimal(animalData);
        setHealthRecords(healthData); 
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load animal or health records');
      } finally {
        setIsFetching(false);
      }
    };

    loadData();
  }, [id, navigate]);

  
  const statusCounts = useMemo(() => {
    return {
      all: healthRecords.length,
      healthy: healthRecords.filter(r => r.health_status.toLowerCase() === 'healthy').length,
      sick: healthRecords.filter(r => r.health_status.toLowerCase() === 'sick').length,
      recovering: healthRecords.filter(r => r.health_status.toLowerCase() === 'recovering').length,
      critical: healthRecords.filter(r => r.health_status.toLowerCase() === 'critical').length,
    };
  }, [healthRecords]);

  
  const filteredRecords = useMemo(() => {
    if (activeTab === 'all') return healthRecords;
    return healthRecords.filter(
      record => record.health_status.toLowerCase() === activeTab.toLowerCase()
    );
  }, [healthRecords, activeTab]);

 
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  
  const handleAddHealthRecord = () => {
    navigate(`/animals/${id}/health/new`);
  };

  const handleEditHealthRecord = (healthId: string) => { 
    console.log('Navigating to edit health record:', healthId); 
    navigate(`/animals/${id}/health/${healthId}/edit`);
  };

  
  const openDeleteDialog = (health: Health) => {
    setHealthToDelete(health);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!healthToDelete || !id) return;

    try {
      await deleteHealthRecord(id, healthToDelete.Health_id.toString()); 
      setHealthRecords(prev => prev.filter(r => r.Health_id.toString() !== healthToDelete.Health_id.toString()));
      toast.success('Health record deleted successfully');
    } catch (error) {
      console.error('Error deleting health record:', error);
      toast.error('Failed to delete health record');
    } finally {
      setDeleteDialogOpen(false);
      setHealthToDelete(null);
    }
  };

  
  const handleViewContent = (content: string, title: string) => {
    setSelectedContent(content);
    setSelectedTitle(title);
    setContentDialogOpen(true);
  };

  
  const handleBack = () => {
    navigate(`/animals/${id}`);
  };

  if (isFetching) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <HealthSkeleton />
        <HealthSkeleton />
        <HealthSkeleton />
      </div>
    );
  }

  if (!animal || !id) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <p className="text-center text-muted-foreground">Animal not found.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <HealthHeader
          animalName={animal.name}
          onBack={handleBack}
          onAddHealthRecord={handleAddHealthRecord}
        />

        <HealthStatusTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          statusCounts={statusCounts}
        >
          {filteredRecords.length === 0 ? (
            <EmptyHealthState
              activeTab={activeTab}
              animalName={animal.name}
              onAddHealthRecord={handleAddHealthRecord}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.map(record => (
                <HealthCard
                  key={record.Health_id}
                  health={{ ...record, Health_id: Number(record.Health_id) }}
                  animalId={id}
                  onEdit={() => handleEditHealthRecord(record.Health_id)} 
                  onDelete={() => openDeleteDialog(record)}
                  onViewContent={handleViewContent}
                />
              ))}
            </div>
          )}
        </HealthStatusTabs>

        <HealthDialogs
          deleteDialogOpen={deleteDialogOpen}
          setDeleteDialogOpen={setDeleteDialogOpen}
          healthToDelete={healthToDelete ? { ...healthToDelete, Health_id: Number(healthToDelete.Health_id) } : null}
          onConfirmDelete={confirmDelete}
          contentDialogOpen={contentDialogOpen}
          setContentDialogOpen={setContentDialogOpen}
          selectedContent={selectedContent}
          selectedTitle={selectedTitle}
        />
      </div>
    </TooltipProvider>
  );
};

export default AnimalHealth;