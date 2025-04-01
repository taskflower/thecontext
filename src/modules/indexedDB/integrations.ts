import { setupLanguageLearningData } from './setupLanguageLearning';

/**
 * Initialize all integration data for IndexedDB
 * This module handles the setup of data for all app integrations
 */
export async function initializeIntegrations() {
  console.log('Initializing IndexedDB integrations...');
  
  // Set up language learning data
  try {
    const result = await setupLanguageLearningData();
    console.log('Language learning data initialization:', result ? 'success' : 'failed');
  } catch (error) {
    console.error('Error initializing language learning data:', error);
  }
  
  console.log('IndexedDB integrations initialization complete');
}