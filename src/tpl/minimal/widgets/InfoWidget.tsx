// src/tpl/minimal/widgets/InfoWidget.tsx
import React from "react";
import { InfoWidgetProps } from "@/types";

const InfoWidget: React.FC<InfoWidgetProps> = ({
  title,
  content,
  icon,
  variant = 'default',
  data = {},
}) => {
  // Determine variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          title: 'text-blue-800',
          content: 'text-blue-700',
          icon: 'text-blue-500',
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          title: 'text-green-800',
          content: 'text-green-700',
          icon: 'text-green-500',
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          title: 'text-yellow-800',
          content: 'text-yellow-700',
          icon: 'text-yellow-500',
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          title: 'text-red-800',
          content: 'text-red-700',
          icon: 'text-red-500',
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          title: 'text-gray-800',
          content: 'text-gray-700',
          icon: 'text-gray-500',
        };
    }
  };

  const styles = getVariantStyles();
  
  // Render appropriate icon
  const renderIcon = () => {
    if (icon) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.icon}
        >
          <path d={icon} />
        </svg>
      );
    } else {
      // Default icons based on variant
      switch (variant) {
        case 'info':
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.icon}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          );
        case 'success':
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.icon}
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          );
        case 'warning':
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.icon}
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          );
        case 'error':
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.icon}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          );
        default:
          return null;
      }
    }
  };

  // Get content from props or data
  const displayContent = content || data.content || data.message || "";
  const displayTitle = title || data.title || "";

  return (
    <div className={`rounded-lg border p-4 ${styles.container}`}>
      <div className="flex">
        {renderIcon() && (
          <div className="mr-3 flex h-6 w-6 items-center justify-center">
            {renderIcon()}
          </div>
        )}
        <div>
          {displayTitle && (
            <h4 className={`text-sm font-medium ${styles.title} mb-1`}>{displayTitle}</h4>
          )}
          <div className={`text-sm ${styles.content}`}>
            {typeof displayContent === 'string' 
              ? displayContent 
              : displayContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoWidget;