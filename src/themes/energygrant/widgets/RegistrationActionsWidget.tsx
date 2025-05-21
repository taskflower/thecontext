import { Home, User, BookOpen, ArrowRight } from 'lucide-react';

type ActionItem = {
  icon: string;
  label: string;
  description?: string;
  url: string;
  primary?: boolean;
};

type RegistrationActionsWidgetProps = {
  title?: string;
  actions?: ActionItem[];
};

export default function RegistrationActionsWidget({ 
  title = "Co dalej?",
  actions = [
    {
      icon: 'home',
      label: 'Przejdź do strony głównej',
      description: 'Zacznij korzystać z wszystkich funkcji platformy',
      url: '/dashboard',
      primary: true
    },
    {
      icon: 'user',
      label: 'Uzupełnij swój profil',
      description: 'Dodaj więcej informacji do swojego profilu',
      url: '/profile'
    },
    {
      icon: 'book',
      label: 'Zapoznaj się z poradnikiem',
      description: 'Dowiedz się więcej o funkcjach dostępnych w systemie',
      url: '/guide'
    }
  ]
}: RegistrationActionsWidgetProps) {
  
  const renderIcon = (iconName: string) => {
    switch(iconName) {
      case 'home': return <Home className="w-5 h-5" />;
      case 'user': return <User className="w-5 h-5" />;
      case 'book': return <BookOpen className="w-5 h-5" />;
      default: return <ArrowRight className="w-5 h-5" />;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        
        <div className="space-y-4">
          {actions.map((action, index) => (
            <a 
              key={index}
              href={action.url}
              className={`flex items-center p-4 rounded-lg border transition-colors ${
                action.primary 
                  ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800' 
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                action.primary ? 'bg-emerald-200' : 'bg-gray-200'
              }`}>
                {renderIcon(action.icon)}
              </div>
              
              <div className="ml-4 flex-1">
                <h4 className="text-sm font-medium">{action.label}</h4>
                {action.description && (
                  <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                )}
              </div>
              
              <ArrowRight className={`w-4 h-4 ${action.primary ? 'text-emerald-600' : 'text-gray-500'}`} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}