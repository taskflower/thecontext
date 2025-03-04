// src/pages/steps/StepHelpComponent.tsx
import { 
  HelpCircle, 
  FileText, 
  CheckSquare, 
  ClipboardCheck, 
  FormInput, 
  MessageSquare 
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function StepHelpComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle size={18} />
          Workflow Steps Guide
        </CardTitle>
        <CardDescription>
          Learn how to build effective workflows using the available steps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="intro" className="w-full">
          <TabsList className="w-full mb-4 justify-start">
            <TabsTrigger value="intro">Introduction</TabsTrigger>
            <TabsTrigger value="patterns">Common Patterns</TabsTrigger>
            <TabsTrigger value="types">Step Types</TabsTrigger>
          </TabsList>
          
          <TabsContent value="intro">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">What are workflow steps?</h3>
              <p className="text-sm leading-relaxed mb-2">
                Workflow steps are the building blocks of your automation process. Each step represents 
                a specific action or task that needs to be completed, such as creating a document, 
                getting approval, or collecting information.
              </p>
              <p className="text-sm leading-relaxed">
                By combining different steps, you can create custom workflows that match your team's 
                processes and ensure all necessary actions are completed.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="patterns">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Common workflow patterns</h3>
              
              <div className="border rounded-md p-3">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <MessageSquare size={16} className="text-indigo-500" />
                  Document Creation & Approval
                </h4>
                <ol className="text-sm list-decimal pl-5 space-y-1">
                  <li>AI Assistant: Generate a project proposal</li>
                  <li>Document Editor: Review and refine the generated content</li>
                  <li>Approval Request: Get stakeholder approval</li>
                </ol>
              </div>
              
              <div className="border rounded-md p-3">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <CheckSquare size={16} className="text-green-500" />
                  Project Requirements Collection
                </h4>
                <ol className="text-sm list-decimal pl-5 space-y-1">
                  <li>Data Collection Form: Gather project details</li>
                  <li>AI Assistant: Generate requirements document</li>
                  <li>Review Checklist: Verify requirements completeness</li>
                </ol>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="types">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Step types and their purposes</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare size={18} className="text-indigo-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">AI Assistant</h4>
                      <p className="text-xs text-muted-foreground">
                        Generate content such as reports, emails, or documentation automatically using AI
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <FileText size={18} className="text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Document Editor</h4>
                      <p className="text-xs text-muted-foreground">
                        Create or edit structured documents like specifications, contracts, or reports
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <CheckSquare size={18} className="text-green-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Approval Request</h4>
                      <p className="text-xs text-muted-foreground">
                        Request and track approvals or decisions from team members or stakeholders
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <ClipboardCheck size={18} className="text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Review Checklist</h4>
                      <p className="text-xs text-muted-foreground">
                        Ensure all requirements or quality standards are met with a verification checklist
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <FormInput size={18} className="text-purple-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Data Collection Form</h4>
                      <p className="text-xs text-muted-foreground">
                        Gather structured information needed for the task or project
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default StepHelpComponent;