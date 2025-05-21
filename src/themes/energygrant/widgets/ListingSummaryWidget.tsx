import { useFlow } from "@/core";

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between border-b pb-2">
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium">{value}</span>
  </div>
);

const SectionTitle = ({ title }) => (
  <h4 className="font-medium text-gray-700 mb-2">{title}</h4>
);

const ListingSummaryWidget = ({
  listing: listingProp,
  colSpan = "full",
}) => {
  const { get } = useFlow();
  const listing = typeof listingProp === "string" ? get(listingProp) : listingProp;
  
  if (!listing) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-center">
        <div className="mb-3">
          <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium">Brak danych zlecenia</h3>
        <p className="mt-2 text-gray-500">
          Nie można wyświetlić podsumowania. Upewnij się, że wszystkie kroki formularza zostały wypełnione.
        </p>
      </div>
    );
  }

  return (
    <div className={`col-span-${colSpan === "full" ? "full" : colSpan} bg-white rounded-lg shadow p-6`}>
      <h3 className="text-xl font-semibold mb-4">Podsumowanie zlecenia</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <SectionTitle title="Podstawowe informacje" />
          <div className="space-y-2">
            <InfoRow label="Tytuł" value={listing.title} />
            <InfoRow 
              label="Zakres prac" 
              value={listing.scope || (listing.scopeOther && `Inne: ${listing.scopeOther}`)} 
            />
            <InfoRow 
              label="Szacowany budżet" 
              value={listing.budget ? `${listing.budget} PLN` : "Nie określono"} 
            />
            <InfoRow 
              label="Termin realizacji" 
              value={listing.timeline || "Nie określono"} 
            />
            <InfoRow 
              label="Audyt energetyczny" 
              value={listing.hasAudit ? "Posiadam" : "Nie posiadam"} 
            />
          </div>
        </div>

        <div>
          <SectionTitle title="Lokalizacja" />
          <div className="space-y-2">
            <InfoRow label="Miejscowość" value={listing.city} />
            <InfoRow label="Kod pocztowy" value={listing.postalCode} />
            <InfoRow label="Adres" value={listing.address} />
          </div>

          <SectionTitle title="Dane kontaktowe" />
          <div className="space-y-2">
            <InfoRow label="Osoba" value={listing.contactName} />
            <InfoRow label="Telefon" value={listing.contactPhone} />
            <InfoRow label="E-mail" value={listing.contactEmail} />
            <InfoRow label="Preferowany kontakt" value={listing.preferredContact} />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <SectionTitle title="Opis zlecenia" />
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="whitespace-pre-wrap">{listing.description}</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <p className="text-gray-600 text-sm">
            Po publikacji, zlecenie będzie widoczne dla wykonawców z Twojego regionu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ListingSummaryWidget;