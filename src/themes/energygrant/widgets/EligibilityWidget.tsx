// src/themes/energygrant/widgets/EligibilityWidget.tsx
import { Check, X, Info, AlertTriangle, ThumbsUp } from 'lucide-react';

type EligibilityWidgetProps = {
  contextDataPath?: string;
  data?: {
    householdSize?: number;
    income?: number;
    coOwners?: boolean;
    grantEligibility?: boolean;
    grantAmount?: number;
  };
};

export default function EligibilityWidget({ 
  data = {} 
}: EligibilityWidgetProps) {
  const { 
    householdSize = 0, 
    income = 0, 
    coOwners = false, 
    grantEligibility = false, 
    grantAmount = 0 
  } = data;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Wynik kalkulacji zdolności do dotacji</h3>
          {grantEligibility ? (
            <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <ThumbsUp className="w-4 h-4 mr-1" />
              Kwalifikujesz się
            </div>
          ) : (
            <div className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              <X className="w-4 h-4 mr-1" />
              Brak kwalifikacji
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Wprowadzone dane</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Liczba osób w gospodarstwie:</span>
                <span className="text-sm font-medium">{householdSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Dochód na osobę:</span>
                <span className="text-sm font-medium">{income.toLocaleString('pl-PL')} PLN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Współwłaściciele:</span>
                <span className="text-sm font-medium">{coOwners ? 'Tak' : 'Nie'}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Wynik kalkulacji</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status kwalifikacji:</span>
                <span className={`text-sm font-medium ${grantEligibility ? 'text-green-600' : 'text-red-600'}`}>
                  {grantEligibility ? 'Kwalifikujesz się' : 'Brak kwalifikacji'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Potencjalna wysokość dotacji:</span>
                <span className="text-sm font-medium">{grantAmount.toLocaleString('pl-PL')} PLN</span>
              </div>
            </div>
          </div>
        </div>

        {grantEligibility ? (
          <div className="mt-6 bg-green-50 border border-green-100 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Kwalifikujesz się do dotacji!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Na podstawie wprowadzonych danych, Twoje gospodarstwo domowe kwalifikuje się do otrzymania dotacji energetycznej.
                    Potencjalna wysokość dotacji wynosi {grantAmount.toLocaleString('pl-PL')} PLN.
                    Przejdź do kolejnego kroku, aby wypełnić formularz kontaktowy do operatora programu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 bg-red-50 border border-red-100 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Brak kwalifikacji do dotacji</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Na podstawie wprowadzonych danych, Twoje gospodarstwo domowe nie kwalifikuje się do otrzymania dotacji energetycznej.
                    Możliwe powody to zbyt wysoki dochód na osobę w gospodarstwie domowym.
                    Możesz skontaktować się z operatorem programu, aby uzyskać więcej informacji.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Dodatkowe informacje</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Kalkulator zdolności do dotacji ma charakter orientacyjny. Ostateczna decyzja o przyznaniu dotacji
                  zostanie podjęta po weryfikacji wszystkich dokumentów przez operatora programu.
                  Aby uzyskać więcej informacji, skontaktuj się z operatorem programu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}