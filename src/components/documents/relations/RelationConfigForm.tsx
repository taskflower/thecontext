// src/components/documents/relations/RelationConfigForm.tsx
import React from "react";
import { DocumentContainer } from "@/types/document";
import { Trans } from "@lingui/macro";
import { RelationType } from "@/types/relation";
import { Card, CardContent, Input, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";


type MatchType = "exact" | "contains" | "startsWith" | "endsWith";

interface RelationRule {
  sourceField: string;
  targetField: string;
  matchType: MatchType;
}

interface FormData {
  sourceContainerId: string;
  targetContainerId: string;
  type: RelationType;
  name: string;
  description: string;
  rules: RelationRule[];
}

interface RelationConfigFormProps {
  containers: DocumentContainer[];
  onSubmit: (data: FormData) => void;
}

export const RelationConfigForm: React.FC<RelationConfigFormProps> = ({
  containers,
  onSubmit,
}) => {
  const [formData, setFormData] = React.useState<FormData>({
    sourceContainerId: "",
    targetContainerId: "",
    type: "OneToOne",
    name: "",
    description: "",
    rules: [{ sourceField: "title", targetField: "title", matchType: "exact" }],
  });

  const sourceContainer = containers.find(
    (c) => c.id === formData.sourceContainerId
  );
  const targetContainer = containers.find(
    (c) => c.id === formData.targetContainerId
  );

  const getContainerFields = (container?: DocumentContainer) => {
    const fields = ["title", "content"];
    if (container?.schema?.fields) {
      fields.push(...container.schema.fields.map((f) => f.key));
    }
    return fields;
  };

  const addRule = () => {
    setFormData((prev) => ({
      ...prev,
      rules: [
        ...prev.rules,
        { sourceField: "title", targetField: "title", matchType: "exact" },
      ],
    }));
  };

  const updateRule = (index: number, updates: Partial<RelationRule>) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.map((rule, i) =>
        i === index ? { ...rule, ...updates } : rule
      ),
    }));
  };

  const removeRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                <Trans>Name</Trans>
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                <Trans>Relation Type</Trans>
              </label>
              <Select
                value={formData.type}
                onValueChange={(value: RelationType) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OneToOne">One to One</SelectItem>
                  <SelectItem value="OneToMany">One to Many</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                <Trans>Source Container</Trans>
              </label>
              <Select
                value={formData.sourceContainerId}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    sourceContainerId: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source container" />
                </SelectTrigger>
                <SelectContent>
                  {containers.map((container) => (
                    <SelectItem key={container.id} value={container.id}>
                      {container.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                <Trans>Target Container</Trans>
              </label>
              <Select
                value={formData.targetContainerId}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    targetContainerId: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target container" />
                </SelectTrigger>
                <SelectContent>
                  {containers.map((container) => (
                    <SelectItem key={container.id} value={container.id}>
                      {container.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">
                <Trans>Matching Rules</Trans>
              </h3>
              <Button type="button" variant="outline" onClick={addRule}>
                <Trans>Add Rule</Trans>
              </Button>
            </div>

            {formData.rules.map((rule, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-4 p-4 border rounded-lg"
              >
                <Select
                  value={rule.sourceField}
                  onValueChange={(value) =>
                    updateRule(index, { sourceField: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getContainerFields(sourceContainer).map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={rule.matchType}
                  onValueChange={(value: MatchType) =>
                    updateRule(index, { matchType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exact">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="startsWith">Starts with</SelectItem>
                    <SelectItem value="endsWith">Ends with</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={rule.targetField}
                  onValueChange={(value) =>
                    updateRule(index, { targetField: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getContainerFields(targetContainer).map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {formData.rules.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeRule(index)}
                    className="text-destructive col-span-3"
                  >
                    <Trans>Remove Rule</Trans>
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              <Trans>Create Relation Config</Trans>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RelationConfigForm;
