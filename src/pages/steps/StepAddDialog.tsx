// src/pages/steps/StepAddDialog.tsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStepStore } from "@/store/stepStore";
import { getAllPlugins, getDefaultConfig } from "@/pages/stepsPlugins";
import { StepType } from "@/types";
import { PLUGIN_CATEGORIES } from "../stepsPlugins/registry";

interface StepAddDialogProps {
  taskId: string;
  open: boolean;
  onClose: () => void;
}

export function StepAddDialog({ taskId, open, onClose }: StepAddDialogProps) {
  const [newStepType, setNewStepType] = useState<string>("");
  const [newStepTitle, setNewStepTitle] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState(PLUGIN_CATEGORIES.CONTENT);
  const { addStep } = useStepStore();
  
  // Get all available plugins
  const plugins = getAllPlugins();
  
  // Group plugins by category
  const categorizedPlugins = Object.values(PLUGIN_CATEGORIES).reduce((acc, category) => {
    acc[category] = plugins.filter(plugin => plugin.category === category);
    return acc;
  }, {} as Record<string, typeof plugins>);
  
  // Set default plugin if available
  useEffect(() => {
    const categoryPlugins = categorizedPlugins[activeCategory] || [];
    if (categoryPlugins.length > 0 && !newStepType) {
      setNewStepType(categoryPlugins[0].type);
      
      // Auto-set title based on plugin default
      const defaultConfig = getDefaultConfig(categoryPlugins[0].type);
      setNewStepTitle(defaultConfig.title || "");
    }
  }, [activeCategory, categorizedPlugins, newStepType]);

  // Update title when step type changes
  useEffect(() => {
    if (newStepType) {
      const defaultConfig = getDefaultConfig(newStepType);
      setNewStepTitle(defaultConfig.title || "");
    }
  }, [newStepType]);
  
  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;
    
    const defaultConfig = getDefaultConfig(newStepType);
    
    addStep(taskId, {
      title: newStepTitle,
      description: defaultConfig.description || "",
      type: newStepType as StepType,
      config: defaultConfig,
      options: {},
      status: 'pending',
      result: null
    });
    
    // Reset and close dialog
    setNewStepTitle("");
    onClose();
  };
  
  const selectedPlugin = plugins.find(p => p.type === newStepType);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add step to task</DialogTitle>
          <DialogDescription>
            Choose a step type to add to your workflow
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="w-full mb-4">
            {Object.values(PLUGIN_CATEGORIES).map(category => (
              <TabsTrigger value={category} key={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(categorizedPlugins).map(([category, categoryPlugins]) => (
            <TabsContent value={category} key={category} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {categoryPlugins.map(plugin => (
                  <div 
                    key={plugin.type}
                    className={`p-3 rounded-md border cursor-pointer transition-colors
                      ${newStepType === plugin.type 
                        ? 'bg-primary/10 border-primary/50' 
                        : 'hover:bg-secondary'}`}
                    onClick={() => setNewStepType(plugin.type)}
                  >
                    <h4 className="font-medium">{plugin.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {plugin.description}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        {selectedPlugin && (
          <div className="space-y-2 mt-4">
            <h3 className="text-sm font-medium">Step Name</h3>
            <Input
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
              placeholder="Enter step name"
            />
            <p className="text-xs text-muted-foreground">
              This step will add a {selectedPlugin.name.toLowerCase()} to your workflow.
            </p>
          </div>
        )}
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddStep} disabled={!newStepTitle.trim()}>
            Add Step
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StepAddDialog;