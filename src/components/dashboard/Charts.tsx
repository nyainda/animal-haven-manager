import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Animal } from '@/types/AnimalTypes';
import { ProductionStatistics } from '@/services/animalProductionApi';

interface ChartsProps {
  animals: Animal[];
  productionStats: ProductionStatistics | null;
}

const Charts: React.FC<ChartsProps> = ({ animals, productionStats }) => {
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  const animalTypeDistribution = animals.length > 0
    ? Object.entries(
        animals.reduce((acc: Record<string, number>, animal) => {
          acc[animal.type] = (acc[animal.type] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
    : [{ name: 'Dogs', value: 0 }, { name: 'Cats', value: 0 }, { name: 'Birds', value: 0 }];

  const qualityDistributionData = productionStats && Object.keys(productionStats.quality_distribution).length > 0
    ? Object.entries(productionStats.quality_distribution).map(([name, value]) => ({ name, value }))
    : [{ name: 'No Data', value: 1, fill: '#E5E7EB' }];

  const productionTrendsData = productionStats && Object.keys(productionStats.production_trends).length > 0
    ? Object.entries(productionStats.production_trends).map(([month, quantity]) => ({ month, quantity }))
    : [{ month: 'No Data', quantity: 0 }];

  const organicData = productionStats && productionStats.total_production > 0
    ? [
        { name: 'Organic', value: productionStats.organic_vs_non_organic['1'] || 0 },
        { name: 'Non-Organic', value: productionStats.total_production - (productionStats.organic_vs_non_organic['1'] || 0) },
      ].filter(item => item.value > 0)
    : [{ name: 'No Data', value: 1, fill: '#E5E7EB' }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Animal Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={animalTypeDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {animalTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quality Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={qualityDistributionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => name !== 'No Data' ? `${name} ${(percent * 100).toFixed(0)}%` : 'No Data'}
              >
                {qualityDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Production Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productionTrendsData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => productionTrendsData[0].month === 'No Data' ? 'No Data' : `${value} L/kg`} />
              <Bar dataKey="quantity" fill="#10B981" name="Quantity (L/kg)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organic vs Non-Organic</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={organicData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => name !== 'No Data' ? `${name} ${(percent * 100).toFixed(0)}%` : 'No Data'}
              >
                {organicData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Charts;