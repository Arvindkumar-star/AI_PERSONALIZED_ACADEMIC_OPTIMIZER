import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin', className)} />;
}

export function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center text-muted-foreground">
      <Spinner className="h-6 w-6" />
    </div>
  );
}

export default Spinner;
