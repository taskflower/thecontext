/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trans } from "@lingui/macro";
import { DocumentContainer } from "@/types/document";
import { DocumentSchema, SchemaField } from "@/types/schema";

interface DocumentPreviewProps {
  document: Record<string, any>;
  container?: DocumentContainer;
  schema?: DocumentSchema;
}

export const DocumentPreview = ({ document,schema }: DocumentPreviewProps) => {
  const formatValue = (value: any, field?: SchemaField) => {
    if (value === undefined || value === null || value === "") return "Not set";
    if (field?.type === "date") {
      return new Date(value).toLocaleDateString();
    }
    if (field?.type === "boolean") {
      return value ? "Yes" : "No";
    }
    return value.toString();
  };

  const documentMetadata = [
    { key: "title", value: document.title },
    { key: "createdAt", value: document.createdAt ? new Date(document.createdAt).toLocaleString() : "Not set" },
    { key: "updatedAt", value: document.updatedAt ? new Date(document.updatedAt).toLocaleString() : "Not set" },
  ];

  if (schema?.fields) {
    documentMetadata.push(
      ...schema.fields.map((field) => ({
        key: field.name,
        value: formatValue(document[field.key], field),
      }))
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/3">
            <Trans>Property</Trans>
          </TableHead>
          <TableHead>
            <Trans>Value</Trans>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documentMetadata.map(({ key, value }) => (
          <TableRow key={key}>
            <TableCell className="font-medium capitalize">
              <Trans>{key.replace(/([A-Z])/g, " $1").trim()}</Trans>
            </TableCell>
            <TableCell>{value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DocumentPreview;