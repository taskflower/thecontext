// ========================================
// src/modules/edv2/shared/AIGeneratorSection.tsx
// ========================================
import { useAIGenerator } from './useAIGenerator';
import type { AI_CONFIGS } from './editorConfigs';

interface AIGeneratorSectionProps {
  type: keyof typeof AI_CONFIGS;
  onApply: (result: any) => void;
  bgColor?: string;
}

export function AIGeneratorSection({ type, onApply, bgColor = 'bg-indigo-50' }: AIGeneratorSectionProps) {
  const { prompt, setPrompt, isLoading, result, generate, config } = useAIGenerator(type);

  return (
    <div className={`${bgColor} p-3 rounded`}>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={config.placeholder}
        className="w-full text-sm border rounded p-2 mb-2"
        rows={2}
      />
      <div className="flex gap-2">
        <button
          onClick={generate}
          disabled={isLoading || !prompt.trim()}
          className="text-xs bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : config.buttonText}
        </button>
        {result && (
          <button
            onClick={() => onApply(result)}
            className="text-xs bg-green-600 text-white px-3 py-1 rounded"
          >
            Apply {config.type === 'schema' ? 'Schemas' : type === 'flow' ? 'Flow' : 'Generated'}
          </button>
        )}
      </div>
    </div>
  );
}