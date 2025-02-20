// src/components/documents/RelatedDocuments.tsx
import React from "react";
import { useDocumentsStore } from "@/store/documentsStore";
import { Document } from "@/types/document";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trans } from "@lingui/macro";

interface RelatedDocumentsProps {
  documentId: string;
}

const RelatedDocuments: React.FC<RelatedDocumentsProps> = ({ documentId }) => {
  const { getRelatedDocuments } = useDocumentsStore();
  const relatedDocuments = getRelatedDocuments(documentId);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>
          <Trans>Powiązane dokumenty</Trans>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {relatedDocuments.length === 0 ? (
          <p>
            <Trans>Brak powiązanych dokumentów.</Trans>
          </p>
        ) : (
          <ul className="list-disc pl-4">
            {relatedDocuments.map((doc: Document) => (
              <li key={doc.id}>{doc.title}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default RelatedDocuments;
