import React from 'react';
import { LayoutGrid, CheckSquare, FileText, Settings, LucideIcon } from 'lucide-react';

type IconName = 'boards' | 'tasks' | 'documents' | 'settings';

interface IconComponentProps {
  icon: string; // Zmieniono na string
}

const iconMap: Record<IconName, LucideIcon> = {
  boards: LayoutGrid,
  tasks: CheckSquare,
  documents: FileText,
  settings: Settings,
};

const IconCom: React.FC<IconComponentProps> = ({ icon }) => {
  // Jeśli icon nie jest kluczem w iconMap, użyj wartości domyślnej 'documents'
  const validIcon = icon in iconMap ? icon as IconName : "documents";
  const Icon = iconMap[validIcon];
  return <Icon className="text-muted-foreground h-4 w-4" />;
};

export default IconCom;
