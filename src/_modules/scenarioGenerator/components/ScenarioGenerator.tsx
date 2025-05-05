// src/_modules/scenarioGenerator/components/ScenarioGenerator.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScenarioEditor } from '../hooks/useScenarioEditor';
import { useAuth, useAppStore } from '@/hooks';
import StepEditor from './StepEditor';
import ValidationErrors from './ValidationErrors';

interface ScenarioGeneratorProps {
  existingScenario?: any;
  mode?: 'create' | 'edit';
  onComplete?: (scenarioCode: string) => void;
}

const ScenarioGenerator: React.FC<ScenarioGeneratorProps> = ({
  existingScenario,
  mode = 'create',
  onComplete
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCurrentWorkspace } = useAppStore();
  const currentWorkspace = getCurrentWorkspace();
  
  // Local state
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Initialize the scenario editor hook
  const {
    scenario,
    isLoading,
    error,
    generatedCode,
    hasChanges,
    validationResult,
    editingStepIndex,
    availableTemplates,
    selectedTemplateId,
    
    addStep,
    updateStep,
    removeStep,
    moveStep,
    setEditingStep,
    
    updateScenario,
    generateAIScenario,
    generateFromTemplate,
    loadTemplateScenario,
    generateCode,
    
    setSelectedTemplateId
  } = useScenarioEditor({
    existingScenario,
    mode,
    onComplete
  });
  
  // Check if user is logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Handle AI-based generation
  const handleGenerateWithAI = () => {
    if (!aiPrompt.trim()) return;
    generateAIScenario(aiPrompt);
  };
  
  // Handle advanced AI generation using template
  const handleGenerateFromTemplate = () => {
    if (!selectedTemplateId || !aiPrompt.trim()) return;
    generateFromTemplate(selectedTemplateId, aiPrompt);
  };
  
  // Copy generated code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    alert('Code copied to clipboard!');
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">
        {mode === 'create' ? 'AI Scenario Generator' : 'Edit Scenario'}
      </h1>
      
      {/* Main content */}
      <div className="space-y-6">
        {/* AI-driven generation */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {mode === 'create' ? 'Create a New Scenario' : 'Modify Scenario'}
          </h2>
          
          <div className="space-y-5">
            {/* Description prompt */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Describe Your Scenario
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full p-3 border rounded-md"
                rows={4}
                placeholder="Describe in detail what this scenario should do. Example: Create a scenario for analyzing marketing campaigns with steps for collecting campaign data, analyzing performance, and generating reports..."
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleGenerateWithAI}
                  disabled={isLoading || !aiPrompt.trim()}
                  className={`px-4 py-2 rounded-md text-white font-medium ${
                    isLoading || !aiPrompt.trim()
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
            </div>
            
            {/* Scenario basic info */}
            <div className="space-y-4 pt-2 border-t">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Scenario Name
                </label>
                <input
                  type="text"
                  value={scenario.name}
                  onChange={(e) => updateScenario({ name: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Name of your scenario..."
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={scenario.description}
                  onChange={(e) => updateScenario({ description: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  rows={2}
                  placeholder="Brief description of the scenario purpose..."
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Icon
                </label>
                <select
                  value={scenario.icon}
                  onChange={(e) => updateScenario({ icon: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="folder-kanban">Folder</option>
                  <option value="calculator">Calculator</option>
                  <option value="bar-chart">Chart</option>
                  <option value="clipboard-list">List</option>
                  <option value="presentation">Presentation</option>
                  <option value="file-check">Document</option>
                  <option value="users">Users</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Steps management */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Scenario Steps</h2>
            <div className="flex space-x-2">
              <div className="dropdown relative">
                <button 
                  className="px-3 py-1 bg-green-600 text-white rounded-md flex items-center hover:bg-green-700"
                  onClick={() => {
                    const dropdown = document.getElementById('stepTypeDropdown');
                    if (dropdown) {
                      dropdown.classList.toggle('hidden');
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Step
                </button>
                <div id="stepTypeDropdown" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                  <ul className="py-1">
                    <li>
                      <button 
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          addStep('formStep');
                          document.getElementById('stepTypeDropdown')?.classList.add('hidden');
                        }}
                      >
                        Form Input Step
                      </button>
                    </li>
                    <li>
                      <button 
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          addStep('llmStep');
                          document.getElementById('stepTypeDropdown')?.classList.add('hidden');
                        }}
                      >
                        AI Analysis Step
                      </button>
                    </li>
                    <li>
                      <button 
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          addStep('widgetsStep');
                          document.getElementById('stepTypeDropdown')?.classList.add('hidden');
                        }}
                      >
                        Data Visualization Step
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {scenario.steps.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-700">No steps defined yet. Add steps manually or generate with AI.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Steps list */}
              <div className="border rounded-md overflow-hidden">
                {scenario.steps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className={`flex items-center border-b last:border-b-0 p-3 ${
                      editingStepIndex === index ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => setEditingStep(index)}
                    >
                      <div className="font-medium">{step.label}</div>
                      <div className="text-sm text-gray-500">Type: {step.tplFile}</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                        aria-label="Move step up"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === scenario.steps.length - 1}
                        className="p-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                        aria-label="Move step down"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => setEditingStep(index)}
                        className="p-1 text-blue-600 hover:text-blue-900"
                        aria-label="Edit step"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => removeStep(index)}
                        className="p-1 text-red-600 hover:text-red-900"
                        aria-label="Remove step"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Step editor */}
              {editingStepIndex !== null && scenario.steps[editingStepIndex] && (
                <StepEditor 
                  step={scenario.steps[editingStepIndex]}
                  allSteps={scenario.steps}
                  index={editingStepIndex}
                  onUpdate={(updates) => updateStep(editingStepIndex, updates)}
                  onClose={() => setEditingStep(null)}
                />
              )}
            </div>
          )}
        </div>
        
        {/* Advanced options */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="flex items-center text-gray-700 mb-4"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 mr-2 transition-transform ${showAdvancedOptions ? 'rotate-90' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Advanced Options</span>
          </button>
          
          {showAdvancedOptions && (
            <div className="space-y-4 pt-2 border-t">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Use Existing Scenario as Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a scenario...</option>
                  {availableTemplates.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                
                {selectedTemplateId && (
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => loadTemplateScenario(selectedTemplateId)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      Load Template
                    </button>
                    
                    <button
                      onClick={handleGenerateFromTemplate}
                      disabled={!aiPrompt.trim() || isLoading}
                      className={`px-3 py-1 text-sm rounded-md ${
                        !aiPrompt.trim() || isLoading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      Generate AI-Enhanced Scenario
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  System Message (Optional)
                </label>
                <textarea
                  value={scenario.systemMessage || ''}
                  onChange={(e) => updateScenario({ systemMessage: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  rows={2}
                  placeholder="Custom system message for LLM interactions..."
                />
                <p className="text-xs text-gray-500 mt-1">This message will be used as the system prompt for all LLM steps</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Validation errors */}
        <ValidationErrors 
          error={error} 
          validationResult={validationResult} 
        />
        
        {/* Action buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          
          <button
            onClick={generateCode}
            disabled={isLoading || scenario.steps.length === 0 || !scenario.name.trim() || !hasChanges}
            className={`px-5 py-2 rounded-md ${
              isLoading || scenario.steps.length === 0 || !scenario.name.trim() || !hasChanges
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading 
              ? 'Generating...' 
              : mode === 'edit' 
                ? 'Update Scenario' 
                : 'Generate Scenario'
            }
          </button>
        </div>
        
        {/* Generated code output */}
        {generatedCode && (
          <div className="bg-white p-6 rounded-lg border shadow-sm mt-6">
            <h2 className="text-xl font-semibold mb-4">Generated Scenario Code</h2>
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 overflow-auto max-h-96">
              <pre className="text-sm">{generatedCode}</pre>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <p className="text-gray-600">
                Copy this code and save it to your application files.
              </p>
              
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenarioGenerator;