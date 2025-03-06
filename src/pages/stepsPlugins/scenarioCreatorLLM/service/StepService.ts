/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreatorLLM/service/StepService.ts
import { Step, StepType, Task } from "@/types";
import { useStepStore } from "@/store";
import { UtilityService } from "./UtilityService";

export class StepService {
  /**
   * Tworzy kroki na podstawie danych LLM
   */
  public static async createSteps(
    stepsData: any[],
    taskMapping: Record<string, string>
  ): Promise<Step[]> {
    const steps: Step[] = [];
    const stepStore = useStepStore.getState();

    if (!stepsData || stepsData.length === 0) {
      console.log("[StepService] Brak kroków w danych LLM");
      return steps;
    }

    for (const stepData of stepsData) {
      try {
        // Pobieranie ID zadania, do którego należy krok
        const taskId = taskMapping[stepData.taskRef];

        if (!taskId) {
          console.error(
            `[StepService] Nie znaleziono zadania dla kroku: ${stepData.title}`
          );
          continue;
        }

        // Konfiguracja kroku na podstawie typu
        const stepConfig = this.createStepConfig(stepData);

        // Tworzenie kroku
        const stepId = stepStore.addStep(taskId, {
          title: stepData.title,
          description: stepData.description || "",
          type: stepData.type || "text-input",
          config: stepConfig,
          options: {},
          status: "pending",
          result: null,
        });

        // Dodawanie do wyników
        const createdStep = stepStore.getStepById(stepId);
        if (createdStep) {
          steps.push(createdStep);
        }

        await UtilityService.delay(50);
      } catch (error) {
        console.error(`[StepService] Błąd tworzenia kroku: ${error}`);
      }
    }

    return steps;
  }

  /**
   * Tworzy domyślne kroki dla zadań
   */
  public static async createDefaultSteps(tasks: Task[]): Promise<Step[]> {
    const steps: Step[] = [];
    const stepStore = useStepStore.getState();
    const stepTitles = ["Planowanie", "Wykonanie"];
    const stepTypes: StepType[] = ["form", "custom"];

    for (const task of tasks) {
      try {
        for (let i = 0; i < stepTitles.length; i++) {
          // Tworzenie konfiguracji kroku
          let stepConfig: any = {
            title: `${stepTitles[i]} ${task.title}`,
            description: `Domyślny krok dla ${task.title}`,
          };

          // Konfiguracja specyficzna dla typu
          if (stepTypes[i] === "custom") {
            stepConfig = {
              ...stepConfig,
              placeholder: "Wprowadź informacje tutaj...",
              required: true,
              multiline: true,
              rows: 6,
            };
          }

          // Tworzenie kroku
          const stepId = stepStore.addStep(task.id, {
            title: `${stepTitles[i]} ${task.title}`,
            description: `Domyślny krok dla ${task.title}`,
            type: stepTypes[i],
            config: stepConfig,
            options: {},
            status: "pending",
            result: null,
          });

          // Dodawanie do wyników
          const createdStep = stepStore.getStepById(stepId);
          if (createdStep) {
            steps.push(createdStep);
          }

          await UtilityService.delay(50);
        }
      } catch (error) {
        console.error(
          `[StepService] Błąd tworzenia domyślnych kroków: ${error}`
        );
      }
    }

    return steps;
  }

  /**
   * Tworzy konfigurację kroku na podstawie typu
   */
  private static createStepConfig(stepData: any): any {
    // Podstawowa konfiguracja
    let stepConfig: any = {
      title: stepData.title,
      description: stepData.description || "",
    };

    // Konfiguracja specyficzna dla typu
    if (stepData.type === "text-input") {
      stepConfig = {
        ...stepConfig,
        placeholder: "Wprowadź informacje tutaj...",
        required: true,
        multiline: true,
        rows: 6,
      };
    } else if (stepData.type === "simple-plugin") {
      // Nic specjalnego nie jest potrzebne dla simple plugin
    } else if (stepData.type === "step-reference") {
      stepConfig.referenceStepId = "";
    }

    return stepConfig;
  }
}
