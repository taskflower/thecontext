# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- `npm run dev` - Start the development server (Vite)
- `npm run build` - Build for production (TypeScript compiler + Vite build)
- `npm run lint` - Run ESLint to check for code issues
- `npm run build:plugins` - Build plugins with custom TypeScript config
- `npm run preview` - Preview the production build locally
- `npm run messages:extract` - Extract i18n messages with Lingui

## Code Style & Conventions
- **Components**: Use functional components with explicit types (`React.FC<Props>`)
- **TypeScript**: Always define interfaces/types for props, state, and function returns
- **Naming**: PascalCase for components/types/interfaces, camelCase for functions/variables
- **Imports**: Group imports (React, third-party, internal) with `@/` alias paths
- **State Management**: Zustand with immer middleware for immutable state updates
- **Module Structure**: Domain-driven approach with modules in `src/modules/`
- **UI Components**: Use shadcn/ui components from `src/components/ui/`
- **Error Handling**: Use try/catch blocks with meaningful error messages
- **Internationalization**: Use Lingui macros for translations
- **Formatting**: 2-space indentation, semicolons, 100-character line length

## Project Architecture
- Feature modules in `src/modules/` with component/context/action separation
- UI component library in `src/components/ui/` based on shadcn
- IndexedDB for client-side storage with central service
- Firebase (optional) for backend services when available

## Error Handling System
- Backend returns standardized error responses with `success`, `error.code`, `error.message`, and optional `error.details`
- Common backend error codes: `UNAUTHORIZED`, `INSUFFICIENT_TOKENS`, `INVALID_INPUT`, `NOT_FOUND`, `RATE_LIMIT_EXCEEDED`, `FIREBASE_AUTH_ERROR`, `FIREBASE_DB_ERROR`, `INTERNAL_ERROR`, `SERVICE_UNAVAILABLE`
- AI service-specific errors need special handling for subscription/token purchase prompts
- Frontend error handling uses centralized utility with axios interceptors to process errors consistently
- UI components display appropriate severity levels with clear guidance for resolution
- Error boundaries prevent UI crashes and provide fallback UI
- Notification system uses toasts for transient errors and modal dialogs for blocking errors
- AI-specific errors guide users to purchase tokens, understand service availability issues, or retry with modified inputs