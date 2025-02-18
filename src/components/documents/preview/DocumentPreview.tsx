/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/documents/preview/DocumentPreview.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trans } from "@lingui/macro";

interface DocumentPreviewProps {
  document: Record<string, any>;
}

export const DocumentPreview = ({ document }: DocumentPreviewProps) => {
  const documentMetadata = Object.entries(document)
    .filter(([key]) => key !== 'content')
    .map(([key, value]) => {
      let displayValue = value;
      
      if (value instanceof Date || (typeof value === 'string' && Date.parse(value))) {
        displayValue = new Date(value).toLocaleString();
      }
      else if (Array.isArray(value)) {
        displayValue = value.join(", ") || "None";
      }
      else {
        displayValue = value?.toString() || "Not set";
      }

      return {
        key,
        value: displayValue
      };
    });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/3"><Trans>Property</Trans></TableHead>
          <TableHead><Trans>Value</Trans></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documentMetadata.map(({ key, value }) => (
          <TableRow key={key}>
            <TableCell className="font-medium capitalize">
              <Trans>{key.replace(/([A-Z])/g, ' $1').trim()}</Trans>
            </TableCell>
            <TableCell>{value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};