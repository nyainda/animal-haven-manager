
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportAnimalsToCSV } from "@/services/animalService";

interface ExportButtonProps {
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ className }) => {
  const handleExport = () => {
    exportAnimalsToCSV();
  };

  return (
    <Button 
      onClick={handleExport} 
      variant="outline" 
      className={className}
    >
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
};

export default ExportButton;
