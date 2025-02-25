// src/store/taskStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { taskActions } from "@/utils/tasks/taskActions";
import { stepActions } from "@/utils/tasks/stepActions";
import { templateActions } from "@/utils/tasks/templateActions";
import { taskFormActions } from "@/utils/tasks/taskFormActions";
import { taskAIActions } from "@/utils/tasks/taskAIActions";
import { TaskState } from "@/utils/tasks/tasksInterfaces";
import { defaultTemplates } from "@/utils/tasks/defaultTemplates";

// Łączymy interfejs danych z akcjami przy pomocy typu przecięcia.
// Dzięki temu sklep zawiera zarówno dane, jak i metody akcji.
export type TaskStore = TaskState &
  ReturnType<typeof taskActions> &
  ReturnType<typeof stepActions> &
  ReturnType<typeof templateActions> &
  ReturnType<typeof taskFormActions> &
  ReturnType<typeof taskAIActions>;

  export const useTaskStore = create<TaskStore, [["zustand/persist", unknown]]>(
    persist(
      (set, get) => ({
        // Dane i stan UI
        tasks: [],
        templates: defaultTemplates,
        selectedTaskId: null,
        isDialogOpen: false,
        taskFormData: {
          title: "",
          description: "",
          priority: "medium",
          containerId: "",
          templateId: "",
        },
        editingTaskId: null,
        selectedStatusFilter: "all",
  
        // Akcje
        ...taskActions(set, get),
        ...stepActions(set, get),
        ...templateActions(set, get),
        ...taskFormActions(set, get),
        ...taskAIActions(set, get),
      }),
      {
        name: "task-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          tasks: state.tasks,
          templates: state.templates,
        }),
      }
    )
  );
  
