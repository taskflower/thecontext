/**
 * Hook points system entry point
 */
import { HookPointProvider, useHookPoints } from './context';
import HookPoint from './HookPoint';
import { HookPointName, HookPointProps, HookPointRegistration } from './types';

export {
  HookPointProvider,
  useHookPoints,
  HookPoint,
  HookPointName
};

export type {
  HookPointProps,
  HookPointRegistration
};