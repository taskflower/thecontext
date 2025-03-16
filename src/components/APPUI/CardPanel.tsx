// src/components/APPUI/CardPanel.tsx
import React from "react";

import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

interface CardPanelProps {
  title: string;
  children: React.ReactNode;
  onAddClick: () => void;
}

export const CardPanel: React.FC<CardPanelProps> = ({ title, children, onAddClick }) => (
  <Card className="border-none shadow-none">
    <CardHeader className="px-3 py-2 flex flex-row items-center justify-between space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Button variant="ghost" size="icon" onClick={onAddClick} className="h-7 w-7">
        <Plus className="h-4 w-4" />
      </Button>
    </CardHeader>
    <CardContent className="px-3 pb-3 pt-0">
      {children}
    </CardContent>
  </Card>
);