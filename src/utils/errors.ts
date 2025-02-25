// src/utils/errors.ts
export class DocumentError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'DocumentError';
    }
  }
  
  export const Errors = {
    CONTAINER_EXISTS: (name: string) => new DocumentError(`Kontener o nazwie "${name}" już istnieje`),
    CONTAINER_HAS_RELATIONS: () => new DocumentError('Nie można usunąć kontenera z istniejącymi relacjami'),
    DOCUMENT_TITLE_REQUIRED: () => new DocumentError('Tytuł dokumentu jest wymagany'),
    INVALID_RELATION: (message?: string) => new DocumentError(`Nieprawidłowa konfiguracja relacji${message ? `: ${message}` : ''}`),
    // Adding missing error definitions:
    CONTAINER_NAME_REQUIRED: () => new DocumentError('Nazwa kontenera jest wymagana'),
    DOCUMENT_CONTAINER_REQUIRED: () => new DocumentError('ID kontenera jest wymagane'),
    DOCUMENT_NOT_FOUND: () => new DocumentError('Dokument nie został znaleziony'),
    RELATION_CONFIG_NOT_FOUND: () => new DocumentError('Konfiguracja relacji nie została znaleziona'),
    RELATION_CONFIG_IN_USE: () => new DocumentError('Nie można usunąć konfiguracji relacji która jest w użyciu')
  } as const;