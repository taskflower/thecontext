// src/components/debug/StepSchemaHelper.ts
import { useAppStore } from "@/lib/store";

/**
 * Pobiera schemat dla kroku
 * @param step Obiekt kroku z atrybutami 
 * @returns Informacje o schemacie lub null
 */
export function getStepSchema(step: any) {
  if (!step) return null;

  // Get context access function from store
  const { getContextPath } = useAppStore.getState();

  // Check for new schema path format first (for LLM)
  if (step.templateId === "llm-query" && step.attrs?.schemaPath) {
    const schemaPath = step.attrs.schemaPath;
    let resolvedPath = schemaPath;

    // Ensure path has schemas.llm. prefix
    if (!resolvedPath.startsWith("schemas.llm.")) {
      resolvedPath = resolvedPath.startsWith("schemas.")
        ? resolvedPath
        : `schemas.llm.${resolvedPath}`;
    }

    // Try to get schema
    const schema = getContextPath(resolvedPath);

    if (schema) {
      console.log(
        `[DebugPanel] Found LLM schema using new path: ${resolvedPath}`,
        schema
      );
      return {
        type: "llm",
        path: resolvedPath,
        schema: schema,
      };
    } else {
      console.warn(
        `[DebugPanel] LLM schema not found at new path: ${resolvedPath}`
      );
    }
  }

  // Check for new schema path format (for Forms)
  if (
    (step.templateId === "form-step" || step.type === "form") &&
    step.attrs?.schemaPath
  ) {
    const schemaPath = step.attrs.schemaPath;
    let resolvedPath = schemaPath;

    // Ensure path has schemas.form. prefix
    if (!resolvedPath.startsWith("schemas.form.")) {
      resolvedPath = resolvedPath.startsWith("schemas.")
        ? resolvedPath
        : `schemas.form.${resolvedPath}`;
    }

    // Try to get schema
    const schema = getContextPath(resolvedPath);

    if (schema) {
      console.log(
        `[DebugPanel] Found form schema using new path: ${resolvedPath}`,
        schema
      );
      return {
        type: "form",
        path: resolvedPath,
        schema: schema,
      };
    } else {
      console.warn(
        `[DebugPanel] Form schema not found at new path: ${resolvedPath}`
      );
    }
  }

  // Fall back to legacy paths for LLM
  if (step.templateId === "llm-query" && step.attrs?.llmSchemaPath) {
    const schemaPath = step.attrs.llmSchemaPath;

    // Try directly with the provided path first (might be already using schemas.llm format)
    const directSchema = getContextPath(schemaPath);
    if (directSchema) {
      console.log(`[DebugPanel] Found LLM schema directly at: ${schemaPath}`);
      return {
        type: "llm",
        path: schemaPath,
        schema: directSchema,
      };
    }

    // Try with llmSchemas prefix if not found directly
    if (!schemaPath.startsWith("llmSchemas.")) {
      const legacyPath = `llmSchemas.${schemaPath}`;
      const schema = getContextPath(legacyPath);

      if (schema) {
        console.log(
          `[DebugPanel] Found LLM schema using legacy path: ${legacyPath}`,
          schema
        );
        return {
          type: "llm",
          path: legacyPath,
          schema: schema,
        };
      }
    }

    console.warn(
      `[DebugPanel] LLM schema not found for legacy path: ${schemaPath}`
    );
    return {
      type: "llm",
      path: schemaPath,
      schema: null,
    };
  }

  // Fall back to legacy paths for Forms
  if (
    (step.templateId === "form-step" || step.type === "form") &&
    step.attrs?.formSchemaPath
  ) {
    const schemaPath = step.attrs.formSchemaPath;

    // Try directly with the provided path first (might be already using schemas.form format)
    const directSchema = getContextPath(schemaPath);
    if (directSchema) {
      console.log(
        `[DebugPanel] Found form schema directly at: ${schemaPath}`
      );
      return {
        type: "form",
        path: schemaPath,
        schema: directSchema,
      };
    }

    // Try with formSchemas prefix if not found directly
    if (!schemaPath.startsWith("formSchemas.")) {
      const legacyPath = `formSchemas.${schemaPath}`;
      const schema = getContextPath(legacyPath);

      if (schema) {
        console.log(
          `[DebugPanel] Found form schema using legacy path: ${legacyPath}`,
          schema
        );
        return {
          type: "form",
          path: legacyPath,
          schema: schema,
        };
      }
    }

    console.warn(
      `[DebugPanel] Form schema not found for legacy path: ${schemaPath}`
    );
    return {
      type: "form",
      path: schemaPath,
      schema: null,
    };
  }

  // Wykrywanie schematu na podstawie kontekstu
  if (step.contextPath) {
    const contextKey = step.contextPath.split(".")[0];
    
    // Próba wykrycia typu kroku i schematu
    if (
      step.templateId === "llm-query" || 
      step.label?.includes("AI") || 
      step.label?.includes("Analiza")
    ) {
      // Próba znalezienia schematu LLM dla kontekstu
      const schemaByContext = getContextPath(`schemas.llm.${contextKey}`);
      if (schemaByContext) {
        return {
          type: "llm",
          path: `schemas.llm.${contextKey}`,
          schema: schemaByContext,
        };
      }
      
      // Sprawdź starszy format
      const legacySchema = getContextPath(`llmSchemas.${contextKey}`);
      if (legacySchema) {
        return {
          type: "llm",
          path: `llmSchemas.${contextKey}`,
          schema: legacySchema,
        };
      }
    }
    
    if (step.templateId === "form-step" || step.type === "form") {
      // Próba znalezienia schematu formularza dla kontekstu
      const schemaByContext = getContextPath(`schemas.form.${contextKey}`);
      if (schemaByContext) {
        return {
          type: "form",
          path: `schemas.form.${contextKey}`,
          schema: schemaByContext,
        };
      }
      
      // Sprawdź starszy format
      const legacySchema = getContextPath(`formSchemas.${contextKey}`);
      if (legacySchema) {
        return {
          type: "form",
          path: `formSchemas.${contextKey}`,
          schema: legacySchema,
        };
      }
    }
  }

  return null;
}