# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn type-check` - Run TypeScript type checking
- `yarn lint` - Run ESLint

## Code Style Guidelines
- **Imports**: Group imports by type (React, third-party, local)
- **TypeScript**: Strict mode enabled, use proper type annotations for all variables and functions
- **Components**: Use functional React components with TypeScript interfaces for props
- **Naming**: PascalCase for components, camelCase for functions/variables, interfaces with `I` prefix
- **File Structure**: Components in separate files, hooks in `hooks/` directory
- **Error Handling**: Use error boundaries for React components, try/catch for async operations
- **State Management**: Zustand for global state, React hooks for local state
- **Paths**: Use absolute imports with `@/` alias
- **Comments**: Use JSDoc for functions, include purpose descriptions for complex logic

Always run `yarn type-check` and `yarn lint` before submitting changes.