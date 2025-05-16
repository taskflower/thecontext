// src/themes/energygrant/layouts/AuthLayout.tsx

import { Footer } from './../common/Footer';
import { useDarkMode } from "../utils/ThemeUtils";


interface AuthLayoutProps {
  children?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {

  const { darkMode, toggleDarkMode } = useDarkMode();

  
  // Renderowanie tylko ekranu logowania (bez Header)
  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg overflow-hidden`}>
          <div className={`p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-center mb-8">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Program Dotacji Energetycznych
              </h2>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Zaloguj się, aby kontynuować
              </p>
            </div>
            
          
          </div>
          
          <div className={`px-8 py-4 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Logując się, akceptujesz nasze <a href="#" className="text-blue-600 hover:underline">Warunki korzystania</a> i <a href="#" className="text-blue-600 hover:underline">Politykę prywatności</a>
            </p>
          </div>
        </div>
      </div>

      {children}
      
      <Footer 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
        minimal={true} 
      />
    </div>
  );
};

export default AuthLayout;