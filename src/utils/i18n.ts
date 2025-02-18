// src/utils/i18n.ts
import { i18n } from "@lingui/core"

export async function loadCatalog(locale: string) {
 const [
   auth,
   boards, 
   documents,
   tasks,
   settings,
   users,
   projects,
   plugins,
   common,
   layouts,
   hooks,
   system,
   public_messages
 ] = await Promise.all([
   import(`../locales/auth/${locale}.po`),
   import(`../locales/boards/${locale}.po`),
   import(`../locales/documents/${locale}.po`), 
   import(`../locales/tasks/${locale}.po`),
   import(`../locales/settings/${locale}.po`),
   import(`../locales/users/${locale}.po`),
   import(`../locales/projects/${locale}.po`),
   import(`../locales/plugins/${locale}.po`),
   import(`../locales/common/${locale}.po`),
   import(`../locales/layouts/${locale}.po`),
   import(`../locales/hooks/${locale}.po`),
   import(`../locales/system/${locale}.po`),
   import(`../locales/public/${locale}.po`)
 ]);

 const messages = {
   ...auth.messages,
   ...boards.messages,
   ...documents.messages,
   ...tasks.messages,
   ...settings.messages,
   ...users.messages,
   ...projects.messages,
   ...plugins.messages,
   ...common.messages,
   ...layouts.messages,
   ...hooks.messages,
   ...system.messages,
   ...public_messages.messages
 };

 await i18n.load(locale, messages);
 await i18n.activate(locale);
}