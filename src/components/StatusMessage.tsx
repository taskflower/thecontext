
import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export const StatusMessage = ({ 
  error, 
  success, 
  onNavigate,
  navigateLabel = "Go to workspace" 
}:any) => {
  if (!error && !success) return null;
  
  if (error) {
    return (
      <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start">
        <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5 flex-shrink-0" />
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
      <div className="flex items-start">
        <CheckCircle2 className="h-5 w-5 text-success mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-success font-medium mb-2">Data imported successfully!</p>
          <div className="space-y-1 text-sm text-success/80">
            <p>Application ID: {success.applicationId}</p>
            <p>Workspace ID: {success.workspaceId}</p>
            <p>Scenario ID: {success.scenarioId}</p>
          </div>
          
          {onNavigate && (
            <button
              onClick={onNavigate}
              className="mt-4 inline-flex items-center justify-center h-9 px-4 rounded-md bg-success text-success-foreground text-sm font-medium shadow hover:bg-success/90 transition"
            >
              {navigateLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusMessage;