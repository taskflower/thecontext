/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectsStore } from '@/store/projectsStore';
import { useDocumentsStore } from '@/store/documentsStore';
import { useTasksStore } from '@/store/tasksStore';
import { PROJECT } from './mockedproject';
import { Trans } from '@lingui/macro';
import { Card, CardContent } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { DocumentTable, DocumentPreviewDialog } from "@/components/documents";
import { Document } from '@/types/document';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProcessRunner from '@/components/tasks/ProcessRunner';

interface ActionConfig {
  label: string;
  actionType: string;
  flowId?: string;
  taskId?: string;
  tag?: string;
}

interface TabConfig {
  title: string;
  type: string;
  containerId: string;
  actions: ActionConfig[];
}

interface StepConfig {
  id: string;
  name: string;
  description: string;
  pluginId: string;
  config: any;
  data: any;
}

interface KanbanTask {
  id: string;
  name: string;
  description: string;
  dependencies: string[];
  templateId: string;
  steps: StepConfig[];
}

interface KanbanConfig {
  boardTemplateId: string;
  tasks: KanbanTask[];
}

interface ProjectConfig {
  name: string;
  tabs: TabConfig[];
  kanban: KanbanConfig;
}

const ProjectRenderer: React.FC = () => {
  const { projectSlug } = useParams();
  const { projects } = useProjectsStore();
  const { templates } = useTasksStore();
  const { getContainerDocuments, containers, updateDocument, removeDocument } = useDocumentsStore();
  
  const [config, setConfig] = useState<ProjectConfig | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);

  // Find the project by matching the slug with the project title
  const project = projects.find(
    (p) => p.title.toLowerCase() === projectSlug?.toLowerCase()
  );

  useEffect(() => {
    if (project) {
      setConfig(PROJECT as ProjectConfig);
      // Set first tab as active by default
      if (PROJECT.tabs.length > 0) {
        setActiveTab(PROJECT.tabs[0].containerId);
      }
    }
  }, [project]);

  const handleAction = (action: ActionConfig) => {
    if (action.actionType === 'runFlow' && action.flowId) {
      setSelectedFlow(action.flowId);
    } else if (action.actionType === 'viewDocument' && action.tag) {
      const documentsWithTag = getContainerDocuments(activeTab).filter(
        doc => doc.tags?.includes(action.tag)
      );
      if (documentsWithTag.length > 0) {
        setSelectedDocument(documentsWithTag[0]);
      }
    }
  };

  const handleMoveDocument = (docId: string, direction: "up" | "down") => {
    const documents = selectedDocument?.documentContainerId 
      ? getContainerDocuments(selectedDocument.documentContainerId)
      : [];
    
    const currentIndex = documents.findIndex((d) => d.id === docId);
    if (direction === "up" && currentIndex > 0) {
      const prevDoc = documents[currentIndex - 1];
      updateDocument(docId, { order: prevDoc.order });
      updateDocument(prevDoc.id, { order: documents[currentIndex].order });
    } else if (direction === "down" && currentIndex < documents.length - 1) {
      const nextDoc = documents[currentIndex + 1];
      updateDocument(docId, { order: nextDoc.order });
      updateDocument(nextDoc.id, { order: documents[currentIndex].order });
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'viewDocument':
        return <Eye className="h-4 w-4" />;
      case 'runFlow':
        return <Play className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (!project) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          <Trans>Project Not Found</Trans>
        </h1>
        <p className="text-gray-600">
          <Trans>
            The requested project does not exist or you may not have access to it.
          </Trans>
        </p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <Trans>Loading project configuration...</Trans>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{project.title}</h1>
      
      <div className="mb-8">
        <p className="text-gray-600">
          {project.description || (
            <span className="italic">
              <Trans>No description provided</Trans>
            </span>
          )}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          {config.tabs.map((tab) => (
            <TabsTrigger key={tab.containerId} value={tab.containerId}>
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {config.tabs.map((tab) => {
          const container = containers.find(c => c.id === tab.containerId);
          const documents = getContainerDocuments(tab.containerId);

          return (
            <TabsContent key={tab.containerId} value={tab.containerId}>
              <div className="flex justify-end items-center mb-4 space-x-2">
                {tab.actions.map((action, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleAction(action)}
                    variant={action.actionType === 'runFlow' ? 'default' : 'secondary'}
                    size="sm"
                  >
                    {getActionIcon(action.actionType)}
                    <span className="ml-2">{action.label}</span>
                  </Button>
                ))}
              </div>

              <Card>
                <CardContent className="p-0">
                  <DocumentTable
                    documents={documents}
                    container={container}
                    onPreview={setSelectedDocument}
                    onEdit={(id) => console.log('Edit document:', id)}
                    onMove={handleMoveDocument}
                    onDelete={removeDocument}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <DocumentPreviewDialog
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />

      <Dialog open={selectedFlow !== null} onOpenChange={() => setSelectedFlow(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {templates.find(t => t.id === selectedFlow)?.name || 'Uruchom proces'}
            </DialogTitle>
          </DialogHeader>
          {selectedFlow && (
            <ProcessRunner
              template={templates.find(t => t.id === selectedFlow)!}
              onBack={() => setSelectedFlow(null)}
              onComplete={() => setSelectedFlow(null)}
              onEdit={() => setSelectedFlow(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectRenderer;