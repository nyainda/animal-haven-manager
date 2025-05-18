import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { AlertCircle, ChartLine } from 'lucide-react';

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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <Card className="border overflow-hidden hover:border-primary/20 transition-all duration-200">
      <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-purple-600"></div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <ChartLine className="h-5 w-5 text-primary" />
          Status Distribution
        </CardTitle>
        <CardDescription>Breakdown by status</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <p>No status distribution data available</p>
          </div>
        ) : (
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth={1}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value: string) => {
                    const item = data.find((item) => item.name === value);
                    const percentage = (((item?.value || 0) / totalTransactions) * 100).toFixed(0);
                    return `${value} (${percentage}%)`;
                  }}
                />
                <RechartsTooltip
                  formatter={(value: number, name: string) => [
                    `${value} transactions (${((value / totalTransactions) * 100).toFixed(0)}%)`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}