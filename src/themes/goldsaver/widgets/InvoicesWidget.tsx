// src/themes/goldsaver/widgets/InvoicesWidget.tsx
import { Download, FileText, FileDown } from 'lucide-react';

export default function InvoicesWidget({ data = [] }: { data: any[] }) {
  // Grupowanie faktur po miesiącach
  const groupInvoicesByMonth = () => {
    const groups: Record<string, { label: string; invoices: any[] }> = {};
    
    if (!data || data.length === 0) return groups;
    
    data.forEach(invoice => {
      const date = new Date(invoice.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthLabel = date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
      
      if (!groups[monthKey]) {
        groups[monthKey] = {
          label: monthLabel,
          invoices: []
        };
      }
      
      groups[monthKey].invoices.push(invoice);
    });
    
    return groups;
  };
  
  const invoiceGroups = groupInvoicesByMonth();
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Faktury</h2>
        
        {Object.keys(invoiceGroups).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(invoiceGroups).map(([key, group]: [string, any]) => (
              <div key={key}>
                <h3 className="text-sm font-medium text-gray-500 mb-3">{group.label}</h3>
                <div className="space-y-2">
                  {group.invoices.map((invoice: any) => (
                    <div 
                      key={invoice.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-red-50 mr-3">
                          <FileDown className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Faktura {invoice.number}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(invoice.date).toLocaleDateString('pl-PL', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <a 
                        href={invoice.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Brak faktur</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Nie masz jeszcze żadnych faktur. Faktury będą dostępne po zakupie złota.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}