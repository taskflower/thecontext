// src/themes/default/widgets/ButtonWidget.tsx
import { useAppNavigation } from "@/core/hooks/useAppNavigation";
import { useParams } from "react-router-dom";

type ButtonWidgetProps = { 
  title: string; 
  attrs: { 
    navPath?: string; 
    variant?: string 
  } 
};

export default function ButtonWidget({ title, attrs }: ButtonWidgetProps) {
  const { go } = useAppNavigation([]);
  const params = useParams();
  
  const handle = () => {
    if (!attrs.navPath) return;
    
    const config = params.config || "exampleTicketApp";
    
    // Sprawdź czy navPath zaczyna się od nazwy workspace'a
    const navPath = attrs.navPath;
    const pathParts = navPath.split('/');
    const possibleWorkspace = pathParts[0];
    
    // Lista znanych workspace'ów
    const knownWorkspaces = ['main', 'tickets', 'users'];
    
    let fullPath;
    if (knownWorkspaces.includes(possibleWorkspace)) {
      // NavPath zawiera workspace - użyj go bezpośrednio
      fullPath = `/${config}/${navPath}`;
    } else {
      // NavPath nie zawiera workspace - użyj aktualnego
      const workspace = params.workspace || "tickets";
      fullPath = `/${config}/${workspace}/${navPath}`;
    }
    
    console.log(`[ButtonWidget] Navigating from navPath: ${navPath} to: ${fullPath}`);
    go(fullPath);
  };

  return (
    <button
      onClick={handle}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        attrs.variant === "primary"
          ? "bg-zinc-900 text-white hover:bg-zinc-800"
          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
      }`}
    >
      {title}
    </button>
  );
}