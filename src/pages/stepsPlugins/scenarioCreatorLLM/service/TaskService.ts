/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreatorLLM/service/TaskService.ts
import { Task, Scenario } from '@/types';
import { useTaskStore } from '@/store';
import { UtilityService } from './UtilityService';

export class TaskService {
  /**
   * Tworzy zadania na podstawie danych LLM
   */
  public static async createTasks(
    tasksData: any[],
    scenarioMapping: Record<string, string>,
    taskMapping: Record<string, string>
  ): Promise<Task[]> {
    const tasks: Task[] = [];
    const taskStore = useTaskStore.getState();
    
    if (!tasksData || tasksData.length === 0) {
      console.log("[TaskService] Brak zadań w danych LLM");
      return tasks;
    }
    
    for (const taskData of tasksData) {
      try {
        // Pobieranie ID scenariusza, do którego należy zadanie
        const scenarioId = scenarioMapping[taskData.scenarioRef];
        
        if (!scenarioId) {
          console.error(`[TaskService] Nie znaleziono scenariusza dla zadania: ${taskData.title}`);
          continue;
        }
        
        // Generowanie unikalnego ID
        const taskId = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Tworzenie zadania
        const task: Task = {
          id: taskId,
          title: taskData.title,
          description: taskData.description || '',
          status: 'todo',
          priority: taskData.priority || 'medium',
          dueDate: UtilityService.generateDueDate(14),
          scenarioId: scenarioId,
          currentStepId: null,
          data: {}
        };
        
        // Mapowanie tytułu zadania na ID
        taskMapping[taskData.title] = task.id;
        
        // Dodawanie do store'a
        const addResult = taskStore.addTask(task);
        
        if (addResult.success) {
          tasks.push(task);
        }
        
        await UtilityService.delay(50);
      } catch (error) {
        console.error(`[TaskService] Błąd tworzenia zadania: ${error}`);
      }
    }
    
    return tasks;
  }
  
  /**
   * Tworzy domyślne zadania dla scenariuszy
   */
  public static async createDefaultTasks(
    scenarios: Scenario[],
    taskMapping: Record<string, string>
  ): Promise<Task[]> {
    const tasks: Task[] = [];
    const taskStore = useTaskStore.getState();
    const taskTitles = ["Badania i planowanie", "Tworzenie treści", "Wdrożenie", "Przegląd i testy"];
    const priorities = ["high", "medium", "medium", "high"];
    
    for (const scenario of scenarios) {
      try {
        for (let i = 0; i < taskTitles.length; i++) {
          const taskId = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}-${i}`;
          
          // Tworzenie domyślnego zadania
          const task: Task = {
            id: taskId,
            title: taskTitles[i],
            description: `Domyślne zadanie dla ${scenario.title}`,
            status: 'todo',
            priority: priorities[i] as any,
            dueDate: UtilityService.generateDueDate(14),
            scenarioId: scenario.id,
            currentStepId: null,
            data: {}
          };
          
          // Mapowanie tytułu zadania na ID
          taskMapping[taskTitles[i]] = task.id;
          
          // Dodawanie do store'a
          const addResult = taskStore.addTask(task);
          
          if (addResult.success) {
            tasks.push(task);
          }
          
          await UtilityService.delay(50);
        }
      } catch (error) {
        console.error(`[TaskService] Błąd tworzenia domyślnych zadań: ${error}`);
      }
    }
    
    return tasks;
  }
}