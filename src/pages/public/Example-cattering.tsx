import { useState } from 'react';
import { 
  CalendarDays, 
  School, 
  ChefHat, 
  TrendingUp, 
  MessageSquare, 
  Facebook, 
  Instagram, 
  Mail, 
  BarChart3, 
  Users, 
  PieChart, 
  Plus,
  Search,
  Bell,
  MoreHorizontal,
  Calendar,
  Percent
} from 'lucide-react';

const CateringMarketingDashboard = () => {
  const [activeTab, setActiveTab] = useState('kampanie');
  
  // Przykładowe dane kampanii marketingowych
  const campaigns = [
    { 
      id: 1,
      title: 'Zdrowe posiłki na nowy rok szkolny 2025',
      progress: 75, 
      startDate: '2025-08-01',
      endDate: '2025-09-30',
      status: 'w trakcie',
      budget: 5000,
      budgetSpent: 3750,
      schools: ['SP nr 12 w Warszawie', 'SP nr 8 w Warszawie', 'LO nr 3 w Warszawie'],
      channels: ['facebook', 'instagram', 'email'],
      metrics: {
        leads: 145,
        conversions: 28,
        conversionRate: 19.3,
        roi: 215
      }
    },
    { 
      id: 2,
      title: 'Menu na specjalne diety (bezglutenowe, wegetariańskie)',
      progress: 45, 
      startDate: '2025-07-15',
      endDate: '2025-08-31',
      status: 'w trakcie',
      budget: 3500,
      budgetSpent: 1575,
      schools: ['SP nr 12 w Warszawie', 'LO nr 3 w Warszawie', 'SP nr 21 w Warszawie'],
      channels: ['instagram', 'email'],
      metrics: {
        leads: 98,
        conversions: 14,
        conversionRate: 14.3,
        roi: 180
      }
    },
    { 
      id: 3,
      title: 'Promocja cateringu na wydarzenia szkolne',
      progress: 100, 
      startDate: '2025-06-01',
      endDate: '2025-06-30',
      status: 'zakończone',
      budget: 2800,
      budgetSpent: 2800,
      schools: ['Gimnazjum nr 4 w Warszawie', 'LO nr 6 w Warszawie', 'SP nr 8 w Warszawie'],
      channels: ['facebook', 'email'],
      metrics: {
        leads: 120,
        conversions: 35,
        conversionRate: 29.2,
        roi: 310
      }
    },
    { 
      id: 4,
      title: 'Program lojalnościowy dla szkół',
      progress: 25, 
      startDate: '2025-09-01',
      endDate: '2025-11-30',
      status: 'w trakcie',
      budget: 6000,
      budgetSpent: 1500,
      schools: ['SP nr 21 w Warszawie', 'LO nr 3 w Warszawie', 'Gimnazjum nr 4 w Warszawie', 'SP nr 12 w Warszawie'],
      channels: ['facebook', 'instagram', 'email'],
      metrics: {
        leads: 68,
        conversions: 9,
        conversionRate: 13.2,
        roi: 140
      }
    },
    { 
      id: 5,
      title: 'Degustacje w szkołach - jesień 2025',
      progress: 10, 
      startDate: '2025-09-15',
      endDate: '2025-10-31',
      status: 'planowane',
      budget: 4200,
      budgetSpent: 420,
      schools: ['SP nr 8 w Warszawie', 'LO nr 6 w Warszawie', 'SP nr 21 w Warszawie'],
      channels: ['facebook', 'email'],
      metrics: {
        leads: 22,
        conversions: 3,
        conversionRate: 13.6,
        roi: 85
      }
    }
  ];
  
  // Współpracujące szkoły
  const schools = [
    { id: 1, name: 'SP nr 12 w Warszawie', students: 450, contract: true, campaigns: 3 },
    { id: 2, name: 'SP nr 8 w Warszawie', students: 380, contract: true, campaigns: 3 },
    { id: 3, name: 'LO nr 3 w Warszawie', students: 520, contract: true, campaigns: 3 },
    { id: 4, name: 'SP nr 21 w Warszawie', students: 410, contract: true, campaigns: 3 },
    { id: 5, name: 'Gimnazjum nr 4 w Warszawie', students: 320, contract: true, campaigns: 2 },
    { id: 6, name: 'LO nr 6 w Warszawie', students: 490, contract: true, campaigns: 2 },
    { id: 7, name: 'SP nr 15 w Warszawie', students: 350, contract: false, campaigns: 0 }
  ];
  
  // Helper function to get channel icon
  const getChannelIcon = (channel: string) => {
    switch(channel) {
      case 'facebook': return <Facebook size={16} className="text-blue-600" />;
      case 'instagram': return <Instagram size={16} className="text-pink-600" />;
      case 'email': return <Mail size={16} className="text-purple-600" />;
      default: return null;
    }
  };
  
  // Dynamiczne kolory dla statusu kampanii
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'zakończone': return 'bg-green-100 text-green-800';
      case 'w trakcie': return 'bg-blue-100 text-blue-800';
      case 'planowane': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b shadow-sm py-3 px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <ChefHat size={24} className="text-green-700" />
            </div>
            <div>
              <h1 className="font-bold text-xl">SmacznePosiłki</h1>
              <p className="text-xs text-gray-500">Panel Marketingowy - Catering dla Szkół</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Szukaj..."
                className="pl-10 pr-4 py-2 border rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <button className="p-2 rounded-full bg-gray-100 relative">
              <Bell size={18} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                <span className="font-medium text-green-800">MK</span>
              </div>
              <span className="text-sm font-medium">Maria Kowalska</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-60 border-r bg-white flex flex-col">
          <div className="flex-1 overflow-auto p-2">
            <div className="px-4 py-3">
              <span className="text-xs font-medium text-gray-500">MENU GŁÓWNE</span>
            </div>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center w-full p-2 rounded-md ${activeTab === 'dashboard' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'}`}
                >
                  <BarChart3 size={18} className="mr-3" />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('kampanie')}
                  className={`flex items-center w-full p-2 rounded-md ${activeTab === 'kampanie' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'}`}
                >
                  <TrendingUp size={18} className="mr-3" />
                  <span>Kampanie</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('szkoly')}
                  className={`flex items-center w-full p-2 rounded-md ${activeTab === 'szkoly' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'}`}
                >
                  <School size={18} className="mr-3" />
                  <span>Szkoły</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('kalendarz')}
                  className={`flex items-center w-full p-2 rounded-md ${activeTab === 'kalendarz' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'}`}
                >
                  <CalendarDays size={18} className="mr-3" />
                  <span>Kalendarz</span>
                </button>
              </li>
            </ul>
            
            <div className="px-4 py-3 mt-4">
              <span className="text-xs font-medium text-gray-500">ANALITYKA</span>
            </div>
            <ul className="space-y-1">
              <li>
                <button className="flex items-center w-full p-2 rounded-md hover:bg-gray-100">
                  <PieChart size={18} className="mr-3" />
                  <span>Raporty</span>
                </button>
              </li>
              <li>
                <button className="flex items-center w-full p-2 rounded-md hover:bg-gray-100">
                  <Users size={18} className="mr-3" />
                  <span>Odbiorcy</span>
                </button>
              </li>
            </ul>
          </div>
          
          <div className="p-4 border-t bg-green-50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <MessageSquare size={16} className="text-green-700" />
              </div>
              <div>
                <p className="text-xs font-medium text-green-700">Wsparcie</p>
                <p className="text-sm">Potrzebujesz pomocy?</p>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'kampanie' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Kampanie Marketingowe</h2>
                <div className="flex space-x-2">
                  <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm">
                    <Plus size={16} className="mr-2" />
                    Nowa Kampania
                  </button>
                </div>
              </div>
              
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500 mb-1">Aktywne Kampanie</p>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold">4</p>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">+2 w przygotowaniu</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500 mb-1">Budżet (miesięcznie)</p>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold">21 500 zł</p>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Wykorzystano: 65%</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500 mb-1">Nowe Szkoły (miesiąc)</p>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold">3</p>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">+50% m/m</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500 mb-1">Średni ROI</p>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold">186%</p>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">+12% m/m</span>
                  </div>
                </div>
              </div>
              
              {/* Kampanie Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {campaigns.map(campaign => (
                  <div 
                    key={campaign.id}
                    className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{campaign.title}</h4>
                          <div className="flex space-x-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Calendar size={12} className="mr-1" />
                              {campaign.startDate} - {campaign.endDate}
                            </span>
                          </div>
                        </div>
                        <button className="p-1 text-gray-500 hover:text-gray-700">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Postęp</span>
                          <span>{campaign.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              campaign.status === 'zakończone' ? 'bg-green-500' : 
                              campaign.progress > 60 ? 'bg-green-600' : 
                              campaign.progress > 30 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${campaign.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-500">Budżet</p>
                          <p className="font-medium">{campaign.budgetSpent} / {campaign.budget} zł</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-500">Konwersje</p>
                          <div className="flex items-center">
                            <p className="font-medium">{campaign.metrics.conversions}</p>
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded flex items-center">
                              <Percent size={10} className="mr-0.5" />
                              {campaign.metrics.conversionRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <School size={14} className="text-gray-500 mr-1" />
                          <span className="text-xs text-gray-600">{campaign.schools.length} szkół</span>
                        </div>
                        <div className="flex space-x-1">
                          {campaign.channels.map((channel, idx) => (
                            <div key={idx} className="p-1 bg-gray-100 rounded">
                              {getChannelIcon(channel)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add New Campaign Card */}
                <div className="border border-dashed rounded-lg overflow-hidden hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center h-64">
                  <div className="text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                      <Plus size={24} className="text-green-600" />
                    </div>
                    <p className="font-medium text-green-600">Utwórz Nową Kampanię</p>
                    <p className="text-sm text-gray-500 mt-1">Zaplanuj działania marketingowe</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'szkoly' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Szkoły</h2>
                <div className="flex space-x-2">
                  <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm">
                    <Plus size={16} className="mr-2" />
                    Dodaj Szkołę
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nazwa szkoły
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Liczba uczniów
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kampanie
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Akcje
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {schools.map((school) => (
                      <tr key={school.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                              <School size={16} className="text-green-700" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{school.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{school.students}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {school.contract ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Aktywna umowa
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Potencjalny klient
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {school.campaigns}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-green-600 hover:text-green-900 mr-3">Szczegóły</button>
                          <button className="text-gray-600 hover:text-gray-900">Edytuj</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {(activeTab === 'dashboard' || activeTab === 'kalendarz') && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md mx-auto py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'dashboard' ? 
                    <BarChart3 size={32} className="text-green-600" /> : 
                    <CalendarDays size={32} className="text-green-600" />
                  }
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {activeTab === 'dashboard' ? 'Dashboard' : 'Kalendarz'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'dashboard' 
                    ? 'Tu będzie wyświetlony ogólny przegląd wszystkich działań i wyników kampanii marketingowych.' 
                    : 'Tu będzie wyświetlony kalendarz działań marketingowych i harmonogram dla wszystkich kampanii.'
                  }
                </p>
                <button className="bg-green-100 text-green-700 px-4 py-2 rounded-md text-sm font-medium">
                  {activeTab === 'dashboard' ? 'Konfiguruj widoki' : 'Dodaj wydarzenie'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CateringMarketingDashboard;