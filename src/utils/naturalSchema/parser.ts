// src/utils/naturalSchema/parser.ts
import { Schema, SchemaProperty, ValidationRule } from './types';

export class SchemaParser {
  private static parseValidationRules(ruleString: string): ValidationRule[] {
    if (!ruleString) return [];

    return ruleString
      .split(',')
      .map(rule => {
        const [type, value] = rule.trim().split('=');
        
        // Parsowanie wartości w zależności od typu reguły
        let parsedValue: string | number | boolean | string[];
        if (type === 'enum') {
          parsedValue = value.split('|').map(v => v.trim());
        } else if (type === 'min' || type === 'max') {
          parsedValue = Number(value);
        } else {
          parsedValue = value;
        }

        return { type: type as ValidationRule['type'], value: parsedValue };
      });
  }

  private static parseType(typeString: string): SchemaProperty {
    // Sprawdzanie czy to tablica
    if (typeString.startsWith('array[')) {
      const itemType = typeString.match(/array\[(.*?)\]/)?.[1] || 'string';
      return {
        type: 'array',
        items: this.parseType(itemType)
      };
    }

    // Sprawdzanie czy typ zawiera reguły walidacji
    const [baseType, validationRules] = typeString.split('(');
    const property: SchemaProperty = {
      type: baseType as SchemaProperty['type']
    };

    if (validationRules) {
      property.validation = this.parseValidationRules(
        validationRules.replace(')', '')
      );
    }

    return property;
  }

  static parseFromMarkdown(markdown: string): Schema {
    const lines = markdown.split('\n').filter(line => line.trim());
    const schema: Schema = { type: 'object', properties: {} };
    let currentPath: string[] = [];
    let currentProperties = schema.properties;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Pomijamy puste linie
      if (!trimmedLine) return;

      // Obsługa nagłówków
      if (line.startsWith('#')) {
        const level = line.match(/^#+/)?.[0].length || 1;
        const title = line.slice(level).trim();
        
        // Aktualizujemy ścieżkę na podstawie poziomu nagłówka
        currentPath = currentPath.slice(0, level - 1);
        currentPath.push(title);
        
        // Resetujemy wskaźnik do aktualnych właściwości
        currentProperties = schema.properties;
        for (const pathPart of currentPath.slice(0, -1)) {
          if (!currentProperties[pathPart]) {
            currentProperties[pathPart] = {
              type: 'object',
              properties: {}
            };
          }
          currentProperties = (currentProperties[pathPart] as SchemaProperty).properties!;
        }
      } 
      // Obsługa definicji typu
      else if (!line.startsWith('-')) {
        const lastKey = currentPath[currentPath.length - 1];
        currentProperties[lastKey] = this.parseType(trimmedLine);
      }
    });

    return schema;
  }
}