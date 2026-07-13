import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'Nothing here yet', description, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
      <Icon className="mb-3 h-10 w-10 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
