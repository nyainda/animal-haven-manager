import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/card';
import { TransactionSummary } from '@/services/transactionApis';
import { Layers, DollarSign, Clock3, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

interface SummaryStatsCardsProps {
  summary: TransactionSummary;
  formatCurrency: (amount: number | string | null | undefined, currency: string) => string;
}

export default function SummaryStatsCards({ summary, formatCurrency }: SummaryStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Transactions Card */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-900/50 dark:to-blue-900/20 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
          <Layers className="h-16 w-16 text-blue-500" />
        </div>
        <CardHeader className="relative p-6 pb-2">
          <CardDescription className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Layers className="h-4 w-4" />
            </div>
            <span>Total Transactions</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="relative p-6 pt-0">
          <div className="flex items-end gap-3">
            <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {summary.overview.total_transactions || 0}
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 mb-1">
              <ArrowUp className="h-3 w-3" />
              <span className="text-xs font-medium">+12%</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            {summary.overview.completed_transactions || 0} completed
          </p>
        </CardContent>
      </Card>

      {/* Total Value Card */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-900/50 dark:to-teal-900/20 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500"></div>
        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
          <DollarSign className="h-16 w-16 text-emerald-500" />
        </div>
        <CardHeader className="relative p-6 pb-2">
          <CardDescription className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
            <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <DollarSign className="h-4 w-4" />
            </div>
            <span>Total Value</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="relative p-6 pt-0">
          <div className="flex items-end gap-3">
            <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {formatCurrency(summary.overview.total_value, summary.currency)}
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 mb-1">
              <ArrowUp className="h-3 w-3" />
              <span className="text-xs font-medium">+24%</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            <span className="font-medium">
              {formatCurrency(summary.overview.average_transaction_value, summary.currency)}
            </span>{' '}
            average per transaction
          </p>
        </CardContent>
      </Card>

      {/* Pending Amount Card */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-900/50 dark:to-orange-900/20 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500"></div>
        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
          <Clock3 className="h-16 w-16 text-amber-500" />
        </div>
        <CardHeader className="relative p-6 pb-2">
          <CardDescription className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Clock3 className="h-4 w-4" />
            </div>
            <span>Pending Amount</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="relative p-6 pt-0">
          <div className="flex items-end gap-3">
            <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {formatCurrency(summary.overview.pending_amount, summary.currency)}
            </div>
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 mb-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Pending</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Awaiting completion
          </p>
        </CardContent>
      </Card>

      {/* Highest Value Card */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-pink-50/50 dark:from-purple-900/50 dark:to-pink-900/20 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-purple-500 to-pink-500"></div>
        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
          <TrendingUp className="h-16 w-16 text-purple-500" />
        </div>
        <CardHeader className="relative p-6 pb-2">
          <CardDescription className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span>Transaction Range</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="relative p-6 pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <ArrowUp className="h-3 w-3 text-emerald-500" />
                Highest
              </span>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(summary.overview.highest_transaction, summary.currency)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <ArrowDown className="h-3 w-3 text-red-500" />
                Lowest
              </span>
              <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                {formatCurrency(summary.overview.lowest_transaction, summary.currency)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}