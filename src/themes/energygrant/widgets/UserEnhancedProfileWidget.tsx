// src/themes/default/widgets/EnhancedProfileWidget.tsx
import { useState, useEffect, useMemo } from 'react';
import { Mail, Phone, MapPin, Calendar, Shield, Edit, User } from 'lucide-react';
import { useFlow } from '@/core';
import { getColorClasses, ColorVariant } from "@/themes/energygrant/utils/ColorUtils";
import { roles } from "../utils/Definitions";

type UserProfile = { firstName?: string; lastName?: string; id?: string };
type UserData = {
  id?: string;
  email?: string;
  points?: number;
  role?: 'beneficiary' | 'contractor' | 'auditor' | 'operator';
  isLoggedIn?: boolean;
  lastLoginDate?: string;
};

type EnhancedProfileWidgetProps = {
  userData?: string;
  userProfile?: string;
  avatarUrl?: string;
  editProfileUrl?: string;
  location?: string;
  phone?: string;
};

export default function EnhancedProfileWidget({
  userData = 'user-data',
  userProfile = 'user-profile',
  avatarUrl = '',
  editProfileUrl = '/profile/edit',
  location = '',
  phone = ''
}: EnhancedProfileWidgetProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { get } = useFlow();
  
  const profile: UserProfile = get(userProfile) || {};
  const data: UserData = get(userData) || {};

  // Obliczenia zależne od danych
  const fullName = useMemo(() => 
    profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : 
    profile.firstName || profile.lastName || '', 
    [profile.firstName, profile.lastName]
  );
  
  const initials = useMemo(() => {
    if (!fullName) return '';
    const parts = fullName.split(' ');
    return parts.length >= 2 
      ? `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
      : fullName.charAt(0).toUpperCase();
  }, [fullName]);

  const profileCompleteness = useMemo(() => {
    const fields = [
      { check: profile?.firstName !== undefined, complete: !!profile?.firstName },
      { check: profile?.lastName !== undefined, complete: !!profile?.lastName },
      { check: data?.email !== undefined, complete: !!data?.email },
      { check: data?.role !== undefined, complete: !!data?.role },
      { check: location !== undefined, complete: !!location },
      { check: phone !== undefined, complete: !!phone }
    ];
    
    const fieldsToCheck = fields.filter(f => f.check).length;
    if (fieldsToCheck === 0) return 0;
    
    const fieldsCompleted = fields.filter(f => f.check && f.complete).length;
    return Math.round((fieldsCompleted / fieldsToCheck) * 100);
  }, [profile, data, location, phone]);

  const formattedDate = useMemo(() => {
    if (!data.lastLoginDate) return '';
    try {
      return new Date(data.lastLoginDate).toLocaleDateString('pl-PL', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return data.lastLoginDate;
    }
  }, [data.lastLoginDate]);

  const roleConfig = useMemo(() => 
    roles.find(r => r.id === data.role) || {
      id: 'undefined',
      name: 'Użytkownik',
      description: 'Rola użytkownika nie została jeszcze określona',
      icon: 'user',
      features: ['Dostęp do podstawowych funkcji'],
      color: 'gray'
    }, [data.role]
  );

  const roleColor = useMemo(() => 
    (roleConfig.color as ColorVariant) || 'gray', [roleConfig.color]
  );

  const colorClasses = useMemo(() => 
    getColorClasses(roleColor, true, isLoaded), [roleColor, isLoaded]
  );

  // Efekt animacji wejścia
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Helper do nazwy roli
  const getRoleName = (role?: string) => {
    if (!role) return '';
    const roleObj = roles.find(r => r.id === role);
    if (roleObj) return roleObj.name;
    
    const roleMap: Record<string, string> = {
      'beneficiary': 'Beneficjent', 'contractor': 'Wykonawca',
      'auditor': 'Audytor', 'operator': 'Operator'
    };
    return roleMap[role] || role;
  };

  // Rozłożenie na komponenty dla czytelności
  const ProfileInfo = ({icon: Icon, text}: {icon: any, text: string}) => (
    <div className="flex items-center text-sm text-gray-600">
      <Icon className="w-4 h-4 mr-3 text-gray-400" />
      <span>{text}</span>
    </div>
  );
  
  // Funkcja do uzyskania klasy z kolorem roli dla badge'a
  const getRoleBadgeClasses = (roleColor: string) => {
    const colorMap: Record<string, string> = {
      'blue': 'bg-blue-50 text-blue-700',
      'green': 'bg-green-50 text-green-700',
      'orange': 'bg-orange-50 text-orange-700',
      'indigo': 'bg-indigo-50 text-indigo-700',
      'gray': 'bg-gray-50 text-gray-700'
    };
    
    return colorMap[roleColor] || colorMap.gray;
  };
  
  // Funkcja do uzyskania klasy dla górnej linii akcentu
  const getRoleAccentClass = (roleColor: string) => {
    const colorMap: Record<string, string> = {
      'blue': 'bg-blue-500',
      'green': 'bg-green-500',
      'orange': 'bg-orange-500',
      'indigo': 'bg-indigo-500',
      'gray': 'bg-gray-500'
    };
    
    return colorMap[roleColor] || colorMap.gray;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden 
      transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Górna część z subtelnym gradientem */}
      <div className="relative h-32 bg-gradient-to-br from-emerald-50 via-zinc-50 to-blue-50">
        {/* Dekoracyjny pasek akcentu w kolorze roli */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${getRoleAccentClass(roleColor)}`}></div>
        
        {editProfileUrl && (
          <a href={editProfileUrl} className="absolute top-4 right-4 bg-white/80 hover:bg-white/90 text-gray-600 rounded-full p-2 transition-colors shadow-sm">
            <Edit className="w-4 h-4" />
          </a>
        )}
        
        {/* Awatar */}
        <div className="absolute -bottom-12 left-6">
          <div className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center bg-white shadow-md">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center text-emerald-600 bg-white">
                {initials}
              </div>
            )}
            
            {data.isLoggedIn && (
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
          <h3 className="text-xl font-bold text-gray-900">{fullName || 'Użytkownik'}</h3>
          {data.role && (
            <span className={`inline-block mt-1 px-3 py-1 
              ${getRoleBadgeClasses(roleColor)}
              text-xs font-medium rounded-full`}>
              {getRoleName(data.role)}
            </span>
          )}
        </div>
        
        <div className="space-y-3">
          {data.email && <ProfileInfo icon={Mail} text={data.email} />}
          {phone && <ProfileInfo icon={Phone} text={phone} />}
          {location && <ProfileInfo icon={MapPin} text={location} />}
          {formattedDate && <ProfileInfo icon={Calendar} text={`Dołączono: ${formattedDate}`} />}
          {data.points !== undefined && <ProfileInfo icon={User} text={`Punkty: ${data.points}`} />}
        </div>
        
        {/* Wskaźnik uzupełnienia profilu */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Uzupełnienie profilu</span>
            <span className="text-xs font-medium text-gray-700">{profileCompleteness}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`h-2 rounded-full ${getRoleAccentClass(roleColor)}`}
                 style={{ width: `${profileCompleteness}%` }}></div>
          </div>
          
          {profileCompleteness < 100 && (
            <p className="mt-2 text-xs text-gray-500">
              Uzupełnij brakujące informacje, aby odblokować wszystkie funkcje.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}