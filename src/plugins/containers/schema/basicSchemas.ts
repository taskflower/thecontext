// src/plugins/schema/basicSchemas.ts
import { SchemaPlugin } from './types';

export const noteSchema: SchemaPlugin = {
  id: 'note-schema',
  name: 'Note',
  schema: {
    id: 'note',
    name: 'Note',
    fields: [
      {
        name: 'tags',
        type: 'string',
        required: false
      },
      {
        name: 'priority',
        type: 'number',
        required: false
      },
      {
        name: 'dueDate',
        type: 'date',
        required: false
      }
    ]
  }
};

export const taskSchema: SchemaPlugin = {
  id: 'task-schema',
  name: 'Task',
  schema: {
    id: 'task',
    name: 'Task',
    fields: [
      {
        name: 'status',
        type: 'string',
        required: true
      },
      {
        name: 'assignee',
        type: 'string',
        required: false
      },
      {
        name: 'dueDate',
        type: 'date',
        required: true
      },
      {
        name: 'priority',
        type: 'number',
        required: true
      }
    ]
  }
};

export const contactSchema: SchemaPlugin = {
  id: 'contact-schema',
  name: 'Contact',
  schema: {
    id: 'contact',
    name: 'Contact',
    fields: [
      {
        name: 'email',
        type: 'string',
        required: true
      },
      {
        name: 'phone',
        type: 'string',
        required: false
      },
      {
        name: 'birthday',
        type: 'date',
        required: false
      }
    ]
  }
};