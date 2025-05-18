import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/card';
import { TransactionSummary } from '@/services/transactionApis';
import { Layers, DollarSign, Clock3, TrendingUp } from 'lucide-react';

interface SummaryStatsCardsProps {
  summary: TransactionSummary;
  formatCurrency: (amount: number | string | null | undefined, currency: string) => string;
}

export default function SummaryStatsCards({ summary, formatCurrency }: SummaryStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="overflow-hidden border hover:border-primary/20 transition-all duration-200 group">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
        <CardHeader className="p-4 pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-blue-500" />
            <span>Transactions</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-3xl font-bold text-foreground">
            {summary.overview.total_transactions || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.overview.completed_transactions || 0} completed
          </p>
        </CardContent>
      </Card>
      <Card className="overflow-hidden border hover:border-primary/20 transition-all duration-200 group">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
        <CardHeader className=" p-4 pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <span>Total Value</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-3xl font-bold text-foreground">
            {formatCurrency(summary.overview.total_value, summary.currency)}
          </div>
          < p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(summary.overview.average_transaction_value, summary.currency)} avg per
            transaction
          </p>
        </CardContent>
      </Card>
      <Card className="overflow-hidden border hover:border-primary/20 transition-all duration-200 group">
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-amber-600"></div>
        <CardHeader className="p-4 pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <Clock3 className="h-4 w-4 text-amber-500" />
            <span>Pending Amount</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-3xl font-bold text-foreground">
            {formatCurrency(summary.overview.pending_amount, summary.currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Awaiting completion</p>
        </CardContent>
      </Card>
      <Card className="overflow-hidden border hover:border-primary/20 transition-all duration-200 group">
        <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-purple-600"></div>
        <CardHeader className="p-4 pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span>Highest Value</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-3xl font-bold text-foreground">
            {formatCurrency(summary.overview.highest_transaction, summary.currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(summary.overview.lowest_transaction, summary.currency)} lowest
          </p>
        </CardContent>
      </Card>
    </div>
  );
}