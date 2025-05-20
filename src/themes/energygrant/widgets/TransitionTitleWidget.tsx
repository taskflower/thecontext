// src/themes/default/widgets/RoleDetailsWidget.tsx
import { useState, useEffect } from 'react';
import { 
  User, 
  Wrench, 
  ClipboardCheck, 
  Headphones, 
  Check, 
  Info,
  ChevronRight
} from 'lucide-react';


type RoleDetailsWidgetProps = {
  role?: string;
  showFeatures?: boolean;
  animateEntrance?: boolean;
};

export default function RoleDetailsWidget({ 
  role = '',
  showFeatures = true,
  animateEntrance = true 
}: RoleDetailsWidgetProps) {
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(!animateEntrance);

  useEffect(() => {
    if (animateEntrance) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [animateEntrance]);

  // Definicje ról i ich cech
  const rolesConfig = {
    beneficiary: {
      name: 'Beneficjent',
      description: 'Właściciel domu, który ubiega się o dotację energetyczną',
      icon: <User className="w-8 h-8 text-blue-500" />,
      color: 'blue',
      features: [
        {
          title: 'Kalkulator zdolności do dotacji',
          description: 'Sprawdź, czy kwalifikujesz się do otrzymania dotacji energetycznej i oszacuj jej wysokość'
        },
        {
          title: 'Zlecanie audytów energetycznych',
          description: 'Utwórz zlecenie na wykonanie audytu energetycznego i wybierz najlepszą ofertę'
        },
        {
          title: 'Zlecanie prac wykonawczych',
          description: 'Zleć wykonanie prac termomodernizacyjnych i wybierz najlepszą ofertę'
        },
        {
          title: 'Bezpośredni kontakt z operatorem',
          description: 'Otrzymuj wsparcie operatora programu na każdym etapie procesu'
        }
      ]
    },
    contractor: {
      name: 'Wykonawca',
      description: 'Firma wykonująca prace termomodernizacyjne i energetyczne',
      icon: <Wrench className="w-8 h-8 text-orange-500" />,
      color: 'orange',
      features: [
        {
          title: 'Dostęp do giełdy zleceń',
          description: 'Przeglądaj dostępne zlecenia na prace termomodernizacyjne i energetyczne'
        },
        {
          title: 'Składanie ofert na zlecenia',
          description: 'Składaj oferty na interesujące Cię zlecenia i konkuruj z innymi wykonawcami'
        },
        {
          title: 'Zarządzanie portfolio',
          description: 'Prezentuj swoje usługi i zrealizowane projekty, aby przyciągnąć klientów'
        },
        {
          title: 'Bezpośredni kontakt z beneficjentami',
          description: 'Komunikuj się z beneficjentami bezpośrednio przez platformę'
        }
      ]
    },
    auditor: {
      name: 'Audytor',
      description: 'Specjalista wykonujący audyty energetyczne',
      icon: <ClipboardCheck className="w-8 h-8 text-indigo-500" />,
      color: 'indigo',
      features: [
        {
          title: 'Dostęp do zleceń audytów',
          description: 'Przeglądaj dostępne zlecenia na wykonanie audytów energetycznych'
        },
        {
          title: 'Składanie ofert na audyty',
          description: 'Składaj oferty na interesujące Cię zlecenia i konkuruj z innymi audytorami'
        },
        {
          title: 'Zarządzanie portfolio',
          description: 'Prezentuj swoje usługi i zrealizowane projekty, aby przyciągnąć klientów'
        },
        {
          title: 'Bezpośredni kontakt z beneficjentami',
          description: 'Komunikuj się z beneficjentami bezpośrednio przez platformę'
        }
      ]
    },
    operator: {
      name: 'Operator',
      description: 'Administrator programu dotacji energetycznych',
      icon: <Headphones className="w-8 h-8 text-green-500" />,
      color: 'green',
      features: [
        {
          title: 'Weryfikacja wniosków',
          description: 'Weryfikuj wnioski o dotację i podejmuj decyzje o przyznaniu środków'
        },
        {
          title: 'Moderacja zleceń',
          description: 'Moderuj zlecenia publikowane na platformie i dbaj o ich jakość'
        },
        {
          title: 'Wsparcie beneficjentów',
          description: 'Zapewniaj wsparcie beneficjentom na każdym etapie procesu'
        },
        {
          title: 'Zarządzanie programem',
          description: 'Zarządzaj parametrami programu dotacyjnego i monitoruj jego efekty'
        }
      ]
    }
  };

  // Pobierz konfigurację dla wybranej roli
  const roleConfig = rolesConfig[role as keyof typeof rolesConfig] || {
    name: 'Wybierz rolę',
    description: 'Wybierz jedną z dostępnych ról, aby zobaczyć jej opis i funkcje',
    icon: <Info className="w-8 h-8 text-gray-500" />,
    color: 'gray',
    features: []
  };

  // Klasy CSS dla kolorów
  const getColorClasses = (color: string) => {
    switch(color) {
      case 'blue': 
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          button: 'bg-blue-500 hover:bg-blue-600',
          highlight: 'bg-blue-100',
          shadow: 'shadow-blue-100'
        };
      case 'orange': 
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-800',
          button: 'bg-orange-500 hover:bg-orange-600',
          highlight: 'bg-orange-100',
          shadow: 'shadow-orange-100'
        };
      case 'indigo': 
        return {
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
          text: 'text-indigo-800',
          button: 'bg-indigo-500 hover:bg-indigo-600',
          highlight: 'bg-indigo-100',
          shadow: 'shadow-indigo-100'
        };
      case 'green': 
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          button: 'bg-green-500 hover:bg-green-600',
          highlight: 'bg-green-100',
          shadow: 'shadow-green-100'
        };
      default: 
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          button: 'bg-gray-500 hover:bg-gray-600',
          highlight: 'bg-gray-100',
          shadow: 'shadow-gray-100'
        };
    }
  };

  const colorClasses = getColorClasses(roleConfig.color);

  return (
    <div 
      className={`transition-all duration-500 ${
        isVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-4'
      }`}
    >
      <div className={`bg-white rounded-lg shadow-md border ${colorClasses.border} overflow-hidden`}>
        {/* Nagłówek */}
        <div className={`p-6 ${colorClasses.bg}`}>
          <div className="flex items-center">
            <div className={`w-16 h-16 rounded-full bg-white shadow-md ${colorClasses.shadow} flex items-center justify-center`}>
              {roleConfig.icon}
            </div>
            <div className="ml-5">
              <h3 className="text-xl font-bold text-gray-900">{roleConfig.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{roleConfig.description}</p>
            </div>
          </div>
        </div>
        
        {/* Funkcje */}
        {showFeatures && roleConfig.features.length > 0 && (
          <div className="p-6 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Dostępne funkcje:</h4>
            
            <div className="space-y-3">
              {roleConfig.features.map((feature, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedFeature === index 
                      ? `${colorClasses.border} ${colorClasses.highlight}` 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                  onClick={() => setSelectedFeature(selectedFeature === index ? null : index)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full ${colorClasses.bg} flex items-center justify-center mr-3`}>
                        <Check className={`w-3 h-3 ${colorClasses.text}`} />
                      </div>
                      <h5 className="font-medium text-gray-800">{feature.title}</h5>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                      selectedFeature === index ? 'transform rotate-90' : ''
                    }`} />
                  </div>
                  
                  {selectedFeature === index && (
                    <div className="mt-3 pl-9 text-sm text-gray-600 animate-fadeIn">
                      {feature.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}