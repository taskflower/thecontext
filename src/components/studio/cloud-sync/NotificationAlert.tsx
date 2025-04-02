// src/components/studio/cloud-sync/NotificationAlert.tsx
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";

interface NotificationAlertProps {
  type: "error" | "success";
  title: string;
  message: string | null;
}

export const NotificationAlert: React.FC<NotificationAlertProps> = ({
  type,
  title,
  message,
}) => {
  if (!message) return null;

  if (type === "error") {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert
      variant="default"
      className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-100 mt-4 border-green-200 dark:border-green-800"
    >
      <Check className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default NotificationAlert;