import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StatCard({ title, value, hint, icon: Icon, className }) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center gap-4 p-5">
        {Icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{title}</p>
          <p className={cn('text-2xl font-bold', className)}>{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
