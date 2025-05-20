// src/themes/energygrant/fieldRegistry.ts
import RoleSelectField from '@/themes/energygrant/commons/form/role';
import defaultRegistry from '../default/fieldRegistry';

/**
 * Rejestr komponentów pól dla motywu `energygrant` – rozszerza domyślny
 */
const energyGrantRegistry = {
  ...defaultRegistry,
  role: RoleSelectField,
};

export default energyGrantRegistry;