import React, { useState } from "react";
import { useAppStore } from "../store";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { ContextEditor } from "./ContextEditor";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export const ContextsList: React.FC = () => {
  const selected = useAppStore(state => state.selected);
  const getContextItems = useAppStore(state => state.getContextItems);
  
  // Force component to update when state changes
  useAppStore(state => state.stateVersion);
  
  const [showEditor, setShowEditor] = useState(false);
  
  const selectedWorkspace = selected.workspace;
  
  // Get context items safely
  const contextItems = selectedWorkspace 
    ? getContextItems(selectedWorkspace)(useAppStore.getState()) 
    : [];
  
  // Format display values
  const formatValue = (value: string, valueType: 'text' | 'json') => {
    if (valueType === 'json') {
      try {
        const parsed = JSON.parse(value);
        const formatted = JSON.stringify(parsed, null, 2);
        return formatted.length > 50 
          ? formatted.substring(0, 50) + '...' 
          : formatted;
      } catch  {
        return value;
      }
    }
    return value.length > 50 ? value.substring(0, 50) + '...' : value;
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Workspace Context</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{contextItems.length} items</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowEditor(true)}
            className="gap-1.5 text-xs"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {contextItems.length > 0 ? (
          <Table>
            <TableBody>
              {contextItems.map(item => (
                <TableRow key={item.key}>
                  <TableCell className="font-medium">
                    {item.key}
                    <Badge
                      variant={item.valueType === "json" ? "outline" : "secondary"}
                      className="ml-2 text-xs"
                    >
                      {item.valueType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {formatValue(item.value, item.valueType)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No context items defined. Click Edit to add.
          </div>
        )}
      </ScrollArea>
      
      {showEditor && (
        <ContextEditor
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};