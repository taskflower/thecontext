// src/pages/stepsPlugins/llmQuery/index.ts
import { register } from '../registry';
import { PLUGIN_CATEGORIES } from '../registry';
import { LLMQueryEditor } from './LLMQueryEditor';
import { LLMQueryResult } from './LLMQueryResult';
import { LLMQueryViewer } from './LLMQueryViewer';

import './validation';

register({
  type: 'llm-query',
  name: 'LLM Query',
  Viewer: LLMQueryViewer,
  Editor: LLMQueryEditor,
  ResultRenderer: LLMQueryResult,
  category: PLUGIN_CATEGORIES.INTEGRATION,
  description: 'Wysyła zapytanie do LLM i zwraca wynik na podstawie historii konwersacji z poprzedniego pluginu.',
  defaultConfig: {
    title: 'LLM Query',
    description: 'Wysyła zapytanie do LLM na podstawie historii konwersacji',
    referenceStepId: ''
  }
});