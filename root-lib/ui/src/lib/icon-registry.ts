import {
  Code,
  Star,
  Zap,
  Home,
  Settings,
  User,
  Mail,
  Phone,
} from 'lucide-react';

export const iconRegistry = {
  Code,
  Star,
  Zap,
  Home,
  Settings,
  User,
  Mail,
  Phone,
} as const;

export type IconName = keyof typeof iconRegistry;

export const getIcon = (name: IconName) => iconRegistry[name];
