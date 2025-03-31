// src/modules/databaseConfigurator/index.ts
import DatabaseConfigurator from './componentst/DatabaseConfigurator';
import { 
  initDatabase, 
  addItemsToCollection, 
  getAllItems, 
  getItemsByIndex,
  deleteItems,
  createDatabaseConfig,
  generateNodesFromData,
  type DatabaseConfig,
  type CollectionSchema
} from './databaseConfigurator';

export {
  DatabaseConfigurator,
  initDatabase,
  addItemsToCollection,
  getAllItems,
  getItemsByIndex,
  deleteItems,
  createDatabaseConfig,
  generateNodesFromData,
  type DatabaseConfig,
  type CollectionSchema
};

export default DatabaseConfigurator;