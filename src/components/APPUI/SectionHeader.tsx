import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";

interface SectionHeaderProps {
  title: string;
  onAddClick: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onAddClick,
}) => (
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-sm font-medium">{title}</h3>
    <Button
      variant="ghost"
      size="icon"
      onClick={onAddClick}
      className="h-8 w-8"
    >
      <PlusCircle className="h-4 w-4" />
    </Button>
  </div>
);
