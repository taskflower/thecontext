// src/modules/flow/components/templates/elearning/index.ts
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

// For convenience export as object
export const components = {
  Header,
  AssistantMessage,
  UserInput,
  NavigationButtons,
  ContextUpdateInfo
};

export default components;