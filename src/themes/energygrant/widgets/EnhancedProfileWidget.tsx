// src/themes/default/widgets/EnhancedProfileWidget.tsx
import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit } from 'lucide-react';

type EnhancedProfileWidgetProps = {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  joinDate?: string;
  role?: string;
  avatarUrl?: string;
  verified?: boolean;
  editProfileUrl?: string;
  profileCompleteness?: number;
};

export default function EnhancedProfileWidget({ 
  fullName = '',
  email = '',
  phone = '',
  location = '',
  joinDate = '',
  role = '',
  avatarUrl = '',
  verified = false,
  editProfileUrl = '/profile/edit',
  profileCompleteness = 40
}: EnhancedProfileWidgetProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Efekt animacji wejścia
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Formatowanie daty dołączenia
  const formattedDate = (() => {
    if (!joinDate) return '';
    try {
      return new Date(joinDate).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return joinDate;
    }
  })();

  // Inicjały do awatara
  const initials = (() => {
    if (!fullName) return '';
    
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return fullName.charAt(0).toUpperCase();
  })();

  // Kolor tła awatara
  const getAvatarBgColor = () => {
    if (avatarUrl) return '';
    
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-indigo-500', 'bg-pink-500', 'bg-yellow-500'
    ];
    
    // Użyj liter imienia i nazwiska do wyboru koloru
    const hashCode = fullName.split('').reduce(
      (acc, char) => acc + char.charCodeAt(0), 0
    );
    
    return colors[hashCode % colors.length];
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all duration-500 ${
      isLoaded 
        ? 'opacity-100 transform translate-y-0' 
        : 'opacity-0 transform translate-y-4'
    }`}>
      {/* Górna część z awatarem */}
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600">
        {/* Opcjonalny przycisk edycji */}
        {editProfileUrl && (
          <a 
            href={editProfileUrl}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </a>
        )}
        
        {/* Awatar */}
        <div className="absolute -bottom-12 left-6">
          <div className={`w-24 h-24 rounded-full border-4 border-white ${getAvatarBgColor()}`}>
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={fullName} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center text-white text-xl font-bold">
                {initials}
              </div>
            )}
            
            {verified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1 border-2 border-white">
                <Shield className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Dane profilowe */}
      <div className="pt-16 px-6 pb-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">{fullName}</h3>
          {role && (
            <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {role}
            </span>
          )}
        </div>
        
        <div className="space-y-3">
          {email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400 mr-3" />
              <span>{email}</span>
            </div>
          )}
          
          {phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400 mr-3" />
              <span>{phone}</span>
            </div>
          )}
          
          {location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 mr-3" />
              <span>{location}</span>
            </div>
          )}
          
          {formattedDate && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400 mr-3" />
              <span>Dołączono: {formattedDate}</span>
            </div>
          )}
        </div>
        
        {/* Wskaźnik uzupełnienia profilu */}
        {profileCompleteness !== undefined && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Uzupełnienie profilu</span>
              <span className="text-xs font-medium text-gray-700">{profileCompleteness}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${profileCompleteness}%` }}
              ></div>
            </div>
            
            {profileCompleteness < 100 && (
              <p className="mt-2 text-xs text-gray-500">
                Uzupełnij brakujące informacje, aby odblokować wszystkie funkcje.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}