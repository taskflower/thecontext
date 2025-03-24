import { useState } from "react";
import { useAppStore } from "../../store";
import {
  CancelButton,
  DialogModal,
  InputField,
  SaveButton,
  TextAreaField,
} from "@/components/studio";

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
  });

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
    });
    setFormData({ name: "", description: "" });
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
    </DialogModal>
  );
};

export default AddNewScenario;
