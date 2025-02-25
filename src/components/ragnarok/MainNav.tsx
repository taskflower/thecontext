import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Database, FileText, CheckSquare } from 'lucide-react';
import { cn } from '@/services/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const items: NavItem[] = [
  {
    title: 'Containers',
    href: '/containers',
    icon: <Database className="mr-2 h-4 w-4" />,
  },
  {
    title: 'Documents',
    href: '/documents',
    icon: <FileText className="mr-2 h-4 w-4" />,
  },
  {
    title: 'Tasks',
    href: '/tasks',
    icon: <CheckSquare className="mr-2 h-4 w-4" />,
  },
];

export function MainNav() {
  return (
    <div className="mr-4 flex">
      <Link to="/" className="mr-6 flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">
          Ragnarok
        </span>
      </Link>
      <nav className="flex items-center gap-2">
        {items.map((item) => (
          <Button key={item.href} variant="ghost" asChild>
            <Link
              to={item.href}
              className={cn(
                "flex h-10 items-center text-sm font-medium transition-colors"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  );
}