import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);

  const generateBreadcrumbs = () => {
    return paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      
      return {
        label,
        url,
        isLast: index === paths.length - 1
      };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground pb-4">
      <Link 
        to="/" 
        className="flex items-center hover:text-primary transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map(({ label, url, isLast }) => (
        <React.Fragment key={url}>
          <ChevronRight className="h-4 w-4" />
          {isLast ? (
            <span className="text-foreground font-medium">{label}</span>
          ) : (
            <Link 
              to={url}
              className="hover:text-primary transition-colors"
            >
              {label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}