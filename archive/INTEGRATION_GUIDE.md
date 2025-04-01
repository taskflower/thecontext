# Language Learning Template Integration Guide

This guide explains how to integrate the Duolingo-like language learning template into your existing Context App application.

## Step 1: Import the Template

1. Go to the Export/Import tab in Studio view
2. Select the "Import" tab
3. Choose the `language_learning_app.json` file
4. Select "Import as new workspace" and click "Import Data"

## Step 2: Initialize IndexedDB Collections

The template relies on IndexedDB for storing and retrieving learning data. You need to initialize these collections.

### Option 1: Using the provided loader script

1. Add the `loader_script.js` to your project
2. Import and run the loader script when your app initializes:

```javascript
import { loadLanguageLearningTemplate } from './temp_imports/loader_script';

// Call this when your app starts
async function initializeApp() {
  // Load the language learning template data
  await loadLanguageLearningTemplate();
  
  // Continue with your app initialization
  // ...
}
```

### Option 2: Manual initialization

If you prefer to manually control the initialization process:

1. Create the required IndexedDB collections using the Context App interface:
   - app_config
   - lessons
   - user_progress
   - current_learning_state

2. Initialize each collection with the data from the JSON file using the IndexedDB service:

```javascript
import IndexedDBService from '../src/modules/indexedDB/service';

async function initializeCollection(collectionName, data) {
  // Ensure collection exists
  await IndexedDBService.ensureCollection(collectionName);
  
  // Add data items
  for (const item of data) {
    await IndexedDBService.saveItem(collectionName, item, item.id);
  }
}
```

## Step 3: Register Custom Components

The template includes custom UI components for language learning. You need to register these components in your application.

1. Copy the `LanguageLearningComponents.tsx` file to your components directory
2. Import and register the components:

```javascript
import { 
  LanguageDashboard, 
  MultipleChoiceExercise, 
  TranslationExercise,
  LessonComplete 
} from './path/to/LanguageLearningComponents';

// Register components with your component registry
registerComponents({
  LanguageDashboard,
  MultipleChoiceExercise,
  TranslationExercise,
  LessonComplete
});
```

## Step 4: Set Up Context Items

The template uses context items to control the application flow. Initialize these context items:

```javascript
function initializeContextItems() {
  const { addContextItem } = useAppStore.getState();
  
  // Add required context items
  addContextItem({
    title: "app_config",
    type: "indexedDB",
    content: "app_config",
    persistent: true
  });
  
  addContextItem({
    title: "current_learning_state",
    type: "indexedDB",
    content: "current_learning_state",
    persistent: true
  });
  
  // Add other context items from the template
  // ...
}
```

## Step 5: Expose the Language Learning App from Your Frontend

To make the language learning app accessible from your frontend:

1. Create a route or navigation option to the language learning workspace:

```javascript
function navigateToLanguageLearningApp() {
  const { selectWorkspace, selectScenario } = useAppStore.getState();
  
  // Navigate to the language learning workspace and dashboard scenario
  selectWorkspace("workspace-language-learning");
  selectScenario("scenario-dashboard");
}
```

2. Add a button or menu option in your main interface:

```jsx
<Button onClick={navigateToLanguageLearningApp}>
  Language Learning
</Button>
```

## Step 6: Customize the Learning Content

To customize the learning content:

1. Modify the `app_config` collection to change unit information
2. Add/edit lessons in the `lessons` collection
3. Update the `user_progress` collection to track progress

You can do this programmatically:

```javascript
async function addNewLesson(lessonData) {
  await IndexedDBService.saveItem("lessons", lessonData, lessonData.id);
  
  // Update app_config to reference the new lesson
  const config = await IndexedDBService.getItem("app_config", "config");
  
  // Update the unit to include the new lesson
  const unitIndex = config.available_units.findIndex(u => u.id === lessonData.unit_id);
  if (unitIndex >= 0) {
    config.available_units[unitIndex].lessons_count += 1;
    await IndexedDBService.saveItem("app_config", config, "config");
  }
}
```

## Advanced Customization

### Creating New Exercise Types

1. Define a new exercise component in `LanguageLearningComponents.tsx`
2. Update the `ExerciseRenderer` node to support the new type
3. Add exercises of the new type to your lessons in the `lessons` collection

### Custom Learning Paths

1. Modify the flow in the scenarios to create different learning paths
2. Update filters to control progression based on custom criteria
3. Add new scenarios for specialized learning activities

## Troubleshooting

### IndexedDB Initialization Issues

If you encounter issues with IndexedDB initialization:

1. Check browser console for errors
2. Ensure IndexedDB is supported in your browser
3. Make sure the collections are properly created before adding data

### Component Registration Issues

If custom components aren't rendering correctly:

1. Verify that components are registered correctly
2. Check that component names in nodes match the registered names
3. Ensure all required props are being passed to components

### Data Flow Issues

If the learning flow isn't working as expected:

1. Check context items to ensure they contain the expected values
2. Verify that filters are properly configured
3. Inspect the edges between nodes to ensure they're connecting correctly