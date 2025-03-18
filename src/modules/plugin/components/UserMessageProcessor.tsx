/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugin/components/UserMessageProcessor.tsx
import React, { useState, useEffect } from 'react';
import { usePluginStore } from '../store';
import { Textarea } from '@/components/ui/textarea';

interface UserMessageProcessorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  pluginId?: string;
  pluginOptions?: Record<string, any>;
  disabled?: boolean;
}

export const UserMessageProcessor: React.FC<UserMessageProcessorProps> = ({
  value,
  onChange,
  placeholder = "Type your message here...",
  className = "min-h-[120px] resize-none",
  pluginId,
  pluginOptions = {},
  disabled = false
}) => {
  const { plugins } = usePluginStore();
  const [customRenderer, setCustomRenderer] = useState<React.ReactNode | null>(null);
  const [isPluginActive, setIsPluginActive] = useState(false);

  // Inicjalizacja pluginu do kontroli wiadomości użytkownika
  useEffect(() => {
    const initializePlugin = async () => {
      if (!pluginId) return;

      const plugin = plugins[pluginId];
      if (!plugin || !plugin.processUserInput) {
        setIsPluginActive(false);
        setCustomRenderer(null);
        return;
      }

      try {
        // Sprawdź czy plugin chce przejąć kontrolę nad interfejsem
        const result = await plugin.processUserInput({
          currentValue: value,
          options: pluginOptions,
          // Przekaż funkcje zwrotne do pluginu
          onChange: (newValue: string) => onChange(newValue),
          provideCustomRenderer: (renderer: React.ReactNode) => {
            setCustomRenderer(renderer);
            setIsPluginActive(true);
          }
        });

        // Jeśli plugin zwrócił nową wartość, ale nie dostarczył renderera
        if (result && typeof result === 'string' && !customRenderer) {
          onChange(result);
        }
      } catch (error) {
        console.error('Error initializing user message plugin:', error);
        setIsPluginActive(false);
        setCustomRenderer(null);
      }
    };

    initializePlugin();
  }, [pluginId, plugins, pluginOptions]);

  // Renderowanie niestandardowego interfejsu pluginu lub domyślnego pola tekstowego
  if (isPluginActive && customRenderer) {
    return (
      <div className="plugin-user-input">
        {customRenderer}
      </div>
    );
  }

  // Domyślny interfejs wprowadzania wiadomości użytkownika
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
};