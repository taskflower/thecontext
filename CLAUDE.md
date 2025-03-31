# The Context App - Development Guidelines

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript compiler)
- `npm run lint` - Run ESLint
- `npm run build:plugins` - Build plugins
- `npm run messages:extract` - Extract i18n messages

## Code Style
- **TypeScript**: Strict mode, explicit return types
- **Components**: Use functional components with React.FC type
- **Naming**: PascalCase for components/types, camelCase for functions/variables
- **Imports**: Third-party first, then app imports using @/ alias
- **Styling**: Tailwind CSS with utility classes, use cn() for conditionals
- **State**: Zustand for state management, use selector pattern
- **Error Handling**: Try/catch with fallbacks, console logging for development
- **Formatting**: 2-space indentation, semicolons required
- **Testing**: No specific test setup found in package.json

## Project Structure
- Feature-based organization in src/modules/
- Shared components in src/components/
- i18n messages in src/locales/ using Lingui