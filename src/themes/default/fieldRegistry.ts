// src/themes/default/fieldRegistry.ts
import BooleanField from '@/themes/default/commons/form/boolean';
import StringField from '@/themes/default/commons/form/string';
import TextField from '@/themes/default/commons/form/text';
import HiddenField from '@/themes/default/commons/form/hidden';

/**
 * Rejestr domyślnych komponentów pól dla motywu `default`
 */
const defaultRegistry: Record<string, React.ComponentType<any>> = {
  boolean: BooleanField,
  string: StringField,
  text: TextField,
  hidden: HiddenField,
};

export default defaultRegistry;