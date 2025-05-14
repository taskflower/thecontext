// src/components/LuIcon.tsx
import React, { lazy, Suspense, useMemo } from "react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { LucideProps } from "lucide-react";

type IconName = keyof typeof dynamicIconImports;
export interface IconProps extends Omit<LucideProps, "ref"> {
  name: IconName;
}

// Modulowy cache dla komponentów lazy, współdzielony między instancjami
const iconCache = new Map<
  IconName,
  React.LazyExoticComponent<React.ComponentType<LucideProps>>
>();

/**
 * LuIcon
 * Dynamicznie ładuje ikony z lucide-react przy pomocy React.lazy i suspense.
 * Korzysta z modułowego cache, aby uniknąć wielokrotnych importów.
 */
export const LuIcon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = "currentColor",
  ...rest
}) => {
  const LazyIcon = useMemo(() => {
    const importer = dynamicIconImports[name];
    if (!importer) {
      return null;
    }
    if (!iconCache.has(name)) {
      iconCache.set(
        name,
        lazy(() => importer())
      );
    }
    return iconCache.get(name)!;
  }, [name]);

  if (!LazyIcon) {
    return <div style={{ width: size, height: size }} />;
  }

  return (
    <Suspense fallback={<div style={{ width: size, height: size }} />}>
      <LazyIcon size={size} color={color} {...rest} />
    </Suspense>
  );
};

export default LuIcon;
