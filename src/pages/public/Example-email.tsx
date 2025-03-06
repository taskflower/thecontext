import  { useState } from 'react';
import { 
  MessageSquare, 
  Clock, 
  Users, 
  BarChart, 

  ArrowLeft, 
  ExternalLink,
  Plus,
  Mail,
  Clock4,
  UserCheck,
  UserX,
  ChevronRight,
  Zap
} from 'lucide-react';

const EmailAutomationWorkflow = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dane scenariusza "Email Automation Workflow"
  const emailScenario = { 
    id: 4, 
    title: 'Email Automation Workflow', 
    progress: 100, 
    tasks: 6, 
    completedTasks: 6, 
    status: 'completed',
    description: 'Automatyczny cykl wiadomości email dla nowych klientów, obejmujący powitanie, onboarding oraz cross-selling produktów.',
    channels: ['email'],
    connections: [1],
    stats: {
      deliveryRate: 98.2,
      openRate: 45.6,
      clickRate: 12.8,
      conversionRate: 3.4,
      unsubscribeRate: 0.8
    },
    workflow: [
      {
        id: 1,
        name: 'Welcome Email',
        delay: '0 days',
        sentCount: 1240,
        openRate: 68.5,
        active: true
      },
      {
        id: 2,
        name: 'Getting Started Guide',
        delay: '2 days',
        sentCount: 1182,
        openRate: 52.3,
        active: true
      },
      {
        id: 3,
        name: 'Feature Highlight',
        delay: '5 days',
        sentCount: 1105,
        openRate: 41.8,
        active: true
      },
      {
        id: 4,
        name: 'Success Stories',
        delay: '10 days',
        sentCount: 980,
        openRate: 38.2,
        active: true
      },
      {
        id: 5,
        name: 'Product Upsell',
        delay: '15 days',
        sentCount: 890,
        openRate: 32.6,
        active: true
      },
      {
        id: 6,
        name: 'Feedback Request',
        delay: '30 days',
        sentCount: 780,
        openRate: 42.9,
        active: true
      }
    ],
    audiences: [
      {
        id: 1,
        name: 'New Customers',
        count: 1450,
        description: 'Użytkownicy, którzy dokonali pierwszego zakupu w ciągu ostatnich 30 dni'
      },
      {
        id: 2,
        name: 'Trial Users',
        count: 860,
        description: 'Użytkownicy w okresie próbnym produktu'
      }
    ]
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Nagłówek */}
      <header className="bg-white dark:bg-gray-800 border-b p-4">
        <div className="container mx-auto">
          <div className="flex items-center">
            <button className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">{emailScenario.title}</h1>
            <div className="ml-4 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Completed
            </div>
            <div className="ml-auto flex space-x-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                Duplicate
              </button>
              <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Edit Workflow
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Nawigacja */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto">
          <div className="flex">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent hover:text-indigo-600'}`}
            >
              Przegląd
            </button>
            <button 
              onClick={() => setActiveTab('emails')}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'emails' ? 'border-indigo-600 text-indigo-600' : 'border-transparent hover:text-indigo-600'}`}
            >
              Wiadomości
            </button>
            <button 
              onClick={() => setActiveTab('audience')}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'audience' ? 'border-indigo-600 text-indigo-600' : 'border-transparent hover:text-indigo-600'}`}
            >
              Grupy docelowe
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'analytics' ? 'border-indigo-600 text-indigo-600' : 'border-transparent hover:text-indigo-600'}`}
            >
              Analityka
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent hover:text-indigo-600'}`}
            >
              Ustawienia
            </button>
          </div>
        </div>
      </div>
      
      {/* Główna zawartość */}
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Podsumowanie */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold mb-4">Podsumowanie</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{emailScenario.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center mb-2">
                      <MessageSquare size={18} className="text-indigo-600 mr-2" />
                      <span className="text-sm font-medium">Łącznie wiadomości</span>
                    </div>
                    <p className="text-2xl font-bold">6</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Users size={18} className="text-indigo-600 mr-2" />
                      <span className="text-sm font-medium">Odbiorcy</span>
                    </div>
                    <p className="text-2xl font-bold">2,310</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Clock size={18} className="text-indigo-600 mr-2" />
                      <span className="text-sm font-medium">Czas trwania</span>
                    </div>
                    <p className="text-2xl font-bold">30 dni</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center mb-2">
                      <BarChart size={18} className="text-indigo-600 mr-2" />
                      <span className="text-sm font-medium">Średni open rate</span>
                    </div>
                    <p className="text-2xl font-bold">{Math.round(emailScenario.workflow.reduce((sum, email) => sum + email.openRate, 0) / emailScenario.workflow.length)}%</p>
                  </div>
                </div>
              </div>
              
              {/* Wizualizacja cyklu */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold">Wizualizacja cyklu email</h2>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                    Pełny widok
                  </button>
                </div>
                
                <div className="relative">
                  {emailScenario.workflow.map((email, index) => (
                    <div key={email.id} className="flex mb-8 relative">
                      <div className="flex-none mr-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <MessageSquare size={18} className="text-indigo-600" />
                        </div>
                        {index < emailScenario.workflow.length - 1 && (
                          <div className="w-px h-16 bg-gray-200 absolute left-5 top-10 z-0"></div>
                        )}
                      </div>
                      <div className="flex-grow bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{email.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              <Clock4 size={14} className="inline mr-1" /> 
                              Wysyłka: {email.delay} po poprzedniej wiadomości
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">{email.sentCount}</span> wysłanych
                            </div>
                            <div className="text-sm mt-1">
                              <span className="font-medium text-green-600">{email.openRate}%</span> open rate
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'emails' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Wiadomości w cyklu</h2>
                <button className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">
                  <Plus size={16} className="mr-2" />
                  Dodaj wiadomość
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-700 p-4 border-b">
                  <div className="col-span-5 font-medium">Nazwa</div>
                  <div className="col-span-2 font-medium">Opóźnienie</div>
                  <div className="col-span-2 font-medium">Statystyki</div>
                  <div className="col-span-2 font-medium">Status</div>
                  <div className="col-span-1 font-medium text-right">Akcje</div>
                </div>
                
                {emailScenario.workflow.map((email) => (
                  <div key={email.id} className="grid grid-cols-12 p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="col-span-5 flex items-center">
                      <Mail size={16} className="text-indigo-600 mr-3" />
                      <div>
                        <p className="font-medium">{email.name}</p>
                        <p className="text-sm text-gray-500 mt-1">ID: {email.id}</p>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      {email.delay}
                    </div>
                    <div className="col-span-2 flex items-center">
                      <div>
                        <div className="text-sm"><span className="font-medium">{email.sentCount}</span> wysłanych</div>
                        <div className="text-sm text-green-600">{email.openRate}% otwartych</div>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Aktywny
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <button className="p-1 text-gray-500 hover:text-indigo-600">
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800">
                <div className="flex">
                  <div className="flex-none mr-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Zap size={18} className="text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-indigo-700 dark:text-indigo-400">Wskazówka od AI</h3>
                    <p className="text-sm text-indigo-600 dark:text-indigo-300 mt-1">
                      Na podstawie analiz, możesz zwiększyć wskaźnik otwarć o około 12% dodając personalizowane tematy wiadomości zawierające imię odbiorcy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'audience' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Grupy docelowe</h2>
                <button className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">
                  <Plus size={16} className="mr-2" />
                  Dodaj grupę
                </button>
              </div>
              
              {emailScenario.audiences.map((audience) => (
                <div key={audience.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                      <Users size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{audience.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{audience.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-6">
                      <p className="text-sm text-gray-500">Liczba osób</p>
                      <p className="font-bold">{audience.count.toLocaleString()}</p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-indigo-600">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="font-medium mb-4">Segmentacja odbiorców</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center mb-2">
                      <UserCheck size={18} className="text-green-600 mr-2" />
                      <span className="text-sm font-medium">Aktywni odbiorcy</span>
                    </div>
                    <p className="text-xl font-bold">1,864</p>
                    <p className="text-sm text-gray-500 mt-1">80.7% całości</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center mb-2">
                      <UserX size={18} className="text-red-600 mr-2" />
                      <span className="text-sm font-medium">Wypisani</span>
                    </div>
                    <p className="text-xl font-bold">18</p>
                    <p className="text-sm text-gray-500 mt-1">0.8% całości</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Mail size={18} className="text-indigo-600 mr-2" />
                      <span className="text-sm font-medium">Niezrealizowane</span>
                    </div>
                    <p className="text-xl font-bold">428</p>
                    <p className="text-sm text-gray-500 mt-1">18.5% całości</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Analityka kampanii</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                  <h3 className="font-medium text-gray-500 mb-2">Delivery Rate</h3>
                  <p className="text-3xl font-bold">{emailScenario.stats.deliveryRate}%</p>
                  <div className="mt-2 w-full bg-gray-200 h-2 rounded-full">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${emailScenario.stats.deliveryRate}%` }}></div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                  <h3 className="font-medium text-gray-500 mb-2">Open Rate</h3>
                  <p className="text-3xl font-bold">{emailScenario.stats.openRate}%</p>
                  <div className="mt-2 w-full bg-gray-200 h-2 rounded-full">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${emailScenario.stats.openRate}%` }}></div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                  <h3 className="font-medium text-gray-500 mb-2">Click Rate</h3>
                  <p className="text-3xl font-bold">{emailScenario.stats.clickRate}%</p>
                  <div className="mt-2 w-full bg-gray-200 h-2 rounded-full">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${emailScenario.stats.clickRate}%` }}></div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                  <h3 className="font-medium text-gray-500 mb-2">Conversion Rate</h3>
                  <p className="text-3xl font-bold">{emailScenario.stats.conversionRate}%</p>
                  <div className="mt-2 w-full bg-gray-200 h-2 rounded-full">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${emailScenario.stats.conversionRate*5}%` }}></div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                  <h3 className="font-medium text-gray-500 mb-2">Unsubscribe Rate</h3>
                  <p className="text-3xl font-bold">{emailScenario.stats.unsubscribeRate}%</p>
                  <div className="mt-2 w-full bg-gray-200 h-2 rounded-full">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${emailScenario.stats.unsubscribeRate*10}%` }}></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="font-medium mb-4">Wykres skuteczności cyklu</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Podgląd wykresu skuteczności kampanii email</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Ustawienia</h2>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="font-medium mb-4">Ogólne ustawienia</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nazwa cyklu</label>
                    <input type="text" defaultValue={emailScenario.title} className="w-full p-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Opis</label>
                    <textarea defaultValue={emailScenario.description} className="w-full p-2 border rounded-md" rows={3}></textarea>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="active" defaultChecked={true} className="mr-2" />
                    <label htmlFor="active">Aktywny cykl</label>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="font-medium mb-4">Ustawienia wysyłki</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nadawca (nazwa)</label>
                    <input type="text" defaultValue="Marketing Team" className="w-full p-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Adres email nadawcy</label>
                    <input type="email" defaultValue="marketing@example.com" className="w-full p-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Domyślny czas wysyłki</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>09:00 AM - lokalna strefa czasowa odbiorcy</option>
                      <option>12:00 PM - lokalna strefa czasowa odbiorcy</option>
                      <option>03:00 PM - lokalna strefa czasowa odbiorcy</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md">
                  Zapisz ustawienia
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmailAutomationWorkflow;