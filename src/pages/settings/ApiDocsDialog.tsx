import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,

  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { X, Save, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiDocsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourcesDirId: string | null;
}

export const ApiDocsDialog: React.FC<ApiDocsDialogProps> = ({ open, onOpenChange, resourcesDirId }) => {
  const [backupStatus, setBackupStatus] = useState<'idle' | 'saving' | 'restoring' | 'error'>('idle');

  const handleBackupStores = async () => {
    if (!resourcesDirId) return;
    
    try {
      setBackupStatus('saving');
      const storeData = {
        documents: localStorage.getItem('documents-storage'),
        kanban: localStorage.getItem('kanban-storage'),
        templates: localStorage.getItem('templates')
      };

      const file = new Blob([JSON.stringify(storeData)], { type: 'application/json' });
      const formData = new FormData();
      
      const fileMetadata = {
        name: 'store-backup.json',
        parents: [resourcesDirId]
      };

      formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      formData.append('file', file);

      const accessToken = localStorage.getItem('driveAccessToken');
      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData
        }
      );

      if (!response.ok) throw new Error('Failed to backup stores');
      setBackupStatus('idle');
    } catch (err) {
      console.error('Backup error:', err);
      setBackupStatus('error');
    }
  };

  const handleRestoreStores = async () => {
    if (!resourcesDirId) return;
    
    try {
      setBackupStatus('restoring');
      const accessToken = localStorage.getItem('driveAccessToken');
      
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='store-backup.json' and '${resourcesDirId}' in parents and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const { files } = await searchResponse.json();
      if (!files || files.length === 0) throw new Error('No backup file found');

      const fileId = files[0].id;
      
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const storeData = await response.json();
      
      if (storeData.documents) {
        localStorage.setItem('documents-storage', storeData.documents);
      }
      if (storeData.kanban) {
        localStorage.setItem('kanban-storage', storeData.kanban);
      }
      if (storeData.templates) {
        localStorage.setItem('templates', storeData.templates);
      }

      setBackupStatus('idle');
      window.location.reload();
    } catch (err) {
      console.error('Restore error:', err);
      setBackupStatus('error');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-row items-start justify-between">
          <AlertDialogTitle>Google Drive Actions</AlertDialogTitle>
          <AlertDialogAction asChild className="h-auto p-0">
            <button onClick={() => onOpenChange(false)} className="border rounded-sm p-2 hover:bg-accent">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </AlertDialogAction>
        </AlertDialogHeader>
        <Separator className="my-4" />
        
        <div className="flex gap-2">
          <Button 
            onClick={handleBackupStores} 
            disabled={backupStatus === 'saving' || backupStatus === 'restoring'}
            className="flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            {backupStatus === 'saving' ? 'Saving...' : 'Backup Stores'}
          </Button>
          <Button 
            onClick={handleRestoreStores} 
            variant="outline"
            disabled={backupStatus === 'saving' || backupStatus === 'restoring'}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            {backupStatus === 'restoring' ? 'Restoring...' : 'Restore Stores'}
          </Button>
        </div>

        <Separator className="my-4" />
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)} className="bg-primary hover:bg-primary/90">
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ApiDocsDialog;