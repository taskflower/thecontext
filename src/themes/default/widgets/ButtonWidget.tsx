// src/themes/default/widgets/ButtonWidget.tsx
import { useAppNavigation } from "@/core/hooks/useAppNavigation";


type ButtonWidgetProps = { title: string; attrs: { navPath?: string; variant?: string } };
export default function ButtonWidget({ title, attrs }: ButtonWidgetProps) {
  const { go } = useAppNavigation([]);
  const handle = () => attrs.navPath && go(`/:config/:workspace/${attrs.navPath}`);
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