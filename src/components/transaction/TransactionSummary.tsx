 import React from 'react';
  
  interface TransactionSummaryProps {
    price: number;
    taxAmount: number;
    currency: string;
    depositAmount?: number;
  }
  
  export const TransactionSummary: React.FC<TransactionSummaryProps> = ({
    price,
    taxAmount,
    currency,
    depositAmount = 0,
  }) => {
    const totalAmount = price + taxAmount;
    const balanceDue = totalAmount - depositAmount;
  
    return (
      <div className="p-4 rounded-lg border">
        <div className="text-sm font-medium">Transaction Summary</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="text-muted-foreground">Price:</div>
          <div className="text-right">{price.toFixed(2)} {currency}</div>
          <div className="text-muted-foreground">Tax:</div>
          <div className="text-right">{taxAmount.toFixed(2)} {currency}</div>
          <div className="text-muted-foreground font-medium">Total:</div>
          <div className="text-right font-medium">{totalAmount.toFixed(2)} {currency}</div>
        </div>
      </div>
    );
  };