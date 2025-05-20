// src/themes/default/widgets/UserRoleSummaryWidget.tsx
import { User, Wrench, ClipboardCheck, Headphones, Award } from 'lucide-react';
import { useMemo } from 'react';

type UserRoleSummaryWidgetProps = {
  role?: string;
  points?: number | string;
};

export default function UserRoleSummaryWidget({ 
  role = '',
  points = 0
}: UserRoleSummaryWidgetProps) {
  // Konwersja punktów na liczbę
  const pointsNumber = useMemo(() => {
    if (typeof points === 'string') {
      const parsed = parseInt(points, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return points || 0;
  }, [points]);

  // Definicje ról
  const roleConfig = useMemo(() => {
    const config = {
      beneficiary: {
        name: 'Beneficjent',
        description: 'Właściciel domu, który ubiega się o dotację energetyczną',
        icon: <User className="w-6 h-6 text-blue-500" />,
        features: [
          'Kontakt z operatorem',
          'Kalkulator zdolności do dotacji',
          'Zlecanie audytów energetycznych',
          'Zlecanie prac wykonawczych'
        ],
        color: 'blue'
      },
      contractor: {
        name: 'Wykonawca',
        description: 'Firma wykonująca prace termomodernizacyjne i energetyczne',
        icon: <Wrench className="w-6 h-6 text-orange-500" />,
        features: [
          'Dostęp do giełdy zleceń',
          'Składanie ofert na zlecenia',
          'Zarządzanie portfolio',
          'Kontakt z beneficjentami'
        ],
        color: 'orange'
      },
      auditor: {
        name: 'Audytor',
        description: 'Specjalista wykonujący audyty energetyczne',
        icon: <ClipboardCheck className="w-6 h-6 text-indigo-500" />,
        features: [
          'Dostęp do zleceń audytów',
          'Składanie ofert na audyty',
          'Zarządzanie portfolio',
          'Kontakt z beneficjentami'
        ],
        color: 'indigo'
      },
      operator: {
        name: 'Operator',
        description: 'Administrator programu dotacji energetycznych',
        icon: <Headphones className="w-6 h-6 text-green-500" />,
        features: [
          'Weryfikacja wniosków',
          'Moderacja zleceń',
          'Wsparcie beneficjentów',
          'Chat z uczestnikami programu'
        ],
        color: 'green'
      }
    };
    
    return config[role as keyof typeof config] || {
      name: 'Niezdefiniowana rola',
      description: 'Rola użytkownika nie została jeszcze określona',
      icon: <User className="w-6 h-6 text-gray-500" />,
      features: ['Dostęp do podstawowych funkcji'],
      color: 'gray'
    };
  }, [role]);

  // Klasy CSS dla kolorów
  const colorClasses = useMemo(() => {
    const classes = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        text: 'text-blue-800',
        icon: 'text-blue-500'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-100',
        text: 'text-orange-800',
        icon: 'text-orange-500'
      },
      indigo: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-100',
        text: 'text-indigo-800',
        icon: 'text-indigo-500'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-100',
        text: 'text-green-800',
        icon: 'text-green-500'
      },
      gray: {
        bg: 'bg-gray-50',
        border: 'border-gray-100',
        text: 'text-gray-800',
        icon: 'text-gray-500'
      }
    };
    
    return classes[roleConfig.color as keyof typeof classes];
  }, [roleConfig]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Twoja rola i uprawnienia</h3>
          <div className="mt-2 sm:mt-0 flex items-center">
            <Award className="w-5 h-5 text-yellow-500 mr-2" />
            <span className="text-sm text-gray-600">
              Punkty startowe: <span className="font-semibold text-yellow-600">{pointsNumber}</span>
            </span>
          </div>
        </div>
        
        <div className={`rounded-lg ${colorClasses.bg} ${colorClasses.border} border p-4`}>
          <div className="flex items-center mb-3">
            <div className="mr-3">
              {roleConfig.icon}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{roleConfig.name}</h4>
              <p className="text-sm text-gray-600">{roleConfig.description}</p>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {roleConfig.features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center bg-white rounded px-3 py-2 border border-gray-100"
              >
                <div className={`w-4 h-4 rounded-full ${colorClasses.bg} flex items-center justify-center mr-3`}>
                  <div className={`w-2 h-2 rounded-full ${colorClasses.icon}`}></div>
                </div>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}