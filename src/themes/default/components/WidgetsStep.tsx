// src/themes/default/components/WidgetsStep.tsx
import { lazy, Suspense } from "react";
import { useFlow } from "../../../core/context";
import { CheckSquare, Loader, ArrowRight, Database } from "lucide-react";
import { useParams } from "react-router-dom";
import { getDatabaseProvider } from "../../../core/databaseProvider";
import { get as getPath } from 'lodash';

type WidgetConfig = {
 tplFile: string;
 title?: string;
 contextDataPath?: string;
 colSpan?: 1 | 2 | 3 | "full";
 [key: string]: any;
};

type WidgetsStepProps = {
 widgets: WidgetConfig[];
 onSubmit: (data: any) => void;
 title?: string;
 subtitle?: string;
 saveToDB?: {
   enabled: boolean;
   provider: "indexedDB";
   itemId?: string;
   itemType: "lesson" | "quiz" | "project";
   itemTitle?: string;
   contentPath?: string;
 } | null;
 scenarioName?: string | null;
 nodeSlug?: string | null;
};

export default function WidgetsStep({
 widgets = [],
 onSubmit,
 title = "Podsumowanie",
 subtitle,
 saveToDB,
 scenarioName,
 nodeSlug,
}: WidgetsStepProps) {
 const { get } = useFlow();
 const { scenarioSlug, stepIndex } = useParams<{ 
   scenarioSlug: string; 
   stepIndex: string 
 }>();
 
 // Używamy funkcji singleton zamiast hooka
 const dbProvider = (saveToDB?.enabled && saveToDB?.provider) 
   ? getDatabaseProvider(saveToDB.provider) 
   : null;
 
 const isLastStep = !scenarioSlug;

 const getColSpanClass = (colSpan?: 1 | 2 | 3 | "full") => {
   switch (colSpan) {
     case 1: return "col-span-1";
     case 2: return "col-span-2";
     case 3: return "col-span-3";
     case "full": return "col-span-full";
     default: return "col-span-1";
   }
 };

 const loadWidget = (widget: WidgetConfig) => {
   const Widget = lazy(() =>
     import(`../widgets/${widget.tplFile}`).catch(
       () => import("../widgets/ErrorWidget")
     )
   );

   const data = widget.contextDataPath
     ? get(widget.contextDataPath)
     : undefined;

   return (
     <div
       key={widget.tplFile + (widget.title || "")}
       className={`bg-white rounded overflow-hidden shadow-sm border border-gray-100 h-full ${getColSpanClass(widget.colSpan)}`}
     > 
       <Suspense
         fallback={
           <div className="flex items-center justify-center p-6 h-32">
             <Loader className="w-4 h-4 text-gray-900 animate-spin" />
             <span className="ml-2 text-gray-600 text-sm">Ładowanie widgetu...</span>
           </div>
         }
       >
         <Widget {...widget} data={data} />
       </Suspense>
     </div>
   );
 };

 // Funkcja obsługująca kliknięcie przycisku "Dalej"
 const handleNext = async () => {
   // Jeśli włączone zapisywanie do bazy i mamy provider
   if (saveToDB?.enabled && dbProvider) {
     try {
       // Pobieramy dane do zapisania
       const contentPath = saveToDB.contentPath || '';
       const dataToSave = contentPath ? getPath(get(contentPath), '') : {};
       
       // Zapisujemy dane używając providera
       await dbProvider.saveData(
         saveToDB,
         dataToSave,
         {
           scenarioName,
           nodeSlug,
           scenarioSlug,
           stepIndex
         }
       );
     } catch (error) {
       console.error("[WidgetsStep] Błąd podczas zapisywania do bazy:", error);
     }
   }
   
   // Wywołujemy onSubmit z null
   onSubmit(null);
 };

 return (
   <div className="max-w-6xl mx-auto">
     {(title || subtitle) && (
       <div className="mb-6">
         {title && <h2 className="text-xl font-medium text-gray-900 mb-2">{title}</h2>}
         {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
       </div>
     )}

     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
       {widgets.map(loadWidget)}
     </div>

     <div className="flex justify-between items-center">
       {saveToDB?.enabled && (
         <div className="text-xs text-green-600 flex items-center">
           <Database className="w-3 h-3 mr-1" />
           Dane zostaną zapisane lokalnie po kliknięciu przycisku
         </div>
       )}
       
       <button
         onClick={handleNext}
         className="px-5 py-2.5 rounded transition-colors text-sm font-medium bg-black text-white hover:bg-gray-800 flex items-center ml-auto"
       >
         {isLastStep ? (
           <>
             <CheckSquare className="w-4 h-4 mr-2" />
             Zakończ
           </>
         ) : (
           <>
             <ArrowRight className="w-4 h-4 mr-2" />
             Dalej
           </>
         )}
       </button>
     </div>
   </div>
 );
}