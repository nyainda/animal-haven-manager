import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, 
  BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, 
  Line, CartesianGrid, Area, AreaChart, RadialBarChart, 
  RadialBar, Treemap
} from 'recharts';
import { Animal } from '@/types/AnimalTypes';
import { ProductionStatistics } from '@/services/animalProductionApi';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChartsProps {
  animals: Animal[];
  productionStats: ProductionStatistics | null;
}

const Charts: React.FC<ChartsProps> = ({ animals, productionStats }) => {
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1'];
  
  // Create extended color palette for advanced charts
  const EXTENDED_COLORS = [
    ...COLORS,
    '#06B6D4', '#8B5CF6', '#D946EF', '#F97316', '#A855F7', '#0EA5E9', '#84CC16', '#F43F5E'
  ];

  // Animation variants
  const cardVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 0.8
      }
    }
  };

  const animalTypeDistribution = animals.length > 0
    ? Object.entries(
        animals.reduce((acc: Record<string, number>, animal) => {
          acc[animal.type] = (acc[animal.type] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
    : [{ name: 'No Data', value: 1, fill: '#E5E7EB' }];

  const qualityDistributionData = productionStats && Object.keys(productionStats.quality_distribution).length > 0
    ? Object.entries(productionStats.quality_distribution).map(([name, value]) => ({ name, value }))
    : [{ name: 'No Data', value: 1, fill: '#E5E7EB' }];

  // Transform production trends data for wave chart
  const productionTrendsData = productionStats && Object.keys(productionStats.production_trends).length > 0
    ? Object.entries(productionStats.production_trends).map(([month, quantity]) => ({ 
        month, 
        quantity,
        // Adding cubic interpolation points for smoother wave
        interpolated: quantity * 0.85
      }))
    : Array(12).fill(0).map((_, i) => ({ 
        month: 'Month ' + (i + 1), 
        quantity: Math.floor(Math.random() * 10) + 1,
        interpolated: Math.floor(Math.random() * 8) + 1
      }));

  const organicData = productionStats && productionStats.total_production > 0
    ? [
        { name: 'Organic', value: productionStats.organic_vs_non_organic['1'] || 0 },
        { name: 'Non-Organic', value: productionStats.total_production - (productionStats.organic_vs_non_organic['1'] || 0) },
      ].filter(item => item.value > 0)
    : [
        { name: 'Organic', value: 65 },
        { name: 'Non-Organic', value: 35 }
      ];

  // Mock data for animal age distribution
  const ageDistribution = [
    { name: '0-1 yr', value: animals.filter(a => a.age && a.age <= 1).length || 5 },
    { name: '1-2 yrs', value: animals.filter(a => a.age && a.age > 1 && a.age <= 2).length || 8 },
    { name: '2-5 yrs', value: animals.filter(a => a.age && a.age > 2 && a.age <= 5).length || 12 },
    { name: '5+ yrs', value: animals.filter(a => a.age && a.age > 5).length || 7 }
  ];

  // Mock data for breed distribution
  const breedDistribution = animals.length > 0
    ? Object.entries(
        animals.reduce((acc: Record<string, number>, animal) => {
          const breed = animal.breed || 'Unknown';
          acc[breed] = (acc[breed] || 0) + 1;
          return acc;
        }, {})
      )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], index) => ({ 
        name, 
        value,
        fill: COLORS[index % COLORS.length]
      }))
    : Array(5).fill(0).map((_, i) => ({ 
        name: `Breed ${i + 1}`, 
        value: Math.floor(Math.random() * 10) + 2,
        fill: COLORS[i % COLORS.length]
      }));

  // Mock data for health statistics
  const healthData = [
    { name: 'Healthy', value: 75, fill: '#10B981' },
    { name: 'Under Treatment', value: 15, fill: '#F59E0B' },
    { name: 'Critical', value: 10, fill: '#EF4444' }
  ];

  // Calculate gradient stops for wave effect
  const getGradientOffset = () => {
    if (!productionTrendsData.length || productionTrendsData[0].month === 'No Data') {
      return { stop1: 0, stop2: 1 };
    }

    const dataMax = Math.max(...productionTrendsData.map(i => i.quantity));
    const dataMin = Math.min(...productionTrendsData.map(i => i.quantity));
    
    if (dataMax <= 0) {
      return { stop1: 0, stop2: 0 };
    }
    if (dataMin >= 0) {
      return { stop1: 0, stop2: 1 };
    }
    
    return {
      stop1: dataMax / (dataMax - dataMin),
      stop2: 0
    };
  };

  // Generate random forecast data
  const forecastData = Array(6).fill(0).map((_, i) => ({
    name: `Month ${i + 1}`,
    actual: Math.floor(Math.random() * 100) + 50,
    forecast: Math.floor(Math.random() * 100) + 50
  }));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="distribution" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Analytics Dashboard</h3>
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="distribution" className="text-xs md:text-sm">
              Distribution
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-xs md:text-sm">
              Trends
            </TabsTrigger>
            <TabsTrigger value="forecasts" className="text-xs md:text-sm">
              Forecasts
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="distribution">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
            >
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded text-blue-600 dark:text-blue-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 22h20"></path>
                        <path d="M10 14a8 8 0 0 0 0-16"></path>
                        <path d="M10 16v-7.5"></path>
                        <path d="M14 16v-3.5a4 4 0 0 0-4-4C7.67 8.5 6 9.56 6 11"></path>
                        <path d="M18 16v-7.5a4 4 0 0 0-4-4c-1.42 0-2.7.58-3.62 1.5"></path>
                      </svg>
                    </span>
                    Animal Type Distribution
                  </CardTitle>
                  <CardDescription>
                    Distribution of animals by type across your farm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          {COLORS.map((color, index) => (
                            <linearGradient key={index} id={`colorPie${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={color} stopOpacity={0.6}/>
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={animalTypeDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={60}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {animalTypeDistribution.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`url(#colorPie${index % COLORS.length})`} 
                              stroke={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`Count: ${value}`, '']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
            >
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded text-green-600 dark:text-green-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22c6.23-.05 8.56-4.1 9-9"></path>
                        <path d="M8 22c-4.01-.15-6.53-1.46-8-4"></path>
                        <path d="M5.5 17.5l-1.7-1"></path>
                        <path d="M2 16l-1.5-1"></path>
                        <path d="M15 22c4.41-.27 6.92-2.02 8-6"></path>
                        <path d="M22 13l1.5-1"></path>
                        <path d="M22 8l-2-1"></path>
                        <path d="M20 5l-2-1"></path>
                        <path d="M17 3l-2-1"></path>
                        <path d="M2 12a10 10 0 0 1 8.5-9.9"></path>
                      </svg>
                    </span>
                    Age Distribution
                  </CardTitle>
                  <CardDescription>
                    Distribution of animals by age range
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageDistribution}>
                        <defs>
                          {COLORS.map((color, index) => (
                            <linearGradient key={index} id={`colorAge${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={color} stopOpacity={0.5}/>
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => [`Count: ${value}`, 'Animals']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          name="Animals"
                          radius={[4, 4, 0, 0]}
                          barSize={40}
                        >
                          {ageDistribution.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`url(#colorAge${index})`} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
            >
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded text-amber-600 dark:text-amber-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"></path>
                        <path d="m12 12 4 10 1.7-4.3L22 16Z"></path>
                      </svg>
                    </span>
                    Breed Distribution
                  </CardTitle>
                  <CardDescription>
                    Top breeds in your animal inventory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart 
                        cx="50%" 
                        cy="50%" 
                        innerRadius="20%" 
                        outerRadius="90%" 
                        barSize={20} 
                        data={breedDistribution}
                      >
                        <RadialBar
                          background
                          dataKey="value"
                          label={{ position: "insideStart", fill: "#fff", fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`${value} animals`, '']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                        <Legend 
                          iconSize={10}
                          layout="vertical"
                          verticalAlign="middle"
                          wrapperStyle={{ fontSize: '12px', lineHeight: '20px' }}
                          align="right"
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
            >
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded text-purple-600 dark:text-purple-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                    </span>
                    Health Status
                  </CardTitle>
                  <CardDescription>
                    Current health status of animals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={healthData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                        >
                          {healthData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.fill} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${value}%`, '']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                        <Legend 
                          formatter={(value, entry, index) => (
                            <span className="text-sm">{value}: {healthData[index].value}%</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
        
        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              className="lg:col-span-2"
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
            >
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded text-blue-600 dark:text-blue-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                    </span>
                    Production Wave Analysis
                  </CardTitle>
                  <CardDescription>
                    Monthly production trends with dynamic wave analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={productionTrendsData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.2} />
                          </linearGradient>
                          <linearGradient id="colorInterpolated" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <Tooltip 
                          formatter={(value: number) => [`${value} L/kg`, '']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="quantity" 
                          name="Production"
                          stroke="#10B981" 
                          fillOpacity={1} 
                          fill="url(#colorQuantity)" 
                          animationDuration={1500}
                          isAnimationActive={true}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="interpolated" 
                          name="Trend"
                          stroke="#3B82F6" 
                          fillOpacity={0.3} 
                          fill="url(#colorInterpolated)" 
                          animationDuration={2000}
                          isAnimationActive={true}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
            >
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded text-green-600 dark:text-green-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.29 7 12 12 20.71 7"></polyline>
                        <line x1="12" y1="22" x2="12" y2="12"></line>
                      </svg>
                    </span>
                    Monthly Production
                  </CardTitle>
                  <CardDescription>
                    Production quantity by month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productionTrendsData}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.4}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => [`${value} L/kg`, 'Production']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                        <Bar 
                          dataKey="quantity" 
                          name="Quantity (L/kg)" 
                          fill="url(#barGradient)"
                          radius={[4, 4, 0, 0]}
                          barSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
            >
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded text-purple-600 dark:text-purple-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <line x1="10" y1="9" x2="8" y2="9"></line>
                      </svg>
                    </span>
                    Quality Analysis
                  </CardTitle>
                  <CardDescription>
                    Production quality metrics breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          {COLORS.map((color, index) => (
                            <linearGradient key={index} id={`colorQuality${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={color} stopOpacity={0.5}/>
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={qualityDistributionData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={60}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {qualityDistributionData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.fill || `url(#colorQuality${index % COLORS.length})`} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`Count: ${value}`, '']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
        
        <TabsContent value="forecasts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              className="lg:col-span-2"
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
            >
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded text-indigo-600 dark:text-indigo-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 8v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h12l5 5Z"></path>
                        <path d="M9 9h1"></path>
                        <path d="M14 9h1"></path>
                        <path d="M9 13h6"></path>
                      </svg>
                    </span>
                    Production Forecast
                  </CardTitle>
                  <CardDescription>
                    6-month production forecast vs actual trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                          name="Actual"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="forecast" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ stroke: '#10b981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                          name="Forecast"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
            >
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded text-amber-600 dark:text-amber-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </span>
                    Organic vs Non-Organic
                  </CardTitle>
                  <CardDescription>
                    Production breakdown by certification type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.5}/>
                          </linearGradient>
                          <linearGradient id="colorNonOrganic" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.5}/>
                          </linearGradient>
                        </defs>
                        <Pie
                          data={organicData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="url(#colorOrganic)" />
                          <Cell fill="url(#colorNonOrganic)" />
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${value} units`, '']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
            >
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <span className="bg-cyan-100 dark:bg-cyan-900/30 p-1.5 rounded text-cyan-600 dark:text-cyan-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                          <path d="M8 14h.01"></path>
                          <path d="M12 14h.01"></path>
                          <path d="M16 14h.01"></path>
                          <path d="M8 18h.01"></path>
                          <path d="M12 18h.01"></path>
                          <path d="M16 18h.01"></path>
                        </svg>
                      </span>
                      Advanced Reports
                    </CardTitle>
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                      View All
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="divide-y divide-muted">
                    <li className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Production Trends</p>
                          <p className="text-xs text-muted-foreground">Monthly and quarterly analysis</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </li>
                    <li className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Efficiency Metrics</p>
                          <p className="text-xs text-muted-foreground">Resource utilization metrics</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </li>
                    <li className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Breeding Performance</p>
                          <p className="text-xs text-muted-foreground">Reproductive statistics</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Charts;
