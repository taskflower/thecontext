// src/components/WidgetLoader.tsx (Refactored)
import React, { memo, useState, useEffect } from 'react';
import { useWidget } from '@/core';
import { withSuspense } from '.';
import { NotFoundWidget } from '@/core/fallback-components';

const RawWidgetLoader = memo(({ tplDir, widget }: { tplDir: string, widget: any }) => {
  const [error, setError] = useState<Error | null>(null);
  
  // Safely fetch the widget component
  const Widget = useWidget(tplDir, widget.tplFile);
  
  // Reset error when widget changes
  useEffect(() => setError(null), [tplDir, widget.tplFile]);
  
  // Show error fallback if rendering failed
  if (error) {
    return (
      <NotFoundWidget 
        componentName={widget.tplFile} 
        tplDir={tplDir}
        error={error.message}
        {...widget}
      />
    );
  }
  
  // Safely render widget with error handling
  try {
    return <Widget {...widget} componentName={widget.tplFile} />;
  } catch (err) {
    // Log error and schedule error state update
    console.error(`Error rendering widget ${widget.tplFile}:`, err);
    const newError = err instanceof Error ? err : new Error(String(err));
    setTimeout(() => setError(newError), 0);
    return null; // Return null to avoid render errors
  }
});

// Add Suspense handling
export default withSuspense(
  React.lazy(() => Promise.resolve({ default: RawWidgetLoader })),
  'Ładowanie widgetu…'
);