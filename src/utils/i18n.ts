// src/utils/i18n.ts
import { i18n } from "@lingui/core"

export async function loadCatalog(locale: string) {
  const [boards, documents, tasks, settings, users, projects] = await Promise.all([
    import(`../locales/boards/${locale}.po`),
    import(`../locales/documents/${locale}.po`),
    import(`../locales/tasks/${locale}.po`),
    import(`../locales/settings/${locale}.po`),
    import(`../locales/users/${locale}.po`),
    import(`../locales/projects/${locale}.po`),
  ]);

  const messages = {
    ...boards.messages,
    ...documents.messages,
    ...tasks.messages,
    ...settings.messages,
    ...users.messages,
    ...projects.messages,
  };

  await i18n.load(locale, messages);
  await i18n.activate(locale);
}
