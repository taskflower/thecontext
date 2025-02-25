/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, DocumentContainer } from "@/types/document";
import { SchemaField, DocumentSchema } from "@/types/schema";
import { Trans } from "@lingui/macro";

import { DocumentActions } from "./DocumentActions";
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { truncate } from "@/services/utils";

interface DocumentTableProps {
  documents: Document[];
  container?: DocumentContainer;
  schema?: DocumentSchema;
  onPreview: (document: Document) => void;
  onEdit: (documentId: string) => void;
  onMove: (documentId: string, direction: "up" | "down") => void;
  onDelete: (documentId: string) => void;
  showContainer?: boolean;
}

const formatValue = (value: unknown, field?: SchemaField) => {
  if (value === undefined || value === null || value === "") return "-";

  switch (field?.type) {
    case "date":
      return value instanceof Date
        ? value.toLocaleDateString()
        : new Date(value as string).toLocaleDateString();
    case "boolean":
      return value ? "Tak" : "Nie";
    default:
      return String(value);
  }
};

export const DocumentTable = ({
  documents,
  container,
  schema,
  onPreview,
  onEdit,
  onMove,
  onDelete,
  showContainer = false,
}: DocumentTableProps) => {
  // Pobiera wartość bezpośrednio z dokumentu
  const getDocumentValue = (doc: Document, field: SchemaField): unknown => {
    return (doc as any)[field.key];
  };

  // Filtruje kolumny na podstawie displayOptions.showInList
  const customColumns =
    schema?.fields?.filter((field) => field.displayOptions?.showInList) || [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell className="w-[30px] p-3 py-4">
            <Checkbox />
          </TableCell>
          <TableCell className="px-3">
            <Trans>Title</Trans>
          </TableCell>
          {showContainer && (
            <TableCell className="px-3">
              <Trans>Container</Trans>
            </TableCell>
          )}
          {customColumns.map((field) => (
            <TableCell key={field.key} className="px-3">
              <Trans>{field.name}</Trans>
            </TableCell>
          ))}
          <TableCell className="hidden md:table-cell px-3">
            <Trans>Content Preview</Trans>
          </TableCell>
          <TableCell className="w-[150px] px-3" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document, index) => (
          <TableRow key={document.id}>
            <TableCell className="px-3">
              <Checkbox />
            </TableCell>
            <TableCell className="px-3">
              <div className="flex space-x-2">
                <span className="max-w-[500px] truncate font-medium">
                  {document.title}
                </span>
              </div>
            </TableCell>
            {showContainer && (
              <TableCell className="px-3">
                {container?.name || document.documentContainerId}
              </TableCell>
            )}
            {customColumns.map((field) => (
              <TableCell key={field.key} className="px-3 text-muted-foreground">
                {formatValue(getDocumentValue(document, field), field)}
              </TableCell>
            ))}
            <TableCell className="hidden md:table-cell px-3">
              <span className="text-muted-foreground">
                {document.content ? (
                  truncate(document.content, 32)
                ) : (
                  <span className="italic text-muted-foreground">
                    <Trans>No content provided</Trans>
                  </span>
                )}
              </span>
            </TableCell>
            <TableCell className="px-3">
              <DocumentActions
                document={document}
                index={index}
                totalDocuments={documents.length}
                onPreview={onPreview}
                onEdit={onEdit}
                onMove={onMove}
                onDelete={onDelete}
                showContainer={showContainer}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
