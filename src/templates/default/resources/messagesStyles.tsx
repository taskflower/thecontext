import { MessageSquare, Shield, User, Info } from "lucide-react";
export const messagesStyles = {
    assistant: {
      container: "bg-blue-50 border-blue-100",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      titleColor: "text-lg font-semibold mb-2",
      textColor: "text-gray-700",
      icon: <MessageSquare size={20} />,
    },
    system: {
      container: "bg-amber-50 border-amber-100",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
      titleColor: "text-sm font-medium text-amber-800 mb-1",
      textColor: "text-xs text-amber-700",
      icon: <Shield size={20} />,
    },
    user: {
      container: "bg-green-50 border-green-100",
      iconBg: "bg-green-100",
      iconColor: "text-green-500",
      titleColor: "text-sm font-medium text-green-800 mb-1",
      textColor: "text-xs text-green-700",
      icon: <User size={20} />,
    },
    debug: {
      container: "bg-gray-100 border-gray-200",
      iconBg: "bg-gray-200",
      iconColor: "text-gray-500",
      titleColor: "text-sm font-medium text-gray-800 mb-1",
      textColor: "text-xs text-gray-800",
      icon: <Info size={20} />,
    },
  };