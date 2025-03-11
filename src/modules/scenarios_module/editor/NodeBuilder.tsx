// src/modules/scenarios_module/NodeBuilder.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useScenarioStore } from '../scenarioStore';

const NodeBuilder: React.FC = () => {
  const { categories, addNode, addCategory } = useScenarioStore();
  const [nodeForm, setNodeForm] = useState({ id: '', message: '', category: 'default' });
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      addCategory(newCategory);
      setNewCategory('');
    }
  };

  const handleAddNode = () => {
    if (nodeForm.id && nodeForm.message) {
      addNode(nodeForm.id, nodeForm.message, nodeForm.category);
      setNodeForm({ ...nodeForm, id: '', message: '' });
    }
  };

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Add Node
        </CardTitle>
        <CardDescription>Create a prompt node with content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-1" /> New Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new category to organize your nodes
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="new-category">Category Name</Label>
                  <Input 
                    id="new-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter category name"
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewCategory('')}>Cancel</Button>
                  <Button onClick={handleAddCategory}>Add Category</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleAddNode}
          disabled={!nodeForm.id || !nodeForm.message}
          className="w-full"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Add Node
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NodeBuilder;