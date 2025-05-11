// src/themes/energygrant/widgets/ListingsWidget.tsx
import { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Lock,
  Unlock,
  ClipboardCheck,
  Settings
} from 'lucide-react';

type Listing = {
  id: string;
  postalCode: string;
  city: string;
  scope: string;
  hasAudit: boolean;
  isVerified: boolean;
  views: number;
  created: string;
  type: 'contractor' | 'auditor';
};

type ListingsWidgetProps = {
  title?: string;
  data?: Listing[];
  listingType?: 'contractor' | 'auditor';
  contextDataPath?: string;
  purchasedPoints?: number;
  unlockedListings?: string[];
};

export default function ListingsWidget({ 
  title = "Dostępne oferty", 
  data = [],
  listingType = 'contractor',
  purchasedPoints = 10,
  unlockedListings = []
}: ListingsWidgetProps) {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Filtruj wyświetlane oferty według typu
  const filteredListings = data.filter(listing => 
    listing.type === listingType
  );

  const getIconForListing = (listing: Listing) => {
    return listing.type === 'contractor' 
      ? <Settings className="h-5 w-5 text-orange-500" />
      : <ClipboardCheck className="h-5 w-5 text-blue-500" />;
  };

  const getLabelForListingType = (type: string) => {
    return type === 'contractor' ? 'wykonawcy' : 'audytora';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
  };

  const handleUnlock = (listing: Listing) => {
    if (purchasedPoints <= 0) {
      alert("Nie masz wystarczającej liczby punktów. Wykup punkty, aby odblokować kontakt.");
      return;
    }
    
    setSelectedListing(listing);
    setShowUnlockModal(true);
  };

  const confirmUnlock = () => {
    // Tutaj byłaby logika zmniejszenia liczby punktów i odblokowania kontaktu
    setShowUnlockModal(false);
    alert("Kontakt został odblokowany! Możesz teraz zobaczyć dane kontaktowe.");
  };

  const isListingUnlocked = (listingId: string) => {
    return unlockedListings.includes(listingId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <div className="text-sm text-gray-500">
            Dostępne punkty: <span className="font-medium text-green-600">{purchasedPoints}</span>
          </div>
        </div>
      </div>
      
      {filteredListings.length === 0 ? (
        <div className="p-6 text-center">
          <div className="py-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">Brak dostępnych ofert</p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="mr-4">
                    {getIconForListing(listing)}
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <h4 className="font-medium text-gray-900">
                        Zlecenie dla {getLabelForListingType(listing.type)}
                      </h4>
                      {listing.isVerified && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Zweryfikowane
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {listing.scope}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {listing.postalCode}, {listing.city}
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        Dodano: {formatDate(listing.created)}
                      </div>
                      
                      <div className="flex items-center">
                        <Eye className="mr-1 h-3 w-3" />
                        Wyświetlenia: {listing.views}
                      </div>
                      
                      {listing.hasAudit ? (
                        <div className="flex items-center text-green-600">
                          <FileText className="mr-1 h-3 w-3" />
                          Audyt dostępny
                        </div>
                      ) : (
                        <div className="flex items-center text-orange-600">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Brak audytu
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  {isListingUnlocked(listing.id) ? (
                    <button className="inline-flex items-center px-3 py-1.5 border border-green-500 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100">
                      <Unlock className="mr-1 h-3 w-3" />
                      Kontakt odblokowany
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleUnlock(listing)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Lock className="mr-1 h-3 w-3" />
                      Odblokuj kontakt (1 pkt)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal do potwierdzenia odblokowania kontaktu */}
      {showUnlockModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Potwierdź odblokowanie kontaktu</h3>
            <p className="text-sm text-gray-600 mb-6">
              Czy na pewno chcesz odblokować dane kontaktowe dla tego zlecenia? 
              Zostanie pobrane <span className="font-medium text-green-600">1 punkt</span> z Twojego konta.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowUnlockModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button 
                onClick={confirmUnlock}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Potwierdź i odblokuj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}