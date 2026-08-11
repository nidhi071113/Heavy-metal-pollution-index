import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, XCircle, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ level, showIcon = true, size = 'md' }: RiskBadgeProps) {
  const icons = {
    low: CheckCircle,
    medium: AlertTriangle,
    high: AlertTriangle,
    critical: AlertOctagon,
  };

  const Icon = icons[level];

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium",
      size === 'sm' && "px-2 py-0.5 text-xs",
      size === 'md' && "px-3 py-1 text-sm",
      size === 'lg' && "px-4 py-1.5 text-base",
      level === 'low' && "bg-success/10 text-success",
      level === 'medium' && "bg-warning/10 text-warning",
      level === 'high' && "bg-destructive/10 text-destructive",
      level === 'critical' && "bg-destructive/20 text-destructive border border-destructive"
    )}>
      {showIcon && <Icon className={cn(
        size === 'sm' && "h-3 w-3",
        size === 'md' && "h-4 w-4",
        size === 'lg' && "h-5 w-5"
      )} />}
      <span className="capitalize">{level}</span>
    </div>
  );
}
