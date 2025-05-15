// src/components/I.tsx (Refactored)
import { useState, useEffect } from "react";

// Cache for SVG content
const cache: Record<string, string> = {};
const load: Record<string, Promise<string>> = {};

export const I = ({
  name,
  className = "inline-block w-4 h-4 text-gray-500 fill-current stroke-current",
  fallback = null,
  ...props
}: {
  name: string;
  className?: string;
  fallback?: React.ReactNode;
  [key: string]: any;
}) => {
  const [svg, setSvg] = useState(cache[name]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (svg) return; // Already loaded

    // Start loading if not already in progress
    if (!load[name]) {
      load[name] = fetch(`/icons/${name}.svg`)
        .then(res => res.ok ? res.text() : Promise.reject())
        .then(text => {
          // Clean SVG by removing width/height and adding preserveAspectRatio
          const cleanedSvg = text
            .replace(/width="([^"]*)"/g, '')
            .replace(/height="([^"]*)"/g, '')
            .replace(/<svg/g, '<svg preserveAspectRatio="xMidYMid meet"');
          
          cache[name] = cleanedSvg;
          return cleanedSvg;
        });
    }

    // Track component mount state
    let mounted = true;
    
    // Set SVG content or error state
    load[name]
      .then(text => mounted && setSvg(text))
      .catch(() => mounted && setError(true));

    return () => { mounted = false; };
  }, [name, svg]);

  // Show fallback or nothing during loading or on error
  if (!svg && !error) return fallback || null;
  if (error) return null;

  // Render the SVG
  return (
    <i
      className={className}
      {...props}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default I;