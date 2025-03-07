/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreatorLLM/components/ActionButtons.tsx
import { Button } from '@/components/ui/button';
import { Loader2, Play, Save, CheckCircle2, RefreshCw } from 'lucide-react';

interface ActionButtonsProps {
  loading: boolean;
  fetchFromLLM: () => void;
  handleCreateAll: () => void;
  handleSaveToDocuments: () => void;
  llmResponse: any;
  creationStatus: string;
  saveStatus: string;
}

export function ActionButtons({ 
  loading, 
  fetchFromLLM, 
  handleCreateAll, 
  handleSaveToDocuments, 
  llmResponse, 
  creationStatus, 
  saveStatus 
}: ActionButtonsProps) {
  return (
    <div className="flex justify-between gap-2 flex-wrap">
      <Button 
        variant="outline" 
        onClick={fetchFromLLM}
        disabled={loading || creationStatus === 'processing'}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Generating...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Content
          </>
        )}
      </Button>
      
      <div className="flex gap-2">
        <Button 
          onClick={handleCreateAll}
          disabled={loading || !llmResponse || creationStatus === 'processing' || creationStatus === 'completed'}
        >
          {creationStatus === 'processing' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Create All
            </>
          )}
        </Button>
        
        {llmResponse && (
          <Button 
            variant="secondary"
            onClick={handleSaveToDocuments}
            disabled={saveStatus === 'processing' || saveStatus === 'completed'}
          >
            {saveStatus === 'processing' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : saveStatus === 'completed' ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save to Documents
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}