import { useState, useEffect } from "react";
import { useAppStore } from "../../store";
import {
  CancelButton,
  DialogModal,
  InputField,
  SaveButton,
  TextAreaField,
} from "@/components/studio";

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
  });

  // Load scenario data when component mounts or scenarioId changes
  useEffect(() => {
    if (isOpen && scenarioId) {
      const scenario = getCurrentScenario();
      if (scenario) {
        setFormData({
          name: scenario.name,
          description: scenario.description || "",
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
    });
    setIsOpen(false);
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
    </DialogModal>
  );
};

export default EditScenario;