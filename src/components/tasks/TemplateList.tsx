import { FC, useState } from "react";
import { Trans } from "@lingui/macro";

import { Template } from "@/types/template";
import { useTasksStore } from "@/store/tasksStore";

interface TemplateListProps {
  onEdit: (template: Template) => void;
  onRun: (template: Template) => void;
}

export const TemplateList: FC<TemplateListProps> = ({ onEdit, onRun }) => {
  const { templates } = useTasksStore();
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <div key={template.id} className="border rounded-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-gray-500">{template.description}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() =>
                  setPreviewTemplate((t) => (t?.id === template.id ? null : template))
                }
                className="px-3 py-1 border rounded-md hover:bg-gray-100"
              >
                <Trans>Preview</Trans>
              </button>
              <button
                onClick={() => onEdit(template)}
                className="px-3 py-1 border rounded-md hover:bg-gray-100"
              >
                <Trans>Edit</Trans>
              </button>
              <button
                onClick={() => onRun(template)}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <Trans>Run</Trans>
              </button>
            </div>
          </div>

          {previewTemplate?.id === template.id && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">
                <Trans>Steps:</Trans>
              </h4>
              {template.steps.map((step, index) => (
                <div key={step.id} className="mb-2">
                  <p className="font-medium">
                  <Trans>Step {index + 1}: {step.name}</Trans>
                  </p>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              ))}
              <button
                onClick={() => setPreviewTemplate(null)}
                className="mt-2 text-sm text-blue-500 hover:underline"
              >
                <Trans>Close Preview</Trans>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
