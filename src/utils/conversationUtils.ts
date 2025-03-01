/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/conversationUtils.ts
import { ConversationItem, Step } from "@/types";

/**
 * Extracts values from conversation data in key-value pairs
 * @param conversationData Array of conversation items
 * @returns Object containing key-value pairs extracted from conversation
 */
export function extractValuesFromConversation(conversationData: ConversationItem[]): Record<string, string> {
  const valueMap: Record<string, string> = {};
  
  // Process pairs (assistant key, user value)
  for (let i = 0; i < conversationData.length; i += 2) {
    if (i + 1 < conversationData.length) {
      const key = conversationData[i].content;
      const value = conversationData[i + 1].content;
      valueMap[key] = value;
    }
  }
  
  return valueMap;
}

/**
 * Creates conversation data from key-value pairs
 * @param dataMap Object containing key-value pairs
 * @returns Array of conversation items
 */
export function createConversationFromValues(dataMap: Record<string, any>): ConversationItem[] {
  const conversationData: ConversationItem[] = [];
  
  Object.entries(dataMap).forEach(([key, value]) => {
    conversationData.push(
      { role: "assistant", content: key },
      { role: "user", content: String(value) }
    );
  });
  
  return conversationData;
}

/**
 * Gets the conversation data from a step, prioritizing the most reliable source
 * @param step Step object 
 * @returns ConversationItem array if found, null otherwise
 */
export function getStepConversationData(step: Step): ConversationItem[] | null {
  // Priority 1: Step's conversationData field
  if (step.conversationData && step.conversationData.length > 0) {
    return step.conversationData;
  }
  
  // Priority 2: Result's conversationData field
  if (step.result?.conversationData) {
    return step.result.conversationData as ConversationItem[];
  }
  
  return null;
}

/**
 * Gets the value for a specific key from a step's conversation data
 * @param step Step object
 * @param key The key to look for
 * @param defaultValue Optional default value if key is not found
 * @returns The value if found, or the defaultValue
 */
export function getValueFromStepConversation(
  step: Step, 
  key: string, 
  defaultValue: string = ''
): string {
  const conversationData = getStepConversationData(step);
  
  if (!conversationData) {
    return defaultValue;
  }
  
  const valueMap = extractValuesFromConversation(conversationData);
  return valueMap[key] || defaultValue;
}