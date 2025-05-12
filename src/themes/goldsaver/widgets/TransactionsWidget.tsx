// src/themes/goldsaver/widgets/TransactionsWidget.tsx
import { useState } from 'react';
import { Download, Filter, ArrowUpCircle, ArrowDownCircle, Search } from 'lucide-react';

export default function TransactionsWidget({ data = [] }: { data: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'purchase', 'sale'
  
  const getTransactionIcon = (type: string) => {
    if (type.toLowerCase().includes('zakup') || type.toLowerCase().includes('wpłata')) {
      return <ArrowUpCircle className="w-5 h-5 text-green-500" />;
    }
    return <ArrowDownCircle className="w-5 h-5 text-red-500" />;
  };
  
  const getTransactionColor = (type: string) => {
    if (type.toLowerCase().includes('zakup') || type.toLowerCase().includes('wpłata')) {
      return 'text-green-500';
    }
    return 'text-red-500';
  };
  
  // Filtruj transakcje
  const filteredTransactions = (data || []).filter(tx => {
    const matchesSearch = searchTerm === '' || 
      tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = filterType === 'all' || 
      (filterType === 'purchase' && (tx.type.toLowerCase().includes('zakup') || tx.type.toLowerCase().includes('wpłata'))) ||
      (filterType === 'sale' && (tx.type.toLowerCase().includes('sprzedaż') || tx.type.toLowerCase().includes('wypłata')));
      
    return matchesSearch && matchesFilter;
  });
  
  // Sortuj transakcje - najnowsze na górze
  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Historia transakcji</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            <Download className="w-4 h-4 mr-1" />
            <span>Eksportuj CSV</span>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-600 focus:border-yellow-600 text-sm"
              placeholder="Szukaj transakcji..."
            />
          </div>
          
          <div className="relative sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-yellow-600 focus:border-yellow-600 text-sm"
            >
              <option value="all">Wszystkie</option>
              <option value="purchase">Tylko zakupy</option>
              <option value="sale">Tylko sprzedaż</option>
            </select>
          </div>
        </div>
        
        {sortedTransactions.length > 0 ? (
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ilość</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {new Date(tx.date).toLocaleDateString('pl-PL', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-2">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {tx.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      #{tx.id.substring(0, 8)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                      <span className={getTransactionColor(tx.type)}>
                        {tx.type.toLowerCase().includes('zakup') || tx.type.toLowerCase().includes('wpłata')
                          ? '+' 
                          : '-'
                        }
                        {tx.amount} g
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">Brak transakcji spełniających kryteria wyszukiwania</p>
          </div>
        )}
      </div>
    </div>
  );
}
