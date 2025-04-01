/**
 * Language Learning Template Bootstrap Script
 * 
 * This script enables dynamic component registration for the language learning template.
 * It should be included in the HTML page that loads the application.
 */
(function() {
  console.log('Language Learning Bootstrap: Script loaded');
  
  // Define a function to inject our components into the application
  const injectComponents = () => {
    console.log('Language Learning Bootstrap: Attempting to inject components');
    
    // Check if React and the PluginRegistry are available
    if (window.React && window.PluginRegistry) {
      console.log('Language Learning Bootstrap: Found PluginRegistry, registering components');
      
      // Set up global object to store our component code for later registration
      window.LanguageLearningComponents = {
        LessonIntroPlugin: `
          import React, { useEffect } from 'react';
          import { PluginComponentWithSchema, PluginComponentProps } from '@/modules/plugins/types';
          import { Button } from '@/components/ui/button';
          import { IndexedDBService } from '@/modules/indexedDB/service';

          interface LessonIntroData {
            lessonId: string;
            nextExerciseId: string;
          }

          const LessonIntroPlugin = ({ 
            data, 
            appContext 
          }) => {
            const lessonData = data;
            
            // Load lesson data from IndexedDB when component mounts
            useEffect(() => {
              const loadLesson = async () => {
                try {
                  // Ensure collection exists
                  await IndexedDBService.ensureCollection('language_lessons');
                  
                  // Get lesson data
                  const lesson = await IndexedDBService.getItem('language_lessons', lessonData.lessonId);
                  console.log('Loaded lesson:', lesson);
                  
                  // Update user progress
                  await IndexedDBService.ensureCollection('user_progress');
                  let progress = await IndexedDBService.getItem('user_progress', 'user_default');
                  
                  if (!progress) {
                    progress = {
                      id: 'user_default',
                      completedLessons: [],
                      completedExercises: [],
                      currentLessonId: lessonData.lessonId,
                      currentExerciseId: lessonData.nextExerciseId,
                      score: 0
                    };
                  } else {
                    progress.currentLessonId = lessonData.lessonId;
                    progress.currentExerciseId = lessonData.nextExerciseId;
                  }
                  
                  await IndexedDBService.saveItem('user_progress', progress);
                } catch (error) {
                  console.error('Error loading lesson:', error);
                }
              };
              
              loadLesson();
            }, [lessonData.lessonId, lessonData.nextExerciseId]);
            
            const handleContinue = () => {
              if (appContext?.nextStep) {
                appContext.nextStep();
              }
            };
            
            return React.createElement('div', { className: "my-8 space-y-6" },
              React.createElement('div', { className: "p-6 bg-primary/10 rounded-lg border border-primary/20" },
                React.createElement('h3', { className: "text-xl font-semibold mb-2" }, "Ready to begin?"),
                React.createElement('p', { className: "text-muted-foreground" }, 
                  "You're about to start the lesson. Click the button below when you're ready to continue."
                )
              ),
              React.createElement(Button, { 
                onClick: handleContinue,
                className: "w-full py-6 text-lg"
              }, "Start Lesson")
            );
          };

          // Add plugin settings
          LessonIntroPlugin.pluginSettings = {
            replaceUserInput: true,
            hideNavigationButtons: true
          };
        `,
        
        ExercisePlugin: `
          import React, { useState, useEffect } from 'react';
          import { PluginComponentWithSchema, PluginComponentProps } from '@/modules/plugins/types';
          import { Button } from '@/components/ui/button';
          import { Card } from '@/components/ui/card';
          import { IndexedDBService } from '@/modules/indexedDB/service';
          import { Input } from '@/components/ui/input';
          import { Label } from '@/components/ui/label';
          import { Badge } from '@/components/ui/badge';
          import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
          import { updateContextFromNodeInput } from '@/modules/flow/contextHandler';

          const ExercisePlugin = ({ 
            data, 
            appContext 
          }) => {
            const exerciseData = data;
            
            const [answer, setAnswer] = useState('');
            const [submitted, setSubmitted] = useState(false);
            const [isCorrect, setIsCorrect] = useState(false);
            const [exercise, setExercise] = useState(null);
            
            // Load exercise data from IndexedDB when component mounts
            useEffect(() => {
              const loadExercise = async () => {
                try {
                  // Ensure collection exists
                  await IndexedDBService.ensureCollection('language_exercises');
                  
                  // Get exercise data
                  const exerciseData = await IndexedDBService.getItem('language_exercises', exerciseData.exerciseId);
                  setExercise(exerciseData);
                  console.log('Loaded exercise:', exerciseData);
                  
                  // Update user progress
                  await IndexedDBService.ensureCollection('user_progress');
                  let progress = await IndexedDBService.getItem('user_progress', 'user_default');
                  
                  if (!progress) {
                    progress = {
                      id: 'user_default',
                      completedLessons: [],
                      completedExercises: [],
                      currentLessonId: '',
                      currentExerciseId: exerciseData.exerciseId,
                      score: 0
                    };
                  } else {
                    progress.currentExerciseId = exerciseData.exerciseId;
                  }
                  
                  await IndexedDBService.saveItem('user_progress', progress);
                } catch (error) {
                  console.error('Error loading exercise:', error);
                }
              };
              
              loadExercise();
            }, [exerciseData.exerciseId]);
            
            const handleOptionSelect = (option) => {
              setAnswer(option);
            };
            
            const handleInputChange = (e) => {
              setAnswer(e.target.value);
            };
            
            const handleSubmit = async () => {
              // Check if answer is correct
              const correct = answer.toLowerCase() === exerciseData.correctAnswer.toLowerCase();
              setIsCorrect(correct);
              setSubmitted(true);
              
              try {
                // Update context with user's answer
                if (appContext?.currentNode?.id && appContext.updateNodeUserPrompt) {
                  const contextValue = answer;
                  appContext.updateNodeUserPrompt(appContext.currentNode.id, contextValue);
                  
                  // Update context
                  if (appContext.currentNode.contextKey) {
                    updateContextFromNodeInput(appContext.currentNode.id);
                  }
                }
                
                // Update user progress
                await IndexedDBService.ensureCollection('user_progress');
                let progress = await IndexedDBService.getItem('user_progress', 'user_default');
                
                if (progress) {
                  if (correct) {
                    progress.score += 10;
                    if (!progress.completedExercises.includes(exerciseData.exerciseId)) {
                      progress.completedExercises.push(exerciseData.exerciseId);
                    }
                  }
                  
                  await IndexedDBService.saveItem('user_progress', progress);
                }
              } catch (error) {
                console.error('Error updating progress:', error);
              }
            };
            
            const handleContinue = () => {
              if (appContext?.nextStep) {
                appContext.nextStep();
              }
            };
            
            // Create a button component
            const ButtonComponent = (props) => {
              return React.createElement(Button, props, props.children);
            };
            
            // Simplified rendering for the exercise
            if (exerciseData.exerciseType === 'multiple-choice') {
              return React.createElement('div', { className: "my-8 space-y-6" },
                React.createElement('div', { className: "p-6 bg-card rounded-lg border" },
                  React.createElement('h3', { className: "text-xl font-semibold mb-4" }, exerciseData.question)
                ),
                submitted ? 
                  React.createElement(ButtonComponent, { 
                    onClick: handleContinue,
                    className: "w-full py-6"
                  }, "Continue to Next Exercise") :
                  React.createElement(ButtonComponent, { 
                    onClick: handleSubmit,
                    disabled: !answer,
                    className: "w-full py-6"
                  }, "Check Answer")
              );
            }
            
            // Simplified translation exercise
            return React.createElement('div', { className: "my-8 space-y-6" },
              React.createElement('div', { className: "p-6 bg-card rounded-lg border" },
                React.createElement('h3', { className: "text-xl font-semibold mb-4" }, exerciseData.question)
              ),
              submitted ? 
                React.createElement(ButtonComponent, { 
                  onClick: handleContinue,
                  className: "w-full py-6"
                }, "Continue to Next Exercise") :
                React.createElement(ButtonComponent, { 
                  onClick: handleSubmit,
                  disabled: !answer,
                  className: "w-full py-6"
                }, "Check Answer")
            );
          };

          // Add plugin settings
          ExercisePlugin.pluginSettings = {
            replaceUserInput: true,
            hideNavigationButtons: true
          };
        `,
        
        LessonCompletePlugin: `
          import React, { useEffect, useState } from 'react';
          import { PluginComponentWithSchema, PluginComponentProps } from '@/modules/plugins/types';
          import { Button } from '@/components/ui/button';
          import { IndexedDBService } from '@/modules/indexedDB/service';
          import { useAppStore } from '@/modules/store';

          const LessonCompletePlugin = ({ 
            data, 
            appContext 
          }) => {
            const lessonData = data;
            const [userScore, setUserScore] = useState(0);
            const [lesson, setLesson] = useState(null);
            const [nextLesson, setNextLesson] = useState(null);
            
            // Load user progress and mark lesson as completed
            useEffect(() => {
              const updateProgress = async () => {
                try {
                  // Get user progress
                  await IndexedDBService.ensureCollection('user_progress');
                  let progress = await IndexedDBService.getItem('user_progress', 'user_default');
                  
                  if (progress) {
                    // Mark lesson as completed
                    if (!progress.completedLessons.includes(lessonData.lessonId)) {
                      progress.completedLessons.push(lessonData.lessonId);
                    }
                    
                    // Update next lesson
                    progress.currentLessonId = lessonData.nextLessonId;
                    
                    // Save progress
                    await IndexedDBService.saveItem('user_progress', progress);
                    
                    // Set user score
                    setUserScore(progress.score);
                  }
                  
                  // Get lesson info
                  await IndexedDBService.ensureCollection('language_lessons');
                  const currentLesson = await IndexedDBService.getItem('language_lessons', lessonData.lessonId);
                  setLesson(currentLesson);
                  
                  // Get next lesson info
                  const next = await IndexedDBService.getItem('language_lessons', lessonData.nextLessonId);
                  setNextLesson(next);
                } catch (error) {
                  console.error('Error updating progress:', error);
                }
              };
              
              updateProgress();
            }, [lessonData.lessonId, lessonData.nextLessonId]);
            
            const handleFinish = () => {
              // Close the flow session and save changes
              if (appContext?.nextStep) {
                appContext.nextStep();
              }
            };
            
            return React.createElement('div', { className: "my-8 space-y-6" },
              React.createElement('div', { className: "p-6 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800" },
                React.createElement('h3', { className: "text-xl font-semibold mb-2" }, "Lesson Completed!"),
                React.createElement('p', { className: "text-muted-foreground" }, 
                  "Congratulations on completing ", lesson?.title || 'this lesson', "."
                )
              ),
              React.createElement(Button, { 
                onClick: handleFinish,
                className: "w-full py-6 text-lg"
              }, "Finish Lesson")
            );
          };

          // Add plugin settings
          LessonCompletePlugin.pluginSettings = {
            replaceUserInput: true,
            hideNavigationButtons: true
          };
        `
      };
      
      // Load the actual components - simplified versions of the full components
      try {
        const LessonIntroPlugin = eval(`
          (function(React, Button, IndexedDBService) {
            const component = (props) => {
              const { data, appContext } = props;
              const handleContinue = () => {
                if (appContext?.nextStep) {
                  appContext.nextStep();
                }
              };
              
              return React.createElement('div', { className: "my-8 space-y-6" },
                React.createElement('div', { className: "p-6 bg-primary/10 rounded-lg border border-primary/20" },
                  React.createElement('h3', { className: "text-xl font-semibold mb-2" }, "Ready to begin?"),
                  React.createElement('p', { className: "text-muted-foreground" }, 
                    "You're about to start the lesson. Click the button below when you're ready to continue."
                  )
                ),
                React.createElement(Button, { 
                  onClick: handleContinue,
                  className: "w-full py-6 text-lg"
                }, "Start Lesson")
              );
            };
            
            // Add plugin settings
            component.pluginSettings = {
              replaceUserInput: true,
              hideNavigationButtons: true
            };
            
            return component;
          })(window.React, window.UI.Button, window.IndexedDBService);
        `);
        
        // Register the component in the PluginRegistry
        window.PluginRegistry.register('LessonIntroPlugin', LessonIntroPlugin);
        console.log('Language Learning Bootstrap: Registered LessonIntroPlugin');
        
        // Do the same for the other components
        const ExercisePlugin = eval(`
          (function(React, Button) {
            const component = (props) => {
              const { data, appContext } = props;
              
              const handleContinue = () => {
                if (appContext?.nextStep) {
                  appContext.nextStep();
                }
              };
              
              return React.createElement('div', { className: "my-8 space-y-6" },
                React.createElement('div', { className: "p-6 bg-card rounded-lg border" },
                  React.createElement('h3', { className: "text-xl font-semibold mb-4" }, 
                    data.question || "Exercise Question"
                  )
                ),
                React.createElement(Button, { 
                  onClick: handleContinue,
                  className: "w-full py-6"
                }, "Continue to Next Exercise")
              );
            };
            
            // Add plugin settings
            component.pluginSettings = {
              replaceUserInput: true,
              hideNavigationButtons: true
            };
            
            return component;
          })(window.React, window.UI.Button);
        `);
        
        window.PluginRegistry.register('ExercisePlugin', ExercisePlugin);
        console.log('Language Learning Bootstrap: Registered ExercisePlugin');
        
        const LessonCompletePlugin = eval(`
          (function(React, Button) {
            const component = (props) => {
              const { data, appContext } = props;
              
              const handleFinish = () => {
                if (appContext?.nextStep) {
                  appContext.nextStep();
                }
              };
              
              return React.createElement('div', { className: "my-8 space-y-6" },
                React.createElement('div', { className: "p-6 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800" },
                  React.createElement('h3', { className: "text-xl font-semibold mb-2" }, "Lesson Completed!"),
                  React.createElement('p', { className: "text-muted-foreground" }, 
                    "Congratulations on completing this lesson."
                  )
                ),
                React.createElement(Button, { 
                  onClick: handleFinish,
                  className: "w-full py-6 text-lg"
                }, "Finish Lesson")
              );
            };
            
            // Add plugin settings
            component.pluginSettings = {
              replaceUserInput: true,
              hideNavigationButtons: true
            };
            
            return component;
          })(window.React, window.UI.Button);
        `);
        
        window.PluginRegistry.register('LessonCompletePlugin', LessonCompletePlugin);
        console.log('Language Learning Bootstrap: Registered LessonCompletePlugin');
        
        // Set up IndexedDB data
        const setupIndexedDB = async () => {
          if (!window.IndexedDBService) {
            console.warn('IndexedDBService not found, retrying in 2 seconds...');
            setTimeout(setupIndexedDB, 2000);
            return;
          }
          
          console.log('Language Learning Bootstrap: Setting up IndexedDB collections and data');
          
          try {
            // Define collections and data
            const collections = [
              {
                name: 'language_lessons',
                items: [
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
                ]
              },
              {
                name: 'language_exercises',
                items: [
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
                  }
                ]
              },
              {
                name: 'user_progress',
                items: [
                  {
                    id: 'user_default',
                    completedLessons: [],
                    completedExercises: [],
                    currentLessonId: 'lesson1',
                    currentExerciseId: 'exercise1',
                    score: 0
                  }
                ]
              }
            ];
            
            // Initialize collections and add data
            for (const collection of collections) {
              try {
                // Ensure collection exists
                await window.IndexedDBService.ensureCollection(collection.name);
                
                // Add items to the collection
                for (const item of collection.items) {
                  await window.IndexedDBService.saveItem(collection.name, item);
                }
                
                console.log(`Language Learning Bootstrap: Initialized collection: ${collection.name} with ${collection.items.length} items`);
              } catch (err) {
                console.error(`Error initializing collection ${collection.name}:`, err);
              }
            }
            
            console.log('Language Learning Bootstrap: IndexedDB setup complete');
          } catch (err) {
            console.error('Error setting up IndexedDB:', err);
          }
        };
        
        // Start the IndexedDB setup
        setupIndexedDB();
        
      } catch (error) {
        console.error('Language Learning Bootstrap: Error registering components:', error);
      }
    } else {
      console.log('Language Learning Bootstrap: React or PluginRegistry not found, retrying in 2 seconds');
      setTimeout(injectComponents, 2000);
    }
  };
  
  // Start the injection process when the page is fully loaded
  if (document.readyState === 'complete') {
    injectComponents();
  } else {
    window.addEventListener('load', injectComponents);
  }
})();