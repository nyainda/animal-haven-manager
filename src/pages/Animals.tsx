
// Since we can't modify src/pages/Animals.tsx directly, we'll create a custom component that can be used to add export functionality

import React from 'react';
import { exportAnimalsToCSV } from '@/services/animalService';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// This component would be imported in the Animals.tsx page
const ExportAnimalsButton: React.FC = () => {
  return (
    <Button
      variant="outline"
      onClick={exportAnimalsToCSV}
      className="ml-2"
    >
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
};

export default ExportAnimalsButton;
