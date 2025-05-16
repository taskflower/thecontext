// src/themes/energygrant/widgets/LegalTermsWidget.tsx
import { useFlow } from "@/core";
import { I } from "@/components";

interface LegalTermsWidgetProps {
  termsData?: {
    termsContent?: string;
    termsLastUpdated?: string;
  };
}

export default function LegalTermsWidget({ 
  termsData = {
    termsContent: "Program Dotacji Energetycznych działa na podstawie ustawy o efektywności energetycznej i rozporządzeń wykonawczych. Platforma łączy beneficjentów, wykonawców i audytorów energetycznych, ułatwiając wymianę usług i informacji w ramach programu. Korzystając z platformy, użytkownik akceptuje zasady jej funkcjonowania, w szczególności: \n\n1. Obowiązek podawania prawdziwych i aktualnych danych \n2. Zakaz publikowania treści naruszających prawo \n3. Przestrzeganie procedur weryfikacji uprawnień \n4. Akceptację systemu oceniania i recenzji \n\nOperator platformy ma prawo do modyfikacji regulaminu, o czym informuje użytkowników z odpowiednim wyprzedzeniem. Szczegółowe warunki uczestnictwa w programie dotacji regulują odrębne przepisy.",
    termsLastUpdated: "2025-01-15"
  }
}: LegalTermsWidgetProps) {
  const { get } = useFlow();
  const darkMode = get('darkMode') === true;

  return (
    <div className="w-full">
      <div className={`p-6 rounded-lg ${
        darkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-zinc-200 shadow-sm'
      }`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
          Regulamin korzystania z systemu
        </h2>
        
        <div className={`p-4 rounded-md ${darkMode ? 'bg-zinc-700/50 mb-4' : 'bg-gray-50 mb-4'}`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className={`text-sm font-medium ${darkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>
              Regulamin platformy
            </h3>
            <span className={`text-xs ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Aktualizacja: {termsData.termsLastUpdated}
            </span>
          </div>
          <div className={`text-sm whitespace-pre-line ${darkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            {termsData.termsContent}
          </div>
        </div>
        
        <div className={`p-4 rounded-md ${darkMode ? 'bg-zinc-700/30' : 'bg-emerald-50'}`}>
          <div className="flex items-start">
            <I name="info" className={`h-5 w-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-500'} mr-3 mt-0.5`} />
            <div>
              <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-zinc-200' : 'text-emerald-800'}`}>
                Informacja
              </h3>
              <p className={`text-xs ${darkMode ? 'text-zinc-400' : 'text-emerald-700'}`}>
                Korzystając z serwisu, akceptujesz postanowienia regulaminu. Regulamin może podlegać okresowym 
                aktualizacjom. Zalecamy regularne zapoznawanie się z jego treścią.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}