import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Animal } from '@/types/AnimalTypes';
import { ProductionStatistics } from '@/services/animalProductionApi';

interface AnimalStatsProps {
  animalStats: { totalAnimals: number; mostCommonType: string; averageAge: number; breedingStockCount: number } | null;
  animals: Animal[];
  productionStats: ProductionStatistics | null;
  selectedAnimalId: string | null;
}

const AnimalStats: React.FC<AnimalStatsProps> = ({ animalStats, animals, productionStats, selectedAnimalId }) => {
  return (
    <>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Production stats for: {animals.find(a => a.id === selectedAnimalId)?.name || selectedAnimalId || 'No animal selected'}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Animals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{animalStats?.totalAnimals || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Common Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{animalStats?.mostCommonType || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Age</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{animalStats?.averageAge.toFixed(1) || 0} yrs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Breeding Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{animalStats?.breedingStockCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Deceased Animals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{animals.filter(a => a.is_deceased).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Production</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{productionStats?.total_production || 0} L/kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Production</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{productionStats?.average_production.toFixed(1) || 0} L/kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Passed Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{productionStats?.quality_distribution.Passed || 0}</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AnimalStats;