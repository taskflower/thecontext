/**
 * E-Learning template implementation
 */
import { TemplateConfig } from '../types';
import Layout from './components/Layout';
import Header from './components/Header';
import Navigation from './components/Navigation';
import AssistantMessage from './components/AssistantMessage';
import UserInput from './components/UserInput';
import ContextUpdateInfo from './components/ContextUpdateInfo';

const elearningTemplate: TemplateConfig = {
  id: 'elearning',
  name: 'E-Learning Template',
  description: 'Educational design optimized for learning experiences',
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

export default elearningTemplate;