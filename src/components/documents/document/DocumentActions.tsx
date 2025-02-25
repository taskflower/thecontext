import { Trans } from "@lingui/macro";
import { Eye, MoreHorizontal, MoveUp, MoveDown, Pencil, Trash } from "lucide-react";
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
 AlertDialogTrigger,
 Button,
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui";

interface Document {
 id: string;
}

interface DocumentActionsProps {
 document: Document;
 index: number;
 totalDocuments: number;
 onPreview: (document: Document) => void;
 onEdit: (documentId: string) => void;
 onMove: (documentId: string, direction: "up" | "down") => void;
 onDelete: (documentId: string) => void;
 showContainer?: boolean;
}

export const DocumentActions = ({
 document,
 index,
 totalDocuments,
 onPreview,
 onEdit,
 onMove,
 onDelete,
 showContainer,
}: DocumentActionsProps) => {
 return (
   <div className="flex gap-2 justify-end">
     <Button
       size="sm"
       variant="outline"
       className="gap-2"
       onClick={() => onPreview(document)}
     >
       <Eye className="h-4 w-4" />
       <Trans>Preview</Trans>
     </Button>
     <DropdownMenu>
       <DropdownMenuTrigger asChild>
         <Button variant="ghost" size="icon">
           <MoreHorizontal className="h-4 w-4" />
           <span className="sr-only">Open menu</span>
         </Button>
       </DropdownMenuTrigger>
       <DropdownMenuContent align="end">
         <DropdownMenuItem onClick={() => onEdit(document.id)}>
           <Pencil className="mr-2 h-4 w-4" />
           <Trans>Edit</Trans>
         </DropdownMenuItem>
         <DropdownMenuSeparator />
         {!showContainer && (
           <>
             <DropdownMenuItem
               onClick={() => onMove(document.id, "up")}
               disabled={index === 0}
             >
               <MoveUp className="mr-2 h-4 w-4" />
               <Trans>Move Up</Trans>
             </DropdownMenuItem>
             <DropdownMenuItem
               onClick={() => onMove(document.id, "down")}
               disabled={index === totalDocuments - 1}
             >
               <MoveDown className="mr-2 h-4 w-4" />
               <Trans>Move Down</Trans>
             </DropdownMenuItem>
           </>
         )}
         <DropdownMenuSeparator />
         <AlertDialog>
           <AlertDialogTrigger asChild>
             <DropdownMenuItem
               onSelect={(e) => e.preventDefault()}
               className="text-destructive"
             >
               <Trash className="mr-2 h-4 w-4" />
               <Trans>Delete</Trans>
             </DropdownMenuItem>
           </AlertDialogTrigger>
           <AlertDialogContent>
             <AlertDialogHeader>
               <AlertDialogTitle>
                 <Trans>Are you sure?</Trans>
               </AlertDialogTitle>
               <AlertDialogDescription>
                 <Trans>
                   This action cannot be undone and will permanently delete the
                   document.
                 </Trans>
               </AlertDialogDescription>
             </AlertDialogHeader>
             <AlertDialogFooter>
               <AlertDialogCancel>
                 <Trans>Cancel</Trans>
               </AlertDialogCancel>
               <AlertDialogAction onClick={() => onDelete(document.id)}>
                 <Trans>Delete</Trans>
               </AlertDialogAction>
             </AlertDialogFooter>
           </AlertDialogContent>
         </AlertDialog>
       </DropdownMenuContent>
     </DropdownMenu>
   </div>
 );
};