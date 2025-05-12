// src/themes/energygrant/widgets/OrderDetailsWidget.tsx
import React from 'react';

interface OrderDetailsWidgetProps {
  contextDataPath: string;
  data?: any;
}

const OrderDetailsWidget: React.FC<OrderDetailsWidgetProps> = ({ data }) => {
  if (!data) {
    return <div className="p-4 border rounded bg-gray-50">Brak danych zlecenia</div>;
  }

  // Sprawdzenie typu zlecenia (na podstawie pól formularza)
  const isAuditor = data.buildingType !== undefined;

  return (
    <div className="border rounded p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Szczegóły zapotrzebowania</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {data.address && (
          <div>
            <span className="font-medium text-gray-600">Adres:</span>
            <p>{data.address}</p>
          </div>
        )}
        
        {data.postalCode && data.city && (
          <div>
            <span className="font-medium text-gray-600">Lokalizacja:</span>
            <p>{data.postalCode} {data.city}</p>
          </div>
        )}
        
        {data.phone && (
          <div>
            <span className="font-medium text-gray-600">Telefon kontaktowy:</span>
            <p>{data.phone}</p>
          </div>
        )}
        
        {/* Pola specyficzne dla audytora */}
        {data.buildingType && (
          <div>
            <span className="font-medium text-gray-600">Typ budynku:</span>
            <p>{data.buildingType}</p>
          </div>
        )}
        
        {data.buildingArea && (
          <div>
            <span className="font-medium text-gray-600">Powierzchnia:</span>
            <p>{data.buildingArea} m²</p>
          </div>
        )}
        
        {data.constructionYear && (
          <div>
            <span className="font-medium text-gray-600">Rok budowy:</span>
            <p>{data.constructionYear}</p>
          </div>
        )}
        
        {data.urgency && (
          <div>
            <span className="font-medium text-gray-600">Pilność wykonania:</span>
            <p>{data.urgency}</p>
          </div>
        )}
        
        {/* Pola specyficzne dla wykonawcy */}
        {data.scope && (
          <div>
            <span className="font-medium text-gray-600">Zakres prac:</span>
            <p>{data.scope}</p>
          </div>
        )}
        
        {data.scopeDescription && (
          <div className="col-span-1 md:col-span-2">
            <span className="font-medium text-gray-600">Szczegółowy opis zakresu:</span>
            <p>{data.scopeDescription}</p>
          </div>
        )}
        
        {data.hasAudit !== undefined && (
          <div>
            <span className="font-medium text-gray-600">Audyt energetyczny:</span>
            <p>{data.hasAudit ? 'Załączony' : 'Brak'}</p>
          </div>
        )}
        
        {data.auditFile && (
          <div>
            <span className="font-medium text-gray-600">Plik audytu:</span>
            <p>{data.auditFile}</p>
          </div>
        )}
      </div>
      
      {data.comments && (
        <div className="mt-4 border-t pt-3">
          <span className="font-medium text-gray-600">Uwagi dodatkowe:</span>
          <p className="whitespace-pre-line">{data.comments}</p>
        </div>
      )}
      
      <div className="mt-4 text-right text-sm text-gray-500">
        Typ zlecenia: {isAuditor ? 'Audytor' : 'Wykonawca'}
      </div>
    </div>
  );
};

export default OrderDetailsWidget;