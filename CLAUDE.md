# The Context App - Development Guidelines

## Commands
- `npm run dev` - Start the development server (Vite)
- `npm run build` - Build for production (runs TypeScript compiler + Vite build)
- `npm run lint` - Run ESLint to check for code issues
- `npm run build:plugins` - Build plugins with custom TypeScript config
- `npm run preview` - Preview the production build locally
- `npm run messages:extract` - Extract i18n messages with Lingui

## Code Style & Conventions
- **Components**: Use functional components with explicit types (`React.FC<Props>`)
- **TypeScript**: Always define interfaces/types for props, state, and function returns
- **Naming**: PascalCase for components/types/interfaces, camelCase for functions/variables
- **Imports**: Group imports (React, third-party, internal) with alias paths (@/ prefix)
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