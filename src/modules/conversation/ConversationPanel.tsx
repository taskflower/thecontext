// src/modules/conversation/ConversationPanel.tsx
import React from "react";
import { useAppStore } from "../store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ConversationPanel: React.FC = () => {
  const conversation = useAppStore((state) => state.conversation);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h3 className="text-sm font-medium">Conversation History</h3>
        <span className="text-xs text-muted-foreground">{conversation.length} messages</span>
      </div>
      
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Role</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversation.length > 0 ? (
              conversation.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium capitalize">
                    {item.role}
                  </TableCell>
                  <TableCell className="whitespace-pre-line">
                    {item.message}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                  No conversation yet. Play the flow to generate messages.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};