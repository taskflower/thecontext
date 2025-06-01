// src/modules/configsManager/ConfigsManagerCard.tsx
import React from "react";
import { X } from "lucide-react";
import { BaseModal } from "../shared/components/BaseModal";

interface ConfigsManagerCardProps {
  onClose: () => void;
}

const ConfigsManagerCard: React.FC<ConfigsManagerCardProps> = ({ onClose }) => {
  return (
    <BaseModal
      title="Configs Manager"
      position={2}
      onClose={onClose}
      icon={<X size={14} />} // można zmienić ikonę wedle potrzeby
    >
      <div className="p-4">
        <p className="text-sm text-zinc-600">
          Tutaj wstaw zawartość ConfigsManager (lista konfiguracji, edycja, itd.).
        </p>
      </div>
    </BaseModal>
  );
};

export default ConfigsManagerCard;
