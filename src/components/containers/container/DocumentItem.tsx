import { IContainerDocument } from "@/utils/containers/types";

// components/container/DocumentItem.tsx
interface DocumentItemProps {
    document: IContainerDocument;
  }
  
  export const DocumentItem: React.FC<DocumentItemProps> = ({ document }) => {
    return (
      <div className="p-2 border rounded mb-2">
        <h4 className="font-medium">{document.title}</h4>
        <p className="text-sm">{document.content}</p>
        {Object.entries(document.customFields).map(([key, value]) => (
          <p key={key} className="text-sm">
            {key}: {String(value)}
          </p>
        ))}
      </div>
    );
  };