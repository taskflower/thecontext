// src/components/documents/ContainerActions.tsx

import { FileText } from "lucide-react";

import { Trans } from "@lingui/macro";
import { useAdminNavigate } from "@/hooks";
import { Button } from "@/components/ui";
import ContainerDropdown from "./ContainerDropdown";


interface ContainerActionsProps {
  containerId: string;
  onDelete: (containerId: string) => void;
}

const ContainerActions = ({ containerId, onDelete }: ContainerActionsProps) => {
  const adminNavigate = useAdminNavigate();

  return (
    <div className="flex gap-2 justify-between">
      
      <ContainerDropdown containerId={containerId} onDelete={onDelete} />
      <div className="flex gap-2">
        <Button
          size="sm"
          className="gap-2"
          onClick={() => adminNavigate(`/documents/${containerId}`)}
        >
          <FileText className="h-4 w-4" />
          <Trans>View Documents</Trans>
        </Button>
      </div>
    </div>
  );
};

export default ContainerActions;
