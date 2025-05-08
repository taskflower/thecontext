// src/debug/components/JsonSchemaRenderer.tsx
import React, { useState } from "react";

export type JsonSchema = {
  title?: string;
  description?: string;
  type?: string | string[];
  format?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  allOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  enum?: any[];
  const?: any;
  default?: any;
  examples?: any[];
  readOnly?: boolean;
  writeOnly?: boolean;
  deprecated?: boolean;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
  items?: JsonSchema;
  [key: string]: any;
};

interface NodeProps {
  name: string;
  schema: JsonSchema;
  required?: boolean;
  parentType?: string;
  isLastSibling?: boolean;
}

interface SchemaRendererProps {
  schema: JsonSchema;
  rootName?: string;
}

// Get formatted type label
const getTypeLabel = (schema: JsonSchema): string => {
  if (!schema.type) return "";

  const type = Array.isArray(schema.type)
    ? schema.type.join(" or ")
    : schema.type;

  if (type === "array" && schema.items) {
    const itemsType = schema.items.type;
    if (Array.isArray(itemsType)) {
      return `array[${itemsType.join(" or ")}]`;
    } else if (itemsType) {
      return `array[${itemsType}]`;
    }
    return "array";
  }

  if (schema.format) {
    return `${type}<${schema.format}>`;
  }

  return type;
};

// Constraint Badge Component
const ConstraintBadge: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span className="inline-block bg-gray-100 rounded-sm text-xs px-2 py-1 mr-1 mb-1 border border-gray-200">
    {children}
  </span>
);

// The Node component represents a single item in the schema tree
const SchemaNode: React.FC<NodeProps> = ({
  name,
  schema,
  required = false,
  parentType,
  isLastSibling = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const typeLabel = getTypeLabel(schema);

  // Status badges
  const statusBadges = [];
  if (schema.readOnly)
    statusBadges.push(
      <span key="ro" className="text-xs text-gray-500 ml-2">
        read-only
      </span>
    );
  if (schema.writeOnly)
    statusBadges.push(
      <span key="wo" className="text-xs text-gray-500 ml-2">
        write-only
      </span>
    );
  if (schema.deprecated)
    statusBadges.push(
      <span key="dep" className="text-xs text-orange-500 ml-2">
        deprecated
      </span>
    );
  if (required)
    statusBadges.push(
      <span key="req" className="text-xs text-orange-500 ml-2">
        required
      </span>
    );

  // Is this field collapsible?
  const isCollapsible =
    (schema.properties && Object.keys(schema.properties).length > 0) ||
    (schema.anyOf && schema.anyOf.length > 0) ||
    (schema.oneOf && schema.oneOf.length > 0) ||
    (schema.allOf && schema.allOf.length > 0) ||
    (parentType === "array" && name === "items");

  // For array type with items to display constraints
  const isArray = typeLabel.includes("array") || parentType === "array";

  // Tree line styles
  const verticalLine = !isLastSibling ? "border-l border-gray-300" : "";
  const horizontalLine = "border-t border-gray-300";
  const cornerLine = isLastSibling ? "border-l border-gray-300" : "";

  if (!isCollapsible) {
    // Leaf node
    return (
      <div className="relative">
        <div className="flex">
          <div className={`relative w-5 flex-shrink-0 ${verticalLine}`}>
            <div className={`absolute top-3 w-4 ${horizontalLine}`}></div>
            <div
              className={`absolute h-3 top-0 left-0 w-1 ${cornerLine}`}
            ></div>
          </div>
          <div className="pl-1 py-1 flex-grow">
            <div className="flex items-center">
              <span className="font-medium">{name}</span>
              <span className="ml-2 text-gray-500 text-sm">{typeLabel}</span>
              {statusBadges.length > 0 && statusBadges}
            </div>

            {schema.description && (
              <div className="text-sm text-gray-600 mt-1">
                {schema.description}
              </div>
            )}

            {/* Render constraints */}
            <div className="flex flex-wrap mt-1">
              {schema.minLength !== undefined && (
                <ConstraintBadge>{`>= ${schema.minLength} chars`}</ConstraintBadge>
              )}
              {schema.maxLength !== undefined && (
                <ConstraintBadge>{`<= ${schema.maxLength} chars`}</ConstraintBadge>
              )}
              {schema.minimum !== undefined && (
                <ConstraintBadge>{`>= ${schema.minimum}`}</ConstraintBadge>
              )}
              {schema.maximum !== undefined && (
                <ConstraintBadge>{`<= ${schema.maximum}`}</ConstraintBadge>
              )}
              {schema.pattern && (
                <ConstraintBadge>pattern: {schema.pattern}</ConstraintBadge>
              )}
              {schema.multipleOf !== undefined && (
                <ConstraintBadge>
                  multiple of {schema.multipleOf}
                </ConstraintBadge>
              )}
            </div>

            {schema.enum && schema.enum.length > 0 && (
              <div className="mt-1">
                <span className="text-xs font-medium">Values:</span>{" "}
                <div className="flex flex-wrap mt-1">
                  {schema.enum.map((value, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 rounded-sm px-2 py-1 text-xs mr-1 mb-1 border border-gray-200"
                    >
                      {String(value)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {schema.default !== undefined && (
              <div className="mt-1">
                <span className="text-xs font-medium">Default:</span>{" "}
                <span className="bg-gray-100 rounded-sm px-2 py-1 text-xs border border-gray-200">
                  {String(schema.default)}
                </span>
              </div>
            )}

            {schema.examples && schema.examples.length > 0 && (
              <div className="mt-1">
                <span className="text-xs font-medium">Examples:</span>{" "}
                <div className="flex flex-wrap mt-1">
                  {schema.examples.map((ex, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 rounded-sm px-2 py-1 text-xs mr-1 mb-1 border border-gray-200"
                    >
                      {String(ex)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Node with children
  return (
    <div className="relative">
      <div className="flex">
        <div className={`relative w-5 flex-shrink-0 ${verticalLine}`}>
          <div className={`absolute top-3 w-4 ${horizontalLine}`}></div>
          <div className={`absolute h-3 top-0 left-0 w-1 ${cornerLine}`}></div>
        </div>
        <div className="pl-1 flex-grow">
          <div
            className="flex items-center cursor-pointer py-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span
              className="mr-2 text-gray-500 inline-block w-3 text-center transform transition-transform"
              style={{
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              ›
            </span>
            <span className="font-medium">{name}</span>
            {typeLabel && (
              <span className="ml-2 text-gray-500 text-sm">{typeLabel}</span>
            )}
            {statusBadges.length > 0 && (
              <div className="ml-1">{statusBadges}</div>
            )}
          </div>

          {isExpanded && (
            <div className="pl-6 relative">
              {schema.description && (
                <div className="text-sm text-gray-600 mb-2">
                  {schema.description}
                </div>
              )}

              {/* Array constraints */}
              {isArray && (
                <div className="mb-2 flex flex-wrap">
                  {schema.minItems !== undefined && (
                    <ConstraintBadge>{`>= ${schema.minItems} items`}</ConstraintBadge>
                  )}
                  {schema.maxItems !== undefined && (
                    <ConstraintBadge>{`<= ${schema.maxItems} items`}</ConstraintBadge>
                  )}
                </div>
              )}

              {/* Children for object */}
              {schema.properties && (
                <div className="mb-3">
                  {Object.entries(schema.properties).map(
                    ([propName, propSchema], idx, arr) => (
                      <SchemaNode
                        key={propName}
                        name={propName}
                        schema={propSchema}
                        required={schema.required?.includes(propName)}
                        isLastSibling={idx === arr.length - 1}
                      />
                    )
                  )}
                </div>
              )}

              {/* Children for array */}
              {typeLabel.includes("array") && schema.items && (
                <div className="mb-3">
                  <SchemaNode
                    name="items"
                    schema={schema.items as JsonSchema}
                    parentType="array"
                    isLastSibling={true}
                  />
                </div>
              )}

              {/* anyOf */}
              {schema.anyOf && (
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">Any of:</div>
                  {schema.anyOf.map((subSchema, i, arr) => (
                    <SchemaNode
                      key={`anyOf-${i}`}
                      name={`Option ${i + 1}`}
                      schema={subSchema}
                      isLastSibling={i === arr.length - 1}
                    />
                  ))}
                </div>
              )}

              {/* oneOf */}
              {schema.oneOf && (
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">One of:</div>
                  {schema.oneOf.map((subSchema, i, arr) => (
                    <SchemaNode
                      key={`oneOf-${i}`}
                      name={`Option ${i + 1}`}
                      schema={subSchema}
                      isLastSibling={i === arr.length - 1}
                    />
                  ))}
                </div>
              )}

              {/* allOf */}
              {schema.allOf && (
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">All of:</div>
                  {schema.allOf.map((subSchema, i, arr) => (
                    <SchemaNode
                      key={`allOf-${i}`}
                      name={`AllOf ${i + 1}`}
                      schema={subSchema}
                      isLastSibling={i === arr.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Root component for rendering JSON Schema
export const JsonSchemaRenderer: React.FC<SchemaRendererProps> = ({
  schema,
  rootName = "root",
}) => {
  if (!schema) {
    return <div className="p-4 text-gray-500 italic">No schema available</div>;
  }

  // Special case for array root
  const isArrayRoot = schema.type === "array";

  if (isArrayRoot) {
    return (
      <div className="p-2">
        <div className="bg-gray-50 px-3 py-2 mb-2 font-medium rounded-sm border border-gray-200">
          <div className="flex items-center">
            <span>Array of:</span>
            {schema.minItems !== undefined && (
              <ConstraintBadge>{`>= ${schema.minItems} items`}</ConstraintBadge>
            )}
            {schema.maxItems !== undefined && (
              <ConstraintBadge>{`<= ${schema.maxItems} items`}</ConstraintBadge>
            )}
          </div>
        </div>
        {schema.items && (
          <SchemaNode
            name="items"
            schema={schema.items as JsonSchema}
            parentType="array"
            isLastSibling={true}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-2">
      <SchemaNode name={rootName} schema={schema} isLastSibling={true} />
    </div>
  );
};

export default JsonSchemaRenderer;
