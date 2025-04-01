import { IndexedDBService } from './service';

// Global variable to ensure we don't initialize multiple times
let isInitialized = false;

/**
 * Setup IndexedDB collections and initial data for the language learning app
 * This function should be called when the application initializes
 * Returns immediately if data has already been initialized
 * 
 * @param force If true, will reinitialize data even if already initialized
 */
export async function setupLanguageLearningData(force = false) {
  // Check if already initialized
  if (isInitialized && !force) {
    console.log('Language learning data already initialized - skipping');
    return true;
  }
  
  // Set flag to prevent multiple initializations
  isInitialized = true;
  
  // Check if collections already exist
  if (!force) {
    try {
      const collections = await IndexedDBService.getCollections();
      const hasDbs = collections.includes('language_lessons') && 
                     collections.includes('language_exercises') && 
                     collections.includes('user_progress');
      
      if (hasDbs) {
        // Check if there's data in the collections
        const lessonsCount = await IndexedDBService.countItems('language_lessons');
        if (lessonsCount > 0) {
          console.log('Language learning data already exists in IndexedDB - skipping initialization');
          return true;
        }
      }
    } catch (error) {
      console.error('Error checking IndexedDB collections:', error);
      // Continue with initialization in case of error
    }
  }
  try {
    console.log('Setting up language learning data in IndexedDB...');

    // Setup language lessons collection
    await IndexedDBService.ensureCollection('language_lessons');
    
    // Add lesson data
    const lessons = [
      {
        id: 'lesson1',
        title: 'Greetings and Basic Phrases',
        description: 'Learn how to greet people and use basic phrases in Spanish',
        level: 'beginner',
        language: 'spanish',
        order: 1,
        exercises: ['exercise1', 'exercise2'],
        completed: false
      },
      {
        id: 'lesson2',
        title: 'Numbers and Counting',
        description: 'Learn to count and use numbers in Spanish',
        level: 'beginner',
        language: 'spanish',
        order: 2,
        exercises: ['exercise3', 'exercise4'],
        completed: false
      }
    ];
    
    // Add lessons to IndexedDB
    for (const lesson of lessons) {
      await IndexedDBService.saveItem('language_lessons', lesson);
    }
    
    console.log('Added language lessons to IndexedDB');
    
    // Setup exercises collection
    await IndexedDBService.ensureCollection('language_exercises');
    
    // Add exercise data
    const exercises = [
      {
        id: 'exercise1',
        lessonId: 'lesson1',
        type: 'multiple-choice',
        question: 'How do you say "Hello" in Spanish?',
        options: ['Hola', 'Gracias', 'Adiós', 'Por favor'],
        correctAnswer: 'Hola',
        explanation: 'Hola is the Spanish word for Hello',
        order: 1
      },
      {
        id: 'exercise2',
        lessonId: 'lesson1',
        type: 'translation',
        question: 'Translate "Good morning" to Spanish',
        correctAnswer: 'Buenos días',
        explanation: 'Buenos días is the Spanish phrase for Good morning',
        order: 2
      },
      {
        id: 'exercise3',
        lessonId: 'lesson2',
        type: 'multiple-choice',
        question: 'What is "five" in Spanish?',
        options: ['Uno', 'Tres', 'Cinco', 'Siete'],
        correctAnswer: 'Cinco',
        explanation: 'Cinco is the Spanish word for five',
        order: 1
      },
      {
        id: 'exercise4',
        lessonId: 'lesson2',
        type: 'translation',
        question: 'Translate "I want two apples" to Spanish',
        correctAnswer: 'Quiero dos manzanas',
        explanation: 'Quiero = I want, dos = two, manzanas = apples',
        order: 2
      }
    ];
    
    // Add exercises to IndexedDB
    for (const exercise of exercises) {
      await IndexedDBService.saveItem('language_exercises', exercise);
    }
    
    console.log('Added language exercises to IndexedDB');
    
    // Setup user progress collection
    await IndexedDBService.ensureCollection('user_progress');
    
    // Check if user progress already exists
    const existingProgress = await IndexedDBService.getItem('user_progress', 'user_default');
    
    // Only create default progress if it doesn't already exist
    if (!existingProgress) {
      const progress = {
        id: 'user_default',
        completedLessons: [],
        completedExercises: [],
        currentLessonId: 'lesson1',
        currentExerciseId: 'exercise1',
        score: 0
      };
      
      await IndexedDBService.saveItem('user_progress', progress);
      console.log('Added default user progress to IndexedDB');
    } else {
      console.log('User progress already exists in IndexedDB');
    }
    
    console.log('Language learning data setup complete!');
    return true;
  } catch (error) {
    console.error('Error setting up language learning data:', error);
    return false;
  }
}