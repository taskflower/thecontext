import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";
  import { Separator } from "@/components/ui/separator";
  import { ScrollArea } from "@/components/ui/scroll-area";
  import { X } from "lucide-react";
  
  interface ApiDocsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }
  
  export const ApiDocsDialog: React.FC<ApiDocsDialogProps> = ({ open, onOpenChange }) => {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-4xl">
          <AlertDialogHeader className="flex flex-row items-start justify-between">
            <AlertDialogTitle className="text-xl">Google Drive API Documentation</AlertDialogTitle>
            <AlertDialogAction asChild className="h-auto p-0">
              <button onClick={() => onOpenChange(false)} className="border rounded-sm p-2 hover:bg-accent">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </AlertDialogAction>
          </AlertDialogHeader>
          <Separator className="my-4" />
          <ScrollArea className="h-[60vh] pr-4">
            <AlertDialogDescription className="space-y-6 text-base">
              <section>
                <h3 className="text-base mb-3 font-semibold">Główne funkcje API</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="font-medium">Pliki (files)</span>
                    <span className="text-muted-foreground">— Zarządzanie plikami - tworzenie, usuwanie, aktualizacja</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">Uprawnienia (permissions)</span>
                    <span className="text-muted-foreground">— Kontrola dostępu do plików i folderów</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">Komentarze (comments)</span>
                    <span className="text-muted-foreground">— Dodawanie i zarządzanie komentarzami</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">Wersje (revisions)</span>
                    <span className="text-muted-foreground">— Historia zmian plików</span>
                  </li>
                </ul>
              </section>
  
              <section>
                <h3 className="text-base mb-3 font-semibold">Dostępne scopes</h3>
                <div className="bg-muted p-4 rounded-sm text-sm font-mono space-y-1">
                  <div>https://www.googleapis.com/auth/drive.file</div>
                  <div>https://www.googleapis.com/auth/drive.appdata</div>
                  <div>https://www.googleapis.com/auth/drive.metadata</div>
                  <div>https://www.googleapis.com/auth/drive.readonly</div>
                </div>
              </section>
  
              <section>
                <h3 className="text-base mb-3 font-semibold">Limity API</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="font-medium">Maksymalny rozmiar pliku:</span>
                    <span className="text-muted-foreground">5,120 GB</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">Obsługiwane typy MIME:</span>
                    <span className="text-muted-foreground">wszystkie (*/*)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">Domyślna liczba wyników na stronie:</span>
                    <span className="text-muted-foreground">100</span>
                  </li>
                </ul>
              </section>
            </AlertDialogDescription>
          </ScrollArea>
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