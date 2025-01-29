// src/layouts/AdminTemplate.tsx
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MainTitle from "./MainTitle";
import Breadcrumbs from "@/components/ui/braadcrumbs";
import { useNavigate } from "react-router-dom";

interface AdminTemplateProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  backPath?: string;
  actions?: React.ReactNode;
  showBreadcrumbs?: boolean;
}

export default function AdminOutletTemplate({
  title,
  description,
  icon,
  children,
  backPath,
  actions,
}: AdminTemplateProps) {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Breadcrumbs />

      <div className="flex justify-between items-center">
        <MainTitle title={title} icon={icon} description={description} />

        <div className="flex gap-4 items-center">
         
          {backPath && (
            <Button variant="ghost" onClick={() => navigate(backPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          )}
           {actions}
        </div>
      </div>

      {children}
    </div>
  );
}
