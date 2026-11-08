import React from 'react';
import { LucideIcon } from 'lucide-react';

export type WidgetVariant =
  | 'default'
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'indigo'
  | 'purple'
  | 'cyan';

export interface MetricTrend {
  value: number | string;
  direction: 'up' | 'down' | 'neutral';
  label?: string;
  isPositiveGood?: boolean;
}

export interface MetricProgress {
  current: number;
  max?: number;
  label?: string;
  colorClass?: string;
}

export interface MetricAction {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  icon?: LucideIcon;
  variant?: 'subtle' | 'primary' | 'danger' | 'warning';
}

export interface MetricBadge {
  text: string;
  variant?: WidgetVariant;
}

export interface DashboardWidgetProps {
  title: string;
  value: string | number;
  secondaryValue?: string | number;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  variant?: WidgetVariant;
  trend?: MetricTrend;
  progress?: MetricProgress;
  action?: MetricAction;
  badge?: MetricBadge;
  onClick?: () => void;
  className?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  testId?: string;
}
