// components/container/ContainerComponent.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DocumentForm } from '../form/DocumentForm';
import { IContainer } from '@/utils/containers/types';
import { DocumentItem } from './DocumentItem';

interface ContainerComponentProps {
  container: IContainer;
}

export const ContainerComponent: React.FC<ContainerComponentProps> = ({ container }) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{container.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <DocumentForm container={container} />

        <div className="mt-4">
          <h3 className="font-medium mb-2">Documents:</h3>
          {container.documents.map((doc) => (
            <DocumentItem key={doc.id} document={doc} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
