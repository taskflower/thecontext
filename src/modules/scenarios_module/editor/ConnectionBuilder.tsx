// src/modules/scenarios_module/ConnectionBuilder.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import EdgeConnector from './EdgeConnector';
import SequenceConnections from '../../sequence_module/SequenceConnections';

const ConnectionBuilder: React.FC = () => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightCircle className="h-5 w-5" />
          Connect Nodes
        </CardTitle>
        <CardDescription>Create connections between nodes</CardDescription>
      </CardHeader>
      <CardContent>
        <EdgeConnector />
      </CardContent>
      <CardFooter className="flex flex-col">
        <Separator className="my-4" />
        <SequenceConnections />
      </CardFooter>
    </Card>
  );
};

export default ConnectionBuilder;