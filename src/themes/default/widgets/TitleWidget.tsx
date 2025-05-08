// src/themes/default/widgets/TitleWidget.tsx
type TitleProps = {
  title: string;
  subtitle?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
};

export default function TitleWidget({ title, subtitle, level = 2 }: TitleProps) {
  const TitleTag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const getTitleSize = () => {
    switch (level) {
      case 1: return "text-2xl font-semibold";
      case 2: return "text-xl font-medium";
      case 3: return "text-lg font-medium";
      case 4: return "text-base font-medium";
      case 5: return "text-sm font-medium";
      case 6: return "text-xs font-medium";
      default: return "text-base font-medium";
    }
  };
  
  return (
    <div className="p-4 border-b border-gray-100">
      <TitleTag className={`m-0 ${getTitleSize()} text-gray-900`}>{title}</TitleTag>
      {subtitle && <p className="mt-2 mb-0 text-gray-500 text-sm">{subtitle}</p>}
    </div>
  );
}