// src/themes/goldsaver/widgets/BalanceWidget.tsx
import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export default function BalanceWidget({ data = 0 }: { data: number }) {
  const [change] = useState({ amount: 0.5, percentage: 2.3, positive: true });
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Twoje złoto</h2>
            <p className="text-sm text-gray-500 mt-1">Aktualna wartość twojego portfela</p>
          </div>
          <div className="bg-yellow-100 rounded-full p-2">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
          </div>
        </div>
        
        <div className="flex items-end">
          <p className="text-3xl font-bold text-yellow-700">{data.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} g</p>
          <p className="ml-2 text-sm font-medium text-gray-500">(≈ {(data * 300).toLocaleString('pl-PL')} PLN)</p>
        </div>
        
        <div className="flex items-center mt-2">
          {change.positive ? (
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${change.positive ? 'text-green-500' : 'text-red-500'}`}>
            {change.positive ? '+' : '-'}{change.amount} g ({change.percentage}%)
          </span>
          <span className="text-xs text-gray-500 ml-1">w ostatnim miesiącu</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 divide-x border-t border-gray-200">
        <button className="py-3 px-4 text-center text-sm font-medium text-yellow-700 hover:bg-yellow-50 transition-colors">
          Kup złoto
        </button>
        <button className="py-3 px-4 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Sprzedaj złoto
        </button>
      </div>
    </div>
  );
}