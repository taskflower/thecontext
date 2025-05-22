import React, { useMemo, useState } from "react";
import { useFlow } from "@/core";
import { useConfig } from "@/ConfigProvider";
import { I } from "@/components";
import { useParams, useNavigate } from "react-router-dom";
import { useAppNavigation } from "@/core/navigation";
import { ChevronRight, HelpCircle, HousePlug } from "lucide-react";
import { useDarkMode } from "../utils/ThemeUtils";
import { Footer } from "../commons/Footer";
import BackgroundDecorator2 from "../commons/BackgroundDecorator2";

interface LayoutContext {
  workspace?: { slug: string; name?: string };
  scenario?: { slug: string };
}

interface Props {
  children: React.ReactNode;
  context?: LayoutContext;
}

const DashboardLayout: React.FC<Props> = ({ children, context }) => {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
};

export default DashboardLayout;
