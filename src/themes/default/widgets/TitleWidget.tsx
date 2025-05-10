// src/themes/default/widgets/TitleWidget.tsx
type TitleProps = {
  title: string;
  subtitle?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
};

export default function TitleWidget({ title, subtitle }: TitleProps) {
  return (
    <div className="p-4 border-b border-gray-100">
      <h3 className={`m-0 text-lg font-semibold text-gray-900`}>{title}</h3>
      {subtitle && (
        <p className="mt-2 mb-0 text-gray-500 text-sm">{subtitle}</p>
      )}
    </div>
  );
}
