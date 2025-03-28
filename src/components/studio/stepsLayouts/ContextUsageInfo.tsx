import { Layers } from "lucide-react";
export interface ContextUsageInfoProps {
  contextKey: string | undefined;
  isVisible: boolean;
}
export const ContextUsageInfo: React.FC<ContextUsageInfoProps> = ({
  contextKey,
  isVisible,
}) => {
  if (!isVisible || !contextKey) return null;

  return (
    <div className="mt-2 py-1.5 px-2 bg-muted text-primary text-xs rounded-md flex items-center">
      <Layers className="mr-2 h-4 w-4" />
      <span>
        Używany klucz kontekstu <strong>{contextKey}</strong>
      </span>
    </div>
  );
};
