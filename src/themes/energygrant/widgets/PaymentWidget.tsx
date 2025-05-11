// src/themes/energygrant/widgets/PaymentWidget.tsx
import { useState } from 'react';
import { 
  CreditCard, 
  Phone, 
  ChevronsRight, 
  Check,
  Shield
} from 'lucide-react';

type PaymentWidgetProps = {
  title?: string;
  amount?: number;
};

export default function PaymentWidget({ 
  title = "Metody płatności", 
  amount = 100
}: PaymentWidgetProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [nameOnCard, setNameOnCard] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | null>(null);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCardNumber(formatCardNumber(value));
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExpiryDate(formatExpiryDate(value));
  };

  const handleSubmitPayment = () => {
    // Symulacja procesu płatności
    setPaymentStatus('processing');
    
    setTimeout(() => {
      setPaymentStatus('success');
    }, 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="p-6">
        {paymentStatus === 'success' ? (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Płatność zrealizowana</h3>
            <p className="text-sm text-gray-600 mb-4">
              Twoja płatność została zrealizowana pomyślnie. Punkty zostały dodane do Twojego konta.
            </p>
            <div className="mt-6">
              <button 
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
              >
                Wróć do zleceń
              </button>
            </div>
          </div>
        ) : paymentStatus === 'processing' ? (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Przetwarzanie płatności</h3>
            <p className="text-sm text-gray-600">
              Trwa przetwarzanie Twojej płatności. Prosimy o chwilę cierpliwości.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                <p className="text-lg font-medium text-gray-900">Do zapłaty:</p>
                <p className="text-xl font-bold text-green-700">{amount.toLocaleString('pl-PL')} PLN</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`flex items-center justify-center p-4 border rounded-lg transition-colors ${
                    selectedMethod === 'card'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className={`h-5 w-5 mr-2 ${selectedMethod === 'card' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${selectedMethod === 'card' ? 'text-green-700' : 'text-gray-700'}`}>
                    Karta płatnicza
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedMethod('blik')}
                  className={`flex items-center justify-center p-4 border rounded-lg transition-colors ${
                    selectedMethod === 'blik'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <Phone className={`h-5 w-5 mr-2 ${selectedMethod === 'blik' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${selectedMethod === 'blik' ? 'text-green-700' : 'text-gray-700'}`}>
                    BLIK
                  </span>
                </button>
              </div>
              
              {selectedMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">
                      Numer karty
                    </label>
                    <input
                      type="text"
                      id="card-number"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                      placeholder="0000 0000 0000 0000"
                      className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700 mb-1">
                        Data ważności
                      </label>
                      <input
                        type="text"
                        id="expiry-date"
                        value={expiryDate}
                        onChange={handleExpiryDateChange}
                        maxLength={5}
                        placeholder="MM/RR"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV/CVC
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        maxLength={3}
                        placeholder="123"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="name-on-card" className="block text-sm font-medium text-gray-700 mb-1">
                      Imię i nazwisko na karcie
                    </label>
                    <input
                      type="text"
                      id="name-on-card"
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      placeholder="Jan Kowalski"
                      className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              )}
              
              {selectedMethod === 'blik' && (
                <div className="mt-4">
                  <label htmlFor="blik-code" className="block text-sm font-medium text-gray-700 mb-1">
                    Kod BLIK
                  </label>
                  <input
                    type="text"
                    id="blik-code"
                    maxLength={6}
                    placeholder="Wprowadź 6-cyfrowy kod BLIK"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Kod BLIK znajdziesz w aplikacji swojego banku
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-100 mb-6">
              <Shield className="h-5 w-5 text-green-600 mr-3" />
              <p className="text-xs text-gray-600">
                Twoja płatność jest bezpieczna. Używamy szyfrowania SSL, aby chronić Twoje dane.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmitPayment}
                disabled={selectedMethod === 'card' && (!cardNumber || !expiryDate || !cvv || !nameOnCard)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Zapłać {amount.toLocaleString('pl-PL')} PLN
                <ChevronsRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}