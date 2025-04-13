import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Animal } from '@/types/AnimalTypes';
import { ProductionStatistics } from '@/services/animalProductionApi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Users, Award, Leaf, AlertTriangle, DropletIcon, BarChart2, CheckCircle } from 'lucide-react';

interface AnimalStatsProps {
  animalStats: { totalAnimals: number; mostCommonType: string; averageAge: number; breedingStockCount: number } | null;
  animals: Animal[];
  productionStats: ProductionStatistics | null;
  selectedAnimalId: string | null;
}

const AnimalStats: React.FC<AnimalStatsProps> = ({ animalStats, animals, productionStats, selectedAnimalId }) => {
  // Generate mock production data for waveform visualization
  const [productionData, setProductionData] = useState([]);
  
  useEffect(() => {
    // Generate sample data for waveform if we have a selected animal
    if (selectedAnimalId) {
      const mockData = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        production: Math.random() * 10 + 5 + Math.sin(i / 2) * 3
      }));
      setProductionData(mockData);
    }
  }, [selectedAnimalId]);

  const selectedAnimal = animals.find(a => a.id === selectedAnimalId);
  
  // Calculate quality percentage
  const passedQuality = productionStats?.quality_distribution?.Passed || 0;
  const totalQualityChecks = Object.values(productionStats?.quality_distribution || {}).reduce((sum, val) => sum + val, 0);
  const qualityPercentage = totalQualityChecks > 0 ? ((passedQuality / totalQualityChecks) * 100).toFixed(0) : '0';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Animal Production Dashboard</h2>
        <p className="text-sm text-muted-foreground bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {selectedAnimal ? `${selectedAnimal.name} (${selectedAnimal.type})` : 'No animal selected'}
        </p>
      </div>
      
      {/* Waveform Production Chart */}
      {selectedAnimalId && (
        <Card className="w-full mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Activity size={18} className="text-blue-500" /> 
              Production Trend (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productionData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="production" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={false}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden border-t-4 border-blue-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users size={16} className="text-blue-500" /> 
              Total Animals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{animalStats?.totalAnimals || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-t-4 border-purple-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award size={16} className="text-purple-500" /> 
              Most Common Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{animalStats?.mostCommonType || 'N/A'}</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-t-4 border-amber-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Leaf size={16} className="text-amber-500" /> 
              Average Age
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{animalStats?.averageAge?.toFixed(1) || 0} <span className="text-sm text-muted-foreground">yrs</span></p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-t-4 border-green-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users size={16} className="text-green-500" /> 
              Breeding Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{animalStats?.breedingStockCount || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-t-4 border-red-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" /> 
              Deceased Animals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{animals.filter(a => a.is_deceased).length}</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-t-4 border-cyan-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DropletIcon size={16} className="text-cyan-500" /> 
              Total Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {productionStats?.total_production || 0} <span className="text-sm text-muted-foreground">L/kg</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-t-4 border-indigo-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart2 size={16} className="text-indigo-500" /> 
              Avg Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {productionStats?.average_production?.toFixed(1) || 0} <span className="text-sm text-muted-foreground">L/kg</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-t-4 border-emerald-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" /> 
              Quality Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-emerald-500">{qualityPercentage}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full" 
                  style={{ width: `${qualityPercentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnimalStats;