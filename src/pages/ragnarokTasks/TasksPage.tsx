import { useState } from 'react';

import { ITask } from '@/utils/ragnarok/types';
import { TaskList } from '@/components/ragnarok/TaskList';
import { TaskDetail } from '@/components/ragnarok/TaskDetail';

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);

  return (
  
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
        <div className="col-span-4">
          <TaskList onSelectTask={setSelectedTask} />
        </div>
        <div className="col-span-8">
          <TaskDetail task={selectedTask} />
        </div>
      </div>
   
  );
}