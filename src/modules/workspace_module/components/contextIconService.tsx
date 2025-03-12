// src/modules/workspaces_module/components/contextIconService.tsx
import React from 'react';
import { 
  Box,
  Globe, 
  Users, 
  Target, 
  Info,
  Tag,
  Building,
  Calendar,
  FileText,
  Link,
  MessageCircle,
  Settings,
  Hash,
  Bookmark,
  LucideIcon
} from "lucide-react";

// Map of all available icons
export const availableIcons: Record<string, LucideIcon> = {
  box: Box,
  globe: Globe,
  users: Users,
  target: Target,
  info: Info,
  tag: Tag,
  building: Building,
  calendar: Calendar,
  fileText: FileText,
  link: Link,
  messageCircle: MessageCircle,
  settings: Settings,
  hash: Hash,
  bookmark: Bookmark
};

// Map context keys to their respective icon keys
const contextIconMap: Record<string, string> = {
  url: 'globe',
  audience: 'users',
  businessGoal: 'target',
  keywords: 'tag',
  competitors: 'building',
  notes: 'fileText',
  schedule: 'calendar',
  links: 'link',
  messages: 'messageCircle',
  settings: 'settings',
  tags: 'hash',
  bookmarks: 'bookmark'
};

/**
 * Returns the icon component for a given context key
 */
export const getContextIconComponent = (key: string): LucideIcon => {
  // Make sure to handle case sensitivity by converting to lowercase
  const iconKey = contextIconMap[key.toLowerCase()] || 'box';
  return availableIcons[iconKey] || Box;
};

/**
 * Register a new context icon mapping
 */
export const registerContextIcon = (
  contextKey: string, 
  iconKey: string
): void => {
  if (availableIcons[iconKey]) {
    contextIconMap[contextKey.toLowerCase()] = iconKey;
  }
};

/**
 * Returns the rendered icon element
 */
export const renderContextIcon = (key: string): React.ReactElement => {
  const IconComponent = getContextIconComponent(key);
  // Use JSX syntax to ensure proper rendering
  return <IconComponent className="h-4 w-4" />;
};

export default {
  renderContextIcon,
  registerContextIcon,
  getContextIconComponent,
  availableIcons,
  contextIconMap
};