import { Button } from '@/components/ui/button';
import { List, ChartLine } from 'lucide-react';

interface ViewToggleProps {
  viewMode: 'list' | 'summary';
  setViewMode: (mode: 'list' | 'summary') => void;
}

export default function ViewToggle({ viewMode, setViewMode }: ViewToggleProps) {
  return (
    <div className="inline-flex p-1 rounded-lg bg-muted/70 border shadow-sm">
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('list')}
        className={`rounded-md gap-1.5 ${
          viewMode === 'list'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted stub-foreground hover:text-foreground'
        }`}
      >
        <List className="h-4 w-4" />
        List View
      </Button>
      <Button
        variant={viewMode === 'summary' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('summary')}
        className={`rounded-md gap-1.5 ${
          viewMode === 'summary'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <ChartLine className="h-4 w-4" />
        Summary View
      </Button>
    </div>
  );
}