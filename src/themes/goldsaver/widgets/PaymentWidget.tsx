// src/themes/goldsaver/widgets/PaymentWidget.tsx
import { useState } from 'react';
import { CreditCard, ArrowRight, Check, Banknote } from 'lucide-react';

export default function PaymentWidget({ title = "Wybierz metodę płatności" }) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const paymentMethods = [
    { id: 'card', name: 'Karta płatnicza', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'blik', name: 'BLIK', icon: <div className="font-bold text-blue-600">B</div> },
    { id: 'transfer', name: 'Przelew bankowy', icon: <Banknote className="w-5 h-5" /> }
  ];
  
  const handlePayment = () => {
    if (!selectedMethod) return;
    
    setIsLoading(true);
    
    // Symulacja płatności
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 2000);
  };
  
  if (isSuccess) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Płatność zakończona</h2>
          <p className="text-gray-600 mb-6">Twoje złoto zostało dodane do konta</p>
          
          <div className="flex justify-center space-x-3">
            <button className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors">
              Przejdź do portfela
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors">
              Kup więcej złota
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">{title}</h2>
        
        <div className="space-y-3 mb-6">
          {paymentMethods.map(method => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`w-full flex items-center justify-between p-4 rounded-lg border ${
                selectedMethod === method.id
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } transition-colors`}
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full ${
                  selectedMethod === method.id ? 'bg-yellow-100' : 'bg-gray-100'
                } flex items-center justify-center mr-4`}
                >
                  {method.icon}
                </div>
                <span className="text-sm font-medium text-gray-900">{method.name}</span>
              </div>
              
              <div className={`w-5 h-5 rounded-full border ${
                selectedMethod === method.id
                  ? 'border-yellow-600 bg-yellow-600'
                  : 'border-gray-300'
              } flex items-center justify-center`}>
                {selectedMethod === method.id && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
            </button>
          ))}
        </div>
        
        <button
          onClick={handlePayment}
          disabled={!selectedMethod || isLoading}
          className={`w-full flex items-center justify-center py-3 px-4 rounded-lg transition-colors ${
            selectedMethod && !isLoading
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Przetwarzanie...
            </>
          ) : (
            <>
              Zapłać <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          Płatności są przetwarzane przez bezpieczny system. Twoje dane są chronione.
        </p>
      </div>
    </div>
  );
}