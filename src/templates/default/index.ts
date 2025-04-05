/**
 * Default template implementation
 */
import { TemplateConfig } from '../types';
import Layout from './components/Layout';
import Header from './components/Header';
import Navigation from './components/Navigation';
import AssistantMessage from './components/AssistantMessage';
import UserInput from './components/UserInput';
import ContextUpdateInfo from './components/ContextUpdateInfo';

const defaultTemplate: TemplateConfig = {
  id: 'default',
  name: 'Default Template',
  description: 'Clean, minimal interface with a focus on content',
  author: 'Context App Team',
  version: '1.0.0',
  components: {
    Layout,
    Header,
    Navigation,
    AssistantMessage,
    UserInput,
    ContextUpdateInfo
  }
};

export default defaultTemplate;