# Language Learning Template Usage Guide

This guide explains how to use the Language Learning template integrated into The Context App framework. The template creates a Duolingo-like language learning application while maintaining compatibility with the overall framework.

## Key Features

- **Framework Integration**: Works with the existing Context App components and flow
- **Dynamic Content**: Loads lessons and exercises from IndexedDB
- **Progress Tracking**: Tracks user progress across lessons and units
- **Custom UI**: Provides specialized UI components for language learning
- **Extendable**: Can be customized with new exercise types and content

## Implementation Approach

The template follows a "plugin-first" approach:

1. All components are registered as plugins that integrate with the framework
2. The template uses the context system to control its state
3. IndexedDB is used to store lesson data and track progress
4. The UI adapts depending on the current learning activity

## Getting Started

### 1. Register Template Components

First, register the language learning components with the framework:

```typescript
// In your application initialization
import { registerApplicationTemplates } from '@/modules/appTemplates';

// Register all application templates, including language learning
registerApplicationTemplates();
```

### 2. Initialize Template Data

Initialize the IndexedDB collections and default data:

```typescript
import { initializeLanguageLearningData } from '@/modules/appTemplates/languageLearning';

// Initialize data (can be called during app startup or from a settings screen)
await initializeLanguageLearningData();
```

### 3. Create Language Learning Workspace

Create a workspace with scenarios and nodes for language learning:

```typescript
import { createLanguageLearningWorkspace } from '@/modules/appTemplates/languageLearning';

// Create the workspace (returns workspaceId and scenarioIds)
const { workspaceId, dashboardScenarioId } = await createLanguageLearningWorkspace();

// Optionally, navigate to the created workspace
useAppStore.getState().selectWorkspace(workspaceId);
useAppStore.getState().selectScenario(dashboardScenarioId);
```

## Technical Implementation

### Main Components

1. **LanguageLearningPlugin**: Main entry point that integrates with WorkspacePage
2. **Exercise Components**: Specialized components for different exercise types
3. **LessonComplete**: Component for lesson completion and progression
4. **DataInitializer**: Utilities for initializing and maintaining app data

### Data Structure

The template uses these collections in IndexedDB:

- **app_config**: Application configuration and unit definitions
- **lessons**: Lesson content and exercise data
- **user_progress**: User progress tracking
- **current_learning_state**: Current lesson/exercise state

### Context Items

The template relies on these context items:

- **app_config**: IndexedDB reference to config
- **current_learning_state**: IndexedDB reference to state
- **selected_unit**: Currently selected unit ID
- **current_lesson_id**: Current lesson ID
- **current_lesson**: Complete lesson data (JSON)
- **current_exercise**: Current exercise data (JSON)
- **exercise_progress**: Exercise progress data
- **exercise_feedback**: Feedback on user answers

## Customization

### Adding New Units and Lessons

To add new units or lessons, modify the template data:

```typescript
import templateData from '@/modules/appTemplates/languageLearning/templateData';
import IndexedDBService from '@/modules/indexedDB/service';
import { LANGUAGE_LEARNING_TEMPLATE } from '@/modules/appTemplates/languageLearning/constants';

// Add a new lesson to template data
const newLesson = {
  id: "lesson-2-1",
  unitId: "unit-2",
  lessonId: "lesson-1",
  title: "Food Vocabulary",
  description: "Learn essential food vocabulary",
  exercises: [
    // Exercise definitions...
  ]
};

// Save to IndexedDB
await IndexedDBService.saveItem(
  LANGUAGE_LEARNING_TEMPLATE.collections.lessons,
  newLesson,
  newLesson.id
);

// Update app config to unlock unit if needed
const config = await IndexedDBService.getItem(
  LANGUAGE_LEARNING_TEMPLATE.collections.appConfig,
  'config'
);

// Update unit status
const unitIndex = config.availableUnits.findIndex(u => u.id === 'unit-2');
if (unitIndex >= 0) {
  config.availableUnits[unitIndex].active = true;
  await IndexedDBService.saveItem(
    LANGUAGE_LEARNING_TEMPLATE.collections.appConfig,
    config,
    'config'
  );
}
```

### Creating New Exercise Types

To add a new exercise type:

1. Create a new component in the components directory
2. Register it in the components index.ts
3. Update the getComponentForExerciseType function
4. Add exercises of this type to your lessons

### Customizing UI

The template UI can be customized through the app_config:

```typescript
// Update UI configuration
const config = await IndexedDBService.getItem(
  LANGUAGE_LEARNING_TEMPLATE.collections.appConfig,
  'config'
);

config.ui = {
  primaryColor: "#1e88e5",
  logoUrl: "/your-logo.png",
  showStreak: true,
  showXP: true,
  themeClass: "custom-language-theme"
};

await IndexedDBService.saveItem(
  LANGUAGE_LEARNING_TEMPLATE.collections.appConfig,
  config,
  'config'
);
```

## Integration with Other Framework Features

The language learning template is designed to work with other features of the Context App:

- **Plugins**: Can be used alongside other plugins
- **Context System**: Uses the context system for state management
- **Flow**: Utilizes the flow system for progression logic
- **Filters**: Can use filters for controlling unit availability

## Conclusion

This template demonstrates how to create a specialized application within the Context App framework without changing the core framework. It leverages existing infrastructure while providing custom functionality for language learning.

The same approach can be used to create other types of applications like a marketing campaign creator, quiz builder, or any other interactive application that would benefit from the Context App's flow and context management capabilities.