import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RelationType, DocumentContainer } from "@/types/document";
import { Trans } from "@lingui/macro";


// src/components/documents/relations/RelationConfigList.tsx
export const RelationConfigList: React.FC<{
    configs: Array<{
      id: string;
      name: string;
      type: RelationType;
      sourceContainerId: string;
      targetContainerId: string;
      description?: string;
    }>;
    containers: DocumentContainer[];
    onDelete: (id: string) => void;
  }> = ({ configs, containers, onDelete }) => {
    const getContainerName = (id: string) => {
      return containers.find(c => c.id === id)?.name || 'Unknown';
    };
  
    return (
      <div className="space-y-4">
        {configs.map(config => (
          <Card key={config.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{config.name}</h3>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                  <div className="mt-2 text-sm">
                    <p>
                      <Trans>From:</Trans> {getContainerName(config.sourceContainerId)}
                    </p>
                    <p>
                      <Trans>To:</Trans> {getContainerName(config.targetContainerId)}
                    </p>
                    <p>
                      <Trans>Type:</Trans> {config.type}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => onDelete(config.id)}
                  className="text-destructive"
                >
                  <Trans>Delete</Trans>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };