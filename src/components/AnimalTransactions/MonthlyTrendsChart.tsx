import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { AlertCircle, Activity } from 'lucide-react';

interface MonthlyTrend {
  month: string;
  transaction_count: number;
  total_amount: string | number;
}

interface MonthlyTrendsChartProps {
  monthlyTrends: MonthlyTrend[];
  currency: string;
}

export default function MonthlyTrendsChart({ monthlyTrends, currency }: MonthlyTrendsChartProps) {
  const data = monthlyTrends.map((trend) => ({
    month: trend.month || 'Unknown',
    transaction_count: trend.transaction_count || 0,
    total_amount: parseFloat(trend.total_amount as string) || 0,
  }));

  return (
    <Card className="border overflow-hidden lg:col-span-2 hover:border-primary/20 transition-all duration-200">
      <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-indigo-500"></div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Monthly Trends
        </CardTitle>
        <CardDescription>Transaction activity over time</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <p>No monthly trend data available</p>
          </div>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                />
                <YAxis
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'transaction_count') {
                      return [`${value} transactions`, 'Count'];
                    }
                    return [
                      new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value),
                      'Amount',
                    ];
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total_amount"
                  name="Amount"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
                <Area
                  type="monotone"
                  dataKey="transaction_count"
                  name="Count"
                  stroke="#82ca9d"
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}