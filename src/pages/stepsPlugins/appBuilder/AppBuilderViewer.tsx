/* eslint-disable @typescript-eslint/no-explicit-any */
// AppBuilderViewer.tsx - Main component that orchestrates the workflow
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ViewerProps } from '../types';
import { AppDataCollector } from './VIEWER/AppDataCollector';
import { AppGenerator } from './VIEWER/AppGenerator';
import { AppCreator } from './VIEWER/AppCreator';


export function AppBuilderViewer({ step, onComplete }: ViewerProps) {
  // Shared state
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'collect' | 'generate' | 'create' | 'complete'>('collect');
  const [appDescription, setAppDescription] = useState('');
  const [availablePlugins, setAvailablePlugins] = useState<string[]>([]);
  const [generatedApp, setGeneratedApp] = useState<any>(null);
  
  // Generate a unique instance ID for this component to use as keys for child components
  const [instanceId] = useState(() => `appbuilder-${Date.now()}`);
  
  // Handle the initial app description submission
  const handleGenerateApp = (description: string, plugins: string[]) => {
    setAppDescription(description);
    setAvailablePlugins(plugins);
    setCurrentStep('generate');
  };
  
  // Handle the app generation completion
  const handleAppCreated = (app: any) => {
    setGeneratedApp(app);
    setCurrentStep('create');
  };
  
  // Handle the app creation completion
  const handleAppFinished = () => {
    setCurrentStep('complete');
  };
  
  // Render the appropriate component based on current step
  return (
    <div className="space-y-4">
      {currentStep === 'collect' && (
        <AppDataCollector 
          key={`${instanceId}-collector`}
          title={step.config.title || 'Create Application'} 
          onGenerateApp={handleGenerateApp}
          loading={loading}
        />
      )}
      
      {currentStep === 'generate' && appDescription && (
        <>
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">Generating application based on:</p>
            <p className="text-sm mt-1">{appDescription}</p>
          </div>
          
          <AppGenerator
            key={`${instanceId}-generator`}
            appDescription={appDescription}
            plugins={availablePlugins}
            maxTasks={step.config.maxTasks || 5}
            loading={loading}
            setLoading={setLoading}
            onAppCreated={handleAppCreated}
            onComplete={onComplete}
          />
        </>
      )}
      
      {currentStep === 'create' && generatedApp && (
        <>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-base font-medium mb-2">Application: {generatedApp.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{generatedApp.description}</p>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Tasks:</h4>
                <div className="space-y-3">
                  {generatedApp.tasks.map((task: any, i: number) => (
                    <div key={`${instanceId}-task-${i}`} className="border rounded-md p-3">
                      <h5 className="font-medium">{task.title}</h5>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.steps.length} step{task.steps.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <AppCreator
            key={`${instanceId}-creator`}
            generatedApp={generatedApp}
            loading={loading}
            setLoading={setLoading}
            onComplete={handleAppFinished}
          />
        </>
      )}
      
      {currentStep === 'complete' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-green-700 font-medium">Application Successfully Created</h3>
          <p className="text-sm text-green-600 mt-1">
            Your application has been created and all tasks have been added to the system.
          </p>
        </div>
      )}
    </div>
  );
}