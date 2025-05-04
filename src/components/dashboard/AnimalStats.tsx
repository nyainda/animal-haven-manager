
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Animal } from '@/types/AnimalTypes';
import { ProductionStatistics } from '@/services/animalProductionApi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Users, Award, Leaf, AlertTriangle, DropletIcon, BarChart2, CheckCircle, TrendingUp } from 'lucide-react';
import { HealthStatistics, ReproductiveStatistics, GrowthStatistics } from '@/types/AnimalTypes';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnimalStatsProps {
  animalStats: { totalAnimals: number; mostCommonType: string; averageAge: number; breedingStockCount: number } | null;
  animals: Animal[];
  productionStats: ProductionStatistics | null;
  selectedAnimalId: string | null;
  healthStats: HealthStatistics | null;
  reproStats: ReproductiveStatistics | null;
  growthStats: GrowthStatistics | null;
}

const AnimalStats: React.FC<AnimalStatsProps> = ({ 
  animalStats, 
  animals, 
  productionStats, 
  selectedAnimalId,
  healthStats,
  reproStats,
  growthStats
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [productionData, setProductionData] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any[]>([]);
  
  useEffect(() => {
    // Generate sample data for waveform if we have a selected animal
    if (selectedAnimalId) {
      const mockProductionData = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        production: Math.random() * 10 + 5 + Math.sin(i / 2) * 3,
        average: 8 + Math.cos(i / 4) * 1.5
      }));
      
      const mockHealthData = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(2025, i, 1).toLocaleString('default', { month: 'short' });
        return {
          month,
          checkups: Math.floor(Math.random() * 5) + 1,
          incidents: Math.floor(Math.random() * 3),
          vaccinations: Math.floor(Math.random() * 4)
        };
      });
      
      setProductionData(mockProductionData);
      setHealthData(mockHealthData);
    }
  }, [selectedAnimalId]);

  const selectedAnimal = animals.find(a => a.id === selectedAnimalId);
  
  // Calculate quality percentage
  const passedQuality = productionStats?.quality_distribution?.Passed || 0;
  const totalQualityChecks = Object.values(productionStats?.quality_distribution || {}).reduce((sum, val) => sum + val, 0);
  const qualityPercentage = totalQualityChecks > 0 ? ((passedQuality / totalQualityChecks) * 100).toFixed(0) : '0';
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut" 
      } 
    })
  };

  const statsCards = [
    { 
      title: "Total Animals", 
      value: animalStats?.totalAnimals || 0, 
      icon: <Users size={16} className="text-blue-500" />,
      color: "border-blue-500",
      trend: "+5% this month",
      trendUp: true
    },
    { 
      title: "Most Common Type", 
      value: animalStats?.mostCommonType || 'N/A', 
      icon: <Award size={16} className="text-purple-500" />,
      color: "border-purple-500",
      isText: true
    },
    { 
      title: "Average Age", 
      value: animalStats?.averageAge?.toFixed(1) || 0, 
      suffix: "yrs",
      icon: <Leaf size={16} className="text-amber-500" />,
      color: "border-amber-500"
    },
    { 
      title: "Breeding Stock", 
      value: animalStats?.breedingStockCount || 0, 
      icon: <Users size={16} className="text-green-500" />,
      color: "border-green-500",
      trend: "+2 this month",
      trendUp: true
    },
    { 
      title: "Deceased Animals", 
      value: animals.filter(a => a.is_deceased).length, 
      icon: <AlertTriangle size={16} className="text-red-500" />,
      color: "border-red-500"
    },
    { 
      title: "Total Production", 
      value: productionStats?.total_production || 0, 
      suffix: "L/kg",
      icon: <DropletIcon size={16} className="text-cyan-500" />,
      color: "border-cyan-500",
      trend: "+12% this month",
      trendUp: true
    },
    { 
      title: "Avg Production", 
      value: productionStats?.average_production?.toFixed(1) || 0, 
      suffix: "L/kg",
      icon: <BarChart2 size={16} className="text-indigo-500" />,
      color: "border-indigo-500"
    },
    { 
      title: "Quality Rate", 
      value: qualityPercentage,
      suffix: "%", 
      icon: <CheckCircle size={16} className="text-emerald-500" />,
      color: "border-emerald-500",
      progress: parseInt(qualityPercentage)
    }
  ];
  
  const healthMetrics = [
    { 
      title: "Vaccination Rate",
      value: healthStats?.vaccination_rate?.toFixed(0) || "0",
      suffix: "%",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      description: "Percentage of animals with current vaccinations"
    },
    { 
      title: "Health Incidents",
      value: healthStats?.health_incidents || "0",
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      description: "Current active health issues requiring attention"
    },
    { 
      title: "Checkups Required",
      value: healthStats?.animals_requiring_checkup || "0",
      icon: <Activity className="h-5 w-5 text-blue-500" />,
      description: "Animals that need checkups soon"
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="bg-primary/10 p-1.5 rounded-md">
            <Activity className="h-5 w-5 text-primary" />
          </span>
          Animal Dashboard
        </h2>
        <div className="bg-muted px-4 py-1.5 rounded-full flex items-center gap-2">
          <span className="h-2 w-2 bg-green-500 rounded-full"></span>
          <p className="text-sm font-medium">
            {selectedAnimal ? `${selectedAnimal.name} (${selectedAnimal.type})` : 'No animal selected'}
          </p>
        </div>
      </div>
      
      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="text-sm font-medium">
            Overview
          </TabsTrigger>
          <TabsTrigger value="health" className="text-sm font-medium">
            Health
          </TabsTrigger>
          <TabsTrigger value="production" className="text-sm font-medium">
            Production
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Waveform Production Chart */}
          {selectedAnimalId && (
            <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border-t-4 border-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Activity size={18} className="text-primary" /> 
                  Production Trend (30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={productionData}>
                      <defs>
                        <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: '0.5rem',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="production" 
                        stroke="#2563eb" 
                        fillOpacity={1}
                        fill="url(#colorProduction)" 
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                        animationDuration={1500}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="average" 
                        stroke="#10b981" 
                        fillOpacity={0.3}
                        fill="url(#colorAverage)" 
                        strokeWidth={2}
                        activeDot={{ r: 4 }}
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center mt-2 gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Daily production</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Average</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((card, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <Card 
                  className={`overflow-hidden border-t-4 ${card.color} shadow-sm hover:shadow-md transition-shadow duration-300`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      {card.icon} 
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-end justify-between">
                      <p className={`text-3xl font-bold ${card.isText ? "text-primary" : ""}`}>
                        {card.value}
                        {card.suffix && <span className="text-sm text-muted-foreground ml-1">{card.suffix}</span>}
                      </p>
                      {card.trend && (
                        <span className={`text-xs flex items-center gap-1 ${card.trendUp ? "text-green-500" : "text-red-500"}`}>
                          {card.trendUp ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingUp className="h-3 w-3 transform rotate-180" />
                          )}
                          {card.trend}
                        </span>
                      )}
                    </div>
                    {card.progress !== undefined && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full" 
                          style={{ width: `${card.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {healthMetrics.map((metric, index) => (
              <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {metric.icon}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                      <p className="text-3xl font-bold">
                        {metric.value}
                        {metric.suffix && <span className="text-base text-muted-foreground">{metric.suffix}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Health Activity</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthData}>
                  <defs>
                    <linearGradient id="colorCheckups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVaccinations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="checkups" stroke="#3b82f6" fillOpacity={0.3} fill="url(#colorCheckups)" />
                  <Area type="monotone" dataKey="incidents" stroke="#ef4444" fillOpacity={0.3} fill="url(#colorIncidents)" />
                  <Area type="monotone" dataKey="vaccinations" stroke="#10b981" fillOpacity={0.3} fill="url(#colorVaccinations)" />
                </AreaChart>
              </ResponsiveContainer>
              
              <div className="flex justify-center mt-4 gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Checkups</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Incidents</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Vaccinations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="production" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  Production Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Quality Rate</p>
                      <p className="text-sm font-bold">{qualityPercentage}%</p>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                        style={{ width: `${qualityPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {parseInt(qualityPercentage) >= 80 
                        ? "Excellent quality rating" 
                        : parseInt(qualityPercentage) >= 60
                          ? "Good quality rating"
                          : "Quality needs improvement"}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(productionStats?.quality_distribution || {}).map(([key, value], i) => (
                      <div key={i} className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm font-medium">{key}</p>
                        <p className="text-2xl font-bold">{value}</p>
                        <p className="text-xs text-muted-foreground">{key === "Passed" ? "Units passed quality check" : "Units failed quality check"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-500" />
                  Organic Production
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="16"
                        fill="transparent"
                        className="text-muted/30"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="16"
                        fill="transparent"
                        strokeDasharray="352"
                        strokeDashoffset={352 - (352 * (productionStats?.organic_vs_non_organic['1'] || 0) / (productionStats?.total_production || 1))}
                        className="text-green-500"
                      />
                    </svg>
                    <span className="absolute text-2xl font-bold">
                      {productionStats?.total_production
                        ? Math.round((productionStats?.organic_vs_non_organic['1'] || 0) / productionStats.total_production * 100)
                        : 0}%
                    </span>
                  </div>
                  <p className="text-lg font-medium">Organic Production</p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-green-500">
                        {productionStats?.organic_vs_non_organic['1'] || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Organic (L/kg)</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-muted-foreground">
                        {productionStats?.total_production 
                          ? (productionStats.total_production - (productionStats?.organic_vs_non_organic['1'] || 0)) 
                          : 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Non-Organic (L/kg)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Button variant="outline" className="w-full flex items-center justify-center gap-2">
            <BarChart2 className="h-4 w-4" />
            View Detailed Production Reports
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnimalStats;
