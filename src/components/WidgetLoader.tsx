// src/components/WidgetLoader.tsx (z obsługą błędów)
import React, { memo, useState, useEffect } from 'react';
import { useWidget } from '@/core';
import { withSuspense } from '.';
import { NotFoundWidget } from '@/core/fallback-components';


const RawWidgetLoader: React.FC<{ tplDir: string, widget: any }> = memo(({ tplDir, widget }) => {

  const [error, setError] = useState<Error | null>(null);
  
  // Bezpieczne pobieranie widgetu
  const Widget = useWidget(tplDir, widget.tplFile);
  
  // Obsługa błędów podczas renderowania
  useEffect(() => {
    // Reset błędu przy zmianie widgetu
    setError(null);
  }, [tplDir, widget.tplFile]);
  
  // Obsługa błędów w renderowaniu
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
  
  // Bezpieczne renderowanie widgetu z obsługą błędów
  try {
    return <Widget {...widget} componentName={widget.tplFile} />;
  } catch (err) {
    // Jeśli błąd wystąpił podczas renderowania, zapisujemy go i wyświetlamy fallback
    console.error(`Error rendering widget ${widget.tplFile}:`, err);
    const error = err instanceof Error ? err : new Error(String(err));
    
    // W następnym cyklu renderowania wyświetlimy komponent zastępczy
    // Używamy setTimeout, aby uniknąć błędu "Cannot update during an existing state transition"
    setTimeout(() => setError(error), 0);
    
    // Zwracamy null, aby uniknąć błędów podczas obecnego renderowania
    return null;
  }
});

// Dodanie obsługi Suspense
export default withSuspense(
  React.lazy(() => Promise.resolve({ default: RawWidgetLoader })),
  'Ładowanie widgetu…'
);
