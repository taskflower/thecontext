// src/themes/goldsaver/widgets/RecentTransactionsWidget.tsx
import { ArrowUpCircle, ArrowDownCircle, Calendar, ExternalLink } from 'lucide-react';

export default function RecentTransactionsWidget({ data = [] }: { data: any[] }) {
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
  
  // Sortuj transakcje - najnowsze na górze
  const sortedTransactions = [...(data || [])].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5); // Limit to 5 most recent transactions
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Ostatnie transakcje</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            <ExternalLink className="w-4 h-4 mr-1" />
            <span>Zobacz wszystkie</span>
          </button>
        </div>
        
        {sortedTransactions.length > 0 ? (
          <div className="space-y-4">
            {sortedTransactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-gray-50 mr-3">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.type}</p>
                    <p className="text-xs text-gray-500">#{tx.id.substring(0, 8)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-sm font-medium ${getTransactionColor(tx.type)}`}>
                    {tx.type.toLowerCase().includes('zakup') || tx.type.toLowerCase().includes('wpłata')
                      ? '+' : '-'}{tx.amount} g
                  </span>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(tx.date).toLocaleDateString('pl-PL', { 
                      day: '2-digit', 
                      month: '2-digit',
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">Brak ostatnich transakcji</p>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          Wyświetlono {sortedTransactions.length} z {data.length} transakcji. Kliknij "Zobacz wszystkie", aby wyświetlić pełną historię transakcji.
        </p>
      </div>
    </div>
  );
}