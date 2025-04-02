import { useState } from "react";
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

interface AddNewScenarioProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AddNewScenario: React.FC<AddNewScenarioProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const addScenario = useAppStore((state) => state.addScenario);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template: "default",
  });
  
  // Get available templates
  const templates = getAvailableTemplates().map(template => ({
    value: template,
    label: template.charAt(0).toUpperCase() + template.slice(1)
  }));

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
    addScenario({
      name: formData.name,
      description: formData.description,
      template: formData.template as DialogTemplate,
    });
    setFormData({ name: "", description: "", template: "default" });
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
      title="Add Scenario"
      description="Create a new scenario in your workspace"
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

export default AddNewScenario;
