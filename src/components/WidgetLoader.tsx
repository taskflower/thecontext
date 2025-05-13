// src/components/WidgetLoader.tsx
import React from 'react';
import { useWidget } from '@/core';
import { withSuspense } from './withSuspense';

interface WidgetLoaderProps {
  tplDir: string;
  widget: any;
}

const RawWidgetLoader: React.FC<WidgetLoaderProps> = ({ tplDir, widget }) => {
  const Widget = useWidget(tplDir, widget.tplFile);
  return <Widget {...widget} componentName={widget.tplFile} />;
};

export default withSuspense(
  React.lazy(() => Promise.resolve({ default: RawWidgetLoader })),
  'Ładowanie widgetu…'
);
