/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugin-system/PluginInterface.ts
import React from 'react';
import { PluginConfig, PluginModule, PluginState, PluginStoreState } from './types';
import { useAppStore, usePluginStore } from './store';

// Plugin interface abstract class
export abstract class PluginInterface implements PluginModule {
  id: string;
  name: string;
  defaultConfig: PluginConfig;
  
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.defaultConfig = {};
  }
  
  // Component methods (to be implemented by plugins)
  abstract ConfigComponent: React.FC;
  abstract ViewComponent: React.FC;
  abstract ResultComponent: React.FC;
  
  // Access app store
  getAppStore() {
    return useAppStore.getState();
  }
  
  // Access plugin store
  getPluginStore(): PluginStoreState {
    return usePluginStore.getState();
  }
  
  // Get this plugin's state
  getState(): PluginState | undefined {
    return usePluginStore.getState().getPluginState(this.id);
  }
  
  // Update this plugin's configuration
  updateConfig(configUpdates: Partial<PluginConfig>): void {
    usePluginStore.getState().updatePluginConfig(this.id, configUpdates);
  }
  
  // Update this plugin's result
  updateResult(result: any): void {
    usePluginStore.getState().updatePluginResult(this.id, result);
  }
}
