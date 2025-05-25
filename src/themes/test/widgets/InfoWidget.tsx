// Updated InfoWidget.tsx
export default function InfoWidget({ title = "Info", content = "Content", variant = 'default' }: any) {
  const colors = {
    default: 'bg-white border-gray-200',
    info: 'bg-blue-50 border-blue-200'
  };
  
  return (
    <div className={`p-6 rounded border ${colors[variant] || colors.default}`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p>{content}</p>
    </div>
  );
}