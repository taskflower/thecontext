// src/pages/stepsPlugins/textInput/TextInputViewer.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ViewerProps } from '../types';

export function TextInputViewer({ step, onComplete }: ViewerProps) {
  const [value, setValue] = useState<string>(step.result?.value || '');
  const [error, setError] = useState<string | null>(null);
  
  const config = step.config || {};
  const {
    placeholder = 'Enter your text here...',
    minLength = 0,
    maxLength = 1000,
    required = true,
    multiline = true,
    rows = 6
  } = config;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value);
    setError(null);
  };
  
  const handleSubmit = () => {
    // Validate input
    if (required && !value.trim()) {
      setError('This field is required');
      return;
    }
    
    if (minLength > 0 && value.length < minLength) {
      setError(`Input must be at least ${minLength} characters`);
      return;
    }
    
    if (maxLength > 0 && value.length > maxLength) {
      setError(`Input must be no more than ${maxLength} characters`);
      return;
    }
    
    // Submit the value
    onComplete({
      value,
      timestamp: new Date().toISOString()
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{step.title || 'Text Input'}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {step.description}
        </p>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {multiline ? (
          <Textarea
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            className="min-h-[100px]"
            rows={rows}
          />
        ) : (
          <Input
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
          />
        )}
        
        {minLength > 0 || maxLength > 0 ? (
          <div className="text-xs text-muted-foreground mt-2 flex justify-between">
            {minLength > 0 && <div>{value.length} / {minLength} min characters</div>}
            {maxLength > 0 && <div>{value.length} / {maxLength} max characters</div>}
          </div>
        ) : null}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button onClick={handleSubmit}>
          Complete
        </Button>
      </CardFooter>
    </Card>
  );
}