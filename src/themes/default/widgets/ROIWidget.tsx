// src/themes/default/widgets/ROIWidget.tsx
import { TrendingUp, DollarSign, PieChart } from 'lucide-react';

type ROIWidgetProps = {
  data?: {
    roi?: number;
    profits?: number;
    investment?: number;
  };
  title?: string;
};

export default function ROIWidget({ 
  data = {}, 
  title = "Analiza ROI" 
}: ROIWidgetProps) {
  const { roi = 0, profits = 0, investment = 0 } = data;
  
  // Określenie koloru dla ROI w zależności od wartości
  const getRoiColor = (value: number) => {
    if (value >= 20) return 'text-green-500';
    if (value >= 10) return 'text-green-400';
    if (value >= 0) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const roiColor = getRoiColor(roi);

  return (
    <div className="h-full">
      <div className="p-4 border-b border-gray-100">
        <h3 className="m-0 text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="p-4">
        <div className="space-y-3">
          <div className="bg-white p-3 rounded border border-gray-100 flex items-center">
            <div className="p-2 rounded-full bg-blue-50 mr-3">
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">ROI</p>
              <p className={`text-base font-semibold ${roiColor}`}>{roi}%</p>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded border border-gray-100 flex items-center">
            <div className="p-2 rounded-full bg-green-50 mr-3">
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Zysk</p>
              <p className="text-base font-semibold">{profits.toLocaleString('pl-PL')} PLN</p>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded border border-gray-100 flex items-center">
            <div className="p-2 rounded-full bg-purple-50 mr-3">
              <PieChart className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Inwestycja</p>
              <p className="text-base font-semibold">{investment.toLocaleString('pl-PL')} PLN</p>
            </div>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-100">
          <p className="text-xs text-gray-600">
            {roi >= 20 && "Doskonały zwrot z inwestycji. Projekt jest bardzo opłacalny."}
            {roi >= 10 && roi < 20 && "Dobry zwrot z inwestycji. Projekt jest opłacalny."}
            {roi >= 0 && roi < 10 && "Umiarkowany zwrot z inwestycji. Projekt jest mało opłacalny."}
            {roi < 0 && "Ujemny zwrot z inwestycji. Projekt jest nieopłacalny."}
          </p>
        </div>
      </div>
    </div>
  );
}