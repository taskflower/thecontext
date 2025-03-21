import React from "react";
import { useAppStore } from "../store";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ConversationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const conversation = useAppStore((state) => state.conversation);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Conversation History</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 my-6">
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
                    <TableCell className="font-medium capitalize align-top">
                      {item.role}
                    </TableCell>
                    <TableCell 
                      className={`whitespace-pre-line align-top ${
                        item.role === "user" ? "bg-slate-100" : ""
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
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};