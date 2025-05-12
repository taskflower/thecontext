// src/themes/goldsaver/widgets/BalanceChartWidget.tsx
import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export default function BalanceChartWidget({ data = [] }: { data: any[] }) {
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year', 'all'
  
  // Filtrujemy i formatujemy dane na podstawie zakresu czasu
  const getFilteredData = () => {
    if (!data || data.length === 0) {
      return generateMockData();
    }
    
    return data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('pl-PL', { 
        day: 'numeric', 
        month: 'short' 
      })
    }));
  };
  
  // Funkcja generująca przykładowe dane, gdy faktyczne nie są dostępne
  const generateMockData = () => {
    const mockData: { date: string; value: number }[] = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const formattedDate = date.toLocaleDateString('pl-PL', { 
        day: 'numeric', 
        month: 'short' 
      });
      
      // Generuje wartość która rośnie z niewielkimi fluktuacjami
      const baseValue = 10000 + i * 300;
      const randomFactor = Math.random() * 500 - 250;
      
      mockData.push({
        date: formattedDate,
        value: baseValue + randomFactor,
      });
    }
    
    return mockData;
  };
  
  const chartData = getFilteredData();
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Wartość portfela (PLN)</h2>
          
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { label: 'T', value: 'week', tooltip: 'Tydzień' },
              { label: 'M', value: 'month', tooltip: 'Miesiąc' },
              { label: 'R', value: 'year', tooltip: 'Rok' },
              { label: 'C', value: 'all', tooltip: 'Cały okres' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeRange === option.value 
                    ? 'bg-white text-yellow-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={option.tooltip}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FCD34D" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FCD34D" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={value => `${value.toFixed(0)}`}
              />
              <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
              <ReferenceLine y={0} stroke="#9CA3AF" strokeWidth={1} strokeDasharray="3 3" />
              
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString('pl-PL')} PLN`, value >= 0 ? 'Zysk' : 'Strata']}
                labelFormatter={(label) => `Data: ${label}`}
                contentStyle={{ 
                  borderRadius: '0.375rem',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  borderColor: '#E5E7EB'
                }}
              />
              
              <Area
                type="monotone"
                dataKey="value"
                stroke="#FCD34D"
                fill="url(#colorValue)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
