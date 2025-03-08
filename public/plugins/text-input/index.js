// Plugin: text-input
// This is a compiled version for the browser

// Define React if it doesn't exist (for standalone plugin testing)
if (typeof React === 'undefined') {
  window.React = { createElement: () => ({}) };
}

// Exported manifest
export const manifest = {
  id: "text-input",
  name: "Text Input",
  version: "1.0.0",
  description: "Enhanced text input",
  author: "Plugin Builder"
};

// Mock components for plugin UI
const EditorComponent = (props) => {
  return React.createElement('div', { className: 'plugin-editor' }, 
    React.createElement('p', {}, `Editor for ${manifest.name}`)
  );
};

const ViewerComponent = (props) => {
  return React.createElement('div', { className: 'plugin-viewer' }, 
    React.createElement('p', {}, `Viewer for ${manifest.name}`),
    React.createElement('button', { onClick: () => {
      if (props.onComplete) {
        props.onComplete({ value: 'Sample value' });
      }
    }}, 'Submit')
  );
};

const ResultComponent = (props) => {
  return React.createElement('div', { className: 'plugin-result' }, 
    React.createElement('p', {}, `Result for ${manifest.name}`),
    props.step?.result ? React.createElement('pre', {}, 
      JSON.stringify(props.step.result, null, 2)
    ) : null
  );
};

// Register function that can be called when the plugin is loaded
export function register(context) {
  console.log(`Plugin ${manifest.id} registered`);
  
  return {
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    category: "inputs",
    defaultConfig: {
      label: "Enter information",
      placeholder: "Type here...",
      required: true
    },
    capabilities: {
      autoExecutable: false,
      requiresUserInput: true,
      producesOutput: true,
      consumesOutput: false
    },
    // Export components
    EditorComponent,
    ViewerComponent,
    ResultComponent,
    validate: (step, context) => ({ valid: true }),
    manifest
  };
}

// Default export for ES module compatibility
export default { register, manifest };
