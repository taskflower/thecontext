/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/tasks/editors/ResponseMappingEditor.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import {
  IEntityMapping,
  IResponseAction,
} from "@/utils/tasks/response/responseTypes";

interface ResponseMappingEditorProps {
  value: IResponseAction;
  onChange: (config: IResponseAction) => void;
}

export const ResponseMappingEditor: React.FC<ResponseMappingEditorProps> = ({
  value,
  onChange,
}) => {
  const addEntityMapping = () => {
    onChange({
      ...value,
      entityMappings: [
        ...(value.entityMappings || []),
        {
          entityType: "container",
          sourcePath: "",
          fieldMapping: {},
        },
      ],
    });
  };

  const updateEntityMapping = (
    index: number,
    updates: Partial<IEntityMapping>
  ) => {
    if (!value.entityMappings) return;

    const newMappings = [...value.entityMappings];
    newMappings[index] = { ...newMappings[index], ...updates };
    onChange({ ...value, entityMappings: newMappings });
  };

  const removeEntityMapping = (index: number) => {
    if (!value.entityMappings) return;

    onChange({
      ...value,
      entityMappings: value.entityMappings.filter((_, i) => i !== index),
    });
  };

  const addFieldMapping = (
    mappingIndex: number,
    targetField: string,
    sourcePath: string
  ) => {
    if (!value.entityMappings) return;

    const newMappings = [...value.entityMappings];
    newMappings[mappingIndex].fieldMapping = {
      ...newMappings[mappingIndex].fieldMapping,
      [targetField]: sourcePath,
    };

    onChange({ ...value, entityMappings: newMappings });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Konfiguracja mapowania odpowiedzi</h3>

      <div>
        <label className="text-sm">Typ akcji</label>
        <Select
          value={value.type}
          onValueChange={(type) => onChange({ ...value, type: type as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="execute">Tylko wykonaj krok</SelectItem>
            <SelectItem value="map_to_fields">
              Mapuj do pól następnych kroków
            </SelectItem>
            <SelectItem value="create_entities">
              Twórz obiekty systemu
            </SelectItem>
            <SelectItem value="custom">Niestandardowa akcja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {value.type === "create_entities" && (
        <div className="space-y-4">
          <h4 className="font-medium">Mapowania obiektów</h4>

          {value.entityMappings?.map((mapping, index) => (
            <div key={index} className="p-3 border rounded-md space-y-3">
              <div className="flex justify-between items-center">
                <h5 className="font-medium">Mapowanie {index + 1}</h5>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeEntityMapping(index)}
                >
                  Usuń
                </Button>
              </div>

              <div>
                <label className="text-sm">Typ obiektu</label>
                <Select
                  value={mapping.entityType}
                  onValueChange={(value) =>
                    updateEntityMapping(index, { entityType: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="container">Kontener</SelectItem>
                    <SelectItem value="document">Dokument</SelectItem>
                    <SelectItem value="task">Zadanie</SelectItem>
                    <SelectItem value="template">Szablon</SelectItem>
                    <SelectItem value="project">Projekt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm">Ścieżka źródłowa</label>
                <Input
                  value={mapping.sourcePath}
                  onChange={(e) =>
                    updateEntityMapping(index, { sourcePath: e.target.value })
                  }
                  placeholder="np. containers[0] lub containers"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ścieżka w odpowiedzi JSON, która zawiera dane dla tego typu
                  obiektu.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm">Mapowanie pól</label>

                {Object.entries(mapping.fieldMapping).map(
                  ([targetField, sourcePath], i) => (
                    <div key={i} className="flex space-x-2">
                      <Input
                        value={targetField}
                        onChange={(e) => {
                          const newMapping = { ...mapping.fieldMapping };
                          delete newMapping[targetField];
                          newMapping[e.target.value] = sourcePath;
                          updateEntityMapping(index, {
                            fieldMapping: newMapping,
                          });
                        }}
                        placeholder="Pole docelowe"
                        className="flex-1"
                      />
                      <Input
                        value={sourcePath}
                        onChange={(e) => {
                          const newMapping = { ...mapping.fieldMapping };
                          newMapping[targetField] = e.target.value;
                          updateEntityMapping(index, {
                            fieldMapping: newMapping,
                          });
                        }}
                        placeholder="Ścieżka źródłowa"
                        className="flex-1"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newMapping = { ...mapping.fieldMapping };
                          delete newMapping[targetField];
                          updateEntityMapping(index, {
                            fieldMapping: newMapping,
                          });
                        }}
                      >
                        X
                      </Button>
                    </div>
                  )
                )}

                <div className="flex space-x-2">
                  <Input
                    placeholder="Nowe pole docelowe"
                    id={`new-target-${index}`}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Nowa ścieżka źródłowa"
                    id={`new-source-${index}`}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const targetInput = document.getElementById(
                        `new-target-${index}`
                      ) as HTMLInputElement;
                      const sourceInput = document.getElementById(
                        `new-source-${index}`
                      ) as HTMLInputElement;

                      if (targetInput.value && sourceInput.value) {
                        addFieldMapping(
                          index,
                          targetInput.value,
                          sourceInput.value
                        );
                        targetInput.value = "";
                        sourceInput.value = "";
                      }
                    }}
                  >
                    Dodaj
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button onClick={addEntityMapping}>Dodaj mapowanie obiektu</Button>
        </div>
      )}

      {value.type === "map_to_fields" && (
        <div className="space-y-3">
          <h4 className="font-medium">Mapowanie do pól następnych kroków</h4>

          {Object.entries(value.fieldMappings || {}).map(
            ([targetPath, sourcePath], index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  value={targetPath}
                  onChange={(e) => {
                    const newMappings = { ...value.fieldMappings };
                    delete newMappings?.[targetPath];
                    newMappings[e.target.value] = sourcePath;
                    onChange({ ...value, fieldMappings: newMappings });
                  }}
                  placeholder="stepId.fieldName"
                  className="flex-1"
                />
                <Input
                  value={sourcePath}
                  onChange={(e) => {
                    const newMappings = { ...value.fieldMappings };
                    newMappings[targetPath] = e.target.value;
                    onChange({ ...value, fieldMappings: newMappings });
                  }}
                  placeholder="ścieżka.w.odpowiedzi"
                  className="flex-1"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const newMappings = { ...value.fieldMappings };
                    delete newMappings?.[targetPath];
                    onChange({ ...value, fieldMappings: newMappings });
                  }}
                >
                  X
                </Button>
              </div>
            )
          )}

          <div className="flex space-x-2">
            <Input
              placeholder="Nowa ścieżka docelowa"
              id="new-target-field"
              className="flex-1"
            />
            <Input
              placeholder="Nowa ścieżka źródłowa"
              id="new-source-field"
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const targetInput = document.getElementById(
                  "new-target-field"
                ) as HTMLInputElement;
                const sourceInput = document.getElementById(
                  "new-source-field"
                ) as HTMLInputElement;

                if (targetInput.value && sourceInput.value) {
                  const newMappings = { ...(value.fieldMappings || {}) };
                  newMappings[targetInput.value] = sourceInput.value;
                  onChange({ ...value, fieldMappings: newMappings });
                  targetInput.value = "";
                  sourceInput.value = "";
                }
              }}
            >
              Dodaj
            </Button>
          </div>
        </div>
      )}

      {value.type === "custom" && (
        <div className="space-y-3">
          <div>
            <label className="text-sm">
              Identyfikator niestandardowej akcji
            </label>
            <Input
              value={value.customHandler || ""}
              onChange={(e) =>
                onChange({ ...value, customHandler: e.target.value })
              }
              placeholder="np. generate_report"
            />
          </div>
        </div>
      )}
    </div>
  );
};
