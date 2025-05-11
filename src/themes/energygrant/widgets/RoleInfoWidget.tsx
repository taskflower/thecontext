// src/themes/energygrant/widgets/RoleInfoWidget.tsx
import { User, Wrench, ClipboardCheck, Headphones } from 'lucide-react';

type RoleInfoWidgetProps = {
  title?: string;
};

export default function RoleInfoWidget({ 
  title = "Role w systemie" 
}: RoleInfoWidgetProps) {
  const roles = [
    {
      name: 'Beneficjent',
      icon: <User className="h-6 w-6 text-blue-500" />,
      description: 'Właściciel domu, który ubiega się o dotację energetyczną',
      functions: [
        'Kontakt z operatorem',
        'Kalkulator zdolności do dotacji',
        'Zlecanie audytów energetycznych',
        'Zlecanie prac wykonawczych',
        'Zarządzanie zleceniami'
      ],
      color: 'blue'
    },
    {
      name: 'Wykonawca',
      icon: <Wrench className="h-6 w-6 text-orange-500" />,
      description: 'Firma wykonująca prace termomodernizacyjne i energetyczne',
      functions: [
        'Dostęp do giełdy zleceń',
        'Składanie ofert na zlecenia',
        'Zarządzanie portfolio',
        'Kontakt z beneficjentami'
      ],
      color: 'orange'
    },
    {
      name: 'Audytor',
      icon: <ClipboardCheck className="h-6 w-6 text-indigo-500" />,
      description: 'Specjalista wykonujący audyty energetyczne',
      functions: [
        'Dostęp do zleceń audytów',
        'Składanie ofert na audyty',
        'Zarządzanie portfolio',
        'Kontakt z beneficjentami'
      ],
      color: 'indigo'
    },
    {
      name: 'Operator',
      icon: <Headphones className="h-6 w-6 text-green-500" />,
      description: 'Administrator programu dotacji energetycznych',
      functions: [
        'Weryfikacja wniosków',
        'Moderacja zleceń',
        'Wsparcie beneficjentów',
        'Chat z uczestnikami programu'
      ],
      color: 'green'
    }
  ];

  const getColorClass = (color: string) => {
    switch(color) {
      case 'blue': return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'orange': return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
      case 'indigo': return 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100';
      case 'green': return 'bg-green-50 border-green-200 hover:bg-green-100';
      default: return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role, index) => (
            <div 
              key={index}
              className={`rounded-lg border p-5 transition-colors ${getColorClass(role.color)}`}
            >
              <div className="flex items-center mb-4">
                {role.icon}
                <h4 className="ml-2 font-medium text-gray-900">{role.name}</h4>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {role.description}
              </p>
              
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2">Funkcje:</h5>
                <ul className="space-y-1">
                  {role.functions.map((func, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start">
                      <span className="mr-1 text-gray-400">•</span>
                      {func}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}