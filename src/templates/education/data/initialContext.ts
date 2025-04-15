// src/templates/education/data/initialContext.ts
import { getFormSchemas } from './formSchemas';
import { getLlmSchemas } from './llmSchemas';

export function getInitialContext() {
  return {
    learningSession: {
      subject: "",
      topic: "",
      level: "średnio-zaawansowany"
    },
    generatedContent: {},
    quizResults: {},
    userNotes: {},
    projectWork: {},
    savedItems: {
      selectedItem: null,
      filter: null
    },
    formSchemas: getFormSchemas(),
    llmSchemas: getLlmSchemas()
  };
}