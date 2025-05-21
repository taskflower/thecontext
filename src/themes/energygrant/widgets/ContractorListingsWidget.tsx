// src/components/widgets/ContractorListingsWidget.tsx
import { getDatabaseProvider } from '@/provideDB/databaseProvider';
import React, { useState, useEffect } from 'react';


interface Listing {
  id: string;
  postalCode: string;
  city: string;
  scope: string;
  hasAudit: boolean;
  isVerified: boolean;
  views: number;
  created: string;
  isUnlocked: boolean;
  contactData?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

interface ContractorListingsWidgetProps {
  title?: string;
  contextDataPath?: string;
  colSpan?: number | string;
  databaseProvider?: string;
  onListingClick?: (listing: Listing) => void;
}

export const ContractorListingsWidget: React.FC<ContractorListingsWidgetProps> = ({
  title = 'Dostępne zlecenia',
  contextDataPath,
  colSpan = 'full',
  databaseProvider = 'indexedDB',
  onListingClick
}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasedPoints, setPurchasedPoints] = useState(0);
  const [filters, setFilters] = useState({
    city: '',
    scope: '',
    hasAudit: false,
    showOnlyNew: false
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const dbProvider = getDatabaseProvider(databaseProvider as 'indexedDB' | 'firebase');
        
        // Sprawdzenie czy istnieje kolekcja contractor-listings, jeśli nie - utworzenie
        const existingListings = await dbProvider.listItems('contractor-listings');
        if (!existingListings || existingListings.length === 0) {
          // Utworzenie przykładowych danych jeśli nie ma zleceń
          const sampleListings = generateSampleListings();
          for (const listing of sampleListings) {
            await dbProvider.saveData({
              provider: databaseProvider as 'indexedDB' | 'firebase',
              itemType: 'contractor-listings',
              itemId: listing.id
            }, { payload: listing });
          }
          setListings(sampleListings);
        } else {
          setListings(existingListings);
        }

        // Pobranie punktów użytkownika
        const userData = await dbProvider.retrieveData('user-data');
        if (userData) {
          setPurchasedPoints(userData.points || 0);
        }

        setLoading(false);
      } catch (err) {
        setError('Nie udało się załadować zleceń: ' + (err instanceof Error ? err.message : String(err)));
        setLoading(false);
      }
    };

    fetchListings();
  }, [databaseProvider, contextDataPath]);

  const generateSampleListings = (): Listing[] => {
    return [
      {
        id: 'listing-001',
        postalCode: '00-001',
        city: 'Warszawa',
        scope: 'Termomodernizacja ścian',
        hasAudit: true,
        isVerified: true,
        views: 45,
        created: new Date(Date.now() - 2 * 86400000).toISOString(),
        isUnlocked: false
      },
      {
        id: 'listing-002',
        postalCode: '30-001',
        city: 'Kraków',
        scope: 'Wymiana okien',
        hasAudit: false,
        isVerified: true,
        views: 32,
        created: new Date(Date.now() - 5 * 86400000).toISOString(),
        isUnlocked: false
      },
      {
        id: 'listing-003',
        postalCode: '60-001',
        city: 'Poznań',
        scope: 'Instalacja fotowoltaiki',
        hasAudit: true,
        isVerified: false,
        views: 27,
        created: new Date(Date.now() - 1 * 86400000).toISOString(),
        isUnlocked: false
      },
      {
        id: 'listing-004',
        postalCode: '50-001',
        city: 'Wrocław',
        scope: 'Termomodernizacja dachu',
        hasAudit: true,
        isVerified: true,
        views: 19,
        created: new Date(Date.now() - 7 * 86400000).toISOString(),
        isUnlocked: false
      },
      {
        id: 'listing-005',
        postalCode: '80-001',
        city: 'Gdańsk',
        scope: 'Wymiana źródła ciepła',
        hasAudit: false,
        isVerified: true,
        views: 38,
        created: new Date(Date.now() - 3 * 86400000).toISOString(),
        isUnlocked: false
      },
      {
        id: 'listing-006',
        postalCode: '90-001',
        city: 'Łódź',
        scope: 'Kompleksowa termomodernizacja',
        hasAudit: true,
        isVerified: true,
        views: 56,
        created: new Date().toISOString(),
        isUnlocked: false
      }
    ];
  };

  const unlockListing = async (listingId: string) => {
    if (purchasedPoints <= 0) {
      setError('Nie masz wystarczającej liczby punktów. Wykup punkty, aby zobaczyć dane kontaktowe.');
      return;
    }

    try {
      const dbProvider = getDatabaseProvider(databaseProvider as 'indexedDB' | 'firebase');
      
      // Aktualizacja punktów użytkownika
      const userData = await dbProvider.retrieveData('user-data') || {};
      const newPoints = (userData.points || 0) - 1;
      await dbProvider.saveData({
        provider: databaseProvider as 'indexedDB' | 'firebase',
        itemId: 'user-data'
      }, { ...userData, points: newPoints });
      
      setPurchasedPoints(newPoints);
      
      // Aktualizacja statusu odblokowania zlecenia
      setListings(prevListings => 
        prevListings.map(listing => 
          listing.id === listingId 
            ? { 
                ...listing, 
                isUnlocked: true,
                contactData: {
                  name: 'Jan Kowalski',
                  phone: '+48 123 456 789',
                  email: 'jan.kowalski@example.com'
                }
              } 
            : listing
        )
      );

      // Zapisanie stanu odblokowanych zleceń
      const updatedListing = listings.find(l => l.id === listingId);
      if (updatedListing) {
        await dbProvider.saveData({
          provider: databaseProvider as 'indexedDB' | 'firebase',
          itemType: 'contractor-listings',
          itemId: listingId
        }, { 
          payload: { 
            ...updatedListing, 
            isUnlocked: true,
            contactData: {
              name: 'Jan Kowalski',
              phone: '+48 123 456 789',
              email: 'jan.kowalski@example.com'
            }
          } 
        });
      }
    } catch (err) {
      setError('Nie udało się odblokować danych kontaktowych: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFilters(prev => ({ ...prev, [name]: checked }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const filteredListings = listings.filter(listing => {
    return (
      (filters.city ? listing.city.toLowerCase().includes(filters.city.toLowerCase()) : true) &&
      (filters.scope ? listing.scope.toLowerCase().includes(filters.scope.toLowerCase()) : true) &&
      (filters.hasAudit ? listing.hasAudit : true) &&
      (filters.showOnlyNew ? new Date(listing.created).getTime() > Date.now() - 3 * 86400000 : true)
    );
  });

  if (loading) return <div className="p-4 text-center">Ładowanie zleceń...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${colSpan === 'full' ? 'col-span-full' : `col-span-${colSpan}`}`}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      
      <div className="mb-4 bg-gray-50 p-3 rounded-md">
        <h3 className="font-medium mb-2">Filtry</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm mb-1">Miasto</label>
            <input 
              type="text" 
              name="city" 
              value={filters.city} 
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Wpisz miasto"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Zakres prac</label>
            <input 
              type="text" 
              name="scope" 
              value={filters.scope} 
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Wpisz zakres prac"
            />
          </div>
          <div className="flex items-center mt-6">
            <input 
              type="checkbox" 
              id="hasAudit" 
              name="hasAudit" 
              checked={filters.hasAudit} 
              onChange={handleFilterChange}
              className="mr-2"
            />
            <label htmlFor="hasAudit">Tylko z audytem</label>
          </div>
          <div className="flex items-center mt-6">
            <input 
              type="checkbox" 
              id="showOnlyNew" 
              name="showOnlyNew" 
              checked={filters.showOnlyNew} 
              onChange={handleFilterChange}
              className="mr-2"
            />
            <label htmlFor="showOnlyNew">Tylko nowe (3 dni)</label>
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <span className="font-medium">Dostępne punkty: <span className="text-blue-600">{purchasedPoints}</span></span>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => window.location.href = '/workspace-contractor/contractor-market/1'}
        >
          Dokup punkty
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 text-left">Lokalizacja</th>
              <th className="py-2 px-3 text-left">Zakres prac</th>
              <th className="py-2 px-3 text-left">Audyt</th>
              <th className="py-2 px-3 text-left">Data</th>
              <th className="py-2 px-3 text-left">Status</th>
              <th className="py-2 px-3 text-center">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filteredListings.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center">Brak zleceń spełniających kryteria wyszukiwania</td>
              </tr>
            ) : (
              filteredListings.map(listing => (
                <tr key={listing.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-3">
                    <div>{listing.city}</div>
                    <div className="text-xs text-gray-500">{listing.postalCode}</div>
                  </td>
                  <td className="py-3 px-3">{listing.scope}</td>
                  <td className="py-3 px-3">
                    {listing.hasAudit ? (
                      <span className="text-green-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Tak
                      </span>
                    ) : (
                      <span className="text-red-500">Nie</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {new Date(listing.created).toLocaleDateString('pl-PL')}
                  </td>
                  <td className="py-3 px-3">
                    {listing.isVerified ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        Zweryfikowane
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        W weryfikacji
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {listing.isUnlocked ? (
                      <div>
                        <div className="text-sm font-medium">{listing.contactData?.name}</div>
                        <div className="text-xs text-gray-600">{listing.contactData?.phone}</div>
                        <div className="text-xs text-blue-600">{listing.contactData?.email}</div>
                        <button 
                          className="mt-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                          onClick={() => onListingClick && onListingClick(listing)}
                        >
                          Złóż ofertę
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => unlockListing(listing.id)}
                        disabled={purchasedPoints <= 0}
                      >
                        Odkryj kontakt (1 pkt)
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ContractorListingsWidget;