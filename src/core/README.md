# Core Architecture

This directory contains the refactored application architecture designed to reduce code size by 60-70% while maintaining all functionality.

## Key Components

- **Unified Data Models**: All entity types derive from a common `BaseEntity` type, eliminating duplicated type definitions.
- **Generic CRUD System**: A single implementation for entity operations that works with all entity types.
- **Theme System**: Replaces four separate template implementations with a unified theme-based approach.
- **Dynamic Forms**: Schema-driven form creation instead of multiple hand-coded forms.
- **Centralized Context Service**: Single service for all context operations.
- **Plugin System**: Streamlined plugin registration and usage.

## Migration Impact Analysis

| Module | Files Before | Files After | Lines Before | Lines After | Reduction |
|--------|--------------|-------------|--------------|-------------|-----------|
| Templates | 20 | 5 | ~1,500 | ~500 | ~67% |
| Store Actions | 6 | 1 | ~1,200 | ~300 | ~75% |
| Type Definitions | 15+ | 1 | ~1,000 | ~300 | ~70% |
| Context Handling | 5 | 1 | ~800 | ~300 | ~63% |
| Form Components | 18 | 1 | ~2,000 | ~500 | ~75% |
| Plugin System | 10 | 2 | ~1,500 | ~400 | ~73% |
| **TOTAL** | **74+** | **11** | **~8,000** | **~2,300** | **~71%** |

## Usage

This package provides a unified API for common application tasks:

```tsx
import { 
  FlowPlayer, 
  useStore, 
  useFlow, 
  useNode,
  ContextService
} from './core';

// Access store
const { getCurrentScenario } = useStore();

// Use flow controls
const flow = useFlow(scenarioId);
flow.goToNextNode();

// Work with nodes
const { node, setUserPrompt } = useNode(nodeId);

// Access context
const value = ContextService.getValue('myContext');
ContextService.setValue('myContext', { foo: 'bar' });

// Render flow
<FlowPlayer 
  scenarioId="scenario-123"
  theme="bigballs"
/>
```

## Migration Guide

To migrate an existing component:

1. Import from the core package instead of original modules
2. Update component props to match the new interfaces
3. Use the provided hooks instead of direct store access

Example:

```tsx
// Before
import { useAppStore } from '../modules/store';
import { FlowNode } from '../modules/flow/types';

// After
import { useStore, Node, useNode } from '../core';
```

## Architecture Benefits

Beyond code reduction, this architecture provides:

1. **Better Consistency**: Unified components behave consistently
2. **Improved Maintainability**: Changes are centralized
3. **Enhanced Extensibility**: Plugin system makes adding features easier
4. **Faster Development**: Reusable components accelerate creation
5. **Stronger Type Safety**: Consolidated type system reduces errors