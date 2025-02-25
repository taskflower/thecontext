import { Button, Card, CardContent, CardHeader, CardTitle, Checkbox, Input, Label } from "@/components/ui";
import { schemaRegistry } from "@/plugins/containers/schema/pluginRegistry";
import { useContainerStore } from "@/store/containerStore";
import { IContainer, IDocumentSchema } from "@/utils/containers/types";
import { useState } from "react";

// Modyfikacja ContainerCreator.tsx
export const ContainerCreator: React.FC = () => {
  const [name, setName] = useState('');
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);
  const addContainer = useContainerStore(state => state.addContainer);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const schemas = selectedPlugins
      .map(pluginId => schemaRegistry.getPlugin(pluginId)?.schema)
      .filter((schema): schema is IDocumentSchema => schema !== undefined);

    const newContainer: IContainer = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      documents: [],
      schemas,
      customFields: {}
    };

    addContainer(newContainer);
    setName('');
    setSelectedPlugins([]);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Create New Container</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="containerName">Container Name</Label>
            <Input
              id="containerName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter container name"
              className="w-full"
            />
          </div>
          <div>
            <Label>Select Schemas</Label>
            <div className="space-y-2">
              {schemaRegistry.getAllPlugins().map(plugin => (
                <div key={plugin.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={plugin.id}
                    checked={selectedPlugins.includes(plugin.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPlugins([...selectedPlugins, plugin.id]);
                      } else {
                        setSelectedPlugins(selectedPlugins.filter(id => id !== plugin.id));
                      }
                    }}
                  />
                  <Label htmlFor={plugin.id}>{plugin.name}</Label>
                </div>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full">Create Container</Button>
        </form>
      </CardContent>
    </Card>
  );
};