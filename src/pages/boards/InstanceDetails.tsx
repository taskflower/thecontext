import { useKanbanStore } from "@/store/kanbanStore";
import { useParams } from "react-router-dom";

// src/pages/roadmap/instances/InstanceDetails.tsx
export const InstanceDetails = () => {
    const { id } = useParams();
    const { instances } = useKanbanStore();
    const instance = instances.find(i => i.id === id);
  
    if (!instance) return <div>Instance not found</div>;
  
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1>{instance.name}</h1>
        <div className="mt-4">
          <h2>Tasks Progress</h2>
          <div className="space-y-2">
            {instance.tasks.map(task => (
              <div key={task.id} className="flex justify-between">
                <span>{task.templateTaskId}</span>
                <span>{task.status}</span>
                {task.completedAt && <span>{task.completedAt.toLocaleDateString()}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };