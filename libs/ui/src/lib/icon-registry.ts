import {
  Code,
  Star,
  Zap,
  Home,
  Settings,
  User,
  Mail,
  Phone,
  Sparkles,
  Terminal,
  Search,
  GitBranch,
  CircleQuestionMark,
  TrendingUp,
  Bell,
  BarChart,
  Users
} from 'lucide-react';

export const iconRegistry = {
  Code,
  Star,
  Zap,
  Home,
  Settings,CircleQuestionMark,
  User,
  GitBranch,
  Mail,
  Phone,
  Sparkles,
  Terminal,
  Search,
  TrendingUp,
  Bell,
  BarChart,
  Users
} as const;

export type IconName = keyof typeof iconRegistry;
export const getIcon = (name: IconName) => iconRegistry[name];
