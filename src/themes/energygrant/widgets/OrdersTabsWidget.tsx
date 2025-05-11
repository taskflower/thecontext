// src/themes/energygrant/widgets/OrdersTabsWidget.tsx
import { useState } from 'react';
import { 

  ClipboardCheck, 
  Clock, 
  CheckCircle, 
  Loader, 

  Calendar,
  ChevronDown,
  ChevronUp,
  Settings
} from 'lucide-react';

type Offer = {
  id: string;
  providerId: string;
  providerName: string;
  price: number;
  description: string;
  isAccepted: boolean;
};

type Order = {
  id: string;
  type: 'contractor' | 'auditor';
  status: 'active' | 'in_progress' | 'completed';
  created: string;
  scope: string;
  offers: Offer[];
};

type OrdersTabsWidgetProps = {
  title?: string;
  data?: Order[];
  onViewDetails?: (orderId: string) => void;
};

export default function OrdersTabsWidget({ 
  title,
  data = [], 
  onViewDetails 
}: OrdersTabsWidgetProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'contractor' | 'auditor'>('all');
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };

  const isOrderExpanded = (orderId: string) => {
    return expandedOrders.includes(orderId);
  };

  const filteredOrders = data.filter(order => {
    if (activeTab === 'all') return true;
    return order.type === activeTab;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Aktywne
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Loader className="mr-1 h-3 w-3" />
            W realizacji
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Zakończone
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'contractor' 
      ? <Settings className="h-5 w-5 text-orange-500" />
      : <ClipboardCheck className="h-5 w-5 text-blue-500" />;
  };

  const getTypeName = (type: string) => {
    return type === 'contractor' ? 'Wykonawca' : 'Audytor';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {title && (
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <div className="border-b border-gray-200">
        <div className="px-6">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Wszystkie zlecenia
            </button>
            <button
              onClick={() => setActiveTab('contractor')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contractor'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dla wykonawców
            </button>
            <button
              onClick={() => setActiveTab('auditor')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'auditor'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dla audytorów
            </button>
          </nav>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {filteredOrders.length === 0 ? (
          <div className="p-6 text-center">
            <div className="py-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">Brak zleceń</p>
            </div>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="divide-y divide-gray-100">
              <div 
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => toggleOrderExpansion(order.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mr-4">
                      {getTypeIcon(order.type)}
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        <h4 className="font-medium text-gray-900">
                          Zlecenie dla: {getTypeName(order.type)}
                        </h4>
                        <div className="ml-2">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {order.scope}
                      </p>
                      
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          Dodano: {formatDate(order.created)}
                        </div>
                        
                        <div className="flex items-center">
                          <Settings className="mr-1 h-3 w-3" />
                          Liczba ofert: {order.offers.length}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewDetails) onViewDetails(order.id);
                      }}
                      className="mr-2 inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Szczegóły
                    </button>
                    
                    {isOrderExpanded(order.id) ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
              
              {isOrderExpanded(order.id) && (
                <div className="px-6 pb-6 pt-2 bg-gray-50">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Otrzymane oferty:</h5>
                  
                  {order.offers.length === 0 ? (
                    <div className="py-4 text-center text-sm text-gray-500 bg-white rounded border border-gray-200">
                      Brak otrzymanych ofert
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {order.offers.map(offer => (
                        <div 
                          key={offer.id} 
                          className={`p-4 rounded-lg border ${
                            offer.isAccepted 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center mb-1">
                                <h6 className="font-medium text-gray-900">{offer.providerName}</h6>
                                {offer.isAccepted && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Zaakceptowano
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-lg text-gray-900">{offer.price} PLN</span>
                              <div className="mt-2 space-x-2">
                                {!offer.isAccepted && (
                                  <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700">
                                    Zaakceptuj ofertę
                                  </button>
                                )}
                                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                                  Kontakt
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}