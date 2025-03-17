import React from "react";
import { useAppStore } from "../store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ConversationPanel: React.FC = () => {
  const conversation = useAppStore((state) => state.conversation);

  return (
    <ScrollArea className="h-full">
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
                <TableCell className=
                {`font-medium capitalize align-top ${
                  item.role === "assistant" ? "bg-sidebar" : ""
                }`}>
                  {item.role}
                </TableCell>
                <TableCell 
                  className={`whitespace-pre-line align-top ${
                    item.role === "assistant" ? "bg-sidebar" : ""
                  }`}
                >
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
  );
};