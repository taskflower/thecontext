/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

interface DailyPriceViewProps {
  hourData: any;
  selectedHour: number;
  selectedDate: string;
}

const DailyPriceView: React.FC<DailyPriceViewProps> = ({ 
  hourData, 
  selectedHour,
  selectedDate
}) => {
  if (!hourData) return null;
  
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h2 className="text-lg font-semibold mb-2">
        RB-RDN dla godziny {selectedHour}:00 w dniu {selectedDate}
      </h2>
      
      <div className="p-4 border rounded bg-blue-50">
        <h3 className="font-medium text-lg">Dane dla dnia {selectedDate}</h3>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="p-3 bg-white rounded shadow">
            <div className="text-sm text-gray-600">Cena RDN</div>
            <div className="text-xl font-bold">{hourData.rdnPrice} PLN/MWh</div>
          </div>
          <div className="p-3 bg-white rounded shadow">
            <div className="text-sm text-gray-600">Cena RB</div>
            <div className="text-xl font-bold">{hourData.rbPrice} PLN/MWh</div>
          </div>
          <div className="p-3 bg-white rounded shadow col-span-2">
            <div className="text-sm text-gray-600">Różnica RB-RDN</div>
            <div className={`text-xl font-bold ${hourData.priceDiff > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {hourData.priceDiff} PLN/MWh
            </div>
          </div>
        </div>
        <div className="text-sm mt-4 text-blue-800">
          <p>Wybrano konkretny dzień do analizy. Aby zobaczyć trend historyczny, wybierz opcję "Wszystkie dostępne dni".</p>
        </div>
      </div>
    </div>
  );
};

export default DailyPriceView;