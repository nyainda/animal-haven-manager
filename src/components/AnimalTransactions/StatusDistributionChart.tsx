import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { AlertCircle, PieChart as PieChartIcon, Activity } from 'lucide-react';

interface StatusDistributionChartProps {
  statusDistribution: Record<string, number>;
  totalTransactions: number;
}

export default function StatusDistributionChart({
  statusDistribution,
  totalTransactions,
}: StatusDistributionChartProps) {
  const data = Object.entries(statusDistribution).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count || 0,
  }));

  const COLORS = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalTransactions) * 100).toFixed(1);
      
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.payload.fill }}
            />
            <p className="font-semibold text-slate-900 dark:text-slate-100">{data.name}</p>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-slate-100">{data.value}</span> transactions
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload?.map((entry: any, index: number) => {
          const item = data.find((item) => item.name === entry.value);
          const percentage = (((item?.value || 0) / totalTransactions) * 100).toFixed(0);
          
          return (
            <div 
              key={index} 
              className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <div 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {entry.value}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-900/50 dark:to-purple-900/10 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-purple-500 to-pink-500"></div>
      <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <PieChartIcon className="h-20 w-20 text-purple-500" />
      </div>
      
      <CardHeader className="relative p-6 pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
            <Activity className="h-5 w-5 text-white" />
          </div>
          Status Distribution
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 font-medium">
          Transaction status breakdown and analytics
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative p-6 pt-2">
        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No status distribution data available</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Data will appear here when transactions are processed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart Container */}
            <div className="h-[280px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter id="shadow">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
                    </filter>
                  </defs>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth={2}
                    filter="url(#shadow)"
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        className="hover:opacity-80 transition-opacity duration-200"
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Stats */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {totalTransactions}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Total
                  </div>
                </div>
              </div>
            </div>
            
            {/* Custom Legend */}
            <CustomLegend payload={data.map((item, index) => ({
              value: item.name,
              color: COLORS[index % COLORS.length]
            }))} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}