// src/themes/energygrant/widgets/PortfolioPreviewWidget.tsx
import { MapPin, Phone, Mail, Globe,  Award, Image, FileText, Settings } from 'lucide-react';

type PortfolioData = {
  companyName?: string;
  nip?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  certificateNumber?: string;
  certificateExpiry?: string;
  images?: string[];
  services?: string[];
  portfolioType?: 'contractor' | 'auditor';
};

type PortfolioPreviewWidgetProps = {
  data?: PortfolioData;
  title?: string;
  contextDataPath?: string;
};

export default function PortfolioPreviewWidget({ 
  data = {}, 
  title = "Podgląd portfolio"
}: PortfolioPreviewWidgetProps) {
  const { 
    companyName = '',
    nip = '',
    address = '',
    postalCode = '',
    city = '',
    phone = '',
    email = '',
    website = '',
    description = '',
    certificateNumber = '',
    certificateExpiry = '',
    images = [],
    services = [],
    portfolioType = 'contractor'
  } = data;

  const isContractor = portfolioType === 'contractor';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{companyName}</h2>
              <div className="flex items-center text-gray-500 text-sm">
                <span className="bg-gray-100 px-2 py-1 rounded">NIP: {nip}</span>
                <span className="mx-2">•</span>
                <span className={`font-medium ${isContractor ? 'text-orange-600' : 'text-blue-600'}`}>
                  {isContractor ? 'Wykonawca' : 'Audytor energetyczny'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Adres</h3>
                  <p className="text-sm text-gray-600">{address}</p>
                  <p className="text-sm text-gray-600">{postalCode} {city}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Telefon</h3>
                  <p className="text-sm text-gray-600">{phone}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">E-mail</h3>
                  <p className="text-sm text-gray-600">{email}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Globe className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Strona www</h3>
                  <p className="text-sm text-gray-600">{website || 'Brak'}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 mb-2">O firmie</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {description || 'Brak opisu'}
              </p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium text-gray-900">
                  {isContractor ? 'Oferowane usługi' : 'Zakres audytów'}
                </h3>
                <span className="text-xs text-gray-500">{services.length} {isContractor ? 'usług' : 'specjalizacji'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {services.length > 0 ? (
                  services.map((service, index) => (
                    <span 
                      key={index} 
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        isContractor ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <Settings className="mr-1 h-3 w-3" />
                      {service}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">Brak usług</p>
                )}
              </div>
            </div>
            
            {(certificateNumber || certificateExpiry) && (
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-900 mb-2">Certyfikaty i uprawnienia</h3>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                  <div className="flex items-start">
                    <Award className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-900">
                        {isContractor ? 'Uprawnienia wykonawcze' : 'Certyfikat audytora'}
                      </p>
                      <p className="text-sm text-gray-600">Numer: {certificateNumber}</p>
                      {certificateExpiry && (
                        <p className="text-sm text-gray-600">
                          Ważny do: {new Date(certificateExpiry).toLocaleDateString('pl-PL')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:w-1/3">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium text-gray-900">Galeria realizacji</h3>
                <span className="text-xs text-gray-500">{images.length} zdjęć</span>
              </div>
              
              {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((index) => (
                    <div 
                      key={index} 
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200"
                    >
                      <Image className="h-8 w-8 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-8 flex flex-col items-center justify-center">
                  <Image className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 text-center">Brak zdjęć w galerii</p>
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium text-gray-900">Status weryfikacji</h3>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <div className="flex">
                  <FileText className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Oczekiwanie na weryfikację</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Twój profil oczekuje na weryfikację przez operatora programu.
                      Po pozytywnej weryfikacji będzie widoczny dla beneficjentów.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}