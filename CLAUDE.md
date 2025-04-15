# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn type-check` - Run TypeScript type checking
- `yarn lint` - Run ESLint
- `yarn test` - Run all tests
- `yarn test src/path/to/test.tsx` - Run a single test file

## Code Style Guidelines
- **Imports**: Group by type (React, third-party, local) with a blank line between groups
- **TypeScript**: Use strict typing with interfaces prefixed with `I` (e.g., `IProps`)
- **Components**: Prefer functional React components with explicit prop interfaces
- **Naming**: PascalCase for components/interfaces, camelCase for functions/variables
- **File Structure**: Templates organized by domains (default, education, gamifyEdu)
- **Error Handling**: Use error boundaries in React, try/catch for async operations
- **State Management**: Zustand for global state, React hooks for local state
- **Paths**: Use absolute imports with `@/` alias (e.g., `import { x } from @/components`)
- **Comments**: Use JSDoc for functions, explain complex logic with inline comments

Always run `yarn type-check` and `yarn lint` before submitting changes.
