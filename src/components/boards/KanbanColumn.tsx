import {
  KanbanStatus,
  KanbanInstance,
  KanbanBoard,
  KanbanTaskTemplate
} from "@/types/kaban";
import { FC } from "react";
import { Card, CardContent } from "../ui/card";
import StatusIcon from "./StatusIcon";

export const KanbanColumn: FC<{
  status: KanbanStatus;
  instance: KanbanInstance;
  template: KanbanBoard;
  onTaskClick: (taskId: string) => void;
}> = ({ status, instance, template, onTaskClick }) => {
  const columnTasks = instance.tasks.filter((task) => task.status === status);

  return (
    <div className="flex-1 min-h-[500px]">
      <div className="border-b px-6 py-3">
        <h3 className="text-sm font-medium">
          {status.charAt(0).toUpperCase() + status.slice(1)}
          <span className="ml-2 text-xs text-muted-foreground">
            ({columnTasks.length})
          </span>
        </h3>
      </div>
      <div className="space-y-3 p-px">
        {columnTasks.map((task) => {
          const templateTask = template.tasks.find(
            (t) => t.id === task.templateTaskId
          ) as KanbanTaskTemplate | undefined;
          
          const isBlocked = templateTask?.dependencies.some(
            (depId) =>
              !instance.tasks.find(
                (t) => t.templateTaskId === depId && t.status === "done"
              )
          );

          return (
            <Card
              key={task.id}
              className={
                isBlocked ? "opacity-50 " : "cursor-pointer hover:bg-accent"
              }
              onClick={() => !isBlocked && onTaskClick(task.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <StatusIcon status={task.status} />
                  <div className="font-medium text-sm">{templateTask?.name}</div>
                </div>
                
                <div className="text-sm text-muted-foreground mt-1">
                  {templateTask?.description}
                </div>
                
                {isBlocked && (
                  <div className="text-sm text-destructive mt-2 flex items-center">
                    <span className="w-1 h-1 rounded-full bg-destructive mr-2" />
                    Blocked by dependencies
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};