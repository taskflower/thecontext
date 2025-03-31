// src/modules/context/components/DatabaseConfiguratorTab.tsx
import React, { useState } from 'react';
import { DatabaseConfigurator } from '../../databaseConfigurator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

interface DatabaseConfiguratorTabProps {
  isOpen: boolean;
  onClose: () => void;
}

const DatabaseConfiguratorTab: React.FC<DatabaseConfiguratorTabProps> = ({
  isOpen,
  onClose
}) => {
  const [configResult, setConfigResult] = useState<string | null>(null);

  const handleConfigCreated = (config: any) => {
    setConfigResult(`Baza danych ${config.dbName} została skonfigurowana pomyślnie! Możesz teraz używać kolekcji: ${config.collections.map((c: any) => c.name).join(', ')}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Konfigurator bazy danych
          </DialogTitle>
        </DialogHeader>

        <div className="p-1">
          {configResult && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4 text-green-800 dark:text-green-300">
              <p>{configResult}</p>
              <div className="flex justify-end mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setConfigResult(null)}
                >
                  OK
                </Button>
              </div>
            </div>
          )}

          <DatabaseConfigurator 
            onConfigCreated={handleConfigCreated} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DatabaseConfiguratorTab;