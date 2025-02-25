// components/container/RelationComponent.tsx

import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useContainerStore } from "@/store/containerStore";
import { IContainerRelation } from "@/utils/containers/types";
import { DocumentItem } from "./DocumentItem";


interface RelationComponentProps {
  relation: IContainerRelation;
}

export const RelationComponent: React.FC<RelationComponentProps> = ({ relation }) => {
  const updateFilteredDocuments = useContainerStore(state => state.updateFilteredDocuments);
  const filteredDocuments = useContainerStore(state => state.filteredDocuments);

  return (
    <Card className="w-full max-w-md ">
      <CardHeader>
        <CardTitle>Relation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p>Source Container: {relation.sourceContainerId}</p>
          <p>Target Container: {relation.targetContainerId}</p>
          <p>Condition: {relation.sourceField} {relation.condition} {relation.targetField}</p>
        </div>
        <Button 
          onClick={() => updateFilteredDocuments(relation.id)}
          className="w-full"
        >
          Filter Documents
        </Button>
        <div className="mt-4">
          <h3 className="font-medium mb-2">Filtered Documents:</h3>
          {filteredDocuments.map((doc) => (
            <DocumentItem key={doc.id} document={doc} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};