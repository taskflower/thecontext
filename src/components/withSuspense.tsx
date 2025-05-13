// src/components/withSuspense.tsx
import { Suspense } from 'react';
import Loading from './Loading';

export function withSuspense<P extends {}>(
  Component: React.ComponentType<P>,
  message = '…'
): React.FC<P> {
  const Suspended: React.FC<P> = (props) => (
    <Suspense fallback={<Loading message={message} />}>
      <Component {...props} />
    </Suspense>
  );
  return Suspended;
}
