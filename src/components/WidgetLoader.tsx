// src/components/WidgetLoader.tsx (Refactored)
import React, { memo, useState, useEffect } from 'react';
import { useWidget } from '@/core';
import { withSuspense } from '.';
import { NotFoundWidget } from '@/core/fallback-components';

const RawWidgetLoader = memo(({ tplDir, widget }: { tplDir: string, widget: any }) => {
  const [error, setError] = useState<Error | null>(null);
  const Widget = useWidget(tplDir, widget.tplFile);
  useEffect(() => setError(null), [tplDir, widget.tplFile]);
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
  try {
    return <Widget {...widget} componentName={widget.tplFile} />;
  } catch (err) {
    console.error(`Error rendering widget ${widget.tplFile}:`, err);
    const newError = err instanceof Error ? err : new Error(String(err));
    setTimeout(() => setError(newError), 0);
    return null; 
  }
});

export default withSuspense(
  React.lazy(() => Promise.resolve({ default: RawWidgetLoader })),
  'Ładowanie widgetu…'
);