import { useState } from "react";


import { ContainerList } from "@/components/documents/ContainerList";
import { DocumentList } from "@/components/documents/DocumentList";
import { DocumentDetail } from "@/components/documents/DocumentDetail";
import { IContainer, IContainerDocument } from "@/utils/documents/documentTypes";



export default function ContainersPage() {
  const [selectedContainer, setSelectedContainer] = useState<IContainer | null>(
    null
  );
  const [selectedDocument, setSelectedDocument] =
    useState<IContainerDocument | null>(null);

  return (
    <div className="grid grid-cols-12  h-[calc(100vh-120px)]">
      <div className="col-span-3">
        <ContainerList onSelectContainer={setSelectedContainer} />
      </div>
      <div className="col-span-3">
        <DocumentList
          container={selectedContainer}
          onSelectDocument={setSelectedDocument}
        />
      </div>
      <div className="col-span-6">
        <DocumentDetail
          container={selectedContainer}
          document={selectedDocument}
        />
      </div>
    </div>
  );
}
