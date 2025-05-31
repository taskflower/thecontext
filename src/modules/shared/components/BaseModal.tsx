// src/shared/components/BaseModal.tsx
import React from "react";
import { X } from "lucide-react";

interface BaseModalProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  position?: number;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  title,
  subtitle,
  icon,
  onClose,
  children,
  actions,
  position,
}) => {
  return (
    <div
      className={`fixed ${position === 1 ? "left-6" : position === 2 ? "left-12" : "right-6"} top-10 z-50 w-96 bg-white rounded-lg shadow-xl border border-zinc-200 h-[90vh] flex flex-col `}
    >
      <div className="p-3 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-zinc-900 flex items-center gap-1.5">
            {icon}
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-zinc-500 truncate">{subtitle}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-600 p-1 rounded hover:bg-zinc-100"
        >
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
      {actions && (
        <div className="p-3 border-t border-zinc-200 bg-zinc-50">{actions}</div>
      )}
    </div>
  );
};
