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
    if (value >= 20) return 'text-green-600';
    if (value >= 10) return 'text-green-500';
    if (value >= 0) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const roiColor = getRoiColor(roi);

  return (
    <div className="p-4 h-full">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">ROI</p>
            <p className={`text-xl font-bold ${roiColor}`}>{roi}%</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
          <div className="p-3 rounded-full bg-green-100 mr-4">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Zysk</p>
            <p className="text-xl font-bold">{profits.toLocaleString('pl-PL')} PLN</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
          <div className="p-3 rounded-full bg-purple-100 mr-4">
            <PieChart className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Inwestycja</p>
            <p className="text-xl font-bold">{investment.toLocaleString('pl-PL')} PLN</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          {roi >= 20 && "Doskonały zwrot z inwestycji. Projekt jest bardzo opłacalny."}
          {roi >= 10 && roi < 20 && "Dobry zwrot z inwestycji. Projekt jest opłacalny."}
          {roi >= 0 && roi < 10 && "Umiarkowany zwrot z inwestycji. Projekt jest mało opłacalny."}
          {roi < 0 && "Ujemny zwrot z inwestycji. Projekt jest nieopłacalny."}
        </p>
      </div>
    </div>
  );
}