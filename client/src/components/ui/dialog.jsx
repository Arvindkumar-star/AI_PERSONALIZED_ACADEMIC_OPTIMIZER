import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export function Dialog({ open, onClose, title, description, children, className }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={onClose}
    >
      <div
        className={cn(
          'relative w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg',
          className
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export default Dialog;
