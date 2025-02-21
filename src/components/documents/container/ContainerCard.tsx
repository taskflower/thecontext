// src/components/documents/ContainerCard.tsx
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { FileText, Folder, Calendar, Link2 } from "lucide-react";
import ContainerActions from "./ContainerActions";
import { DocumentContainer, Document } from "@/types/document";
import { Trans } from "@lingui/macro";
import { useDocumentsStore } from "@/store/documentsStore";


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
  const { relationConfigs } = useDocumentsStore();
  const documentCount = getContainerDocuments(container.id).length;
  const relationsCount = relationConfigs.filter(
    config => config.sourceContainerId === container.id || config.targetContainerId === container.id
  ).length;

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
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-lg">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {documentCount}
                  </span>
                </div>
                {relationsCount > 0 && (
                  <div className="flex items-center gap-2 bg-blue-100 px-2 py-1 rounded-lg">
                    <Link2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      {relationsCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <CardDescription className="text-sm text-muted-foreground leading-relaxed">
            {container.description || <Trans>No description provided</Trans>}
          </CardDescription>
          <div className="mt-2 flex items-center justify-end gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(container.createdAt)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {container.targetDocumentCount !== undefined && container.targetDocumentCount > 0 ? (
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
              <span>
                <Trans>Estimated progress</Trans>
              </span>
              <span>
                <Trans>
                  {documentCount} of {container.targetDocumentCount} documents
                </Trans>
              </span>
            </div>
          </div>
        ) : (
          <div className="py-3 flex items-center justify-between text-sm text-muted-foreground border-y">
            <span>
              <Trans>Collection status</Trans>
            </span>
            <span>
              <Trans>{documentCount} documents stored</Trans>
            </span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {relationsCount > 0 && (
            <div className="text-sm text-muted-foreground border-y py-3">
              <Link to={`/admin/documents/${container.id}/relations`} className="hover:text-primary">
                <div className="flex justify-between items-center">
                  <span><Trans>Container Relations</Trans></span>
                  <span>{relationsCount}</span>
                </div>
              </Link>
            </div>
          )}
          
          <div className="w-full">
            <ContainerActions containerId={container.id} onDelete={onDelete} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default ContainerCard;