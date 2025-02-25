/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Card, CardContent, CardHeader, CardTitle, Label } from "@/components/ui";
import { useContainerStore } from "@/store/containerStore";
import { IContainerRelation } from "@/utils/containers/types";
import { useState } from "react";

// components/management/RelationCreator.tsx
export const RelationCreator: React.FC = () => {
    const [sourceContainerId, setSourceContainerId] = useState('');
    const [targetContainerId, setTargetContainerId] = useState('');
    const [sourceField, setSourceField] = useState('');
    const [targetField, setTargetField] = useState('');
    const [condition, setCondition] = useState<'equals' | 'greater' | 'less' | 'contains'>('equals');
  
    const containers = useContainerStore(state => state.containers);
    const addRelation = useContainerStore(state => state.addRelation);
  
    const sourceContainer = containers.find(c => c.id === sourceContainerId);
    const targetContainer = containers.find(c => c.id === targetContainerId);
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!sourceContainerId || !targetContainerId || !sourceField || !targetField) return;
  
      const newRelation: IContainerRelation = {
        id: Math.random().toString(36).substr(2, 9),
        sourceContainerId,
        targetContainerId,
        sourceField,
        targetField,
        condition
      };
  
      addRelation(newRelation);
      setSourceContainerId('');
      setTargetContainerId('');
      setSourceField('');
      setTargetField('');
      setCondition('equals');
    };
  
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Create Relation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="sourceContainer">Source Container</Label>
              <select
                id="sourceContainer"
                value={sourceContainerId}
                onChange={(e) => setSourceContainerId(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select container...</option>
                {containers.map(container => (
                  <option key={container.id} value={container.id}>
                    {container.name}
                  </option>
                ))}
              </select>
            </div>
  
            {sourceContainer && (
              <div>
                <Label htmlFor="sourceField">Source Field</Label>
                <select
                  id="sourceField"
                  value={sourceField}
                  onChange={(e) => setSourceField(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select field...</option>
                  {sourceContainer.schemas.flatMap(schema =>
                    schema.fields.map(field => (
                      <option key={field.name} value={field.name}>
                        {field.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}
  
            <div>
              <Label htmlFor="targetContainer">Target Container</Label>
              <select
                id="targetContainer"
                value={targetContainerId}
                onChange={(e) => setTargetContainerId(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select container...</option>
                {containers.map(container => (
                  <option key={container.id} value={container.id}>
                    {container.name}
                  </option>
                ))}
              </select>
            </div>
  
            {targetContainer && (
              <div>
                <Label htmlFor="targetField">Target Field</Label>
                <select
                  id="targetField"
                  value={targetField}
                  onChange={(e) => setTargetField(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select field...</option>
                  {targetContainer.schemas.flatMap(schema =>
                    schema.fields.map(field => (
                      <option key={field.name} value={field.name}>
                        {field.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}
  
            <div>
              <Label htmlFor="condition">Condition</Label>
              <select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full p-2 border rounded"
              >
                <option value="equals">Equals</option>
                <option value="greater">Greater Than</option>
                <option value="less">Less Than</option>
                <option value="contains">Contains</option>
              </select>
            </div>
  
            <Button 
              type="submit" 
              className="w-full"
              disabled={!sourceContainerId || !targetContainerId || !sourceField || !targetField}
            >
              Create Relation
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };