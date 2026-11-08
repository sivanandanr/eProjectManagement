import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight
} from 'lucide-react';
import { DashboardWidgetProps, WidgetVariant } from './types';

const variantIconStyles: Record<WidgetVariant, string> = {
  default: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800',
  blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50',
  emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
  amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
  rose: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50',
  indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50',
  purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50',
  cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50'
};

const variantValueStyles: Record<WidgetVariant, string> = {
  default: 'text-slate-900 dark:text-white',
  blue: 'text-slate-900 dark:text-white',
  emerald: 'text-slate-900 dark:text-white',
  amber: 'text-amber-600 dark:text-amber-400',
  rose: 'text-rose-600 dark:text-rose-400',
  indigo: 'text-slate-900 dark:text-white',
  purple: 'text-slate-900 dark:text-white',
  cyan: 'text-cyan-600 dark:text-cyan-400'
};

const variantBadgeStyles: Record<WidgetVariant, string> = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
  purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
  cyan: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60'
};

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  value,
  secondaryValue,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
  progress,
  action,
  badge,
  onClick,
  className = '',
  footer,
  children
}) => {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`group relative p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-all duration-200 flex flex-col justify-between ${
        isClickable
          ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
          : ''
      } ${className}`}
    >
      <div>
        {/* Top Header: Title, Icon, Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
            {title}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {badge && (
              <span
                className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                  variantBadgeStyles[badge.variant || variant]
                }`}
              >
                {badge.text}
              </span>
            )}
            {Icon && (
              <div className={`p-1.5 rounded-lg shrink-0 ${variantIconStyles[variant]}`}>
                <Icon className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Value Row */}
        <div className="flex items-baseline gap-2">
          <div
            className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${variantValueStyles[variant]}`}
          >
            {value}
          </div>
          {secondaryValue && (
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
              {secondaryValue}
            </span>
          )}
        </div>

        {/* Trend Indicator */}
        {trend && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            {trend.direction === 'up' && (
              <TrendingUp
                className={`w-3.5 h-3.5 ${
                  trend.isPositiveGood !== false ? 'text-emerald-600' : 'text-rose-600'
                }`}
              />
            )}
            {trend.direction === 'down' && (
              <TrendingDown
                className={`w-3.5 h-3.5 ${
                  trend.isPositiveGood !== false ? 'text-rose-600' : 'text-emerald-600'
                }`}
              />
            )}
            {trend.direction === 'neutral' && (
              <Minus className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span
              className={`font-mono font-semibold text-[11px] ${
                trend.direction === 'up'
                  ? trend.isPositiveGood !== false
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                  : trend.direction === 'down'
                  ? trend.isPositiveGood !== false
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500'
              }`}
            >
              {trend.value}
            </span>
            {trend.label && (
              <span className="text-[11px] text-slate-400 truncate">{trend.label}</span>
            )}
          </div>
        )}

        {/* Progress Bar (Optional) */}
        {progress && (
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>{progress.label || 'Progress'}</span>
              <span>
                {Math.round(progress.current)}% {progress.max ? `/ ${progress.max}%` : ''}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progress.colorClass ||
                  (progress.current === 100
                    ? 'bg-emerald-500'
                    : progress.current >= 50
                    ? 'bg-blue-600'
                    : 'bg-amber-500')
                }`}
                style={{ width: `${Math.min(100, Math.max(0, progress.current))}%` }}
              />
            </div>
          </div>
        )}

        {/* Subtitle / Description */}
        {subtitle && (
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {subtitle}
          </div>
        )}

        {/* Custom Body Children */}
        {children && <div className="mt-3">{children}</div>}
      </div>

      {/* Footer / Action Area */}
      {(action || footer || isClickable) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          {action ? (
            <button
              onClick={e => {
                e.stopPropagation();
                action.onClick(e);
              }}
              className={`flex items-center gap-1 font-semibold transition-colors ${
                action.variant === 'primary'
                  ? 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                  : action.variant === 'danger'
                  ? 'text-rose-600 hover:text-rose-700 dark:text-rose-400'
                  : action.variant === 'warning'
                  ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <span>{action.label}</span>
              {action.icon ? (
                <action.icon className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>
          ) : footer ? (
            <div className="w-full">{footer}</div>
          ) : isClickable ? (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors ml-auto">
              <span>View details</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
