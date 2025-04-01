# Language Learning App Template for The Context App

This package contains a ready-to-use Duolingo-style language learning application that integrates directly with The Context App framework. The template works directly with the existing frontend components and can be imported with a single file.

## Quick Import Instructions

1. In The Context App, navigate to the Export/Import tab
2. Select the "Import" tab
3. Upload the `language_learning_complete_import.json` file
4. Select "Import as new workspace"
5. Click "Import Data"

Once imported, the system will:
- Create a new workspace with language learning scenarios
- Register all necessary components
- Initialize IndexedDB collections with lesson data
- Set up context items for tracking progress
- Configure the flow with exercise templates

## Features

- **Complete Learning Flow**: Dashboard, lessons, exercises, and progress tracking
- **Multiple Exercise Types**: Multiple choice, translation, and completion screens
- **IndexedDB Integration**: All data stored in IndexedDB for persistence
- **Ready-to-Use Templates**: Alternative UI templates for optimal learning experience
- **No Framework Modifications**: All functionality implemented as plugins and scenarios

## How It Works

The template uses several key mechanisms to integrate with the framework:

### 1. Component Registration

Custom React components are registered with the application's dynamic component system, allowing them to be used within flows:

- `LanguageDashboard`: Main dashboard showing available units
- `MultipleChoiceExercise`: Exercise with multiple choice options
- `TranslationExercise`: Exercise requiring text input
- `LessonComplete`: Lesson completion screen with stats

### 2. Data Storage

All learning data is stored in IndexedDB collections:

- `app_config`: Application settings and unit definitions
- `lessons`: Lesson content and exercises
- `user_progress`: User progress tracking

### 3. Flow Integration

The template creates a flow that:

1. Shows a dashboard of available units
2. Lets users select a unit to start learning
3. Presents exercises in sequence
4. Tracks progress and completion
5. Returns to the dashboard when finished

### 4. Context Management

Learning state is managed through context items:

- `app_config`: Reference to app configuration
- `selected_unit`: Currently selected unit
- `current_lesson`: Current lesson data

## Customization

The imported template can be easily customized:

### Adding More Lessons

1. Create new lessons in the IndexedDB `lessons` collection
2. Update the unit configuration in `app_config`
3. Create new scenarios or modify existing ones for advanced units

### Custom Exercise Types

1. Create a new component and register it with the system
2. Update exercise flows to use your new component
3. Add exercises of the new type to your lessons

### UI Customization

Modify the template styles in component definitions:
- Change colors, icons, and layout
- Add animations or transitions
- Customize feedback and progress indicators

## Technical Details

- **JSX Components**: Full React components with state management
- **Automatic Registration**: Components self-register on import
- **IndexedDB Integration**: Seamless data storage and retrieval
- **Flow Building**: Dynamic flow based on lesson content
- **Template System**: Uses alternative templates for optimal UI

## Creating Similar Applications

This template demonstrates how to create specialized applications within The Context App framework. The same approach can be used for:

- Marketing campaign creators
- Quiz builders
- Guided tutorials
- Interactive documentation
- Any application that benefits from structured flow and context

## Troubleshooting

If you encounter issues:

- Check browser console for errors
- Verify that IndexedDB is available in your browser
- Make sure all components have registered correctly
- Check that context items are properly initialized