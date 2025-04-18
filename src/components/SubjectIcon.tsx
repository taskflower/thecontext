// src/components/SubjectIcon.tsx
import React from "react";
import * as LucideIcons from "lucide-react";

// Mapowanie nazw ikon do odpowiadających im komponentów z Lucide
const SUBJECT_ICONS: Record<string, keyof typeof LucideIcons> = {
  // Bezpośrednie mapowanie nazw ikon (kebab-case) na komponenty Lucide
  "calculate": "Calculate",
  "calculator": "Calculator",
  "circle-dot": "CircleDot",
  "atom": "Atom",
  "flask": "Flask",
  "flask-conical": "FlaskConical",
  "leaf": "Leaf",
  "code": "Code",
  "code2": "Code2",
  "cpu": "Cpu",
  "clock": "Clock",
  "book-open": "BookOpen",
  "languages": "Languages",
  "pen": "Pen",
  "palette": "Palette",
  "music": "Music",
  "brain": "Brain",
  "globe": "Globe",
  "trending-up": "TrendingUp",
  "briefcase": "Briefcase",
  "users": "Users",
  "heart": "Heart",
  "dumbbell": "Dumbbell",
  "stethoscope": "Stethoscope",
  "graduation-cap": "GraduationCap",
  "clipboard-list": "ClipboardList",
  "file-check": "FileCheck",
  "help-circle": "HelpCircle",
  "folder-kanban": "FolderKanban",
  "presentation": "Presentation",
  "school": "School",
};

// Interfejs dla właściwości komponentu
interface SchoolIconProps {
  iconName?: string;
  className?: string;
  size?: number;
  color?: string;
  fallback?: keyof typeof LucideIcons;
}

/**
 * Komponent SchoolIcon wyświetla ikonę związaną z przedmiotem szkolnym.
 * Jeśli nazwa ikony nie zostanie znaleziona, wyświetla ikonę fallback.
 */
export const SubjectIcon: React.FC<SchoolIconProps> = ({
  iconName,
  className = "",
  size = 24,
  color = "currentColor",
  fallback = "GraduationCap"
}) => {
  // Wybierz nazwę ikony z biblioteki Lucide
  let lucideIconName: keyof typeof LucideIcons = fallback;
  
  if (iconName) {
    // Znormalizuj nazwę ikony (lowercase, bez spacji)
    const normalizedIconName = iconName.toLowerCase().trim();
    
    // Sprawdź czy ikona istnieje w naszym mapowaniu
    if (SUBJECT_ICONS[normalizedIconName]) {
      lucideIconName = SUBJECT_ICONS[normalizedIconName];
    } else {
      console.warn(`Icon '${iconName}' not found in SCHOOL_ICONS, using fallback`);
    }
  }
  
  // Pobierz komponent ikony z Lucide
  const IconComponent = LucideIcons[lucideIconName] || LucideIcons[fallback];
  return <IconComponent size={size} className={className} color={color} />;
};

export default SubjectIcon;