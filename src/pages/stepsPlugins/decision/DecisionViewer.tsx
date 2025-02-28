// src/pages/stepsPlugins/decision/DecisionViewer.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ViewerProps } from "../types";

interface DecisionOption {
  id: string;
  label: string;
  color: string;
}

export default function DecisionViewer({ step, onComplete }: ViewerProps) {
  const options = step.config?.options || [
    { id: 'approve', label: 'Approve', color: 'green' },
    { id: 'reject', label: 'Reject', color: 'red' }
  ];
  
  const requireComment = step.config?.requireComment ?? true;
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
    // Clear error when an option is selected
    setError(null);
  };
  
  const getButtonVariant = (option: DecisionOption) => {
    if (selectedOption === option.id) {
      return 'default';
    }
    
    switch (option.color) {
      case 'green': return 'outline';
      case 'red': return 'outline';
      case 'blue': return 'outline';
      case 'yellow': return 'outline';
      case 'purple': return 'outline';
      case 'gray': return 'outline';
      default: return 'outline';
    }
  };
  
  const getButtonStyle = (option: DecisionOption) => {
    if (selectedOption === option.id) {
      switch (option.color) {
        case 'green': return { borderColor: 'green', background: 'rgba(0, 128, 0, 0.1)' };
        case 'red': return { borderColor: 'red', background: 'rgba(255, 0, 0, 0.1)' };
        case 'blue': return { borderColor: 'blue', background: 'rgba(0, 0, 255, 0.1)' };
        case 'yellow': return { borderColor: 'orange', background: 'rgba(255, 165, 0, 0.1)' };
        case 'purple': return { borderColor: 'purple', background: 'rgba(128, 0, 128, 0.1)' };
        default: return {};
      }
    }
    return {};
  };
  
  const handleSubmit = () => {
    if (!selectedOption) {
      setError('Please select an option');
      return;
    }
    
    if (requireComment && !comment.trim()) {
      setError('Please provide a comment explaining your decision');
      return;
    }
    
    const selectedOptionObj = options.find((o: DecisionOption) => o.id === selectedOption);
    
    onComplete({
      decision: selectedOption,
      decisionLabel: selectedOptionObj?.label,
      comment,
      decidedAt: new Date().toISOString()
    });
  };
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">{step.config?.title || step.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{step.config?.description || step.description}</p>
      </div>
      
      <div className="space-y-2">
        <Label>Select an option:</Label>
        <div className="flex flex-wrap gap-2">
          {options.map((option: DecisionOption) => (
            <Button
              key={option.id}
              variant={getButtonVariant(option)}
              style={getButtonStyle(option)}
              onClick={() => handleSelectOption(option.id)}
              className="flex-1"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="comment">
          Comment {requireComment && <span className="text-red-500">*</span>}
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Please provide a reason for your decision"
          className="min-h-24"
        />
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={handleSubmit}
        className="w-full mt-4"
      >
        Submit Decision
      </Button>
    </div>
  );
}