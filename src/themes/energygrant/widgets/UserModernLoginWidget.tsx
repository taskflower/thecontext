// src/themes/default/widgets/ModernLoginWidget.tsx
import { useState, useEffect } from 'react';
import { useAuthContext } from "@/auth/AuthContext";
import { useFlow } from "@/core";
import { useAppNavigation } from "@/core/navigation";
import { 
  ArrowRight,
  AlertCircle,
  Loader,
  LogOut,
  Mail
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { getColorClasses } from "@/themes/energygrant/utils/ColorUtils";
import { roles } from "../utils/Definitions";

type ModernLoginWidgetProps = {
  successPath?: string;
  dataPath?: string;
  profilePath?: string;
  title?: string;
  subtitle?: string;
  workspaceSlug?: string;
  scenarioSlug?: string;
  colorTheme?: string;
};

export default function ModernLoginWidget({
  successPath = '',
  dataPath = 'user-data',
  profilePath = 'user-profile',
  title = 'Logowanie',
  subtitle = 'Zaloguj się, aby kontynuować',
  workspaceSlug,
  scenarioSlug,
  colorTheme = 'blue'
}: ModernLoginWidgetProps) {
  const { loading, signInWithGoogle, signOut, user } = useAuthContext();
  const { get, set } = useFlow();
  const { navigateTo, toScenarioStep } = useAppNavigation();
  const params = useParams();
  
  const [error, setError] = useState<string | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const urlWorkspaceSlug = params.workspaceSlug || workspaceSlug;
  const urlScenarioSlug = params.scenarioSlug || scenarioSlug;
  
  // Pobranie roli z kontekstu przepływu
  const [userRole, setUserRole] = useState<string>(colorTheme);
  useEffect(() => {
    const role = get('user-data.role');
    if (role) setUserRole(role);
    
    // Animacja wejściowa
    const timer = setTimeout(() => setHasAnimated(true), 300);
    return () => clearTimeout(timer);
  }, [get]);

  // Znalezienie obiektu roli na podstawie ID
  const roleObject = roles.find(r => r.id === userRole) || roles.find(r => r.color === colorTheme) || { color: 'blue' };

  // Zapisuje dane użytkownika do kontekstu
  const saveUserDataToContext = () => {
    if (!user) return;
    
    // Zapisz dane logowania
    if (dataPath) {
      set(`${dataPath}.email`, user.email);
      set(`${dataPath}.id`, user.uid);
      set(`${dataPath}.isLoggedIn`, true);
      set(`${dataPath}.lastLoginDate`, new Date().toISOString());
    }

    // Zapisz imię i nazwisko
    if (profilePath && user.displayName) {
      const nameParts = user.displayName.split(" ");
      set(`${profilePath}.firstName`, nameParts[0]);
      if (nameParts.length > 1) {
        set(`${profilePath}.lastName`, nameParts.slice(1).join(" "));
      }
      set(`${profilePath}.id`, user.uid);
    }
  };

  // Pobranie klas kolorów na podstawie roli
  const colorClasses = getColorClasses(roleObject.color, true, hasAnimated);

  // Obsługa logowania Google
  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await signInWithGoogle();
      saveUserDataToContext();
      // Nie ustawiamy isSuccess - pozostajemy w widoku zalogowanego użytkownika
    } catch (err) {
      setError('Wystąpił błąd podczas logowania przez Google. Spróbuj ponownie.');
      console.error('Google login failed', err);
    }
  };

  // Obsługa wylogowania z przekierowaniem do kroku zerowego
  const handleLogout = async () => {
    try {
      await signOut();
      if (dataPath) {
        set(`${dataPath}.isLoggedIn`, false);
      }
      
      // Przekierowanie do zerowego kroku po wylogowaniu
      if (urlWorkspaceSlug && urlScenarioSlug) {
        toScenarioStep(urlWorkspaceSlug, urlScenarioSlug, 0);
      }
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // Przekierowanie po zalogowaniu
  const handleContinue = () => {
    if (successPath) {
      navigateTo(successPath);
    }
  };

  // Komponent stanu ładowania
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${colorClasses.bgClasses}`}>
        <Loader className="w-6 h-6 text-white animate-spin" />
      </div>
      <p className="text-gray-600">Trwa logowanie...</p>
    </div>
  );

  // Komponent zalogowanego użytkownika
  const renderLoggedIn = () => (
    <div className="flex flex-col items-center py-6">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${colorClasses.bgClasses}`}>
        <div className="w-full h-full rounded-full flex items-center justify-center text-xl font-bold text-black">
          {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
      
      <h4 className="text-lg font-semibold text-gray-900 mb-1">
        Witaj, {user?.displayName || user?.email}
      </h4>
      
      <p className="text-sm text-gray-600 mb-6">
        Jesteś zalogowany na konto:
      </p>
      
      <div className={`w-full p-4 rounded-lg border mb-6 ${colorClasses.borderClasses} bg-white bg-opacity-50`}>
        <p className="text-sm text-gray-700 flex items-center">
          <Mail className={`w-4 h-4 mr-2 ${colorClasses.iconClasses}`} /> 
          {user?.email}
        </p>
      </div>
      
      <div className="flex space-x-4 w-full">
      <button
          onClick={handleLogout}
          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 px-4 rounded-lg flex items-center justify-center border border-red-200 transition-all duration-300"
        >
          <LogOut className="mr-2 w-4 h-4" /> Wyloguj się
        </button>
        <button
          onClick={handleContinue}
          className={`flex-1 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-md ${colorClasses.buttonClasses}`}
        >
          Kontynuuj <ArrowRight className="ml-2 w-4 h-4" />
        </button>
        
      
      </div>
    </div>
  );

  // Komponent formularza logowania
  const renderLoginForm = () => (
    <div className={`transition-all duration-300 ${hasAnimated ? 'opacity-100' : 'opacity-0 transform translate-y-4'}`}>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <button
        onClick={handleGoogleLogin}
        className={`w-full flex items-center justify-center py-3 px-4 mb-4 rounded-lg border text-sm font-medium bg-white shadow-sm transition-all duration-300 transform hover:scale-[1.01] ${colorClasses.borderClasses} border-opacity-40 hover:border-opacity-100`}
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span className={colorClasses.featureClasses}>Kontynuuj z Google</span>
      </button>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-md border overflow-hidden transition-all duration-300 transform ${hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${colorClasses.borderClasses} border-opacity-20`}>
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
        </div>
        
        {loading ? renderLoading() : 
         user ? renderLoggedIn() : 
         renderLoginForm()}
      </div>
    </div>
  );
}