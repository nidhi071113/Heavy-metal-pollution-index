import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = 'default' 
}: StatCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border bg-card p-6 shadow-card transition-all hover:shadow-elevated",
      "hover:scale-[1.02] duration-300"
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          "rounded-lg p-3",
          variant === 'success' && "bg-success/10 text-success",
          variant === 'warning' && "bg-warning/10 text-warning",
          variant === 'destructive' && "bg-destructive/10 text-destructive",
          variant === 'default' && "bg-primary/10 text-primary"
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {trend && (
        <div className={cn(
          "absolute bottom-0 left-0 h-1 w-full",
          trend === 'up' && "bg-success",
          trend === 'down' && "bg-destructive",
          trend === 'neutral' && "bg-muted"
        )} />
      )}
    </div>
  );
}
