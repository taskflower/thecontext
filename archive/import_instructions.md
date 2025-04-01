# Importing the Language Learning Template into The Context App

This document provides step-by-step instructions for importing and using the Language Learning template with The Context App framework.

## Prerequisites

1. The Context App installed and running
2. Access to the framework's codebase
3. Basic understanding of how the framework's workspaces and scenarios function

## Installation Steps

### 1. Add the Template Files

Add the following files to your codebase:

- Create the directory structure: `src/modules/appTemplates/languageLearning`
- Copy all template files into the directory
- Ensure the `index.ts` file is properly set up to export all necessary components

### 2. Register the Template with Your Application

Update your main application entry point (usually `main.tsx` or similar):

```typescript
import { registerApplicationTemplates } from '@/modules/appTemplates';

// Inside your initialization code:
registerApplicationTemplates();
```

### 3. Create Import Button in Your UI

Add a button to your application interface (for example in a settings menu or workspace page):

```tsx
import { Button } from '@/components/ui/button';
import { 
  initializeLanguageLearningData, 
  createLanguageLearningWorkspace 
} from '@/modules/appTemplates/languageLearning';

function ImportTemplateButton() {
  const handleImport = async () => {
    try {
      // Initialize data in IndexedDB
      await initializeLanguageLearningData();
      
      // Create workspace with necessary scenarios
      const { workspaceId, dashboardScenarioId } = await createLanguageLearningWorkspace();
      
      // Navigate to the created workspace
      const store = useAppStore.getState();
      store.selectWorkspace(workspaceId);
      store.selectScenario(dashboardScenarioId);
      
      alert('Language Learning template imported successfully!');
    } catch (error) {
      console.error('Failed to import template:', error);
      alert('Failed to import template. Check console for details.');
    }
  };
  
  return (
    <Button onClick={handleImport}>
      Import Language Learning Template
    </Button>
  );
}
```

### 4. Set Up Proper Access to IndexedDB

Make sure your application has the appropriate permissions to use IndexedDB:

1. Check browser support for IndexedDB
2. Request necessary permissions if required
3. Handle potential errors if IndexedDB is not available

## Using the Template

Once imported, you can use the Language Learning template as follows:

### Basic Usage

1. Navigate to the imported workspace
2. The main dashboard will show available learning units
3. Select a unit to start learning
4. Complete exercises in each lesson
5. Track progress through the units

### Customizing Content

To add or modify language learning content:

1. Use the IndexedDB service to update lessons or units
2. Create new exercise types by extending the existing components
3. Modify the UI appearance through the configuration

Example code for adding a new unit:

```typescript
import IndexedDBService from '@/modules/indexedDB/service';
import { LANGUAGE_LEARNING_TEMPLATE } from '@/modules/appTemplates/languageLearning/constants';

async function addNewUnit() {
  // Get current config
  const config = await IndexedDBService.getItem(
    LANGUAGE_LEARNING_TEMPLATE.collections.appConfig,
    'config'
  );
  
  // Add new unit
  config.availableUnits.push({
    id: "unit-4",
    title: "Advanced Conversation",
    description: "Practice advanced conversation topics",
    icon: "🗣️",
    lessonsCount: 0,
    active: false,
    progress: 0
  });
  
  // Save updated config
  await IndexedDBService.saveItem(
    LANGUAGE_LEARNING_TEMPLATE.collections.appConfig,
    config,
    'config'
  );
}
```

## Troubleshooting

If you encounter issues with the template:

### IndexedDB Issues

- Check browser console for errors
- Verify IndexedDB is supported and accessible
- Make sure collections are properly created

### Component Registration Issues

- Ensure all components are properly registered with the plugin system
- Check for naming conflicts with existing components
- Verify all dependencies are correctly imported

### Data Loading Issues

- Confirm that initialization was successful
- Check that context items are properly set
- Verify that template data is correctly structured

## Further Customization

The template can be further customized to fit different learning needs:

1. Add different types of exercises
2. Implement additional gamification elements
3. Create different learning paths based on user progress
4. Integrate with external language APIs for more content

## Conclusion

The Language Learning template demonstrates how to create specialized applications within The Context App framework. By following these instructions, you can import and use the template without modifying the core framework code.

For more details, refer to the template's README and usage guide.