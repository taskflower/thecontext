// src/components/help/FilteringHelpComponent.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';

export const FilteringHelpComponent: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>System filtrowania scenariuszy</CardTitle>
        <CardDescription>
          Instrukcja obsługi systemu filtrowania w aplikacji
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-lg font-medium">1. Definicja filtrów w scenariuszu</h3>
          <p>Każdy scenariusz może mieć zdefiniowane warunki filtrowania w zakładce "Filtry" podczas edycji:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Otwórz scenariusz i kliknij "Edytuj szczegóły"</li>
            <li>Przejdź do zakładki "Filtry"</li>
            <li>Dodaj warunki filtrowania, określając klucz, operator i wartość</li>
            <li>Scenariusze z warunkami filtrowania są oznaczone znaczkiem <Badge variant="outline" className="bg-blue-50"><Filter className="h-3 w-3 mr-1" />Filtered</Badge></li>
          </ul>
          
          <div className="bg-blue-50 p-4 rounded-md mt-2">
            <p className="text-sm text-blue-800">
              <strong>Ważne:</strong> Znaczek "Filtered" na karcie scenariusza oznacza tylko, że ten scenariusz ma zdefiniowane warunki filtrowania. 
              Nie oznacza to, że ten filtr jest aktywny w obszarze roboczym.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-medium">2. Aktywacja filtrów w obszarze roboczym</h3>
          <p>Aby filtrować widoczne scenariusze:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Kliknij przycisk "Filtry" na górze listy scenariuszy</li>
            <li>Dodaj filtry ręcznie lub użyj opcji "Użyj jako filtr" z menu rozwijanego scenariusza</li>
            <li>Włącz filtrowanie przyciskiem "Filtering On/Off"</li>
          </ul>
          
          <div className="bg-amber-50 p-4 rounded-md mt-2">
            <p className="text-sm text-amber-800">
              <strong>Wskazówka:</strong> Aby szybko zastosować filtr zdefiniowany w scenariuszu, kliknij "..." na karcie scenariusza i wybierz "Użyj jako filtr".
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-medium">3. Jak działają filtry</h3>
          <p>System filtrowania działa na dwóch poziomach:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Poziom scenariusza:</strong> Każdy scenariusz może mieć zdefiniowane warunki filtrowania w swoim kontekście. 
              Te warunki nie wpływają na widoczność scenariuszy, ale definiują zestaw kryteriów, które mogą być używane do filtrowania.
            </li>
            <li>
              <strong>Poziom obszaru roboczego:</strong> Aktywne filtry w obszarze roboczym określają, które scenariusze są dostępne do aktywacji. 
              Scenariusze niespełniające warunków są wyszarzone i nie można ich otworzyć.
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-medium">4. Przechowywanie filtrów</h3>
          <p>Filtry są przechowywane w kontekście obszaru roboczego pod kluczami:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><code>activeFilters</code> - tablica aktywnych filtrów w obszarze roboczym</li>
            <li><code>filteringEnabled</code> - flaga określająca, czy filtrowanie jest włączone</li>
          </ul>
          <p>Warunki filtrowania scenariusza są przechowywane w jego kontekście pod kluczem:</p>
          <ul className="list-disc pl-6">
            <li><code>filterConditions</code> - tablica warunków filtrowania zdefiniowanych dla scenariusza</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-medium">5. Przykład użycia</h3>
          <p>
            Wyobraź sobie, że masz scenariusze dla różnych środowisk (dev, test, prod). Możesz:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Zdefiniować warunek <code>environment = "dev"</code> w scenariuszach deweloperskich,
              <code>environment = "test"</code> w testowych itd.
            </li>
            <li>
              Aktywować filtr <code>environment = "dev"</code> w obszarze roboczym,
              aby wyświetlać i umożliwiać wybór tylko scenariuszy deweloperskich.
            </li>
            <li>
              Gdy potrzebujesz pracować z innym środowiskiem, zmień aktywny filtr
              na <code>environment = "test"</code> lub <code>environment = "prod"</code>.
            </li>
          </ol>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-medium">6. Dostępne operatory</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <h4 className="font-medium mb-2">Operatory dla kluczy:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>exists</strong> - klucz istnieje w kontekście scenariusza</li>
                <li><strong>notExists</strong> - klucz nie istnieje w kontekście</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Operatory dla wartości:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>equals</strong> - wartość klucza jest równa podanej wartości</li>
                <li><strong>notEquals</strong> - wartość klucza jest różna od podanej</li>
                <li><strong>contains</strong> - wartość klucza zawiera podany tekst</li>
                <li><strong>notContains</strong> - wartość klucza nie zawiera podanego tekstu</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-md">
          <p className="text-sm text-green-800">
            <strong>Porada:</strong> Filtrowanie jest szczególnie przydatne w dużych projektach z wieloma scenariuszami.
            Odpowiednie etykietowanie scenariuszy za pomocą kluczy kontekstowych pozwala na szybkie 
            odnalezienie potrzebnych scenariuszy i ograniczenie ryzyka pomyłki.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilteringHelpComponent;