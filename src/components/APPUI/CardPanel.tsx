import { SectionHeader } from "./SectionHeader";
interface CardPanelProps {
    title: string;
    children: React.ReactNode;
    onAddClick: () => void;
  }
export const CardPanel: React.FC<CardPanelProps> = ({ title, children, onAddClick }) => (
    <div className="bg-white rounded-md shadow-sm mb-3">
      <div className="p-3">
        <SectionHeader title={title} onAddClick={onAddClick} />
        {children}
      </div>
    </div>
  );