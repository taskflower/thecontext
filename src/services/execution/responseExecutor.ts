/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/execution/responseExecutor.ts

import { actionTypeRegistry } from "@/utils/tasks/registry/actionTypeRegistry";
import { getValueByPath } from "@/utils/tasks/response/parsers";
import {
  IResponseAction,
  IExecutionPlan,
  ActionType,
  IEntityMapping,
} from "@/utils/tasks/response/responseTypes";

export class ResponseExecutor {
  static async executeResponse(
    taskId: string,
    stepId: string,
    responseData: any,
    responseAction: IResponseAction,
    projectId: string
  ): Promise<boolean> {
    try {
      // Mapowanie odpowiedzi na plan wykonania
      const executionPlan = this.mapResponseToExecutionPlan(
        responseData,
        responseAction,
        projectId
      );

      // Wykonanie planu
      await this.executePlan(executionPlan);
      return true;
    } catch (error) {
      console.error("Błąd przetwarzania odpowiedzi:", error);
      return false;
    }
  }

  static mapResponseToExecutionPlan(
    responseData: any,
    responseAction: IResponseAction,
    projectId: string
  ): IExecutionPlan {
    const plan: IExecutionPlan = {
      projectId,
      actions: [],
    };

    if (
      responseAction.type === "create_entities" &&
      responseAction.entityMappings
    ) {
      for (const mapping of responseAction.entityMappings) {
        const entities = this.getEntitiesFromMapping(responseData, mapping);

        for (const entityData of entities) {
          plan.actions.push({
            type: `create_${mapping.entityType}` as ActionType,
            data: entityData,
          });
        }
      }
    } else if (
      responseAction.type === "custom" &&
      responseAction.customHandler
    ) {
      // Custom handler - przekazujemy do odpowiedniego modułu rozszerzenia
      const customHandler = responseAction.customHandler;
      if (actionTypeRegistry.hasHandler(customHandler as ActionType)) {
        plan.actions.push({
          type: customHandler as ActionType,
          data: {
            responseData,
            config: responseAction.customConfig,
          },
        });
      }
    }

    return plan;
  }

  static getEntitiesFromMapping(
    responseData: any,
    mapping: IEntityMapping
  ): Array<Record<string, any>> {
    const sourceData = getValueByPath(responseData, mapping.sourcePath);

    if (!sourceData) return [];

    // Jeśli sourceData to tablica, mapujemy każdy element
    if (Array.isArray(sourceData)) {
      return sourceData.map((item) =>
        this.mapEntityFields(item, mapping.fieldMapping)
      );
    }

    // Jeśli to pojedynczy obiekt
    return [this.mapEntityFields(sourceData, mapping.fieldMapping)];
  }

  static mapEntityFields(
    source: Record<string, any>,
    fieldMapping: Record<string, string>
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [targetField, sourcePath] of Object.entries(fieldMapping)) {
      const value = getValueByPath(source, sourcePath);
      if (value !== undefined) {
        result[targetField] = value;
      }
    }

    return result;
  }

  static async executePlan(plan: IExecutionPlan): Promise<void> {
    for (const action of plan.actions) {
      const handler = actionTypeRegistry.getHandler(action.type);
      if (handler) {
        await handler.executeFunction(plan.projectId, action.data);
      } else {
        console.warn(`Brak handlera dla akcji typu: ${action.type}`);
      }
    }
  }
}
