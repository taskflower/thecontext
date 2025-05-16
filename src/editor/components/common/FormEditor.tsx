// src/editor/components/common/FormEditor.tsx
import React from "react";

interface FormEditorProps {
  schema: any;
  formData: any;
  onChange: (formData: any) => void;
}

export const FormEditor: React.FC<FormEditorProps> = ({
  schema,
  formData,
  onChange,
}) => {
  const getValue = (path: string) =>
    path.split(".").reduce((acc, part) => acc?.[part], formData);

  const setValue = (path: string, value: any) => {
    const updated = { ...formData };
    const parts = path.split(".");
    const last = parts.pop();
    if (!last) return;
    const target = parts.reduce((acc, part) => (acc[part] ??= {}), updated);
    target[last] = value;
    onChange(updated);
  };

  const renderField = (name: string, schema: any, path = "") => {
    const fullPath = path ? `${path}.${name}` : name;
    const value = getValue(fullPath);
    const commonProps = {
      className: "w-full px-3 py-2 border rounded-md text-sm",
      value: value ?? "",
      onChange: (e: any) => setValue(fullPath, e.target.value),
    };

    if (schema.enum)
      return (
        <div key={fullPath} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {schema.title || name}
          </label>
          <select {...commonProps}>
            <option value="">Wybierz...</option>
            {schema.enum.map((opt: string, i: number) => (
              <option key={opt} value={opt}>
                {schema.enumNames?.[i] || opt}
              </option>
            ))}
          </select>
        </div>
      );

    switch (schema.type) {
      case "string":
      case "number":
      case "integer":
        return (
          <div key={fullPath} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {schema.title || name}
            </label>
            <input
              type={schema.type === "string" ? "text" : "number"}
              {...commonProps}
              onChange={(e) =>
                setValue(
                  fullPath,
                  schema.type === "string"
                    ? e.target.value
                    : Number(e.target.value)
                )
              }
            />
          </div>
        );
      case "boolean":
        return (
          <div key={fullPath} className="mb-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => setValue(fullPath, e.target.checked)}
                className="mr-2"
              />
              {schema.title || name}
            </label>
          </div>
        );
      case "object":
        return (
          <div key={fullPath} className="mb-4 border p-3 rounded bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-2">
              {schema.title || name}
            </div>
            {Object.entries(schema.properties || {}).map(([k, v]) =>
              renderField(k, v, fullPath)
            )}
          </div>
        );
      case "array":
        const items = value || [];
        const itemSchema = schema.items || { type: "string" };
        return (
          <div key={fullPath} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {schema.title || name}
            </label>
            <div className="space-y-2">
              {items.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type={
                      itemSchema.type === "number" ||
                      itemSchema.type === "integer"
                        ? "number"
                        : "text"
                    }
                    className="flex-1 px-3 py-1.5 border rounded text-sm"
                    value={item}
                    onChange={(e) =>
                      setValue(fullPath, [
                        ...items.slice(0, i),
                        e.target.value,
                        ...items.slice(i + 1),
                      ])
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        fullPath,
                        items.filter((_: any, idx: number) => idx !== i)
                      )
                    }
                    className="text-red-600 text-sm"
                  >
                    Usuń
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setValue(fullPath, [...items, ""])}
                className="text-blue-600 text-sm"
              >
                + Dodaj element
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {Object.entries(schema.properties || {}).map(([name, s]) =>
        renderField(name, s)
      )}
    </div>
  );
};
