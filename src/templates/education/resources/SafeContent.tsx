    // src/components/ui/SafeContent.tsx
import React from 'react';

interface SafeContentProps {
  content: any;
  className?: string;
}

/**
 * Komponent do bezpiecznego renderowania dowolnej zawartości
 * Obsługuje różne typy danych i zapobiega typowym błędom renderowania w React
 */
const SafeContent: React.FC<SafeContentProps> = ({ content, className = '' }) => {
  // Obsługa wartości null i undefined
  if (content === null || content === undefined) {
    return null;
  }
  
  // Obsługa prymitywów
  if (typeof content === 'string' || typeof content === 'number' || typeof content === 'boolean') {
    return <span className={className}>{String(content)}</span>;
  }
  
  // Obsługa tablic
  if (Array.isArray(content)) {
    return (
      <div className={className}>
        {content.map((item, index) => (
          <div key={index}>
            <SafeContent content={item} />
          </div>
        ))}
      </div>
    );
  }
  
  // Obsługa obiektów
  if (typeof content === 'object') {
    // Obsługa typowych struktur obiektów
    if ('nazwa' in content && 'definicja' in content) {
      return (
        <div className={className}>
          <div className="font-medium">{content.nazwa}</div>
          <div>{content.definicja}</div>
        </div>
      );
    }
    
    if ('przyklad' in content) {
      return <div className={className}>{content.przyklad}</div>;
    }
    
    if ('tresc' in content) {
      return <div className={className}>{content.tresc}</div>;
    }
    
    if ('cwiczenie' in content && 'odpowiedz' in content) {
      return (
        <div className={`space-y-1 ${className}`}>
          <div><strong>Ćwiczenie:</strong> {content.cwiczenie}</div>
          <div><strong>Odpowiedź:</strong> {content.odpowiedz}</div>
        </div>
      );
    }
    
    // Fallback dla innych obiektów - wyświetl jako JSON
    return <pre className={className}>{JSON.stringify(content, null, 2)}</pre>;
  }
  
  // Ostateczny fallback dla innych typów
  return <span className={className}>{String(content)}</span>;
};

export default SafeContent;