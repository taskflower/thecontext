// src/components/withSuspense.tsx
import { Suspense } from "react";
import { Loading } from ".";

export function withSuspense<P extends {}>(
  Comp: React.ComponentType<P>,
  message = "…"
): React.FC<P> {
  const Suspended: React.FC<P> = (props) => (
    <Suspense fallback={<Loading message={message} />}>
      <Comp {...props} />
    </Suspense>
  );
  return Suspended;
}
