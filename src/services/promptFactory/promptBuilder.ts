/* eslint-disable @typescript-eslint/no-explicit-any */
// promptBuilder.ts
import { IPromptConfig } from './types';

export function preparePrompt(
  config: IPromptConfig,
  variables: Record<string, any>
): string {
  let prompt = config.userPromptTemplate;
  
  // Zastępowanie zmiennych w formacie {{zmienna}}
  if (variables) {
    for (const [key, value] of Object.entries(variables)) {
      // Jeśli wartość nie jest ciągiem znaków, przekształcamy ją na JSON
      const replacementValue =
        typeof value === "string"
          ? value
          : typeof value === "object"
          ? JSON.stringify(value, null, 2)
          : String(value);
      prompt = prompt.replace(new RegExp(`{{${key}}}`, "g"), replacementValue);
    }
  }
  return prompt;
}

export function buildPromptMessages(
  config: IPromptConfig,
  variables: Record<string, any>
): Array<{ role: string; content: string }> {
  return [
    { role: "system", content: config.systemPrompt },
    { role: "user", content: preparePrompt(config, variables) },
  ];
}