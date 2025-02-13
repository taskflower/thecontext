import { FileText, MessageSquare, Repeat, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";

export const TaskTemplateEmptyState = ({ onCreateClick }: { onCreateClick: () => void }) => (
  <TableRow>
    <TableCell colSpan={4} className="h-[400px] text-center">
      <div className="flex flex-col items-center justify-center px-4">
        <h2 className="text-lg font-semibold mb-2">Create Your First Template</h2>
        <p className="text-sm text-gray-600 mb-6 max-w-md">
          Start by creating a template for your AI-powered document generation workflow
        </p>    
        <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="p-2 bg-gray-100 rounded-full mb-3">
              <FileText className="h-5 w-5 text-gray-900" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Create Template</h3>
            <p className="text-xs text-gray-600">Define once, use many times</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="p-2 bg-gray-100 rounded-full mb-3">
              <MessageSquare className="h-5 w-5 text-gray-900" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Guide Dialog</h3>
            <p className="text-xs text-gray-600">AI-powered conversation</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="p-2 bg-gray-100 rounded-full mb-3">
              <Repeat className="h-5 w-5 text-gray-900" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Reuse</h3>
            <p className="text-xs text-gray-600">Generate documents easily</p>
          </div>
        </div>
        <Button className="gap-2" onClick={onCreateClick}>
          Create Template
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
);
