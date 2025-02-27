/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/tasks/actions/responseActions.ts

import { useProjectStore } from "@/store/projectStore";
import { ResponseExecutor } from "@/services/execution/responseExecutor";
import { getValueByPath, parseResponseData } from "../response/parsers";

export interface ResponseActionFunctions {
  executeResponseAction: (taskId: string, stepId: string) => Promise<boolean>;
  mapResponseToNextSteps: (taskId: string, stepId: string) => Promise<boolean>;
}

export const responseActions = (
  _set: any,
  get: any
): ResponseActionFunctions => ({
  executeResponseAction: async (taskId: string, stepId: string) => {
    const task = get().tasks.find((t: any) => t.id === taskId);
    if (!task) return false;

    const step = task.steps.find((s: any) => s.id === stepId);
    if (!step || !step.output || !step.responseActions) return false;

    const currentProject = useProjectStore.getState().currentProject;
    if (!currentProject) return false;

    const responseData = parseResponseData(step.output);

    return ResponseExecutor.executeResponse(
      taskId,
      stepId,
      responseData,
      step.responseActions,
      currentProject.id
    );
  },

  mapResponseToNextSteps: async (taskId: string, stepId: string) => {
    const task = get().tasks.find((t: any) => t.id === taskId);
    if (!task) return false;

    const step = task.steps.find((s: any) => s.id === stepId);
    if (!step || !step.output || !step.responseActions?.fieldMappings)
      return false;

    try {
      const responseData = parseResponseData(step.output);
      const { fieldMappings } = step.responseActions;

      // Znajdź kolejne kroki
      const nextSteps = task.steps.filter((s: any) => s.order > step.order);
      if (nextSteps.length === 0) return false;

      // Mapowanie danych do kroków
      for (const [targetPath, sourcePath] of Object.entries(fieldMappings)) {
        const [targetStepId, fieldName] = targetPath.split(".");

        // Znajdź krok docelowy
        const targetStep = nextSteps.find((s: any) => s.id === targetStepId);
        if (!targetStep) continue;

        // Pobierz wartość ze ścieżki źródłowej
        const value = getValueByPath(responseData, sourcePath as string);
        if (value === undefined) continue;

        // Aktualizuj dane wejściowe kroku docelowego
        const input = targetStep.input ? JSON.parse(targetStep.input) : {};
        input[fieldName] = value;

        get().updateStep(taskId, targetStepId, {
          input: JSON.stringify(input),
        });
      }

      return true;
    } catch (error) {
      console.error("Błąd mapowania odpowiedzi:", error);
      return false;
    }
  },
});
