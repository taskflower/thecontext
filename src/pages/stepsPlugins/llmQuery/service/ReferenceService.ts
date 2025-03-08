/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/common/services/ReferenceService.ts

import { getStepData } from '@/components/plugins/PreviousStepsSelect';
import { ConversationItem } from '@/types';

export interface ReferenceData {
  id: string;
  title: string;
  status: string;
  type: string;
  result: any;
}

/**
 * Service for handling references between steps
 */
class ReferenceService {
  /**
   * Fetch reference data from a previous step
   */
  public static getReferenceData(referenceStepId: string): ReferenceData | null {
    if (!referenceStepId) return null;
    
    const stepDataResult = getStepData(referenceStepId, false);

    if (stepDataResult.step) {
      return {
        id: stepDataResult.step.id,
        title: stepDataResult.title,
        status: stepDataResult.step.status,
        type: stepDataResult.step.type,
        result: stepDataResult.data,
      };
    }
    
    return null;
  }

  /**
   * Extract conversation data from reference step if available
   */
  public static getConversationDataFromReference(referenceData: ReferenceData | null): ConversationItem[] | null {
    if (!referenceData || referenceData.status !== "completed" || !referenceData.result) {
      return null;
    }

    if (referenceData.result.conversationData) {
      return referenceData.result.conversationData;
    } else if (referenceData.result.messages) {
      return referenceData.result.messages;
    }

    return null;
  }

  /**
   * Check if a reference is valid and completed
   */
  public static isReferenceComplete(referenceData: ReferenceData | null): boolean {
    return Boolean(referenceData && referenceData.status === "completed");
  }
}

export default ReferenceService;