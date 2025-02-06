// ContainerCard.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FileText, Folder, Calendar } from "lucide-react";
import ContainerActions from "@/components/documents/ContainerActions";
import { DocumentContainer, Document } from "@/types/document";

interface ContainerCardProps {
  container: DocumentContainer;
  onDelete: (containerId: string) => Promise<void>;
  getContainerDocuments: (documentContainerId: string) => Document[];
}

export const ContainerCard: React.FC<ContainerCardProps> = ({
  container,
  onDelete,
  getContainerDocuments,
}) => {
  const documentCount = getContainerDocuments(container.id).length;

  const formatDate = (date: Date | string) => {
    const dateObject = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("pl-PL").format(dateObject);
  };

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="pt-1">
            <Folder className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-md font-semibold truncate pt-0.5">
                {container.name}
              </CardTitle>
              <div className="flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-lg shrink-0">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {documentCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="">
          <CardDescription className="text-sm text-muted-foreground leading-relaxed">
            {container.description || "No description provided"}
          </CardDescription>
          <div className="mt-2 flex items-center justify-end gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(container.createdAt)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {container.targetDocumentCount !== undefined &&
        container.targetDocumentCount > 0 ? (
          <div className="space-y-3">
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    (documentCount / container.targetDocumentCount) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Estimated progress</span>
              <span>
                {documentCount} of {container.targetDocumentCount} documents
              </span>
            </div>
          </div>
        ) : (
          <div className="py-3 flex items-center justify-between text-sm text-muted-foreground border-y">
            <span>Collection status</span>
            <span>{documentCount} documents stored</span>
          </div>
        )}

        <div className="w-full">
          <ContainerActions containerId={container.id} onDelete={onDelete} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ContainerCard;
