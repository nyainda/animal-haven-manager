import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { ArrowLeft, Pencil, Trash2, Calendar, Download } from 'lucide-react';
import { Transaction } from '@/services/transactionApis';
import { getStatusColor, getTypeColor, getTypeIcon } from '@/utils/transactionUtils';

interface TransactionCardProps {
  transaction: Transaction;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number | string | null | undefined, currency: string) => string;
  actions: {
    onEdit: (transaction: Transaction) => void;
    onDelete: (transactionId: string) => void;
  };
  openModal: (
    transactionId: string,
    field: 'details' | 'delivery_instructions' | 'terms_and_conditions' | 'special_conditions',
    content: string,
    transactionType: string,
    transactionDate: string
  ) => void;
  animalId: string;
}

export default function TransactionCard({
  transaction,
  formatDate,
  formatCurrency,
  actions,
  openModal,
  animalId,
}: TransactionCardProps) {
  const [expandedDocuments, setExpandedDocuments] = useState(false);

  const isDetailsLong = (transaction.details?.length || 0) > 50;
  const isDeliveryInstructionsLong = (transaction.delivery_instructions?.length || 0) > 50;
  const truncatedDetails = isDetailsLong
    ? `${transaction.details?.slice(0, 50)}...`
    : transaction.details;
  const truncatedDeliveryInstructions = isDeliveryInstructionsLong
    ? `${transaction.delivery_instructions?.slice(0, 50)}...`
    : transaction.delivery_instructions;
  const status = transaction.transaction_status?.toLowerCase()?.trim() || 'unknown';
  const maxDocumentsToShow = expandedDocuments ? Infinity : 2;
  const typeGradient = getTypeColor(transaction.transaction_type);
  const typeIcon = getTypeIcon(transaction.transaction_type);

  return (
    <Card className="flex flex-col relative overflow-hidden min-h-[300px] max-h-[500px] group border transition-all duration-300 hover:shadow-lg hover:border-primary/30 dark:hover:border-primary/50">
      <div className={`h-1 w-full bg-gradient-to-r ${typeGradient}`}></div>
      <CardHeader className="p-4 pb-2 bg-gradient-to-b from-muted/40 to-transparent">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-1.5">
              {typeIcon}
              {transaction.transaction_type.charAt(0).toUpperCase() +
                transaction.transaction_type.slice(1)}
            </CardTitle>
            <CardDescription className="flex items-center gap-1.5 text-sm mt-0.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(transaction.transaction_date)}
            </CardDescription>
          </div>
          <Badge className={`${getStatusColor(status)} border px-2 py-0.5 text-xs capitalize`}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-1 flex-grow overflow-y-auto">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 mb-1">
            <div className="p-2 rounded-md bg-muted/40 border border-border/30">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">Total Amount</p>
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(transaction.total_amount, transaction.currency)}
              </p>
            </div>
            <div className="p-2 rounded-md bg-muted/40 border border-border/30">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">Balance Due</p>
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(transaction.balance_due, transaction.currency)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Invoice #:</span>
            <span className="text-sm text-foreground">
              {transaction.invoice_number || 'N/A'}
            </span>
          </div>
          <div className="p-2 rounded-md bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-0.5">Transaction Parties</p>
            <div className="flex items-center text-sm gap-1.5">
              <span className="text-foreground font-medium truncate max-w-[45%]">
                {transaction.seller_name || 'Unknown'}
              </span>
              <ArrowLeft className="h-3.5 w-3.5 rotate-180 text-muted-foreground flex-shrink-0" />
              <span className="text-foreground font-medium truncate max-w-[45%]">
                {transaction.buyer_name || 'Unknown'}
              </span>
            </div>
          </div>
          {transaction.details && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-0.5">Details</p>
              <p className="text-sm text-foreground line-clamp-2">{truncatedDetails}</p>
              {isDetailsLong && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 mt-0.5 text-primary text-xs"
                  onClick={() =>
                    openModal(
                      transaction.id,
                      'details',
                      transaction.details || '',
                      transaction.transaction_type,
                      transaction.transaction_date
                    )
                  }
                >
                  Read More
                </Button>
              )}
            </div>
          )}
          {transaction.delivery_instructions && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-0.5">Delivery Instructions</p>
              <p className="text-sm text-foreground line-clamp-2">{truncatedDeliveryInstructions}</p>
              {isDeliveryInstructionsLong && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 mt-0.5 text-primary text-xs"
                  onClick={() =>
                    openModal(
                      transaction.id,
                      'delivery_instructions',
                      transaction.delivery_instructions || '',
                      transaction.transaction_type,
                      transaction.transaction_date
                    )
                  }
                >
                  Read More
                </Button>
              )}
            </div>
          )}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="additional-details" className="border-b-0">
              <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:no-underline py-1">
                Additional Details
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-1">
                  {transaction.terms_and_conditions && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Terms & Conditions</p>
                      <p className="text-sm text-foreground line-clamp-2">
                        {transaction.terms_and_conditions.length > 50
                          ? `${transaction.terms_and_conditions.slice(0, 50)}...`
                          : transaction.terms_and_conditions}
                      </p>
                      {transaction.terms_and_conditions.length > 50 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-0.5 text-primary text-xs"
                          onClick={() =>
                            openModal(
                              transaction.id,
                              'terms_and_conditions',
                              transaction.terms_and_conditions || '',
                              transaction.transaction_type,
                              transaction.transaction_date
                            )
                          }
                        >
                          Read More
                        </Button>
                      )}
                    </div>
                  )}
                  {transaction.special_conditions && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Special Conditions</p>
                      <p className="text-sm text-foreground line-clamp-2">
                        {transaction.special_conditions.length > 50
                          ? `${transaction.special_conditions.slice(0, 50)}...`
                          : transaction.special_conditions}
                      </p>
                      {transaction.special_conditions.length > 50 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-0.5 text-primary text-xs"
                          onClick={() =>
                            openModal(
                              transaction.id,
                              'special_conditions',
                              transaction.special_conditions || '',
                              transaction.transaction_type,
                              transaction.transaction_date
                            )
                          }
                        >
                          Read More
                        </Button>
                      )}
                    </div>
                  )}
                  {transaction.insurance_policy_number && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Insurance Policy:</p>
                      <p className="text-sm text-foreground">
                        {transaction.insurance_policy_number}
                        {transaction.insurance_amount &&
                          ` (${formatCurrency(transaction.insurance_amount, transaction.currency)})`}
                      </p>
                    </div>
                  )}
                  {transaction.health_certificate_number && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Health Certificate:</p>
                      <p className="text-sm text-foreground">{transaction.health_certificate_number}</p>
                    </div>
                  )}
                  {transaction.transport_license_number && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Transport License:</p>
                      <p className="text-sm text-foreground">{transaction.transport_license_number}</p>
                    </div>
                  )}
                  {transaction.seller_email && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Seller Contact:</p>
                      <p className="text-sm text-foreground">
                        {transaction.seller_email}
                        {transaction.seller_phone && `, ${transaction.seller_phone}`}
                      </p>
                    </div>
                  )}
                  {transaction.buyer_email && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Buyer Contact:</p>
                      <p className="text-sm text-foreground">
                        {transaction.buyer_email}
                        {transaction.buyer_phone && `, ${transaction.buyer_phone}`}
                      </p>
                    </div>
                  )}
                  {transaction.attached_documents && transaction.attached_documents.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Documents:</p>
                      <ul className="text-sm text-foreground space-y-1 max-h-[100px] overflow-y-auto">
                        {transaction.attached_documents
                          .slice(0, maxDocumentsToShow)
                          .map((doc) => (
                            <li key={doc.id}>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                                aria-label={`Download ${doc.name}`}
                              >
                                <Download className="h-3.5 w-3.5" />
                                {doc.name} ({(doc.size / 1024).toFixed(2)} KB)
                              </a>
                            </li>
                          ))}
                      </ul>
                      {transaction.attached_documents.length > 2 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-1 text-primary text-xs"
                          onClick={() => setExpandedDocuments(!expandedDocuments)}
                          aria-label={expandedDocuments ? 'Show fewer documents' : 'Show more documents'}
                        >
                          {expandedDocuments ? 'Show Less' : 'Show More'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
      <CardFooter className="p-2 bg-muted/30 border-t flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => actions.onEdit(transaction)}
          className="h-8 text-xs gap-1"
          aria-label="Edit transaction"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => actions.onDelete(transaction.id)}
          className="h-8 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
          aria-label="Delete transaction"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}