// src/components/APPUI/CardPanel.tsx
import React from "react";

import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

interface CardPanelProps {
  title: string;
  children: React.ReactNode;
  onAddClick: () => void;
  className?: string;
  noPadding?: boolean;
}

export const CardPanel: React.FC<CardPanelProps> = ({ 
  title, 
  children, 
  onAddClick, 
  className = "",
  noPadding = false
}) => (
  <Card className={`border shadow-sm ${className}`}>
    <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 border-b">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Button variant="ghost" size="icon" onClick={onAddClick} className="h-7 w-7 rounded-full hover:bg-muted">
        <Plus className="h-4 w-4" />
      </Button>
    </CardHeader>
    <CardContent className={noPadding ? "p-0" : "px-4 py-3"}>
      {children}
    </CardContent>
  </Card>
);