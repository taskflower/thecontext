// src/themes/default/widgets/WidgetWrapperApi.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth/useAuth';
import { useFlow } from '@/core';
import { Loading } from '@/components';


export interface WidgetWrapperApiProps<T> {
  apiEndpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  payloadDataPath?: string;
  responseTransform?: (response: any) => T;
  transformErrors?: (error: any) => string;
  widget: React.ComponentType<{ data: T }>;
  widgetProps?: Record<string, any>;
}

export default function WidgetWrapperApi<T>({
  apiEndpoint,
  method = 'GET',
  payloadDataPath,
  responseTransform = (res) => res,
  transformErrors = (err) => err.message || 'Wystąpił nieznany błąd',
  widget: WrappedWidget,
  widgetProps = {},
}: WidgetWrapperApiProps<T>) {
  const { getToken, user } = useAuth();
  const { get } = useFlow();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = await getToken();
        if (!token || !user) throw new Error(token ? 'Użytkownik nie zalogowany' : 'Brak tokenu autoryzacji');
        const payload = payloadDataPath ? get(payloadDataPath) : undefined;
        const url = apiEndpoint.startsWith('http') ? apiEndpoint : `${import.meta.env.VITE_API_URL}${apiEndpoint}`;
        const opts: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          ...(method !== 'GET' && payload ? { body: JSON.stringify(payload) } : {}),
        };
        const response = await fetch(url, opts);
        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          throw new Error(errJson.message || `Błąd HTTP ${response.status}`);
        }
        const json = await response.json();
        const transformed = responseTransform(json);
        setData(transformed);
      } catch (err: any) {
        setError(transformErrors(err));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [apiEndpoint, method, payloadDataPath]);

  if (isLoading) {
    return <Loading />;
  }
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded border border-red-200 text-sm">
        <h3 className="font-semibold mb-2">Wystąpił błąd</h3>
        <p>{error}</p>
      </div>
    );
  }
  if (data !== null) {
    return <WrappedWidget data={data} {...widgetProps} />;
  }
  return null;
}
