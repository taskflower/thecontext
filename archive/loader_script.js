// Language Learning Template - IndexedDB Loader Script
// This script helps load the data from the imported template into IndexedDB collections

/**
 * Initialize the language learning data in IndexedDB
 * @param {Object} importData The imported data object
 */
async function initLanguageLearningData(importData) {
  try {
    console.log('Initializing language learning data...');
    
    if (!importData || !importData.indexed_db || !importData.indexed_db.collections) {
      console.error('Invalid import data format - missing IndexedDB collections');
      return false;
    }
    
    // Get references to the IndexedDB service
    const { IndexedDBService } = await import('../src/modules/indexedDB/service');
    
    // Process each collection in the import data
    for (const collection of importData.indexed_db.collections) {
      try {
        // Ensure the collection exists
        console.log(`Creating collection: ${collection.name}`);
        await IndexedDBService.ensureCollection(collection.name);
        
        // Clear any existing data to avoid conflicts
        await IndexedDBService.clearCollection(collection.name);
        
        // Add all items to the collection
        for (const item of collection.items) {
          console.log(`Adding item to ${collection.name}:`, item.id);
          await IndexedDBService.saveItem(collection.name, item, item.id);
        }
        
        console.log(`Successfully loaded collection: ${collection.name}`);
      } catch (error) {
        console.error(`Error processing collection ${collection.name}:`, error);
      }
    }
    
    console.log('Language learning data initialization complete!');
    return true;
  } catch (error) {
    console.error('Failed to initialize language learning data:', error);
    return false;
  }
}

/**
 * Initialize context items from the imported data
 * @param {Object} importData The imported data object 
 * @param {Function} addContextItem Function to add context items to the store
 */
async function initContextItems(importData, addContextItem) {
  try {
    console.log('Initializing context items...');
    
    if (!importData || !importData.context_items) {
      console.error('Invalid import data format - missing context items');
      return false;
    }
    
    // Add each context item to the store
    for (const item of importData.context_items) {
      console.log(`Adding context item: ${item.title}`);
      addContextItem({
        title: item.title,
        type: item.type === 'JSON' ? 'json' : 
              item.type === 'TEXT' ? 'text' : 
              item.type === 'MARKDOWN' ? 'markdown' : 
              item.type === 'INDEXED_DB' ? 'indexedDB' : 'text',
        content: item.content,
        persistent: item.persistent || false,
        metadata: item.type === 'INDEXED_DB' ? { collection: item.content } : undefined
      });
    }
    
    console.log('Context items initialization complete!');
    return true;
  } catch (error) {
    console.error('Failed to initialize context items:', error);
    return false;
  }
}

/**
 * Load the language learning template
 * This function would be called after importing the template
 */
async function loadLanguageLearningTemplate() {
  try {
    console.log('Loading language learning template...');
    
    // Load the import data from the file
    const response = await fetch('/temp_imports/language_learning_app.json');
    const importData = await response.json();
    
    // Get the necessary functions from the store
    const { useAppStore } = await import('../src/modules/store');
    const store = useAppStore.getState();
    
    // Initialize the data
    await initLanguageLearningData(importData);
    await initContextItems(importData, store.addContextItem);
    
    console.log('Language learning template loaded successfully!');
    
    // Optionally, you could navigate to the dashboard scenario
    if (importData.flowchart-app-state && 
        importData.flowchart-app-state.state && 
        importData.flowchart-app-state.state.selected) {
      const { workspace, scenario } = importData.flowchart-app-state.state.selected;
      
      if (workspace && scenario) {
        store.selectWorkspace(workspace);
        store.selectScenario(scenario);
        console.log(`Navigated to workspace: ${workspace}, scenario: ${scenario}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to load language learning template:', error);
    return false;
  }
}

// Export functions for use in the application
export {
  initLanguageLearningData,
  initContextItems,
  loadLanguageLearningTemplate
};