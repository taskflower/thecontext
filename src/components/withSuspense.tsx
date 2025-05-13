// src/components/withSuspense.tsx
import React, { Suspense } from "react";
import Loading from "./Loading";

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