// src/pages/stepsPlugins/aiContent/components/Header.tsx
interface HeaderProps {
    title: string;
    description: string;
  }
  
  export function Header({ title, description }: HeaderProps) {
    return (
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    );
  }
  