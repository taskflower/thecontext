// src/modules/templates_module/TemplateManagement.tsx
import React, { useState } from 'react';
import { useTemplateStore } from './templateStore';
import { useScenarioStore } from '../scenarios_module/scenarioStore';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MDialog from "@/components/MDialog";
import { Save, Import, FileJson, Upload } from "lucide-react";
import { exportToJsonFile, parseJsonFile } from '../shared/jsonUtils';
import JsonExportModal from '../shared/JsonExportModal';
import JsonImportModal from '../shared/JsonImportModal';


const TemplateManagement: React.FC = () => {
  const { nodes, edges } = useScenarioStore();
  const { templates, addTemplate, importTemplateAsNode, importTemplatesFromJson } = useTemplateStore();
  
  // State for various modals and forms
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportTemplateModal, setShowImportTemplateModal] = useState(false);
  const [showSaveTemplateForm, setShowSaveTemplateForm] = useState(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<string>('');
  const [mountPoint, setMountPoint] = useState('');
  const [prefix, setPrefix] = useState('');
  const [templateForm, setTemplateForm] = useState({ name: '', description: '' });

  // Handle importing a template to the current scenario
  const handleImportTemplate = () => {
    const index = parseInt(selectedTemplateIndex);
    if (!isNaN(index) && templates[index] && mountPoint) {
      importTemplateAsNode(index, mountPoint, prefix || 'imported');
      setSelectedTemplateIndex('');
      setMountPoint('');
      setPrefix('');
      setShowImportTemplateModal(false);
    }
  };

  // Save current scenario as a template
  const saveCurrentAsTemplate = () => {
    if (templateForm.name) {
      const newTemplate = {
        name: templateForm.name,
        description: templateForm.description,
        nodes: { ...nodes },
        edges: [...edges],
      };
      addTemplate(newTemplate);
      setTemplateForm({ name: '', description: '' });
      setShowSaveTemplateForm(false);
    }
  };

  // Handle export all templates
  const handleExportTemplates = () => {
    const templatesData = useTemplateStore.getState().exportTemplatesToJson();
    exportToJsonFile(templatesData, "templates_export.json");
    setShowExportModal(false);
  };

  // Handle file selection for template import
  const handleTemplateFileSelect = async (file: File) => {
    try {
      const data = await parseJsonFile(file);
      
      // Ensure data is an array of templates
      if (Array.isArray(data)) {
        importTemplatesFromJson(data);
      } else {
        alert("Invalid templates format. The file must contain an array of templates.");
      }
    } catch (error) {
      alert("Error importing templates. Please make sure the file contains valid JSON.");
      console.error(error);
    }
  };

  // Export statistics for display
  const exportStats = (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
      <div>
        <span className="text-sm font-medium">Templates:</span>
        <span className="ml-2">{templates.length}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button 
          onClick={() => setShowSaveTemplateForm(true)}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Current Scenario as Template
        </Button>
        <Button 
          onClick={() => setShowImportTemplateModal(true)}
          className="w-full"
        >
          <Import className="h-4 w-4 mr-2" />
          Import Template to Scenario
        </Button>

        <Button 
          onClick={() => setShowExportModal(true)}
          className="w-full"
        >
          <FileJson className="h-4 w-4 mr-2" />
          Export Templates to JSON
        </Button>
        
        <Button
          onClick={() => setShowImportModal(true)}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Load Templates from JSON
        </Button>
      </div>

      {/* Saved templates list */}
      {templates.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Saved Templates ({templates.length})</h3>
          </div>
          <ScrollArea className="h-64">
            <div className="space-y-3 p-1">
              {templates.map((template, index) => (
                <div key={index} className="p-3 border rounded-md bg-white">
                  <div className="font-medium">{template.name}</div>
                  {template.description && (
                    <div className="text-slate-600 mt-1 text-sm">{template.description}</div>
                  )}
                  <div className="flex mt-2 space-x-2">
                    <Badge variant="outline" className="bg-blue-50">
                      Nodes: {Object.keys(template.nodes).length}
                    </Badge>
                    <Badge variant="outline" className="bg-green-50">
                      Connections: {template.edges.length}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Save template form modal */}
      <MDialog
        title="Save Current Scenario as Template"
        description="Create a reusable template from your current scenario"
        isOpen={showSaveTemplateForm}
        onOpenChange={(open) => setShowSaveTemplateForm(open)}
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setShowSaveTemplateForm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={saveCurrentAsTemplate}
              disabled={!templateForm.name}
            >
              Save Template
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="templateName">Template Name</Label>
            <Input 
              id="templateName"
              value={templateForm.name} 
              onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              placeholder="Template name" 
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="templateDescription">Description (optional)</Label>
            <Textarea 
              id="templateDescription"
              value={templateForm.description} 
              onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
              placeholder="Brief description of the template" 
              className="mt-1.5 min-h-24" 
            />
          </div>
        </div>
      </MDialog>

      {/* Import template to scenario modal */}
      <MDialog
        title="Import Template to Scenario"
        description="Add a saved template to your current scenario"
        isOpen={showImportTemplateModal}
        onOpenChange={(open) => setShowImportTemplateModal(open)}
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setShowImportTemplateModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportTemplate}
              disabled={selectedTemplateIndex === '' || !mountPoint}
            >
              Import
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="templateSelect">Select Template</Label>
            <Select
              value={selectedTemplateIndex}
              onValueChange={setSelectedTemplateIndex}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedTemplateIndex !== '' && (
            <div className="bg-slate-50 p-3 rounded-md text-sm">
              <p className="font-medium">{templates[parseInt(selectedTemplateIndex)].name}</p>
              {templates[parseInt(selectedTemplateIndex)].description && (
                <p className="text-slate-600 mt-1">{templates[parseInt(selectedTemplateIndex)].description}</p>
              )}
              <div className="flex mt-2 space-x-2">
                <Badge variant="outline" className="bg-blue-50">
                  Nodes: {Object.keys(templates[parseInt(selectedTemplateIndex)].nodes).length}
                </Badge>
                <Badge variant="outline" className="bg-green-50">
                  Connections: {templates[parseInt(selectedTemplateIndex)].edges.length}
                </Badge>
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="mountPoint">Mount Point (node in current scenario)</Label>
            <Select
              value={mountPoint}
              onValueChange={setMountPoint}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select a node" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(nodes).map((id) => (
                  <SelectItem key={id} value={id}>{id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="prefix">Prefix for Imported Nodes</Label>
            <Input
              id="prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g. section1 (default: imported)"
              className="mt-1.5"
            />
          </div>
        </div>
      </MDialog>

      {/* Export Templates Modal */}
      <JsonExportModal
        isOpen={showExportModal}
        onOpenChange={setShowExportModal}
        title="Export Templates"
        description="Save all templates as a JSON file"
        onExport={handleExportTemplates}
        statistics={exportStats}
      />

      {/* Import Templates Modal */}
      <JsonImportModal
        isOpen={showImportModal}
        onOpenChange={setShowImportModal}
        title="Import Templates"
        description="Select a JSON file to import templates"
        warningMessage="Importing templates will add them to your existing templates. Make sure you've exported your changes first."
        confirmTitle="Import Templates?"
        confirmDescription="This action will add the imported templates to your existing templates."
        onFileSelect={handleTemplateFileSelect}
      />
    </div>
  );
};

export default TemplateManagement;