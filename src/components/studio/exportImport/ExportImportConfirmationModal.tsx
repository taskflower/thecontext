// src/components/ExportImportConfirmationModal.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { StoreItem } from "@/services/StorageService";

interface ExportImportConfirmationModalProps {
  selectedStores: string[];
  storeItems: StoreItem[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const ExportImportConfirmationModal: React.FC<
  ExportImportConfirmationModalProps
> = ({ selectedStores, storeItems, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center text-destructive gap-2">
          <AlertCircle className="h-5 w-5" />
          <h3 className="text-lg font-bold">Confirm Data Deletion</h3>
        </div>

        <div className="py-2">
          <p className="mb-2">
            Are you sure you want to delete the following data?
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {selectedStores.map((storeId) => {
              const store = storeItems.find((item) => item.id === storeId);
              return store ? (
                <li key={storeId} className="text-sm">
                  <span className="font-medium">{store.name}</span> -{" "}
                  {store.description}
                </li>
              ) : null;
            })}
          </ul>

          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This action cannot be undone. All selected data will be
              permanently deleted.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Yes, Delete Data
          </Button>
        </div>
      </div>
    </div>
  </div>
);
