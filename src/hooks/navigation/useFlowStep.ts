// src/hooks/useFlowStep.ts
import { useNavigate, useParams } from "react-router-dom";
import { NodeData } from "@/types";

interface UseFlowStepProps {
  node: NodeData;
  isFirstNode: boolean;
  isLastNode: boolean;
  onSubmit: (data: any) => void;
  onPrevious: () => void;
}

export function useFlowStep({
  isFirstNode,
  isLastNode,
  onSubmit,
  onPrevious,
}: UseFlowStepProps) {
  const navigate = useNavigate();
  const { workspace } = useParams();

  const handlePrevious = () => {
    if (isFirstNode) {
      if (workspace) navigate(`/${workspace}`);
      else navigate("/");
    } else {
      onPrevious();
    }
  };

  const handleComplete = (data: any) => {
    onSubmit(data);
    if (isLastNode && workspace) navigate(`/${workspace}`);
  };

  return { handlePrevious, handleComplete };
}
