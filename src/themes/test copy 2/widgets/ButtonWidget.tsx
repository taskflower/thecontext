// src/themes/test/widgets/ButtonWidget.tsx
import { useNavigate, useParams } from 'react-router-dom';

export default function ButtonWidget({
  label = "Click",
  variant = 'primary',
  attrs = {}
}: any) {
  const navigate = useNavigate();
  const { config } = useParams<{config:string}>();
  const cfg = config || 'testApp';

  const colors = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-600 hover:bg-gray-700'
  };

  return (
    <button
      onClick={() => attrs.navPath && navigate(`/${cfg}/${attrs.navPath}`)}
      className={`${colors[variant] || colors.primary} text-white px-4 py-2 rounded`}
    >
      {label}
    </button>
  );
}
