// Plugin: textInput
import { registerPlugin } from '../../src/plugins/registry.js';
import { default as pluginDefinition } from '../../src/plugins/textInput/index.js';

export const manifest = pluginDefinition.manifest;
export const register = (context) => {
  const registration = pluginDefinition.register(context);
  return registration;
};

export default { register, manifest };
