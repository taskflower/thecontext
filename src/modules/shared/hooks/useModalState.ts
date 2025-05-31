// src/shared/hooks/useModalState.ts
import { useState } from 'react';

export const useModalState = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsync = async (operation: () => Promise<void>, type: 'load' | 'save' = 'load') => {
    const setter = type === 'save' ? setSaving : setLoading;
    try {
      setter(true);
      setError(null);
      await operation();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setter(false);
    }
  };

  return { loading, saving, error, setError, handleAsync };
};
