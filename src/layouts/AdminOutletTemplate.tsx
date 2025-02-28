import React, { FC } from "react";
import MainTitleSecondary from "./MainTitleSecondary";
import IconCom from "@/components/common/IconComp";
import Breadcrumbs from "@/components/ui/braadcrumbs";
import { useCurrentModule } from "@/utils/utils";

interface AdminTemplateProps {
  // Zmieniamy typ title i description aby mogły przyjmować ReactNode
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  backPath?: string;
  actions?: React.ReactNode;
  showBreadcrumbs?: boolean;
}

const AdminOutletTemplate: FC<AdminTemplateProps> = ({
  title,
  description,
  children,
  actions,
}) => {
  const module = useCurrentModule();

  return (
    <div className="max-w-4xl mx-auto flex-1 flex-col space-y-8 p-0 md:p-8 md:flex h-full">
      <div className="p-3 md:p-0">
        <Breadcrumbs />
      </div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-3 md:p-0">
        <MainTitleSecondary
          title={title}
          icon={<IconCom icon={module} />}
          description={description}
        />
        <div className="flex gap-4 items-center">{actions ?? null}</div>
      </div>
      {children}
    </div>
  );
};

export default AdminOutletTemplate;