// src/components/documents/ContainerActions.tsx
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans } from "@lingui/macro";
import ContainerDropdown from "./ContainerDropdown";

interface ContainerActionsProps {
  containerId: string;
  onDelete: (containerId: string) => void;
}

const ContainerActions = ({ containerId, onDelete }: ContainerActionsProps) => {
  const adminNavigate = useAdminNavigate();

  return (
    <div className="flex gap-2 justify-between">
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
      <ContainerDropdown containerId={containerId} onDelete={onDelete} />
    </div>
  );
};

export default ContainerActions;
