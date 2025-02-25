

import { DocumentContainer } from "@/types/document";
import { ArrowRight, Trash2 } from "lucide-react";
import { RelationType } from "@/types/relation";
import { Badge, Button, Card, CardContent } from "@/components/ui";

interface Rule {
  sourceField: string;
  targetField: string;
  matchType: 'exact' | 'contains' | 'startsWith' | 'endsWith';
}

export const RelationConfigList: React.FC<{
  configs: Array<{
    id: string;
    name: string;
    type: RelationType;
    sourceContainerId: string;
    targetContainerId: string;
    description?: string;
    rules: Rule[];
  }>;
  containers: DocumentContainer[];
  onDelete: (id: string) => void;
}> = ({ configs, containers, onDelete }) => {
  const getContainerName = (id: string) => {
    return containers.find(c => c.id === id)?.name || 'Unknown';
  };

  const getMatchTypeLabel = (matchType: Rule['matchType']) => {
    const labels = {
      exact: '=',
      contains: '∋',
      startsWith: '^',
      endsWith: '$'
    };
    return labels[matchType];
  };

  return (
    <div className="space-y-3">
      {configs.map(config => (
        <Card key={config.id} className="border-muted">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{config.name}</h3>
                  {config.description && (
                    <p className="text-sm text-muted-foreground hidden md:block">• {config.description}</p>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {config.rules.map((rule, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center text-xs bg-muted/50 rounded-md px-2 py-1"
                    >
                      <Badge variant="outline" className="font-normal bg-background">{rule.sourceField}</Badge>
                      <span className="mx-2 text-muted-foreground">{getMatchTypeLabel(rule.matchType)}</span>
                      <Badge variant="outline" className="font-normal bg-background">{rule.targetField}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-normal">
                    {getContainerName(config.sourceContainerId)}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="font-normal">
                    {getContainerName(config.targetContainerId)}
                  </Badge>
                </div>
                
                <Badge variant="secondary">
                  {config.type}
                </Badge>

                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onDelete(config.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}