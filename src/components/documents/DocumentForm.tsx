/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/documents/DocumentForm.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trans, t } from "@lingui/macro";
import { DocumentTabs } from "./editor/DocumentTabs";
import { Document, DocumentContainer } from "@/types/document";

interface DocumentFormProps {
 document: Document | null;
 container: DocumentContainer;
 onUpdate: (field: string, value: any) => void;
 onSubmit: (e: React.FormEvent) => void;
 onCancel: () => void;
 submitButtonText: React.ReactNode;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({
 document,
 container,
 onUpdate,
 onSubmit,
 onCancel,
 submitButtonText,
}) => {
 if (!container?.id || !document?.id) {
   return <div>Błąd: Brak wymaganych danych</div>;
 }

 return (
   <Card className="border-0 md:border shadow-none md:shadow">
     <CardContent className="pt-6">
       <form onSubmit={onSubmit} className="space-y-6">
         <div className="space-y-2">
           <label className="text-sm font-medium">
             <Trans>Tytuł</Trans>
           </label>
           <Input
             value={document.title}
             onChange={(e) => onUpdate("title", e.target.value)}
             placeholder={t`Tytuł dokumentu`}
             required
           />
         </div>

         <DocumentTabs
           document={document}
           container={container}
           onUpdate={onUpdate}
         />

         <div className="flex justify-end space-x-2">
           <Button type="button" variant="outline" onClick={onCancel}>
             <Trans>Anuluj</Trans>
           </Button>
           <Button type="submit">{submitButtonText}</Button>
         </div>
       </form>
     </CardContent>
   </Card>
 );
};