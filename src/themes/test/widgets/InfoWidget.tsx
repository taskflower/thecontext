// src/themes/test/widgets/InfoWidget.tsx
export default function InfoWidget(props: any) {
  const title = props.title || "Info";
  const content = props.content || "Content";
  const variant = props.variant || 'default';
  
  console.log('InfoWidget props:', props); // Debug log

  const colors = {
    default: 'bg-white border-gray-200',
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200'
  };
  
  return (
    <div className={`p-6 rounded-lg border ${colors[variant] || colors.default} shadow-sm`}>
      <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-700 leading-relaxed">{content}</p>
    </div>
  );
}