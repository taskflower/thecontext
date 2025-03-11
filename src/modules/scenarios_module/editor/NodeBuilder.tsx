// src/modules/scenarios_module/editor/NodeBuilder.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useScenarioStore } from '../scenarioStore';
import MCard from "@/components/MCard";
import MDialog from "@/components/MDialog";

const NodeBuilder: React.FC = () => {
  const { categories, addNode, addCategory } = useScenarioStore();
  const [nodeForm, setNodeForm] = useState({ id: '', message: '', category: 'default' });
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      addCategory(newCategory);
      setNodeForm({ ...nodeForm, category: newCategory });
      setNewCategory('');
      setShowCategoryDialog(false);
    }
  };

  const handleAddNode = () => {
    if (nodeForm.id && nodeForm.message) {
      addNode(nodeForm.id, nodeForm.message, nodeForm.category);
      setNodeForm({ ...nodeForm, id: '', message: '' });
    }
  };

  return (
    <MCard
      title={
        <div className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Add Node
        </div>
      }
      description="Create a prompt node with content"
      footer={
        <Button 
          onClick={handleAddNode}
          disabled={!nodeForm.id || !nodeForm.message}
          className="w-full"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Add Node
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="node-id">Node ID</Label>
          <Input
            id="node-id"
            value={nodeForm.id}
            onChange={(e) => setNodeForm({ ...nodeForm, id: e.target.value })}
            placeholder="Unique identifier for this node"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="node-message">Prompt Content</Label>
          <Textarea
            id="node-message"
            value={nodeForm.message}
            onChange={(e) => setNodeForm({ ...nodeForm, message: e.target.value })}
            placeholder="Enter prompt content (you can use {{nodeId.response}} to reference previous responses)"
            className="min-h-32"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="node-category">Category</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCategoryDialog(true)}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> New Category
            </Button>
          </div>
          
          <Select
            value={nodeForm.category}
            onValueChange={(value) => setNodeForm({ ...nodeForm, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* New Category Dialog */}
      <MDialog
        title="Add New Category"
        description="Create a new category to organize your nodes"
        isOpen={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </>
        }
      >
        <div>
          <Label htmlFor="new-category">Category Name</Label>
          <Input 
            id="new-category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name"
            className="mt-2"
          />
        </div>
      </MDialog>
    </MCard>
  );
};

export default NodeBuilder;