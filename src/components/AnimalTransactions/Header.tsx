import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  animalId: string;
  isLoading: boolean;
}

export default function Header({ animalId, isLoading }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-muted"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Transaction Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Track and manage all transactions for this animal
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <Button
              onClick={() => navigate(`/animals/${animalId}/transactions/new`)}
              disabled={isLoading}
              className="shadow-md transition-all duration-200 gap-1.5 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Transaction
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={isLoading}
              className="shadow-sm gap-1.5"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}