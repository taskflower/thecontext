// src/modules/flow/components/templates/default/index.ts
import Header from './Header';
import AssistantMessage from './AssistantMessage';
import UserInput from './UserInput';
import NavigationButtons from './NavigationButtons';
import ContextUpdateInfo from './ContextUpdateInfo';

export {
  Header,
  AssistantMessage,
  UserInput,
  NavigationButtons,
  ContextUpdateInfo
};

// Dla wygody eksportu jako obiekt
export const components = {
  Header,
  AssistantMessage,
  UserInput,
  NavigationButtons,
  ContextUpdateInfo
};

export default components;