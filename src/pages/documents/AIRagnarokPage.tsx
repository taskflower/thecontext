// src/pages/AITasksPage.tsx
import { AITaskForm } from "@/components/ragnarok/AITaskForm";
import { AITaskList } from "@/components/ragnarok/AITaskList";
import { AITaskDetail } from "@/components/ragnarok/GenerateDocumentForm";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { useContainerStore } from "@/store/containerStore";
import { useTaskStore } from "@/store/taskStore";
import { Trans } from "@lingui/macro";

import React, { useState } from "react";

export const AIRagnarokPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const { selectedTaskId } = useTaskStore();
  const { containers, selectedContainer } = useContainerStore();

  return (
    <AdminOutletTemplate
      title={<Trans>Zadania AI</Trans>}
      actions={
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          {showForm ? "Anuluj" : "Nowe zadanie"}
        </button>
      }
      description={
        <Trans>View and manage all documents across containers</Trans>
      }
    >
      {showForm && (
        <div className="mb-8 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Utwórz nowe zadanie AI</h2>
          <div className="max-w-lg mx-auto">
            <AITaskForm containerId={selectedContainer} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Lista zadań</h2>
          <AITaskList />
        </div>

        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Szczegóły zadania</h2>
          {selectedTaskId ? (
            <AITaskDetail />
          ) : (
            <div className="p-4 text-center text-gray-500 border rounded-lg">
              Wybierz zadanie z listy lub utwórz nowe
            </div>
          )}
        </div>
      </div>
    </AdminOutletTemplate>
  );
};
