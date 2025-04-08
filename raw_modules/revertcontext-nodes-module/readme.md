# nodes-module

A TypeScript library for managing interactive flow nodes in browser-based applications.

## What's This?

This module provides a complete system for handling nodes in flow-based applications:

- Create and manipulate nodes (steps in a user flow)
- Process context variables between nodes
- Transform node templates with dynamic content
- Execute node logic with user inputs
- Manage user responses within flow context

## Key Features

- No backend required - works entirely in the browser
- Handles context variable substitution using `{{variable.path}}` syntax
- JSON path support for nested data structures
- Plugin system for extensible node behaviors
- TypeScript for better development experience

## Core Concepts

- **Node**: A single step in a flow (like a chat message with assistant text)
- **Context**: Variables that persist between nodes
- **Templates**: Text containing variables like `"Hello {{user.name}}"`

## Simple Usage

```typescript
import { NodeManager } from 'nodes-module';

// Create nodes manager
const nodeManager = new NodeManager([
  {
    id: 'welcome',
    scenarioId: 'intro',
    label: 'Welcome',
    assistantMessage: 'Hello {{user.name}}! Welcome to the flow!'
  }
]);

// Process with context
const processedNode = nodeManager.prepareNodeForDisplay('welcome', [
  {id: 'user', title: 'user', content: '{"name":"Alice"}'}
]);

// Get message with substituted variables
console.log(processedNode.assistantMessage); // "Hello Alice! Welcome to the flow!"
```