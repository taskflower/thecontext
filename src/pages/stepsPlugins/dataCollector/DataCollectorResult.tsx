/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/dataCollector/DataCollectorResult.tsx
import { Card, CardContent } from '@/components/ui/card';
import { ResultRendererProps } from '../types';

export function DataCollectorResult({ step }: ResultRendererProps) {
  const result = step.result;
  
  if (!result || !result.formData) {
    return <div>No data collected</div>;
  }
  
  // Helper function to format values
  const formatValue = (value: any) => {
    if (value === undefined || value === null) {
      return '-';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    return String(value);
  };
  
  // Get the field definitions to show proper labels
  const getFieldLabel = (fieldId: string) => {
    const field = step.config.fields?.find((f: any) => f.id === fieldId);
    return field ? field.label : fieldId;
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-2">
          <h3 className="text-base font-semibold">Collected Data</h3>
          <p className="text-xs text-muted-foreground">
            Submitted on {new Date(result.timestamp).toLocaleString()}
          </p>
        </div>
        
        <div className="mt-4 border rounded-md overflow-hidden">
          <table className="w-full">
            <tbody>
              {Object.entries(result.formData).map(([key, value]) => (
                <tr key={key} className="border-b last:border-b-0">
                  <td className="px-4 py-2 font-medium text-sm bg-muted/50 w-1/3">
                    {getFieldLabel(key)}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {formatValue(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}