# Language Learning Template for The Context App

This template transforms The Context App framework into a Duolingo-like language learning application without modifying the core framework. It demonstrates how to build complex, interactive applications using the framework's existing components and features.

## Template Contents

- **Full Workspace Setup**: Complete workspace with scenarios for a language learning flow
- **IndexedDB Data**: Pre-configured IndexedDB collections for learning content and progress tracking
- **Custom Components**: Specialized UI components for language learning exercises
- **Dynamic Flow Control**: Context-driven flow with progression tracking

## Quick Start

1. Import the template file (`language_learning_app.json`) using the Import functionality in The Context App
2. Run the loader script to initialize the IndexedDB collections:

```javascript
import { loadLanguageLearningTemplate } from './temp_imports/loader_script';
loadLanguageLearningTemplate();
```

3. Navigate to the "Language Learning Template" workspace and select the "Dashboard" scenario

## How It Works

The template uses several key features of The Context App framework:

### 1. IndexedDB Collections

- **app_config**: Application settings, units, and course structure
- **lessons**: Lesson content and exercises with different formats
- **user_progress**: Learner's progress, streaks, and achievements
- **current_learning_state**: Current lesson and exercise state

### 2. Context Items

The app flow is controlled through context items:

- **app_config**: Configuration stored in IndexedDB
- **current_learning_state**: Current learning progress in IndexedDB
- **selected_unit**: Currently selected learning unit
- **current_lesson_id**: ID of the current lesson
- **current_lesson**: Full lesson data loaded from IndexedDB
- **current_exercise**: Current exercise being displayed
- **exercise_progress**: Progress through the current set of exercises
- **exercise_feedback**: Feedback on exercise attempts

### 3. Flow Control

- The Dashboard scenario shows available units
- Unit selection navigates to unit-specific scenarios
- Units load lessons from IndexedDB
- Lessons build a dynamic flow of exercises
- Filters control which units are available based on progress

### 4. Custom Components

The template includes custom UI components for various exercise types:

- **LanguageDashboard**: Displays available units and progress
- **MultipleChoiceExercise**: Multiple choice questions
- **TranslationExercise**: Translation exercises with text input
- **MatchingExercise**: Match pairs of related items
- **FillInBlankExercise**: Fill in missing words
- **LessonComplete**: Completion screen with rewards

## Customization

You can easily extend the template:

1. **Add More Units/Lessons**: Add new items to the `lessons` collection in IndexedDB
2. **Create New Exercise Types**: Define new components and add them to the template
3. **Modify the Learning Path**: Update the `app_config` collection to change progression

## Technical Implementation

The template demonstrates several advanced techniques:

- Dynamic scenario building based on data
- Context-driven application flow
- Filter-based progression control
- Integration with IndexedDB for persistent data storage
- Custom UI components for specific interaction patterns

This implementation preserves the framework's flexibility while creating a focused application experience.