// src/templates/education/flowSteps/SavedItemsListFlowStep.tsx
import React, { useState, useEffect } from 'react';
import { FlowStepProps } from 'template-registry-module';
import { useAppStore } from '@/lib/store';
import { useIndexedDB } from '@/hooks/useIndexedDB';

// Definition of types for saved items
interface SavedItem {
  id: string;
  type: string;
  title: string;
  content: any;
  savedAt?: string;
}

const SavedItemsListFlowStep: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode
}) => {
  // Component states
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [dataFetched, setDataFetched] = useState<boolean>(false); // Flag to prevent multiple fetches

  // Get store
  const processTemplate = useAppStore(state => state.processTemplate);
  const updateByContextPath = useAppStore(state => state.updateByContextPath); // Używamy updateByContextPath zamiast setContextPath
  const getContextPath = useAppStore(state => state.getContextPath);
  const getContext = useAppStore(state => state.getContext);

  // Hook for IndexedDB handling
  const indexedDB = useIndexedDB();
  const getAllItems = indexedDB.getAllItems;

  // Get configuration from node.attrs
  const layout = node.attrs?.layout || 'table'; // 'table' or 'cards'
  const filterTypes = node.attrs?.filterTypes || [];

  // Load saved items when component mounts
  useEffect(() => {
    // Only fetch data if it hasn't been fetched yet
    if (dataFetched) {
      return;
    }
    
    console.log('Starting to load items...');
    
    // Set initial loading state
    setLoading(true);
    
    // Flag to track if component is still mounted
    let isMounted = true;
    
    const loadSavedItems = async () => {
      try {
        // Set a timeout in case the data fetch hangs
        const timeoutId = setTimeout(() => {
          if (isMounted && loading) {
            console.log('Data fetch timeout - setting loading to false');
            setLoading(false);
            setError('Timeout when loading saved items');
          }
        }, 5000); // 5 second timeout
        
        // Get items from indexedDB
        console.log('Calling getAllItems()');
        const savedItems = await getAllItems();
        console.log('Received items:', savedItems);
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        // Check if component is still mounted before updating state
        if (isMounted) {
          // Safeguard against undefined values
          const itemsArray = Array.isArray(savedItems) ? savedItems : [];
          console.log('Saving items to state:', itemsArray);
          setItems(itemsArray);
          setLoading(false);
          setDataFetched(true); // Mark data as fetched
        }
      } catch (err) {
        console.error('Error loading saved items:', err);
        
        // Check if component is still mounted before updating state
        if (isMounted) {
          setError('Failed to load saved items');
          setLoading(false);
          setDataFetched(true); // Mark as fetched even on error to prevent retries
        }
      }
    };

    // Call the loading function
    loadSavedItems();
    
    // Cleanup function to prevent state updates after unmounting
    return () => {
      console.log('Component unmounting');
      isMounted = false;
    };
  // We still need to run this effect when component mounts, but avoid re-fetching
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataFetched]);

  // Process assistant message
  const processedMessage = node.assistantMessage 
    ? processTemplate(node.assistantMessage) 
    : '';

  // Handle item selection - teraz natychmiast ładuje dane i przechodzi do podglądu
  const handleSelectItem = async (item: SavedItem) => {
    // If selecting the same item, just submit to continue
    if (selectedItem && selectedItem.id === item.id) {
      handleSubmit();
      return;
    }
    
    setSelectedItem(item);
    
    // Używamy updateByContextPath zamiast setContextPath
    if (node.contextPath) {
      updateByContextPath('savedItems.selectedItem', item);
    }
    
    // Natychmiast ładujemy dane i przechodzimy do podglądu
    if (item && item.content) {
      // 1. Załaduj oryginalną zawartość
      if (item.content.content) {
        updateByContextPath('generatedContent', item.content.content);
      }
      
      // 2. Załaduj oryginalny kontekst sesji uczenia
      if (item.content.context) {
        updateByContextPath('learningSession', item.content.context);
      }
      
      // 3. Załaduj dodatkowy kontekst jeśli istnieje
      if (item.content.additionalContext) {
        // Aktualizacja każdego klucza z additionalContext osobno
        Object.entries(item.content.additionalContext).forEach(([key, value]) => {
          updateByContextPath(key, value);
        });
      }

      // 4. Kontekst specyficzny dla typów zawartości
      if (item.type === 'quiz' && item.content.quizContent) {
        updateByContextPath('quizContent', item.content.quizContent);
        // Wyczyść wyniki quizu, aby można było go ponownie wykonać
        updateByContextPath('quizResults', null);
      } else if (item.type === 'project' && item.content.projectWork) {
        updateByContextPath('projectWork', item.content.projectWork);
      }
      
      // Małe opóźnienie, aby kontekst zdążył się zaktualizować
      setTimeout(() => {
        onSubmit({
          selectedItem: item,
          timestamp: new Date().toISOString()
        });
      }, 100);
    }
  };

  // Handle submission of selection
  const handleSubmit = () => {
    if (!selectedItem) {
      alert('Please select an item from the list to continue.');
      return;
    }
    
    // Now update the full context with the selected item's data
    if (selectedItem && selectedItem.content) {
      // Całkowite wyczyszczenie i odtworzenie całej struktury danych
      
      // 1. Załaduj oryginalną zawartość dokładnie w tym samym formacie, 
      // jak była wygenerowana
      if (selectedItem.content.content) {
        updateByContextPath('generatedContent', selectedItem.content.content);
      }
      
      // 2. Załaduj oryginalny kontekst sesji uczenia
      if (selectedItem.content.context) {
        updateByContextPath('learningSession', selectedItem.content.context);
      }
      
      // 3. Załaduj dodatkowy kontekst jeśli istnieje
      if (selectedItem.content.additionalContext) {
        // Aktualizacja każdego klucza z additionalContext osobno
        Object.entries(selectedItem.content.additionalContext).forEach(([key, value]) => {
          updateByContextPath(key, value);
        });
      }

      // 4. Kontekst specyficzny dla typów zawartości
      if (selectedItem.type === 'quiz' && selectedItem.content.quizContent) {
        updateByContextPath('quizContent', selectedItem.content.quizContent);
        // Wyczyść wyniki quizu, aby można było go ponownie wykonać
        updateByContextPath('quizResults', null);
      } else if (selectedItem.type === 'project' && selectedItem.content.projectWork) {
        updateByContextPath('projectWork', selectedItem.content.projectWork);
      }
    }
    
    // Zawartość będzie wyświetlana dokładnie tak samo jak po wygenerowaniu
    // bez potrzeby używania specjalnego trybu podglądu
    
    onSubmit({
      selectedItem,
      timestamp: new Date().toISOString()
    });
  };

  // Handle filter type change - optimized to avoid flickering
  const handleFilterChange = (type: string | null) => {
    // Don't reset selection if filter hasn't changed
    if (filterType === type) {
      return;
    }
    
    // Set new filter
    setFilterType(type);
    
    // Check if selected item matches the new filter
    if (selectedItem && type !== null && selectedItem.type !== type) {
      setSelectedItem(null); // Reset selection only if it doesn't match the new filter
      // Also update the context to reflect that no item is selected
      updateByContextPath('savedItems.selectedItem', null);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Function to get icon for item type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'quiz':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'project':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    setDataFetched(false);
    setLoading(true);
    setError(null);
  };
  
  // Filter items by type (if filter is set)
  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];
  const filteredItems = filterType 
    ? safeItems.filter(item => item.type === filterType)
    : safeItems;

  // Component rendering
  return (
    <div className="space-y-4">
      {/* Assistant message */}
      {processedMessage && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="whitespace-pre-line">{processedMessage}</p>
        </div>
      )}
      
      {/* Header with filtering */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-4 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Zapisane materiały</h2>
          
          {!loading && (
            <button 
              onClick={handleRefresh}
              className="px-2 py-1 bg-white/20 rounded-md hover:bg-white/30 text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Odśwież
            </button>
          )}
        </div>
        
        {filterTypes.length > 0 && (
          <div className="flex mt-2 space-x-2">
            <button
              onClick={() => handleFilterChange(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${!filterType ? 'bg-white text-blue-600' : 'bg-blue-600/30 hover:bg-blue-600/50'}`}
            >
              Wszystkie
            </button>
            {filterTypes.map(type => (
              <button
                key={type}
                onClick={() => handleFilterChange(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${filterType === type ? 'bg-white text-blue-600' : 'bg-blue-600/30 hover:bg-blue-600/50'}`}
              >
                {type === 'lesson' ? 'Lekcje' : type === 'quiz' ? 'Quizy' : 'Projekty'}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 bg-white rounded-lg shadow border">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-10 min-h-[200px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <button 
              onClick={() => setLoading(false)}
              className="mt-4 text-sm text-blue-500 hover:text-blue-700"
            >
              Zatrzymaj ładowanie
            </button>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500 min-h-[200px] flex items-center justify-center">
            <div>{error}</div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-10 text-center text-gray-500 min-h-[200px] flex flex-col items-center justify-center">
            <p>Brak zapisanych materiałów{filterType ? ` typu: ${filterType}` : ''}.</p>
            <p className="mt-2 text-sm">Zapisz materiały z innych scenariuszy, aby móc je później przeglądać.</p>
          </div>
        ) : layout === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tytuł</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data zapisu</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`${selectedItem?.id === item.id ? 'bg-blue-50' : 'hover:bg-gray-50'} cursor-pointer transition-colors duration-150 hover:shadow`}
                    onClick={() => handleSelectItem(item)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(item.type)}
                        <span className="ml-2 text-sm">
                          {item.type === 'lesson' ? 'Lekcja' : item.type === 'quiz' ? 'Quiz' : 'Projekt'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500">
                        ID: {item.id.substring(0, 15)}...
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.content?.savedAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg transition-colors duration-150">
                        Kliknij, aby otworzyć
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className={`p-4 border rounded-lg shadow-sm cursor-pointer transition-all duration-200 ${
                  selectedItem?.id === item.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50 hover:shadow'
                }`}
                style={{ height: '180px', display: 'flex', flexDirection: 'column' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getTypeIcon(item.type)}
                    <span className="ml-2 text-sm font-medium text-gray-500">
                      {item.type === 'lesson' ? 'Lekcja' : item.type === 'quiz' ? 'Quiz' : 'Projekt'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(item.content?.savedAt).split(', ')[0]}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900 line-clamp-2">{item.title}</h3>
                <div className="mt-auto pt-3 flex justify-center">
                  <span className="w-full text-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg transition-colors duration-150">
                    Kliknij, aby otworzyć
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Wstecz
        </button>
        
        {/* 
          Nie potrzebujemy już przycisku "Wyświetl szczegóły", 
          ponieważ kliknięcie na element listy natychmiast prowadzi do podglądu
        */}
        {selectedItem && isLastNode && (
          <button
            onClick={() => handleSubmit()}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Zakończ
          </button>
        )}
      </div>
    </div>
  );
};

export default SavedItemsListFlowStep;