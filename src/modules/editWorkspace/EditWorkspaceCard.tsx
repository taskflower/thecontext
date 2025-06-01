// src/modules/editWorkspace/EditWorkspaceCard.tsx
import React, { useState, useEffect } from "react";
import { TreePine, Database, Edit3 } from "lucide-react";

import { WorkspaceInfo } from "../appTree/hooks/useAppTree";
import SimpleSchemaEditor from "../simpleSchemaEditor/SimpleSchemaEditor";
import { configDB } from "@/provideDB";
import { useModalState } from "../shared/hooks/useModalState";
import { BaseModal } from "../shared/components/BaseModal";
import { FormField } from "../shared/components/FormField";

interface EditWorkspaceCardProps {
  workspace: WorkspaceInfo;
  configName: string;
  onClose: () => void;
}

const EditWorkspaceCard: React.FC<EditWorkspaceCardProps> = ({
  workspace,
  configName,
  onClose,
}) => {
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);
  const { loading, saving, error,  handleAsync } = useModalState();

  // Form states
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState("");
  const [layoutFile, setLayoutFile] = useState("Simple");

  useEffect(() => {
    handleAsync(async () => {
      const configKey = `${configName}:/src/_configs/${configName}/workspaces/${workspace.slug}.json`;
      const cachedData = await configDB.records.get(configKey);

      if (cachedData) {
        setWorkspaceData(cachedData.data);
        setName(cachedData.data.name || workspace.name);
        setDescription(cachedData.data.description || "");
        setLayoutFile(cachedData.data.templateSettings?.layoutFile || "Simple");
      } else {
        try {
          const response = await fetch(
            `/src/_configs/${configName}/workspaces/${workspace.slug}.json`
          );
          if (response.ok) {
            const data = await response.json();
            setWorkspaceData(data);
            setName(data.name || workspace.name);
            setDescription(data.description || "");
            setLayoutFile(data.templateSettings?.layoutFile || "Simple");
            await configDB.records.put({
              id: configKey,
              data,
              updatedAt: new Date(),
            });
          } else throw new Error("File not found");
        } catch {
          const defaultData = {
            slug: workspace.slug,
            name: workspace.name,
            templateSettings: { layoutFile: "Simple", widgets: [] },
            contextSchema: {},
          };
          setWorkspaceData(defaultData);
          setName(defaultData.name);
          setLayoutFile(defaultData.templateSettings.layoutFile);
        }
      }
    });
  }, [workspace, configName]);

  const handleSave = () =>
    handleAsync(async () => {
      if (!workspaceData) return;
      const updatedData = {
        ...workspaceData,
        name,
        description,
        templateSettings: { ...workspaceData.templateSettings, layoutFile },
      };
      const configKey = `${configName}:/src/_configs/${configName}/workspaces/${workspace.slug}.json`;
      await configDB.records.put({
        id: configKey,
        data: updatedData,
        updatedAt: new Date(),
      });
      setWorkspaceData(updatedData);
      setTimeout(() => window.location.reload(), 600);
    }, "save");

  const getSchemaStats = () => {
    if (!workspaceData?.contextSchema) return { schemas: 0, fields: 0 };
    const schemas = Object.keys(workspaceData.contextSchema).length;
    const fields = Object.values(workspaceData.contextSchema).reduce(
      (total: number, schema: any) =>
        total + Object.keys(schema.properties || {}).length,
      0
    );
    return { schemas, fields };
  };

  if (loading)
    return (
      <BaseModal
        title="Loading..."
        onClose={onClose}
        icon={<TreePine size={14} />}
      >
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-zinc-200 rounded w-3/4"></div>
          ))}
        </div>
      </BaseModal>
    );

  const stats = getSchemaStats();
  const layoutOptions = [
    { value: "Simple", label: "Simple" },
    { value: "UniversalLayout", label: "Universal Layout" },
    { value: "Dashboard", label: "Dashboard" },
    { value: "Minimal", label: "Minimal" },
  ];

  const actions = (
    <div className="flex justify-between items-center">
      <button
        onClick={onClose}
        className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-800"
        disabled={saving}
      >
        Cancel
      </button>
      <div className="flex gap-2">
        <button
          onClick={() => setShowSchemaEditor(true)}
          disabled={saving}
          className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
        >
          <Database size={10} /> Schemas
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-3 py-1.5 text-xs text-white rounded flex items-center gap-1 ${
            saving ? "bg-zinc-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {saving ? "Saving..." : "💾 Save"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <BaseModal
        title="Edit Workspace"
        subtitle={workspace.slug}
        icon={<TreePine size={14} />}
        onClose={onClose}
        actions={actions}
        position={2}
      >
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-zinc-900">
              📝 Basic Settings
            </h4>
            <FormField
              label="Workspace Name"
              value={name}
              onChange={setName}
              placeholder="Workspace name"
            />
            <FormField
              label="Description"
              type="textarea"
              value={description}
              onChange={setDescription}
              placeholder="Optional description..."
            />
            <FormField
              label="Layout Template"
              type="select"
              value={layoutFile}
              onChange={setLayoutFile}
              options={layoutOptions}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-zinc-900 flex items-center gap-1">
                <Database size={12} />
                Data Schemas
              </h4>
              <button
                onClick={() => setShowSchemaEditor(true)}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
              >
                <Edit3 size={10} />
                Edit
              </button>
            </div>
            <div className="p-3 bg-zinc-50 rounded border">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {stats.schemas}
                  </div>
                  <div className="text-xs text-zinc-500">schemas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {stats.fields}
                  </div>
                  <div className="text-xs text-zinc-500">fields</div>
                </div>
              </div>
              {stats.schemas > 0 ? (
                <div className="space-y-1">
                  {Object.entries(workspaceData?.contextSchema || {}).map(
                    ([name, schema]: [string, any]) => (
                      <div
                        key={name}
                        className="flex justify-between bg-white px-2 py-1.5 rounded text-xs"
                      >
                        <span className="font-medium">{name}</span>
                        <span className="text-zinc-500">
                          {Object.keys(schema.properties || {}).length}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-3">
                  <div className="text-zinc-400 text-xs mb-2">
                    No schemas defined
                  </div>
                  <button
                    onClick={() => setShowSchemaEditor(true)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                  >
                    Add Schema
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </BaseModal>

      {showSchemaEditor && workspaceData && (
        <SimpleSchemaEditor
          schema={workspaceData.contextSchema || {}}
          onSchemaChange={(newSchema) =>
            setWorkspaceData((prev: any) => ({
              ...prev,
              contextSchema: newSchema,
            }))
          }
          onClose={() => setShowSchemaEditor(false)}
          title="Schema Editor"
          workspaceName={workspace.name}
        />
      )}
    </>
  );
};

export default EditWorkspaceCard;
