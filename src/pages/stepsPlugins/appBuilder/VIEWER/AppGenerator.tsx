// 2. Now fix AppGenerator.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
// AppGenerator.tsx - Handles LLM simulation and app generation
import { useState, useEffect } from 'react';
import { ConversationItem } from '@/types';
import { genericAppMockTasks, marketingAppMockTasks, websiteAppMockTasks } from '../mockData';


interface GeneratedApp {
  title: string;
  description: string;
  tasks: any[];
}

interface AppGeneratorProps {
  appDescription: string;
  plugins: string[];
  maxTasks: number;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onAppCreated: (app: GeneratedApp) => void;
  onComplete: (result: any, conversation: ConversationItem[]) => void;
}

export function AppGenerator({ 
  appDescription, 
  plugins, 
  maxTasks, 
  setLoading, 
  onAppCreated,
  onComplete 
}: AppGeneratorProps) {
  const [generatedApp, setGeneratedApp] = useState<GeneratedApp | null>(null);
  const [, setError] = useState<string | null>(null);
  
  const generateApplication = async () => {
    if (!appDescription) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Create the user prompt
      const userPrompt = `Design an application for: ${appDescription}\n\nAvailable plugins: ${plugins.join(', ')}`;
      
      // Create conversation data
      const newConversation: ConversationItem[] = [
        { role: 'user', content: userPrompt }
      ];
      
      // Simulate LLM processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock application based on input
      let appTasks = [];
      
      // Create different app types based on keywords in the input
      if (appDescription.toLowerCase().includes('marketing') || 
          appDescription.toLowerCase().includes('campaign')) {
        appTasks = marketingAppMockTasks;
      } else if (appDescription.toLowerCase().includes('website') || 
                appDescription.toLowerCase().includes('domain') || 
                appDescription.toLowerCase().includes('seo')) {
        appTasks = websiteAppMockTasks;
      } else {
        // Generic application for other requirements
        appTasks = genericAppMockTasks;
      }
      
      // Limit number of tasks based on config
      if (maxTasks && maxTasks > 0) {
        appTasks = appTasks.slice(0, maxTasks);
      }
      
      // Create the application object
      const application = {
        title: appDescription.length > 50 
          ? appDescription.substring(0, 50) + '...' 
          : appDescription,
        description: appDescription,
        tasks: appTasks
      };
      
      setGeneratedApp(application);
      onAppCreated(application);
      
      // Add LLM response to conversation
      const responseContent = `I've designed an application for "${appDescription}" with ${appTasks.length} main tasks:\n\n${
        appTasks.map((task, i) => `${i+1}. ${task.title}: ${task.description} (${task.steps.length} steps)`).join('\n')
      }\n\nEach task contains specific steps using the available plugins to guide you through the process. Would you like me to create this application for you?`;
      
      newConversation.push({ role: 'assistant', content: responseContent });
      
      // Complete the step
      onComplete({
        application,
        timestamp: new Date().toISOString()
      }, newConversation);
      
    } catch (err) {
      setError('Failed to generate application. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Use useEffect to generate the application after component mounts
  useEffect(() => {
    if (!generatedApp) {
      generateApplication();
    }
  }, []);
  
  // Always return null since parent handles the result
  return null;
}