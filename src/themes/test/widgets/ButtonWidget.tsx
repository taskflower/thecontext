import { useNavigate, useParams } from "react-router-dom";

interface ButtonWidgetProps {
  title: string;  // Tytuł widgetu (przekazany bezpośrednio)
  attrs: {
    navPath?: string;  // Ścieżka nawigacji (w `attrs`)
    variant?: string;  // Typ przycisku (w `attrs`)
  };
}

export default function ButtonWidget({
  title,
  attrs,
}: ButtonWidgetProps) {
  const navigate = useNavigate();
  const { config } = useParams<{ config: string }>();
  const cfg = config || "testApp"; // Domyślnie 'testApp' jeśli brak 'config'

  // Budowanie pełnej ścieżki na podstawie 'cfg' i 'navPath'
  const fullPath = attrs?.navPath ? `/${cfg}${attrs.navPath}` : null;

  // Logowanie wartości dla debugowania
  console.log('Button navPath:', attrs?.navPath);
  console.log('Full path:', fullPath);
  console.log('Config:', cfg);

  const colors: Record<string, string> = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    default: "bg-gray-100 hover:bg-gray-200 text-gray-900",
  };

  const handleClick = () => {
    if (fullPath) {
      navigate(fullPath);
    } else {
      console.warn("No navPath defined for button:", title);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${colors[attrs?.variant || "default"]} px-4 py-2 rounded font-medium transition-colors duration-200 ${
        !attrs?.navPath ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={!attrs?.navPath}  // Disabled jeśli brak 'navPath'
    >
      {title}
    </button>
  );
}
  