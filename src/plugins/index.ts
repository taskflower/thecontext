/**
 * Plugin system exports
 */
import { PluginProvider, usePlugins } from './context';
import * as registry from './registry';
import { apiServicePlugin } from './samples';
import StepPluginWrapper from './wrappers/StepPluginWrapper';
import EditorPluginWrapper from './wrappers/EditorPluginWrapper';
import {
  PluginManifest,
  PluginRegistration,
  PluginRegistry,
  StepPluginProps,
  EditorPluginProps,
  HookPointPluginProps
} from './types';

// Export all
export {
  PluginProvider,
  usePlugins,
  registry,
  StepPluginWrapper,
  EditorPluginWrapper,
  apiServicePlugin
};

export type {
  PluginManifest,
  PluginRegistration,
  PluginRegistry,
  StepPluginProps,
  EditorPluginProps,
  HookPointPluginProps
};