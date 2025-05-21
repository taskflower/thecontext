// src/components/widgets/BeneficiaryListingsWidget.tsx
import { getDatabaseProvider } from "@/provideDB/databaseProvider";
import React, { useState, useEffect } from "react";
import { useWidgetNavigation } from "../utils/NavigationUtils";
import { useParams } from 'react-router-dom';
import { useAppNavigation } from '@/core/navigation';

interface Listing {
 id: string;
 title: string;
 description: string;
 scope: string;
 postalCode: string;
 city: string;
 hasAudit: boolean;
 status: string;
 createdAt: string;
 offers: Array<{
   id: string;
   providerId: string;
   providerName: string;
   price: number;
   description: string;
   isAccepted: boolean;
 }>;
}

interface BeneficiaryListingsWidgetProps {
 title?: string;
 contextDataPath?: string;
 colSpan?: number | string;
 databaseProvider?: string;
 onListingClick?: (listing: Listing) => void;
 successPath?: string;
 autoRedirect?: boolean;
 redirectDelay?: number;
 addListingPath?: string;
}

export const BeneficiaryListingsWidget: React.FC<BeneficiaryListingsWidgetProps> = ({
 title = "Twoje zlecenia",
 contextDataPath,
 colSpan = "full",
 databaseProvider = "indexedDB",
 onListingClick,
 successPath,
 autoRedirect = false,
 redirectDelay = 3000,
 addListingPath,
}) => {
 const [listings, setListings] = useState<Listing[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [filters, setFilters] = useState({
   status: "",
   scope: "",
 });

 const { configId, workspaceSlug } = useParams<{ configId: string; workspaceSlug: string }>();
 const { navigateTo } = useAppNavigation();
 const { handleContinue } = useWidgetNavigation({
   successPath: addListingPath || successPath,
   autoRedirect,
   redirectDelay,
   onSubmit: undefined
 });

 useEffect(() => {
   const fetchListings = async () => {
     try {
       setLoading(true);
       const dbProvider = getDatabaseProvider(
         databaseProvider as "indexedDB" | "firebase"
       );

       // Sprawdzenie czy istnieje kolekcja beneficiary-listings
       const existingListings = await dbProvider.listItems(
         "beneficiary-listings"
       );
       if (existingListings && existingListings.length > 0) {
         setListings(existingListings);
       } else {
         // Brak zleceń
         setListings([]);
       }

       setLoading(false);
     } catch (err) {
       setError(
         "Nie udało się załadować zleceń: " +
           (err instanceof Error ? err.message : String(err))
       );
       setLoading(false);
     }
   };

   fetchListings();
 }, [databaseProvider, contextDataPath]);

 const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
   const { name, value } = e.target;
   setFilters((prev) => ({ ...prev, [name]: value }));
 };

 const filteredListings = listings.filter((listing) => {
   return (
     (filters.status ? listing.status === filters.status : true) &&
     (filters.scope ? listing.scope === filters.scope : true)
   );
 });

 const getStatusLabel = (status: string) => {
   switch (status) {
     case "new":
       return "Nowe";
     case "pending":
       return "Oczekujące";
     case "in_progress":
       return "W realizacji";
     case "completed":
       return "Zakończone";
     default:
       return status;
   }
 };

 const getStatusColor = (status: string) => {
   switch (status) {
     case "new":
       return "bg-blue-100 text-blue-800";
     case "pending":
       return "bg-yellow-100 text-yellow-800";
     case "in_progress":
       return "bg-green-100 text-green-800";
     case "completed":
       return "bg-gray-100 text-gray-800";
     default:
       return "bg-gray-100 text-gray-800";
   }
 };

 const handleAddListing = () => {
   if (addListingPath || successPath) {
     handleContinue();
   } else if (configId && workspaceSlug) {
     navigateTo(`/${configId}/${workspaceSlug}/beneficiary-listing-add/0`);
   } else {
     console.error("Navigation error: Missing configId or workspaceSlug parameters");
   }
 };

 if (loading)
   return <div className="p-4 text-center">Ładowanie zleceń...</div>;
 if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

 return (
   <div
     className={`bg-white rounded-lg shadow-md p-4 ${
       colSpan === "full" ? "col-span-full" : `col-span-${colSpan}`
     }`}
   >
     <div className="flex justify-between items-center mb-4">
       <h2 className="text-xl font-semibold">{title}</h2>
       <button
         onClick={handleAddListing}
         className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
       >
         <svg
           className="w-5 h-5 mr-2"
           fill="none"
           stroke="currentColor"
           viewBox="0 0 24 24"
         >
           <path
             strokeLinecap="round"
             strokeLinejoin="round"
             strokeWidth="2"
             d="M12 4v16m8-8H4"
           ></path>
         </svg>
         Dodaj nowe zlecenie
       </button>
     </div>

     <div className="mb-4 bg-gray-50 p-3 rounded-md">
       <h3 className="font-medium mb-2">Filtry</h3>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
         <div>
           <label className="block text-sm mb-1">Status</label>
           <select
             name="status"
             value={filters.status}
             onChange={handleFilterChange}
             className="w-full p-2 border rounded"
           >
             <option value="">Wszystkie statusy</option>
             <option value="new">Nowe</option>
             <option value="pending">Oczekujące</option>
             <option value="in_progress">W realizacji</option>
             <option value="completed">Zakończone</option>
           </select>
         </div>
         <div>
           <label className="block text-sm mb-1">Zakres prac</label>
           <select
             name="scope"
             value={filters.scope}
             onChange={handleFilterChange}
             className="w-full p-2 border rounded"
           >
             <option value="">Wszystkie zakresy</option>
             <option value="Termomodernizacja ścian">
               Termomodernizacja ścian
             </option>
             <option value="Termomodernizacja dachu">
               Termomodernizacja dachu
             </option>
             <option value="Wymiana okien">Wymiana okien</option>
             <option value="Wymiana źródła ciepła">
               Wymiana źródła ciepła
             </option>
             <option value="Instalacja fotowoltaiki">
               Instalacja fotowoltaiki
             </option>
             <option value="Kompleksowa termomodernizacja">
               Kompleksowa termomodernizacja
             </option>
             <option value="Inne">Inne</option>
           </select>
         </div>
       </div>
     </div>

     {listings.length === 0 ? (
       <div className="text-center p-8 bg-gray-50 rounded-lg">
         <div className="text-gray-500 mb-3">
           Nie masz jeszcze żadnych zleceń
         </div>
         <button
           onClick={handleAddListing}
           className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
         >
           Dodaj pierwsze zlecenie
         </button>
       </div>
     ) : (
       <div className="overflow-x-auto">
         <table className="min-w-full bg-white">
           <thead className="bg-gray-100">
             <tr>
               <th className="py-2 px-3 text-left">Zlecenie</th>
               <th className="py-2 px-3 text-left">Lokalizacja</th>
               <th className="py-2 px-3 text-left">Status</th>
               <th className="py-2 px-3 text-left">Data utworzenia</th>
               <th className="py-2 px-3 text-center">Oferty</th>
               <th className="py-2 px-3 text-center">Akcje</th>
             </tr>
           </thead>
           <tbody>
             {filteredListings.length === 0 ? (
               <tr>
                 <td colSpan={6} className="py-4 text-center">
                   Brak zleceń spełniających kryteria wyszukiwania
                 </td>
               </tr>
             ) : (
               filteredListings.map((listing) => (
                 <tr key={listing.id} className="border-b hover:bg-gray-50">
                   <td className="py-3 px-3">
                     <div className="font-medium">{listing.title}</div>
                     <div className="text-xs text-gray-500">
                       {listing.scope}
                     </div>
                   </td>
                   <td className="py-3 px-3">
                     <div>{listing.city}</div>
                     <div className="text-xs text-gray-500">
                       {listing.postalCode}
                     </div>
                   </td>
                   <td className="py-3 px-3">
                     <span
                       className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                         listing.status
                       )}`}
                     >
                       {getStatusLabel(listing.status)}
                     </span>
                   </td>
                   <td className="py-3 px-3">
                     {new Date(listing.createdAt).toLocaleDateString("pl-PL")}
                   </td>
                   <td className="py-3 px-3 text-center">
                     <div className="font-medium">
                       {listing.offers?.length || 0}
                     </div>
                     {listing.offers?.some((offer) => offer.isAccepted) ? (
                       <div className="text-xs text-green-600">
                         Oferta zaakceptowana
                       </div>
                     ) : listing.offers?.length > 0 ? (
                       <div className="text-xs text-blue-600">
                         Oczekujące na wybór
                       </div>
                     ) : (
                       <div className="text-xs text-gray-500">Brak ofert</div>
                     )}
                   </td>
                   <td className="py-3 px-3 text-center">
                     <button
                       className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                       onClick={() =>
                         onListingClick && onListingClick(listing)
                       }
                     >
                       Szczegóły
                     </button>
                   </td>
                 </tr>
               ))
             )}
           </tbody>
         </table>
       </div>
     )}

     {/* Auto-redirect information */}
     {autoRedirect && (addListingPath || successPath) && (
       <p className="text-center text-xs text-gray-500 mt-4">
         Automatyczne przekierowanie za {Math.round(redirectDelay / 1000)} sekund...
       </p>
     )}
   </div>
 );
};

export default BeneficiaryListingsWidget;