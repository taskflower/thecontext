Powtarzalne „lazy + Suspense”

W wielu miejscach (FlowRoutes, WidgetLoader, ScenarioWithStep, WorkspaceOverview, NodeRenderer, itd.) masz identyczny wzorzec:

tsx
Kopiuj
Edytuj
const X = React.lazy(...)
<Suspense fallback={<AppLoading .../>}><X …/></Suspense>
Sugestia: wydziel HOC lub komponent withLazy przyjmujący funkcję importu i ewentualny komponent fallback, żeby nie powtarzać tej logiki w każdym pliku.

---

Nadmierne console.logi

W WidgetLoader, preload.ts, FormStep itp. dużo logów „Ładowanie widgetu…”, które w prodzie nie są potrzebne.

Sugestia: skonfiguruj logger dev/prod albo usuń zbędne console.log.

---

Boilerplate w formularzu (FormStep)

Renderowanie każdego typu pola (text, number, checkbox, select…) ręcznie generuje sporo bardzo podobnego markup-u.

Sugestia: wydziel pojedynczy komponent <Field> lub mapę typ→komponent, wtedy FormStep stanie się krótszy i łatwiej będzie dodać nowe typy.

---

Redundancja w mapowaniu ikon

W ListObjectWidget i ListTableWidget dwa razy definiujesz niemal tę samą mapę nazw ikon→komponenty Lucide.

Sugestia: wyciągnij do wspólnego helpera lub IconFactory.

---

Powtarzalne fallbacki Suspense

Wiele różnych „skeletonów”/spinnerów tworzy się ręcznie. Masz już AppLoading, ale część spinnerów jest definiowana inline.

Sugestia: ujednolić – używać AppLoading lub wspólnego <Spinner fallbackHeight={…} />.

---

Duplikacja dynamicznych ścieżek importu

Zarówno w preloadLayout, preloadComponent, WidgetLoader, NodeRenderer robisz dynamiczne importy z podobnego wzorca catch(…→Error…).

Sugestia: abstrakcja jednej funkcji lazyWithFallback(path, fallbackPath).

---

[OK]
Złożony konwerter JSON→Zod w silniku
Funkcja jsonToZod jest dość długa i wywoływana dla każdego kroku.
Sugestia: cache’ować zbudowane schematy po ścieżce lub przenieść tę logikę do budowania configu raz na starcie, zamiast w renderze.

---

[OK]
Nieużywane lub zbędne propsy

W niektórych komponentach (np. WidgetsStep: isLastStep bazuje na !scenarioSlug, ale w overview scenarioSlug zawsze istnieje) – warto uprościć warunki lub usunąć kod martwy.

---

Konsystencja aliasów importu

Mieszanka @/… i względnych ../../… tworzy chaos. Ustal jednolity alias (np. @/core, @/components) i stosuj wszędzie.

Typowanie React.FC

W większości plików deklarujesz React.FC<…>, mimo że TypeScript może wywnioskować typy propsów. Można pójść w kierunku funkcji strzałkowych bez React.FC, co redukuje boilerplate.
