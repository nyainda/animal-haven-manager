import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Clock, AlertCircle } from 'lucide-react';
import { Transaction } from '@/services/transactionApis';
import { getStatusColor, getTypeColor, getTypeIcon } from '@/utils/transactionUtils';

interface RecentTransactionsProps {
  transactions: Transaction[];
  formatDate: (date: string) => string;
  formatCurrency: (amount: number | string | null | undefined, currency: string) => string;
  currency: string;
  animalId: string;
  lastUpdated?: string;
}

export default function RecentTransactions({
  transactions,
  formatDate,
  formatCurrency,
  currency,
  animalId,
  lastUpdated,
}: RecentTransactionsProps) {
  const navigate = useNavigate();
  const recent = transactions.slice(0, 5);

  return (
    <Card className="border overflow-hidden hover:border-primary/20 transition-all duration-200">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Latest transaction entries</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/animals/${animalId}/transactions`)}
          className="text-xs"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-2 max-h-[400px] overflow-y-auto">
        {recent.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <p>No recent transactions to display</p>
          </div>
        ) : (
          recent.map((transaction) => {
            const status = transaction.transaction_status?.toLowerCase()?.trim() || 'unknown';
            const typeIcon = getTypeIcon(transaction.transaction_type);
            const typeGradient = getTypeColor(transaction.transaction_type);

            return (
              <div
                key={transaction.id}
                className="rounded-lg overflow-hidden border transition-all duration-200 hover:shadow-md hover:border-primary/20"
              >
                <div className={`h-1 w-full bg-gradient-to-r ${typeGradient}`}></div>
                <div className="p-3 flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br ${typeGradient} text-white flex items-center justify-center text-sm font-semibold shadow-sm`}
                  >
                    {typeIcon}
                  </div>
                  <div className="flex-1 flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {transaction.transaction_type.charAt(0).toUpperCase() +
                            transaction.transaction_type.slice(1)}
                        </span>
                        <Badge
                          className={`${getStatusColor(status)} border px-2 py-0 text-xs capitalize`}
                        >
                          {status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDate(transaction.transaction_date)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <span className="textcoran text-xs text-muted-foreground">Amount</span>
                        <span className="block text-sm font-medium text-foreground">
                          {formatCurrency(transaction.total_amount, currency)}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs text-muted-foreground">Balance</span>
                        <span className="block text-sm font-medium text-foreground">
                          {formatCurrency(transaction.balance_due, currency)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-xs gap-1.5">
                      <span className="text-foreground font-medium truncate max-w-[40%]">
                        {transaction.seller_name || 'Unknown'}
                      </span>
                      <ArrowLeft className="h-3 w-3 rotate-180 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground font-medium truncate max-w-[40%]">
                        {transaction.buyer_name || 'Unknown'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(`/animals/${animalId}/transactions/${transaction.id}/edit`)
                      }
                      className="text-xs w-full justify-center mt-1 hover:bg-muted/50"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
      {lastUpdated && (
        <CardFooter className="p-4 pt-0 flex justify-end text-xs text-muted-foreground">
          Last updated: {formatDate(lastUpdated)}
        </CardFooter>
      )}
    </Card>
  );
}