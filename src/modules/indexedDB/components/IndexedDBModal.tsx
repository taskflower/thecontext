// src/modules/indexedDB/components/IndexedDBModal.tsx
import React, { useState, useEffect } from 'react';
import { DialogModal } from '@/components/studio';
import IndexedDBViewer from './IndexedDBViewer';

interface IndexedDBEventDetail {
  collectionName: string;
  contextTitle: string;
}

const IndexedDBModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [collectionInfo, setCollectionInfo] = useState<{
    collectionName: string;
    isContextTitle: boolean;
  } | null>(null);

  useEffect(() => {
    const handleOpenViewer = (event: CustomEvent<IndexedDBEventDetail>) => {
      const detail = event.detail;
      
      if (detail.contextTitle) {
        setCollectionInfo({
          collectionName: detail.contextTitle,
          isContextTitle: true
        });
      } else if (detail.collectionName) {
        setCollectionInfo({
          collectionName: detail.collectionName,
          isContextTitle: false
        });
      }
      
      setIsOpen(true);
    };

    // Add event listener
    document.addEventListener(
      'openIndexedDBViewer',
      handleOpenViewer as EventListener
    );

    // Clean up
    return () => {
      document.removeEventListener(
        'openIndexedDBViewer',
        handleOpenViewer as EventListener
      );
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const renderFooter = () => (
    <button
      onClick={handleClose}
      className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md text-sm flex items-center"
    >
      Close
    </button>
  );

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={handleClose}
      title={`IndexedDB Collection: ${collectionInfo?.collectionName || ''}`}
      description="View and manage your IndexedDB collection data"
      footer={renderFooter()}
      
    >
      {collectionInfo && (
        <div className="max-h-[70vh] overflow-y-auto">
          <IndexedDBViewer
            collectionName={collectionInfo.collectionName}
            isContextTitle={collectionInfo.isContextTitle}
          />
        </div>
      )}
    </DialogModal>
  );
};

export default IndexedDBModal;