// src/themes/goldsaver/widgets/BarsWidget.tsx
import { Package, ShoppingBag, CheckCircle, HelpCircle } from 'lucide-react';

export default function BarsWidget({ data = [] }: { data: any[] }) {
  // Grupowanie sztabek według statusu
  const getStatusGroups = () => {
    const groups = {
      active: { count: 0, weight: 0 },
      pending: { count: 0, weight: 0 },
      shipped: { count: 0, weight: 0 },
      total: { count: 0, weight: 0 }
    };
    
    if (!data || data.length === 0) return groups;
    
    data.forEach(bar => {
      groups.total.count++;
      groups.total.weight += bar.weight;
      
      if (bar.status.toLowerCase().includes('aktywn') || bar.status.toLowerCase().includes('przechowy')) {
        groups.active.count++;
        groups.active.weight += bar.weight;
      } else if (bar.status.toLowerCase().includes('oczek')) {
        groups.pending.count++;
        groups.pending.weight += bar.weight;
      } else if (bar.status.toLowerCase().includes('wysł') || bar.status.toLowerCase().includes('transport')) {
        groups.shipped.count++;
        groups.shipped.weight += bar.weight;
      }
    });
    
    return groups;
  };
  
  const statusGroups = getStatusGroups();
  
  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'aktywna':
      case 'przechowywane':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'oczekujące':
        return <HelpCircle className="w-5 h-5 text-amber-500" />;
      case 'w transporcie':
        return <ShoppingBag className="w-5 h-5 text-blue-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'aktywna':
      case 'przechowywane':
        return 'text-green-500 bg-green-50 border-green-100';
      case 'oczekujące':
        return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'w transporcie':
        return 'text-blue-500 bg-blue-50 border-blue-100';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Moje sztabki</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-500">Łącznie</p>
            <div className="mt-1 flex items-end">
              <p className="text-2xl font-bold text-gray-900">{statusGroups.total.count}</p>
              <p className="ml-1 text-sm text-gray-700">sztabek</p>
            </div>
            <p className="text-sm text-gray-700 mt-1">{statusGroups.total.weight.toFixed(2)} gramów</p>
          </div>
          
          <div className="border border-green-100 rounded-lg p-4 bg-green-50">
            <p className="text-sm text-gray-500">Aktywne</p>
            <div className="mt-1 flex items-end">
              <p className="text-2xl font-bold text-green-600">{statusGroups.active.count}</p>
              <p className="ml-1 text-sm text-gray-700">sztabek</p>
            </div>
            <p className="text-sm text-gray-700 mt-1">{statusGroups.active.weight.toFixed(2)} gramów</p>
          </div>
          
          <div className="border border-amber-100 rounded-lg p-4 bg-amber-50">
            <p className="text-sm text-gray-500">Oczekujące</p>
            <div className="mt-1 flex items-end">
              <p className="text-2xl font-bold text-amber-600">{statusGroups.pending.count}</p>
              <p className="ml-1 text-sm text-gray-700">sztabek</p>
            </div>
            <p className="text-sm text-gray-700 mt-1">{statusGroups.pending.weight.toFixed(2)} gramów</p>
          </div>
        </div>
        
        {data && data.length > 0 ? (
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waga</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map(bar => (
                  <tr key={bar.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{bar.id.substring(0, 8)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {bar.weight} g
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-2">
                          {getStatusIcon(bar.status)}
                        </div>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(bar.status)}`}>
                          {bar.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Szczegóły
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Brak sztabek</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              Nie posiadasz jeszcze żadnych sztabek złota. Kup złoto, aby rozpocząć budowanie swojego portfela.
            </p>
            <button className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors">
              Kup pierwszą sztabkę
            </button>
          </div>
        )}
      </div>
    </div>
  );
}