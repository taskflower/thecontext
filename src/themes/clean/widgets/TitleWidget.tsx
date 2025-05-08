// src/themes/clean/widgets/TitleWidget.tsx
type TitleProps = {
  title: string;
  subtitle?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
};
  
export default function TitleWidget({ title, subtitle, level = 2 }: TitleProps) {
  const TitleTag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <div className="p-4">
      <TitleTag className="m-0 font-semibold">{title}</TitleTag>
      {subtitle && <p className="mt-2 mb-0 text-gray-600">{subtitle}</p>}
      <hr className="mt-4" />
    </div>
  );
}