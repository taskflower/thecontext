import { useState, useEffect } from "react";
import { useAppStore } from "../../store";
import {
  CancelButton,
  DialogModal,
  InputField,
  SaveButton,
  TextAreaField,
  SelectField,
} from "@/components/studio";
import { getAvailableTemplates } from "@/modules/flow/components/templateFactory";
import { DialogTemplate } from "@/modules/flow/components/interfaces";

interface EditScenarioProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  scenarioId: string;
}

const EditScenario: React.FC<EditScenarioProps> = ({
  isOpen,
  setIsOpen,
  scenarioId,
}) => {
  const updateScenario = useAppStore((state) => state.updateScenario);
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template: "default" as DialogTemplate,
  });
  
  // Get available templates
  const templates = getAvailableTemplates().map(template => ({
    value: template,
    label: template.charAt(0).toUpperCase() + template.slice(1)
  }));

  // Load scenario data when component mounts or scenarioId changes
  useEffect(() => {
    if (isOpen && scenarioId) {
      const scenario = getCurrentScenario();
      if (scenario) {
        setFormData({
          name: scenario.name,
          description: scenario.description || "",
          template: scenario.template || "default",
        });
      }
    }
  }, [isOpen, scenarioId, getCurrentScenario]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    updateScenario(scenarioId, {
      name: formData.name,
      description: formData.description,
      template: formData.template,
    });
    setIsOpen(false);
  };
  
  // Handle template select change
  const handleTemplateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      template: value as DialogTemplate
    }));
  };

  const handleClose = () => setIsOpen(false);

  const renderFooter = () => (
    <>
      <CancelButton onClick={handleClose} />
      <SaveButton onClick={handleSubmit} disabled={!formData.name.trim()} />
    </>
  );

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Scenario"
      description="Update scenario details"
      footer={renderFooter()}
    >
      <InputField
        id="name"
        name="name"
        label="Name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Scenario name"
      />

      <TextAreaField
        id="description"
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleChange}
        placeholder="What this scenario is for..."
        rows={3}
      />
      
      <SelectField
        id="template"
        name="template"
        label="UI Template"
        value={formData.template}
        onChange={handleTemplateChange}
        options={templates}
        description="Select the UI template to use for this scenario's flow"
      />
    </DialogModal>
  );
};

export default EditScenario;