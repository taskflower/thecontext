/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/documents/DocumentTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trans } from "@lingui/macro";
import { truncate } from "@/services/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Document } from "@/types/document";
import { DocumentActions } from "./preview/DocumentActions";
import { DocumentContainer } from "@/types/document";
import { SchemaField } from "@/types/schema";

interface DocumentTableProps {
  documents: Document[];
  container?: DocumentContainer;
  onPreview: (document: Document) => void;
  onEdit: (documentId: string) => void;
  onMove: (documentId: string, direction: "up" | "down") => void;
  onDelete: (documentId: string) => void;
  showContainer?: boolean;
}

const formatValue = (value: any, field?: SchemaField) => {
  if (value === undefined || value === null || value === "") return "-";
  if (field?.type === "date") {
    return new Date(value).toLocaleDateString();
  }
  if (field?.type === "boolean") {
    return value ? "Yes" : "No";
  }
  return value.toString();
};

export const DocumentTable = ({
  documents,
  container,
  onPreview,
  onEdit,
  onMove,
  onDelete,
  showContainer = false,
}: DocumentTableProps) => {

   

  const customColumns = container?.schema?.fields?.filter(field => {
 
    return field.atList;
  }) || [];

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
          {customColumns.map(field => {
            return (
              <TableCell key={field.key} className="px-3">
                <Trans>{field.name}</Trans>
              </TableCell>
            );
          })}
          <TableCell className="hidden md:table-cell px-3">
            <Trans>Content Preview</Trans>
          </TableCell>
          <TableCell className="w-[150px] px-3" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document, index) => {
          return (
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
                  {document.documentContainerId}
                </TableCell>
              )}
              {customColumns.map(field => {
                
                return (
                  <TableCell key={field.key} className="px-3 text-muted-foreground  ">
                    {formatValue(document[field.key], field)}
                  </TableCell>
                );
              })}
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
          );
        })}
      </TableBody>
    </Table>
  );
};