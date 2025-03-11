import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ManagementCardProps {
  title: ReactNode | string;
  description: ReactNode | string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

const MCard: React.FC<ManagementCardProps> = ({ 
  title, 
  description, 
  children,
  className = "",
  footer
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {footer && (
        <CardFooter>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};

export default MCard;